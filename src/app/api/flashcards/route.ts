
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
        { error: "Please log in to generate flashcards." },
        { status: 401 }
      );
    }

    // 2. Validate request inputs.
    const body = await request.json();

    const documentId = body.documentId;
    const topic = body.topic;
    const numCards = body.numCards;

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
      typeof topic !== "string" ||
      !topic.trim() ||
      topic.trim().length > 200
    ) {
      return NextResponse.json(
        { error: "Please enter a valid flashcard topic." },
        { status: 400 }
      );
    }

    if (
      !Number.isInteger(numCards) ||
      numCards < 1 ||
      numCards > 20
    ) {
      return NextResponse.json(
        { error: "Choose between 1 and 20 flashcards." },
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

    if (!document.dify_document_id) {
      return NextResponse.json(
        {
          error:
            "This PDF has not been uploaded to the AI knowledge base yet. Please try again after ingestion.",
        },
        { status: 409 }
      );
    }

    // 4. Check Dify configuration.
    const baseUrl = process.env.DIFY_API_BASE_URL;
    const apiKey = process.env.DIFY_FLASHCARD_API_KEY;

    if (!baseUrl || !apiKey) {
      return NextResponse.json(
        { error: "Flashcard Generator configuration is missing." },
        { status: 500 }
      );
    }

    // 5. Call the Dify Flashcard Generator workflow.
    const difyResponse = await fetch(
      `${baseUrl.replace(/\/$/, "")}/workflows/run`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          inputs: {
            document_id: document.id,
            topic: topic.trim(),
            num_cards: numCards,
          },
          response_mode: "blocking",
          user: user.id,
        }),
        signal: AbortSignal.timeout(120000),
      }
    );

    const difyData = await difyResponse.json();

    if (!difyResponse.ok) {
      console.error("Dify Flashcard API error:", difyData);

      return NextResponse.json(
        {
          error:
            difyData.message ||
            difyData.error ||
            "Flashcard generation failed.",
        },
        { status: 502 }
      );
    }

    // 6. Check workflow execution status.
    if (difyData.data?.status !== "succeeded") {
      console.error("Flashcard workflow did not succeed:", difyData);

      return NextResponse.json(
        { error: "The flashcard workflow did not complete successfully." },
        { status: 502 }
      );
    }

    // 7. Parse the JSON string returned by Dify.
    const rawResult = difyData.data?.outputs?.result;

    let flashcards;

    try {
      flashcards =
        typeof rawResult === "string"
          ? JSON.parse(rawResult)
          : rawResult;
    } catch {
      console.error("Invalid flashcard JSON returned by Dify:", rawResult);

      return NextResponse.json(
        { error: "The AI returned an invalid flashcard format." },
        { status: 502 }
      );
    }

    // 8. Validate the generated flashcards.
    if (!flashcards || !Array.isArray(flashcards.cards)) {
      return NextResponse.json(
        { error: "The generated flashcards have an invalid structure." },
        { status: 502 }
      );
    }

    if (flashcards.cards.length === 0) {
      return NextResponse.json(
        {
          error:
            "No flashcards were generated. Check whether this PDF is indexed in the knowledge base and try another topic.",
        },
        { status: 422 }
      );
    }

    const validCards = flashcards.cards.every(
      (card: any) =>
        typeof card.front === "string" &&
        card.front.trim().length > 0 &&
        typeof card.back === "string" &&
        card.back.trim().length > 0
    );

    if (!validCards) {
      return NextResponse.json(
        { error: "The AI returned flashcards in an unexpected format." },
        { status: 502 }
      );
    }

    // 9. Return the parsed flashcards to the frontend.
    return NextResponse.json({
      success: true,
      flashcards,
    });
  } catch (error) {
    console.error("Flashcard API error:", error);

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
