import { useState } from "react";
import { Briefcase, Plus, X } from "lucide-react";
import { Input } from "./ui/Input";
import { Textarea } from "./ui/Textarea";

interface Props {
  onSubmit: (skills: string[], experience: string) => void;
}

export const JobManualInputForm = ({ onSubmit }: Props) => {
  const [skills, setSkills] = useState<string[]>([]);
  const [currentSkill, setCurrentSkill] = useState("");
  const [experience, setExperience] = useState("");

  const handleAddSkill = () => {
    if (currentSkill.trim() && !skills.includes(currentSkill.trim())) {
      setSkills([...skills, currentSkill.trim()]);
      setCurrentSkill("");
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setSkills(skills.filter((s) => s !== skillToRemove));
  };

  return (
    <div className="glass-card p-6 flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <div className="flex gap-2 items-end">
          <div className="flex-1">
            <Input
              label="Your Skills"
              value={currentSkill}
              onChange={(e) => setCurrentSkill(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddSkill()}
              placeholder="e.g. React, Node.js..."
              className="rounded-xl text-sm placeholder-white/25"
            />
          </div>
          <button
            onClick={handleAddSkill}
            className="btn-primary px-4 py-2.5 rounded-xl text-sm flex items-center gap-1.5 h-[42px]"
          >
            <Plus size={16} /> Add
          </button>
        </div>

        {skills.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {skills.map((skill) => (
              <span key={skill} className="feature-pill gap-2">
                {skill}
                <button
                  onClick={() => removeSkill(skill)}
                  className="hover:text-red-400 transition-colors"
                >
                  <X size={12} />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      <Textarea
        label="Experience & Background"
        value={experience}
        onChange={(e) => setExperience(e.target.value)}
        rows={4}
        placeholder="e.g. 3 years as a full-stack developer working with MERN..."
        className="rounded-xl text-sm placeholder-white/25"
      />

      <button
        onClick={() => onSubmit(skills, experience)}
        className="btn-primary py-3.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 mt-2"
      >
        <Briefcase size={16} /> Find Matching Jobs
      </button>
    </div>
  );
};