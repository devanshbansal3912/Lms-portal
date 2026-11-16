
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";

export async function POST(request: Request) {
  try {
    // 1. Authenticate the student.
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Please log in to use the AI assistant." },
        { status: 401 }
      );
    }

    // 2. Read and validate the request.
    const body = await request.json();

    const message = body.message;
    const documentId = body.documentId;
    const conversationId = body.conversationId;

    if (
      typeof message !== "string" ||
      !message.trim() ||
      message.length > 4000
    ) {
      return NextResponse.json(
        { error: "Please enter a valid message (maximum 4000 characters)." },
        { status: 400 }
      );
    }

    if (
      typeof documentId !== "string" ||
      !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(documentId)
    ) {
      return NextResponse.json(
        { error: "Please select a valid PDF." },
        { status: 400 }
      );
    }

    if (
      conversationId !== undefined &&
      conversationId !== null &&
      (typeof conversationId !== "string" || conversationId.length > 200)
    ) {
      return NextResponse.json(
        { error: "Invalid conversation ID." },
        { status: 400 }
      );
    }

    // 3. Verify document ownership.
    const { data: document, error: documentError } = await supabase
      .from("documents")
      .select("id, file_name, dify_document_id")
      .eq("id", documentId)
      .eq("user_id", user.id)
      .single();

    if (documentError || !document) {
      return NextResponse.json(
        { error: "Selected document not found or access denied." },
        { status: 404 }
      );
    }

    // 4. Check Dify configuration.
    const baseUrl = process.env.DIFY_API_BASE_URL;
    const apiKey = process.env.DIFY_CHAT_API_KEY;

    if (!baseUrl || !apiKey) {
      return NextResponse.json(
        { error: "Dify chatbot configuration is missing." },
        { status: 500 }
      );
    }

    // 5. Prepare the Dify request.
    const difyBody: {
      inputs: { document_id: string };
      query: string;
      response_mode: "blocking";
      user: string;
      conversation_id?: string;
    } = {
      inputs: {
        document_id: document.id,
      },
      query: message.trim(),
      response_mode: "blocking",
      user: user.id,
    };

    // Continue the existing conversation when an ID is available.
    if (typeof conversationId === "string" && conversationId.trim()) {
      difyBody.conversation_id = conversationId;
    }

    // 6. Send the question to Dify.
    const difyResponse = await fetch(
      `${baseUrl.replace(/\/$/, "")}/chat-messages`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(difyBody),
        signal: AbortSignal.timeout(60000),
      }
    );

    const difyData = await difyResponse.json();

    if (!difyResponse.ok) {
      console.error("Dify chatbot error:", difyData);

      return NextResponse.json(
        {
          error:
            difyData.message ||
            difyData.error ||
            "Dify could not answer your question.",
        },
        { status: 502 }
      );
    }

    // 7. Return the answer and conversation ID.
    return NextResponse.json({
      answer: difyData.answer || "",
      conversation_id: difyData.conversation_id,
      message_id: difyData.message_id,
    });
  } catch (error) {
    console.error("Chat API error:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred.",
      },
      { status: 500 }
    );
  }
}
