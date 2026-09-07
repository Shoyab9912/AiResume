import React from "react";
import type { Project } from "../../types";
import { Input } from "../ui/Input";
import { Plus, Trash } from "lucide-react";
interface SkillsAndProjectsFormProps {
  techSkills: string;
  softSkills: string;
  projects: Project[];
  certs: string;
  onChangeTech: (val: string) => void;
  onChangeSoft: (val: string) => void;
  onChangeCerts: (val: string) => void;
  onUpdateProj: (i: number, key: "name" | "link", val: string) => void;
  onUpdateProjBullet: (pi: number, bi: number, val: string) => void;
  onAddProj: () => void;
  onRemoveProj: (i: number) => void;
  onAddProjBullet: (pi: number) => void;
  onRemoveProjBullet: (pi: number, bi: number) => void;
}
export const SkillsAndProjectsForm: React.FC<SkillsAndProjectsFormProps> = ({
  techSkills,
  softSkills,
  projects,
  certs,
  onChangeTech,
  onChangeSoft,
  onChangeCerts,
  onUpdateProj,
  onUpdateProjBullet,
  onAddProj,
  onRemoveProj,
  onAddProjBullet,
  onRemoveProjBullet,
}) => {


  return (
    <>
      <div className="glass-card overflow-hidden">
        <div className="px-6 py-4 border-b border-white/6">
          <span className="text-sm font-semibold text-white/85">Skills</span>
        </div>
        <div className="p-6 flex flex-col gap-4">
          <Input
            label="Technical Skills (comma separated)"
            value={techSkills}
            onChange={(e) => onChangeTech(e.target.value)}
            placeholder="React, Node.js, TypeScript..."
          />
          <Input
            label="Soft Skills (comma separated)"
            value={softSkills}
            onChange={(e) => onChangeSoft(e.target.value)}
            placeholder="Leadership, Problem Solving..."
          />
        </div>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="px-6 py-4 border-b border-white/6 flex justify-between items-center">
          <span className="text-sm font-semibold text-white/85">Projects (Optional)</span>
        </div>
        <div className="p-6 flex flex-col gap-4">
          {projects.map((proj, pi) => (
            <div key={pi} className="flex flex-col gap-3 p-4 bg-white/3 rounded-xl border border-white/6">
              <div className="flex justify-between items-center">
                <span className="text-xs text-white/30 uppercase tracking-widest">Project {pi + 1}</span>
                {projects.length > 1 && (
                  <button
                    type="button"
                    onClick={() => onRemoveProj(pi)}
                    className="text-red-400/60 hover:text-red-400 transition-colors"
                  >
                    <Trash size={14} />
                  </button>
                )}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input
                  label="Project Name"
                  value={proj.name}
                  onChange={(e) => onUpdateProj(pi, "name", e.target.value)}
                  placeholder="AI SaaS App"
                />
                <Input
                  label="Link (optional)"
                  value={proj.link || ""}
                  onChange={(e) => onUpdateProj(pi, "link", e.target.value)}
                  placeholder="github.com/user/project"
                />
              </div>
              <div className="flex flex-col gap-2 mt-2">
                <label className="text-xs text-white/30 uppercase tracking-widest">Key Features / Tech Stack</label>
                {proj.bullets.map((b, bi) => (
                  <div key={bi} className="flex gap-2 items-center">
                    <Input
                      value={b}
                      onChange={(e) => onUpdateProjBullet(pi, bi, e.target.value)}
                      placeholder={`Bullet ${bi + 1} - explain tech used or impact`}
                    />
                    {proj.bullets.length > 1 && (
                      <button
                        type="button"
                        onClick={() => onRemoveProjBullet(pi, bi)}
                        className="text-red-400/50 hover:text-red-400 transition-colors p-2"
                      >
                        <Trash size={13} />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => onAddProjBullet(pi)}
                  className="feature-pill self-start gap-1.5 cursor-pointer hover:border-white/15 transition-colors mt-1"
                >
                  <Plus size={10} /> Add Bullet
                </button>
              </div>
            </div>
          ))}
          <button
            type="button"
            onClick={onAddProj}
            className="feature-pill self-start gap-1.5 cursor-pointer hover:border-white/15 transition-colors"
          >
            <Plus size={10} /> Add Project
          </button>
        </div>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="px-6 py-4 border-b border-white/6">
          <span className="text-sm font-semibold text-white/85">Certifications (Optional)</span>
        </div>
        <div className="p-6">
          <Input
            label="Certifications (comma separated)"
            value={certs}
            onChange={(e) => onChangeCerts(e.target.value)}
            placeholder="AWS Developer, Google Analytics..."
          />
        </div>
      </div>
    </>
  );
};