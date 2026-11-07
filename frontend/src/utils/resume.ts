import type { ResumeData } from "../types";

export async function generateResumePDF(r: ResumeData) {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ unit: "mm", format: "a4" });

  const W = 210;
  const ml = 15;
  const mr = 15;
  const tw = W - ml - mr;
  const pageBottom = 282;
  const LH = 1.3;
  let y = 18;

  doc.setLineHeightFactor(LH);
  const lh = (size: number) => size * 0.3528 * LH;

  const DARK: [number, number, number] = [26, 26, 26];
  const BODY: [number, number, number] = [55, 65, 81];
  const MUTED: [number, number, number] = [110, 110, 110];

  const checkPage = (needed: number) => {
    if (y + needed > pageBottom) {
      doc.addPage();
      y = 18;
    }
  };

  const font = (
    size: number,
    style: "normal" | "bold" | "italic",
    color: [number, number, number],
  ) =>
    doc
      .setFontSize(size)
      .setFont("helvetica", style)
      .setTextColor(...color);

  let first = true;
  const heading = (text: string) => {
    checkPage(24); // keep heading with its first entry
    if (!first) y += 6;
    first = false;
    font(11, "bold", DARK);
    doc.text(text.toUpperCase(), ml, y);
    doc
      .setDrawColor(200, 200, 200)
      .setLineWidth(0.3)
      .line(ml, y + 2, ml + tw, y + 2);
    y += 8;
  };

  const paragraph = (text: string, size = 10) => {
    font(size, "normal", BODY);
    const lines = doc.splitTextToSize(text, tw);
    checkPage(lines.length * lh(size));
    doc.text(lines, ml, y);
    y += lines.length * lh(size) + 1.5;
  };

  const bullet = (text: string, size = 9.5, indent = 3) => {
    font(size, "normal", BODY);
    const bw = doc.getTextWidth("•  ");
    const lines = doc.splitTextToSize(text, tw - indent - bw);
    checkPage(lines.length * lh(size));
    doc.text("•", ml + indent, y);
    doc.text(lines, ml + indent + bw, y);
    y += lines.length * lh(size) + 1.4;
  };

  // Left text (wrapped) + right text (reserved width, never overlaps)
  const row = (
    left: string,
    right: string | undefined,
    leftSize: number,
    leftStyle: "normal" | "bold" | "italic",
    leftColor: [number, number, number],
  ) => {
    let rightW = 0;
    if (right) {
      font(9, "normal", MUTED);
      rightW = doc.getTextWidth(right);
    }
    font(leftSize, leftStyle, leftColor);
    const lines = doc.splitTextToSize(left, tw - rightW - (right ? 4 : 0));
    const h = lines.length * lh(leftSize);
    checkPage(h);
    doc.text(lines, ml, y);
    if (right) {
      font(9, "normal", MUTED);
      doc.text(right, W - mr, y, { align: "right" });
    }
    y += h + 0.8;
  };

  const labeled = (label: string, items: string[]) => {
    const size = 10;
    font(size, "bold", BODY);
    const lw = doc.getTextWidth(label);
    font(size, "normal", BODY);
    const lines = doc.splitTextToSize(items.join(", "), tw - lw);
    const h = lines.length * lh(size);
    checkPage(h); // check BEFORE drawing the label
    font(size, "bold", BODY);
    doc.text(label, ml, y);
    font(size, "normal", BODY);
    doc.text(lines, ml + lw, y);
    y += h + 2;
  };

  // ---------- Name + contact ----------
  font(22, "bold", DARK);
  const nameLines = doc.splitTextToSize(r.name.toUpperCase(), tw);
  doc.text(nameLines, W / 2, y, { align: "center" });
  y += nameLines.length * lh(22) + 1;

  const CONTACT: [number, number, number] = [45, 45, 45];
  const contacts = [r.email, r.phone, r.location, r.linkedin].filter(Boolean).join("  |  ");



  font(9.5, "normal", CONTACT);
  const contactLines = doc.splitTextToSize(contacts, tw);
  doc.text(contactLines, W / 2, y, { align: "center" });
  y += contactLines.length * lh(9.5) + 3;
  // ---------- Summary ----------
  if (r.summary) {
    heading("Summary");
    paragraph(r.summary);
  }

  // ---------- Experience ----------
  if (r.experience?.length) {
    heading("Experience");
    r.experience.forEach((e) => {
      checkPage(20);
      const dates = [e.startDate, e.endDate || "Present"]
        .filter(Boolean)
        .join(" – ");
      row(e.title || "", dates, 10.5, "bold", DARK);
      const sub = [e.company, e.location].filter(Boolean).join(", ");
      if (sub) row(sub, undefined, 9.5, "italic", BODY);
      y += 0.8;
      e.bullets?.filter(Boolean).forEach((b) => bullet(b));
      y += 3.5;
    });
  }

  // ---------- Education ----------
  if (r.education?.length) {
    heading("Education");
    r.education.forEach((e) => {
      checkPage(16);
      row(e.degree || "", e.year, 10.5, "bold", DARK);
      const school = [e.school, e.location].filter(Boolean).join(", ");
      row(school, e.gpa ? `GPA: ${e.gpa}` : undefined, 9.5, "italic", BODY);
      y += 3;
    });
  }

  // ---------- Skills ----------
  if (r.skills?.technical?.length || r.skills?.soft?.length) {
    heading("Skills");
    if (r.skills.technical?.length) labeled("Technical: ", r.skills.technical);
    if (r.skills.soft?.length) labeled("Soft: ", r.skills.soft);
  }

  // ---------- Projects ----------
  if (r.projects?.length) {
    heading("Projects");
    r.projects.forEach((p) => {
      checkPage(20);
      row(p.name || "", undefined, 10.5, "bold", DARK);
      if (p.link) {
        font(9, "normal", [60, 70, 200]);
        const lines = doc.splitTextToSize(p.link, tw); // full URL, no ellipsis
        const h = lines.length * lh(9);
        checkPage(h);
        doc.text(lines, ml, y);
        doc.link(ml, y - lh(9), tw, h, { url: p.link });
        y += h + 1;
      }
      p.bullets?.filter(Boolean).forEach((b) => bullet(b));
      y += 3.5;
    });
  }

  // ---------- Certifications ----------
  if (r.certifications?.length) {
    heading("Certifications");
    r.certifications.filter(Boolean).forEach((c) => bullet(c, 10));
  }

  doc.setProperties({ title: `${r.name} - Resume` });
  doc.save(`${r.name.replace(/\s+/g, "_")}_Resume.pdf`);
}
