
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";



export async function POST(request: Request) {
  try {
    // 1. Verify the logged-in student.
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "You must be logged in." },
        { status: 401 }
      );
    }

    // 2. Validate the requested Supabase document.
    const body = await request.json();
    const documentId = body.documentId;

    if (
      typeof documentId !== "string" ||
      !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(documentId)
    ) {
      return NextResponse.json(
        { error: "A valid document ID is required." },
        { status: 400 }
      );
    }

    // 3. Verify that this document belongs to the student.
    const { data: document, error: documentError } = await supabase
      .from("documents")
      .select("id, user_id, file_name, file_path")
      .eq("id", documentId)
      .eq("user_id", user.id)
      .single();

    if (documentError || !document) {
      return NextResponse.json(
        { error: "Document not found or access denied." },
        { status: 404 }
      );
    }

    // 4. Read the PDF from private Supabase Storage.
    const { data: pdfFile, error: downloadError } =
      await supabase.storage
        .from("documents")
        .download(document.file_path);

    if (downloadError || !pdfFile) {
      return NextResponse.json(
        { error: "Could not download the PDF from Supabase." },
        { status: 500 }
      );
    }

    // 5. Read Dify credentials from server-side environment variables.
    const baseUrl = process.env.DIFY_API_BASE_URL;
    const datasetId = process.env.DIFY_DATASET_ID;
    const knowledgeApiKey = process.env.DIFY_KNOWLEDGE_API_KEY;
    const metadataFieldId =
      process.env.DIFY_DOCUMENT_ID_METADATA_FIELD_ID;

    if (!baseUrl || !datasetId || !knowledgeApiKey || !metadataFieldId) {
      return NextResponse.json(
        { error: "Dify Knowledge Base configuration is incomplete." },
        { status: 500 }
      );
    }

    const apiBase = baseUrl.replace(/\/$/, "");
    const headers = {
      Authorization: `Bearer ${knowledgeApiKey}`,
    };

    // 6. Upload the PDF to the Dify Knowledge Base.
    const formData = new FormData();

    formData.append(
      "file",
      new Blob([await pdfFile.arrayBuffer()], {
        type: "application/pdf",
      }),
      document.file_name
    );

    const uploadResponse = await fetch(
      `${apiBase}/datasets/${datasetId}/document/create-by-file`,
      {
        method: "POST",
        headers,
        body: formData,
      }
    );

    const uploadResult = await uploadResponse.json();

    if (!uploadResponse.ok) {
      console.error("Dify upload error:", uploadResult);

      return NextResponse.json(
        { error: "Dify could not ingest the PDF.", details: uploadResult },
        { status: 502 }
      );
    }

    const difyDocumentId = uploadResult?.document?.id;

    if (!difyDocumentId) {
      console.error("Unexpected Dify upload response:", uploadResult);

      return NextResponse.json(
        { error: "Dify did not return a document ID." },
        { status: 502 }
      );
    }

    // 7. Save Dify's internal document ID in Supabase.
    const { error: saveError } = await supabase
      .from("documents")
      .update({ dify_document_id: difyDocumentId })
      .eq("id", documentId)
      .eq("user_id", user.id);

    if (saveError) {
      console.error("Could not save Dify document ID:", saveError);

      return NextResponse.json(
        {
          error: "Dify uploaded the PDF, but Supabase could not save its ID.",
        },
        { status: 500 }
      );
    }

    // 8. Assign the Supabase UUID as custom Dify metadata.
    const metadataResponse = await fetch(
      `${apiBase}/datasets/${datasetId}/documents/metadata`,
      {
        method: "POST",
        headers: {
          ...headers,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          operation_data: [
            {
              document_id: difyDocumentId,
              metadata_list: [
                {
                  id: metadataFieldId,
                  name: "document_id",
                  value: documentId,
                },
              ],
              partial_update: true,
            },
          ],
        }),
      }
    );

    const metadataResult = await metadataResponse.json();

    if (!metadataResponse.ok || metadataResult?.result !== "success") {
      console.error("Dify metadata error:", metadataResult);

      return NextResponse.json(
        {
          error: "PDF uploaded, but Dify metadata assignment failed.",
          difyDocumentId,
          details: metadataResult,
        },
        { status: 502 }
      );
    }

    // 9. Report successful ingestion.
    return NextResponse.json({
      success: true,
      message: "PDF uploaded to Dify and metadata assigned.",
      documentId,
      difyDocumentId,
    });
  } catch (error) {
    console.error("Dify ingestion failed:", error);

    return NextResponse.json(
      { error: "An unexpected error occurred during Dify ingestion." },
      { status: 500 }
    );
  }
}
