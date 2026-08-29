import type { InterviewData } from "../types";

export async function downloadInterview(data: InterviewData) {
  const { default: jsPDF } = await import("jspdf");
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const ml = 15,
    tw = 180;
  let y = 20;

  const checkPage = () => {
    if (y > 270) {
      doc.addPage();
      y = 20;
    }
  };

  doc.setFontSize(18).setFont("helvetica", "bold").setTextColor(99, 102, 241);
  doc.text("Interview Questions", ml, y);
  y += 7;
  doc
    .setFontSize(10)
    .setFont("helvetica", "normal")
    .setTextColor(100, 100, 100);
  doc.text(
    `Role: ${data.role}  ·  Round: ${
      data.round === "hr" ? "HR Round" : "Technical Round"
    }`,
    ml,
    y
  );
  y += 10;

  data.questions.forEach((q, i) => {
    checkPage();
    doc.setFontSize(9).setFont("helvetica", "bold").setTextColor(99, 102, 241);
    doc.text(`Q${i + 1}  [${q.category}]`, ml, y);
    y += 5;

    doc.setFontSize(10).setFont("helvetica", "normal").setTextColor(26, 26, 26);
    const qLines = doc.splitTextToSize(q.question, tw);
    doc.text(qLines, ml, y);
    y += qLines.length * 5 + 2;

    doc
      .setFontSize(8.5)
      .setFont("helvetica", "italic")
      .setTextColor(120, 120, 120);
    const hLines = doc.splitTextToSize(`Hint: ${q.hint}`, tw);
    doc.text(hLines, ml, y);
    y += hLines.length * 4.5 + 2;

    doc
      .setDrawColor(229, 231, 235)
      .setLineWidth(0.3)
      .line(ml, y, ml + tw, y);
    y += 6;
  });

  doc.save(`${data.role.replace(/\s+/g, "_")}_${data.round}_interview.pdf`);
}