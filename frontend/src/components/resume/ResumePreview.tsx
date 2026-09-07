import React from "react";
import { Download } from "lucide-react";
import type { ResumeData } from "../../types";
import { generateResumePDF } from "../../utils/interview";

interface ResumePreviewProps {
  result: ResumeData;
}

export const ResumePreview: React.FC<ResumePreviewProps> = ({ result }) => {

  
  return (
    <div className="flex flex-col gap-4">
      <div className="glass-card p-8 flex flex-col gap-6 font-mono text-sm bg-white/5">
        
        
        <div className="border-b border-white/10 pb-5 text-center">
          <h2 className="text-3xl font-bold text-white mb-2">{result.name}</h2>
          <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 text-white/50 text-xs">
            {[result.email, result.phone, result.location, result.linkedin].filter(Boolean).map((v, i) => (
              <span key={i}>{v}</span>
            ))}
          </div>
        </div>

        {result.summary && (
          <div>
            <p className="text-xs text-indigo-400 font-bold uppercase tracking-widest mb-3 border-b border-white/10 pb-2">Summary</p>
            <p className="text-white/70 text-sm leading-relaxed">{result.summary}</p>
          </div>
        )}

      
        {result.experience?.length > 0 && (
          <div>
            <p className="text-xs text-indigo-400 font-bold uppercase tracking-widest mb-3 border-b border-white/10 pb-2">Experience</p>
            {result.experience.map((e, i) => (
              <div className="mb-5 last:mb-0" key={i}>
                <div className="flex justify-between items-start gap-1">
                  <span className="font-bold text-white/90">
                    {e.title} <span className="text-white/40">|</span> {e.company}
                  </span>
                  <span className="text-white/40 text-xs shrink-0 mt-0.5">
                    {e.startDate} - {e.endDate}
                  </span>
                </div>
                <div className="text-white/40 text-xs mb-2 italic">{e.location}</div>
                <ul className="flex flex-col gap-1.5 pl-4 list-disc marker:text-indigo-500/50">
                  {e.bullets.filter(Boolean).map((b, j) => (
                    <li key={j} className="text-white/60 text-sm leading-relaxed">
                      {b}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}

       
        {result.projects?.length > 0 && (
          <div>
            <p className="text-xs text-indigo-400 font-bold uppercase tracking-widest mb-3 border-b border-white/10 pb-2">Projects</p>
            {result.projects.map((p, i) => (
              <div className="mb-5 last:mb-0" key={i}>
                <div className="flex items-center gap-3 font-bold text-white/90 mb-2">
                  <span>{p.name}</span>
                  {p.link && (
                    <a href={p.link} target="_blank" rel="noreferrer" className="text-indigo-400 font-normal text-xs hover:underline">
                      {p.link}
                    </a>
                  )}
                </div>
                <ul className="flex flex-col gap-1.5 pl-4 list-disc marker:text-indigo-500/50">
                  {p.bullets.filter(Boolean).map((bullet, j) => (
                    <li key={j} className="text-white/60 text-sm leading-relaxed">
                      {bullet}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}

        {/* Education */}
        {result.education?.length > 0 && (
          <div>
            <p className="text-xs text-indigo-400 font-bold uppercase tracking-widest mb-3 border-b border-white/10 pb-2">Education</p>
            {result.education.map((e, i) => (
              <div key={i} className="mb-3 last:mb-0">
                <div className="flex justify-between items-start font-bold text-white/90">
                  <span>{e.degree}</span>
                  <span className="text-white/40 text-xs shrink-0 ml-4">{e.year}</span>
                </div>
                <div className="flex justify-between items-start text-white/60 text-sm mt-1">
                  <span>{e.school} {e.location ? `- ${e.location}` : ""}</span>
                  {e.gpa && <span className="font-semibold text-white/80">GPA: {e.gpa}</span>}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Skills */}
        {result.skills && (
          <div>
            <p className="text-xs text-indigo-400 font-bold uppercase tracking-widest mb-3 border-b border-white/10 pb-2">Skills</p>
            <div className="flex flex-col gap-2">
              {result.skills.technical?.length > 0 && (
                <p className="text-white/70 text-sm leading-relaxed">
                  <span className="text-white/90 font-bold mr-2">Technical:</span>
                  {result.skills.technical.join(", ")}
                </p>
              )}
              {result.skills.soft?.length > 0 && (
                <p className="text-white/70 text-sm leading-relaxed">
                  <span className="text-white/90 font-bold mr-2">Soft Skills:</span>
                  {result.skills.soft.join(", ")}
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      <button
        onClick={() => generateResumePDF(result)}
        className="btn-primary py-3.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 cursor-pointer"
      >
        <Download size={16} /> Download PDF
      </button>
    </div>
  );
};