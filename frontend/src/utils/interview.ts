import jsPDF from "jspdf";
import type { ResumeData } from "../types";

export function generateResumePDF(r: ResumeData) {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const W = 210,
    ml = 15,
    mr = 15,
    tw = W - ml - mr;
  let y = 18;

  const heading = (text: string) => {
    doc.setFontSize(7).setFont("helvetica", "bold").setTextColor(99, 102, 241);
    doc.text(text.toUpperCase(), ml, y);
    doc
      .setDrawColor(229, 231, 235)
      .setLineWidth(0.3)
      .line(ml, y + 1, ml + tw, y + 1);
    y += 6;
  };
  const addText = (
    text: string,
    size: number,
    style: "normal" | "bold",
    color: [number, number, number],
    indent = 0,
    maxWidth?: number
  ) => {
    doc
      .setFontSize(size)
      .setFont("helvetica", style)
      .setTextColor(...color);
    const lines = doc.splitTextToSize(text, maxWidth ?? tw - indent);
    doc.text(lines, ml + indent, y);
    y += lines.length * (size * 0.45) + 1;
  };
  const gap = (n = 3) => {
    y += n;
  };
  const checkPage = (needed = 12) => {
    if (y + needed > 280) {
      doc.addPage();
      y = 15;
    }
  };

  doc.setFontSize(20).setFont("helvetica", "bold").setTextColor(26, 26, 26);
  doc.text(r.name, ml, y);
  y += 7;
  const contacts = [r.email, r.phone, r.location, r.linkedin]
    .filter(Boolean)
    .join("  •  ");
  doc.setFontSize(8).setFont("helvetica", "normal").setTextColor(100, 100, 100);
  doc.text(contacts, ml, y);
  y += 8;

  if (r.summary) {
    heading("Summary");
    addText(r.summary, 9, "normal", [55, 65, 81], 0, tw);
    gap();
  }

  if (r.experience?.length) {
    heading("Experience");
    r.experience.forEach((e) => {
      checkPage(14);
      doc.setFontSize(10).setFont("helvetica", "bold").setTextColor(26, 26, 26);
      doc.text(
        `${e.title}  ·  ${e.company}${e.location ? `, ${e.location}` : ""}`,
        ml,
        y
      );
      doc
        .setFontSize(8)
        .setFont("helvetica", "normal")
        .setTextColor(130, 130, 130);
      const dateText = `${e.startDate} – ${e.endDate}`;
      doc.text(dateText, W - mr - doc.getTextWidth(dateText), y);
      y += 5;
      e.bullets.filter(Boolean).forEach((b) => {
        checkPage(6);
        addText(`• ${b}`, 8.5, "normal", [55, 65, 81], 3, tw - 3);
      });
      gap(2);
    });
  }

  if (r.education?.length) {
    heading("Education");
    r.education.forEach((e) => {
      checkPage(10);
      doc.setFontSize(10).setFont("helvetica", "bold").setTextColor(26, 26, 26);
      doc.text(
        `${e.degree}  ·  ${e.school}${e.location ? `, ${e.location}` : ""}`,
        ml,
        y
      );
      const yr = `${e.year}${e.gpa ? `  ·  GPA ${e.gpa}` : ""}`;
      doc
        .setFontSize(8)
        .setFont("helvetica", "normal")
        .setTextColor(130, 130, 130);
      doc.text(yr, W - mr - doc.getTextWidth(yr), y);
      y += 6;
    });
    gap();
  }

  if (r.skills?.technical?.length || r.skills?.soft?.length) {
    heading("Skills");
    if (r.skills.technical?.length) {
      doc.setFontSize(9).setFont("helvetica", "bold").setTextColor(55, 65, 81);
      doc.text("Technical: ", ml, y);
      const lw = doc.getTextWidth("Technical: ");
      doc.setFont("helvetica", "normal");
      const lines = doc.splitTextToSize(r.skills.technical.join(", "), tw - lw);
      doc.text(lines, ml + lw, y);
      y += lines.length * 4 + 2;
    }
    if (r.skills.soft?.length) {
      doc.setFontSize(9).setFont("helvetica", "bold").setTextColor(55, 65, 81);
      doc.text("Soft: ", ml, y);
      const lw = doc.getTextWidth("Soft: ");
      doc.setFont("helvetica", "normal");
      const lines = doc.splitTextToSize(r.skills.soft.join(", "), tw - lw);
      doc.text(lines, ml + lw, y);
      y += lines.length * 4 + 2;
    }
    gap();
  }

  if (r.projects?.length) {
    heading("Projects");
    r.projects.forEach((p) => {
      checkPage(12);
      doc.setFontSize(10).setFont("helvetica", "bold").setTextColor(26, 26, 26);
      doc.text(p.name, ml, y);
      if (p.link) {
        doc
          .setFontSize(8)
          .setFont("helvetica", "normal")
          .setTextColor(99, 102, 241);
        doc.text(`  ${p.link}`, ml + doc.getTextWidth(p.name), y);
      }
      y += 5;
      addText(p.description, 8.5, "normal", [55, 65, 81], 0, tw);
      gap(2);
    });
  }

  if (r.certifications?.length) {
    heading("Certifications");
    addText(r.certifications.join("  •  "), 9, "normal", [55, 65, 81], 0, tw);
  }

  doc.save(`${r.name.replace(/\s+/g, "_")}_Resume.pdf`);
}