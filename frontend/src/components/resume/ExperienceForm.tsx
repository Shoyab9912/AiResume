import React from "react";
import type { Experience } from "../../types";
import { Input } from "../ui/Input";
import { Plus, Trash } from "lucide-react";

interface ExperienceFormProps {
  experience: Experience[];
  onUpdateExp: (i: number, key: keyof Experience, val: string) => void;
  onUpdateBullet: (ei: number, bi: number, val: string) => void;
  onAddExp: () => void;
  onRemoveExp: (i: number) => void;
  onAddBullet: (ei: number) => void;
  onRemoveBullet: (ei: number, bi: number) => void;
}

export const ExperienceForm: React.FC<ExperienceFormProps> = ({
  experience,
  onUpdateExp,
  onUpdateBullet,
  onAddExp,
  onRemoveExp,
  onAddBullet,
  onRemoveBullet,
}) => {
  


  
  return (
    <div className="glass-card overflow-hidden">
      <div className="px-6 py-4 border-b border-white/6 flex justify-between items-center">
        <span className="text-sm font-semibold text-white/85">Work Experience</span>
      </div>
      <div className="p-6 flex flex-col gap-4">
        {experience.map((exp, ei) => (
          <div key={ei} className="flex flex-col gap-3 p-4 bg-white/3 rounded-xl border border-white/6">
            <div className="flex justify-between items-center">
              <span className="text-xs text-white/30 uppercase tracking-widest">Position {ei + 1}</span>
              {experience.length > 1 && (
                <button
                  type="button"
                  onClick={() => onRemoveExp(ei)}
                  className="text-red-400/60 hover:text-red-400 transition-colors"
                >
                  <Trash size={14} />
                </button>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="Job Title"
                value={exp.title}
                onChange={(e) => onUpdateExp(ei, "title", e.target.value)}
                placeholder="Software Engineer"
              />
              <Input
                label="Company"
                value={exp.company}
                onChange={(e) => onUpdateExp(ei, "company", e.target.value)}
                placeholder="Google"
              />
              <Input
                label="Location"
                value={exp.location}
                onChange={(e) => onUpdateExp(ei, "location", e.target.value)}
                placeholder="Ranchi, Jharkhand"
              />
              <Input
                label="Start Date"
                value={exp.startDate}
                onChange={(e) => onUpdateExp(ei, "startDate", e.target.value)}
                placeholder="April 2026"
              />
              <Input
                label="End Date"
                value={exp.endDate}
                onChange={(e) => onUpdateExp(ei, "endDate", e.target.value)}
                placeholder="Present"
              />
            </div>
            <div className="flex flex-col gap-2 mt-2">
              <label className="text-xs text-white/30 uppercase tracking-widest">Key Achievements / Responsibilities</label>
              {exp.bullets.map((b, bi) => (
                <div key={bi} className="flex gap-2 items-center">
                  <Input
                    value={b}
                    onChange={(e) => onUpdateBullet(ei, bi, e.target.value)}
                    placeholder={`Bullet ${bi + 1} - start with an action verb`}
                  />
                  {exp.bullets.length > 1 && (
                    <button
                      type="button"
                      onClick={() => onRemoveBullet(ei, bi)}
                      className="text-red-400/50 hover:text-red-400 transition-colors p-2"
                    >
                      <Trash size={13} />
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={() => onAddBullet(ei)}
                className="feature-pill self-start gap-1.5 cursor-pointer hover:border-white/15 transition-colors mt-1"
              >
                <Plus size={10} /> Add Bullet
              </button>
            </div>
          </div>
        ))}
        <button
          type="button"
          onClick={onAddExp}
          className="feature-pill self-start gap-1.5 cursor-pointer hover:border-white/15 transition-colors"
        >
          <Plus size={10} /> Add Experience
        </button>
      </div>
    </div>
  );
};