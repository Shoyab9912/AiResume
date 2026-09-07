import React from "react";
import type { Education } from "../../types";
import { Input } from "../ui/Input";
import { Plus, Trash } from "lucide-react";

interface EducationFormProps {
  education: Education[];
  onUpdateEdu: (i: number, key: keyof Education, val: string) => void;
  onAddEdu: () => void;
  onRemoveEdu: (i: number) => void;
}

export const EducationForm: React.FC<EducationFormProps> = ({
  education,
  onUpdateEdu,
  onAddEdu,
  onRemoveEdu,
}) => {

  

  
  return (
    <div className="glass-card overflow-hidden">
      <div className="px-6 py-4 border-b border-white/6">
        <span className="text-sm font-semibold text-white/85">Education</span>
      </div>
      <div className="p-6 flex flex-col gap-4">
        {education.map((edu, ei) => (
          <div key={ei} className="flex flex-col gap-3 p-4 bg-white/3 rounded-xl border border-white/6">
            <div className="flex justify-between items-center">
              <span className="text-xs text-white/30 uppercase tracking-widest">Education {ei + 1}</span>
              {education.length > 1 && (
                <button
                  type="button"
                  onClick={() => onRemoveEdu(ei)}
                  className="text-red-400/60 hover:text-red-400 transition-colors"
                >
                  <Trash size={14} />
                </button>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="Degree"
                value={edu.degree}
                onChange={(e) => onUpdateEdu(ei, "degree", e.target.value)}
                placeholder="B.Tech CS"
              />
              <Input
                label="School"
                value={edu.school}
                onChange={(e) => onUpdateEdu(ei, "school", e.target.value)}
                placeholder="IIT Bombay"
              />
              <Input
                label="Location"
                value={edu.location}
                onChange={(e) => onUpdateEdu(ei, "location", e.target.value)}
                placeholder="Mumbai, India"
              />
              <Input
                label="Year"
                value={edu.year}
                onChange={(e) => onUpdateEdu(ei, "year", e.target.value)}
                placeholder="2026"
              />
              <Input
                label="GPA (optional)"
                value={edu.gpa || ""}
                onChange={(e) => onUpdateEdu(ei, "gpa", e.target.value)}
                placeholder="8.5/10"
              />
            </div>
          </div>
        ))}
        <button
          type="button"
          onClick={onAddEdu}
          className="feature-pill self-start gap-1.5 cursor-pointer hover:border-white/15 transition-colors"
        >
          <Plus size={10} /> Add Education
        </button>
      </div>
    </div>
  );
};