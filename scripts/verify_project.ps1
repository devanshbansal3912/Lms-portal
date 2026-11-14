# ==============================================================================
# Student 3 Deliverables Integrity Verification Script
# ==============================================================================

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host " Verifying Student 3 Learning Features Deliverables..." -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

$requiredFiles = @(
    "README.md",
    "package.json",
    "tsconfig.json",
    "tailwind.config.ts",
    "next.config.mjs",
    ".env.example",
    "public/sample_operating_systems_notes.pdf",
    "supabase/migrations/20261114_001_student3_learning_schema.sql",
    "supabase/seed.sql",
    "dify_workflows/quiz_generation_workflow.yml",
    "dify_workflows/quiz_generation_workflow.json",
    "dify_workflows/flashcard_generation_workflow.yml",
    "dify_workflows/flashcard_generation_workflow.json",
    "dify_workflows/README.md",
    "docs/STUDENT_3_HANDOVER.md",
    "docs/API_CONTRACTS.md",
    "docs/DATABASE_SCHEMA.md",
    "docs/DIFY_WORKFLOW_SETUP.md",
    "docs/TESTING_AND_DEMO_GUIDE.md",
    "src/app/page.tsx",
    "src/app/reader/page.tsx",
    "src/app/quiz/page.tsx",
    "src/app/flashcards/page.tsx",
    "src/app/api/quiz/generate/route.ts",
    "src/app/api/quiz/submit/route.ts",
    "src/app/api/quiz/history/route.ts",
    "src/app/api/flashcards/generate/route.ts",
    "src/app/api/flashcards/route.ts",
    "src/app/api/flashcards/[id]/route.ts",
    "src/components/Navigation.tsx",
    "src/components/pdf/PdfViewer.tsx",
    "src/components/quiz/QuizGenerator.tsx",
    "src/components/quiz/QuizPlayer.tsx",
    "src/components/quiz/QuizResultView.tsx",
    "src/components/quiz/QuizHistoryView.tsx",
    "src/components/flashcards/FlashcardGenerator.tsx",
    "src/components/flashcards/FlashcardDeck.tsx",
    "src/components/flashcards/FlashcardItem.tsx",
    "src/lib/assessment/scoring.ts",
    "src/lib/dify/client.ts",
    "src/lib/mock/learningMockData.ts",
    "src/lib/supabase/client.ts",
    "src/lib/supabase/server.ts",
    "src/lib/validation/quiz.ts",
    "src/lib/validation/flashcard.ts",
    "src/types/learning.ts",
    "src/types/database.ts"
)

$passed = 0
$failed = 0

foreach ($file in $requiredFiles) {
    if (Test-Path -LiteralPath $file) {
        $size = (Get-Item -LiteralPath $file).Length
        Write-Host "  [OK] $file ($size bytes)" -ForegroundColor Green
        $passed++
    } else {
        Write-Host "  [MISSING] $file" -ForegroundColor Red
        $failed++
    }
}

Write-Host "----------------------------------------------------------"
Write-Host "Summary: $passed / $($requiredFiles.Count) files verified." -ForegroundColor $(if ($failed -eq 0) { "Green" } else { "Red" })

if ($failed -eq 0) {
    Write-Host "[SUCCESS] All Student 3 deliverables are present and intact!" -ForegroundColor Cyan
} else {
    Write-Host "[WARNING] Some files are missing. Please re-run file generator." -ForegroundColor Yellow
}
