
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
        { error: "Please log in to generate a quiz." },
        { status: 401 }
      );
    }

    // 2. Validate request inputs.
    const body = await request.json();

    const documentId = body.documentId;
    const topic = body.topic;
    const numQuestions = body.numQuestions;

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
        { error: "Please enter a valid quiz topic." },
        { status: 400 }
      );
    }

    if (
      !Number.isInteger(numQuestions) ||
      numQuestions < 1 ||
      numQuestions > 20
    ) {
      return NextResponse.json(
        { error: "Choose between 1 and 20 questions." },
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
    const apiKey = process.env.DIFY_QUIZ_API_KEY;

    if (!baseUrl || !apiKey) {
      return NextResponse.json(
        { error: "Quiz Generator configuration is missing." },
        { status: 500 }
      );
    }

    // 5. Call the Dify Quiz Generator workflow.
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
            num_questions: numQuestions,
          },
          response_mode: "blocking",
          user: user.id,
        }),
        signal: AbortSignal.timeout(120000),
      }
    );

    const difyData = await difyResponse.json();

    if (!difyResponse.ok) {
      console.error("Dify Quiz API error:", difyData);

      return NextResponse.json(
        {
          error:
            difyData.message ||
            difyData.error ||
            "Quiz generation failed.",
        },
        { status: 502 }
      );
    }

    // 6. Check workflow execution status.
    if (difyData.data?.status !== "succeeded") {
      console.error("Quiz workflow did not succeed:", difyData);

      return NextResponse.json(
        { error: "The quiz workflow did not complete successfully." },
        { status: 502 }
      );
    }

    // 7. Parse the JSON string returned by Dify.
    const rawResult = difyData.data?.outputs?.result;

    let quiz;

    try {
      quiz =
        typeof rawResult === "string"
          ? JSON.parse(rawResult)
          : rawResult;
    } catch {
      console.error("Invalid quiz JSON returned by Dify:", rawResult);

      return NextResponse.json(
        { error: "The AI returned an invalid quiz format." },
        { status: 502 }
      );
    }

    // 8. Validate the generated quiz.
    if (!quiz || !Array.isArray(quiz.questions)) {
      return NextResponse.json(
        { error: "The generated quiz has an invalid structure." },
        { status: 502 }
      );
    }

    if (quiz.questions.length === 0) {
      return NextResponse.json(
        {
          error:
            "No questions were generated. Check whether this PDF is indexed in the knowledge base and try another topic.",
        },
        { status: 422 }
      );
    }

    const validQuestions = quiz.questions.every(
      (question: any) =>
        typeof question.question === "string" &&
        Array.isArray(question.options) &&
        question.options.length === 4 &&
        question.options.every(
          (option: unknown) => typeof option === "string"
        ) &&
        Number.isInteger(question.correctAnswer) &&
        question.correctAnswer >= 0 &&
        question.correctAnswer <= 3 &&
        typeof question.explanation === "string"
    );

    if (!validQuestions) {
      return NextResponse.json(
        { error: "The AI returned questions in an unexpected format." },
        { status: 502 }
      );
    }

    // 9. Return the parsed quiz to the frontend.
    return NextResponse.json({
      success: true,
      quiz,
    });
  } catch (error) {
    console.error("Quiz API error:", error);

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
