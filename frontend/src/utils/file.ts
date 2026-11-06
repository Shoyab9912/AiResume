const MAX_RESUME_CHARS = 15000;
const MIN_RESUME_CHARS = 100;

export async function extractPdfText(file: File): Promise<string> {
  if (file.type !== "application/pdf") {
    throw new Error("Please upload a valid PDF file.");
  }
  if (file.size > 5 * 1024 * 1024) {
    throw new Error("File size exceeds the 5MB limit.");
  }

  const [pdfjsLib, worker] = await Promise.all([
    import("pdfjs-dist"),
    import("pdfjs-dist/build/pdf.worker.min.mjs?url"),
  ]);
  pdfjsLib.GlobalWorkerOptions.workerSrc = worker.default;

  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

  const maxPages = Math.min(pdf.numPages, 5);
  const pageTexts: string[] = [];

  for (let pageNum = 1; pageNum <= maxPages; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const textContent = await page.getTextContent();

    const pageText = textContent.items
      .map((item) => ("str" in item ? item.str : ""))
      .join(" ");

    pageTexts.push(pageText);
  }

  const cleanText = pageTexts
    .join("\n")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, MAX_RESUME_CHARS);

  if (cleanText.length < MIN_RESUME_CHARS) {
    throw new Error(
      "Could not extract enough selectable text. Please upload a text-based PDF, not a scanned image.",
    );
  }

  return cleanText;
}
