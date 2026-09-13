import type { InterviewData } from "../types";

export async function downloadInterview(data: InterviewData) {
  const { default: jsPDF } = await import("jspdf");

  const doc = new jsPDF({
    unit: "mm",
    format: "a4",
  });

  const W = 210;
  const ml = 12;
  const mr = 12;
  const tw = W - ml - mr;
  const pageBottom = 280;

  let y = 18;

  const lh = (size: number) => size * 0.352 * 1.08;

  const checkPage = (neededHeight: number) => {
    if (y + neededHeight > pageBottom) {
      doc.addPage();
      y = 18;
    }
  };

  // --------------------------------------------------
  // Header
  // --------------------------------------------------

  doc
    .setFontSize(18)
    .setFont("helvetica", "bold")
    .setTextColor(99, 102, 241);

  doc.text("Interview Questions", ml, y);

  y += 7;

  doc
    .setFontSize(10)
    .setFont("helvetica", "normal")
    .setTextColor(100, 100, 100);

  const roundText =
    data.round === "hr"
      ? "HR Round"
      : "Technical Round";

  doc.text(
    `Role: ${data.role}  ·  Round: ${roundText}`,
    ml,
    y
  );

  y += 9;

  // --------------------------------------------------
  // Questions
  // --------------------------------------------------

  data.questions.forEach((q, i) => {
    doc.setFontSize(10);

    const qLines = doc.splitTextToSize(
      q.question,
      tw
    );

    const qh = qLines.length * lh(10);

    doc.setFontSize(8.5);

    const hLines = doc.splitTextToSize(
      `Hint: ${q.hint}`,
      tw
    );

    const hh = hLines.length * lh(8.5);

    const blockHeight =
      5 +       // question label
      qh +      // question
      2.5 +     // question → hint
      hh +      // hint
      2 +       // hint → separator
      4;        // separator → next question

    checkPage(blockHeight);

    // Question label
    doc
      .setFontSize(9)
      .setFont("helvetica", "bold")
      .setTextColor(99, 102, 241);

    doc.text(
      `Q${i + 1}  [${q.category}]`,
      ml,
      y
    );

    y += 5;

    // Question
    doc
      .setFontSize(10)
      .setFont("helvetica", "normal")
      .setTextColor(26, 26, 26);

    doc.text(qLines, ml, y);

    y += qh + 2.5;

    // Hint
    doc
      .setFontSize(8.5)
      .setFont("helvetica", "italic")
      .setTextColor(120, 120, 120);

    doc.text(hLines, ml, y);

    y += hh + 2;

    // Separator
    doc
      .setDrawColor(229, 231, 235)
      .setLineWidth(0.3)
      .line(ml, y, ml + tw, y);

    y += 4;
  });

  doc.save(
    `${data.role.replace(/\s+/g, "_")}_${data.round}_interview.pdf`
  );
}