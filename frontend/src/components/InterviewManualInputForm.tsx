import { useState } from "react";
import { Code2 } from "lucide-react";
import { Input } from "./ui/Input";
import { Textarea } from "./ui/Textarea";

interface Props {
  onSubmit: (skills: string, experience: string) => void;
}

export const InterviewManualInputForm = ({ onSubmit }: Props) => {
  const [skills, setSkills] = useState("");
  const [experience, setExperience] = useState("");

  return (
    <div className="glass-card p-6 flex flex-col gap-5">
      <Input
        label="Your Skills"
        value={skills}
        onChange={(e) => setSkills(e.target.value)}
        placeholder="e.g. React, Python, SQL..."
        className="rounded-xl text-sm placeholder-white/25"
      />

      <Textarea
        label="Experience & Background"
        value={experience}
        onChange={(e) => setExperience(e.target.value)}
        rows={4}
        placeholder="e.g. 2 Years of frontend development, Agile workflows..."
        className="rounded-xl text-sm placeholder-white/25"
      />

      <button
        onClick={() => onSubmit(skills, experience)}
        className="btn-primary py-3.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 mt-2"
      >
        <Code2 size={16} /> Get Interview Questions
      </button>
    </div>
  );
};