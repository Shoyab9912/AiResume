import jsPDF from "jspdf";
import type { ResumeData } from "../types";

export function generateResumePDF(r: ResumeData) {
  const doc = new jsPDF({ unit: "mm", format: "a4" });

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
      y = 15;
    }
  };

  let isFirstSection = true;

  const heading = (text: string) => {
    checkPage(16);

    if (!isFirstSection) {
      y += 5; 
    }

    isFirstSection = false;

    doc.setFontSize(10.5).setFont("helvetica", "bold").setTextColor(26, 26, 26);

    doc.text(text.toUpperCase(), ml, y);

    doc
      .setDrawColor(229, 231, 235)
      .setLineWidth(0.3)
      .line(ml, y + 1.5, ml + tw, y + 1.5);

    y += 6;
  };

  const addText = (
    text: string,
    size: number,
    style: "normal" | "bold" | "italic",
    color: [number, number, number],
    indent = 0,
    maxWidth?: number,
  ) => {
    doc
      .setFontSize(size)
      .setFont("helvetica", style)
      .setTextColor(...color);

    const lines = doc.splitTextToSize(text, maxWidth ?? tw - indent);

    const h = lines.length * lh(size);

    checkPage(h);

    doc.text(lines, ml + indent, y);

   
    y += h + 1;
  };

  const addBullet = (text: string, size: number, indent: number) => {
    doc
      .setFontSize(size)
      .setFont("helvetica", "normal")
      .setTextColor(55, 65, 81);

    const bulletW = doc.getTextWidth("• ");

    const lines = doc.splitTextToSize(text, tw - indent - bulletW);

    const h = lines.length * lh(size);

    checkPage(h);

    doc.text("•", ml + indent, y);

    doc.text(lines, ml + indent + bulletW, y);

    y += h + 0.8;
  };

  // Smaller item spacing.
  const itemGap = (n = 4) => {
    y += n;
  };

  // --------------------------------------------------
  // Name + contacts
  // --------------------------------------------------

  doc.setFontSize(20).setFont("helvetica", "bold").setTextColor(26, 26, 26);

  // Center name
  const nameW = doc.getTextWidth(r.name);
  doc.text(r.name, (W - nameW) / 2, y);

  y += 7;

  const contacts = [r.email, r.phone, r.location, r.linkedin]
    .filter(Boolean)
    .join("  •  ");

  doc
    .setFontSize(8.5)
    .setFont("helvetica", "normal")
    .setTextColor(100, 100, 100);

  const contactLines = doc.splitTextToSize(contacts, tw);

  // Center contact line(s)
  contactLines.forEach((line: string, i: number) => {
    const lineW = doc.getTextWidth(line);
    doc.text(line, (W - lineW) / 2, y + i * lh(8.5));
  });

  y += contactLines.length * lh(8.5) + 4;

  // --------------------------------------------------
  // Summary
  // --------------------------------------------------

  if (r.summary) {
    heading("Summary");

    addText(r.summary, 9.5, "normal", [55, 65, 81], 0, tw);
  }

  // --------------------------------------------------
  // Experience
  // --------------------------------------------------

  if (r.experience?.length) {
    heading("Experience");

    r.experience.forEach((e) => {
      checkPage(14);

      doc
        .setFontSize(10.5)
        .setFont("helvetica", "bold")
        .setTextColor(26, 26, 26);

      const titleText =
        `${e.title}  ·  ${e.company}` +
        `${e.location ? `, ${e.location}` : ""}`;

      const titleW = doc.getTextWidth(titleText);

      doc.text(titleText, ml, y);

      doc
        .setFontSize(8.5)
        .setFont("helvetica", "normal")
        .setTextColor(130, 130, 130);

      const dateText = `${e.startDate} – ${e.endDate}`;

      const dateW = doc.getTextWidth(dateText);

      if (ml + titleW + 4 < W - mr - dateW) {
        doc.text(dateText, W - mr - dateW, y);
      } else {
        y += 4;
        doc.text(dateText, ml, y);
      }

      y += 5;

      e.bullets?.filter(Boolean).forEach((b) => {
        addBullet(b, 9, 3);
      });

      itemGap();
    });
  }

  // --------------------------------------------------
  // Education
  // --------------------------------------------------

 if (r.education?.length) {
  heading("Education");

  r.education.forEach((e) => {
    checkPage(13);

    doc
      .setFontSize(10.5)
      .setFont("helvetica", "bold")
      .setTextColor(26, 26, 26);

    doc.text(e.degree || "", ml, y);

    if (e.year) {
      doc
        .setFontSize(8.5)
        .setFont("helvetica", "normal")
        .setTextColor(130, 130, 130);

      doc.text(
        e.year,
        W - mr - doc.getTextWidth(e.year),
        y
      );
    }

    y += 4;

    doc
      .setFontSize(9.5)
      .setFont("helvetica", "italic")
      .setTextColor(55, 65, 81);

    const schoolText =
      `${e.school || ""}` +
      `${e.location ? `, ${e.location}` : ""}`;

    doc.text(schoolText, ml, y);

    if (e.gpa) {
      doc
        .setFont("helvetica", "bold")
        .setTextColor(55, 65, 81);

      const gpaText = `GPA: ${e.gpa}`;

      doc.text(
        gpaText,
        W - mr - doc.getTextWidth(gpaText),
        y
      );
    }

    y += 5;
    itemGap(3);
  });
}

  // --------------------------------------------------
  // Skills
  // --------------------------------------------------

  if (r.skills?.technical?.length || r.skills?.soft?.length) {
    heading("Skills");

    if (r.skills.technical?.length) {
      doc
        .setFontSize(9.5)
        .setFont("helvetica", "bold")
        .setTextColor(55, 65, 81);

      const label = "Technical: ";

      doc.text(label, ml, y);

      const lw = doc.getTextWidth(label);

      doc.setFont("helvetica", "normal");

      const lines = doc.splitTextToSize(r.skills.technical.join(", "), tw - lw);

      const h = lines.length * lh(9.5);

      checkPage(h);

      doc.text(lines, ml + lw, y);

      y += h + 2;
    }

    if (r.skills.soft?.length) {
      doc
        .setFontSize(9.5)
        .setFont("helvetica", "bold")
        .setTextColor(55, 65, 81);

      const label = "Soft: ";

      doc.text(label, ml, y);

      const lw = doc.getTextWidth(label);

      doc.setFont("helvetica", "normal");

      const lines = doc.splitTextToSize(r.skills.soft.join(", "), tw - lw);

      const h = lines.length * lh(9.5);

      checkPage(h);

      doc.text(lines, ml + lw, y);

      y += h + 2;
    }
  }

  // --------------------------------------------------
  // Projects
  // --------------------------------------------------

  if (r.projects?.length) {
    heading("Projects");

    r.projects.forEach((p) => {
      checkPage(14);

      doc
        .setFontSize(10.5)
        .setFont("helvetica", "bold")
        .setTextColor(26, 26, 26);

      doc.text(p.name || "", ml, y);

      if (p.link) {
        const nameW = doc.getTextWidth(p.name || "");

        doc
          .setFontSize(8.5)
          .setFont("helvetica", "normal")
          .setTextColor(99, 102, 241);

        const availW = tw - nameW - 4;

        const linkW = doc.getTextWidth(p.link);

        const linkText =
          linkW > availW
            ? doc.splitTextToSize(p.link, availW)[0] + "…"
            : p.link;

        doc.textWithLink(`  ${linkText}`, ml + nameW, y, { url: p.link });
      }

      y += 5;

      p.bullets?.filter(Boolean).forEach((b) => {
        addBullet(b, 9, 3);
      });

      itemGap();
    });
  }

  // --------------------------------------------------
  // Certifications
  // --------------------------------------------------

  if (r.certifications?.length) {
    heading("Certifications");

    addText(r.certifications.join("  •  "), 9.5, "normal", [55, 65, 81], 0, tw);
  }

  doc.save(`${r.name.replace(/\s+/g, "_")}_Resume.pdf`);
}
