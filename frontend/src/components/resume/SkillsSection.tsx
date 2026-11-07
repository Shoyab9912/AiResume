import { useFormContext } from "react-hook-form";
import { Wrench, Award } from "lucide-react";
import { Input } from "../ui/Input";

export const SkillsSection = () => {
  const { register, formState: { errors } } = useFormContext();

  return (
    <div className="glass-card p-6 flex flex-col gap-4">
      <div className="flex flex-col gap-3.5">
        <h3 className="text-xs font-bold uppercase tracking-widest text-indigo-400 flex items-center gap-2">
          <Wrench size={14} /> Skills (Comma Separated)
        </h3>
        <Input
          {...register("technicalSkills")}
          placeholder="Technical Skills: React, Node.js, TypeScript, MongoDB, Redis *"
          error={errors.technicalSkills?.message as string}
        />
        <Input
          {...register("softSkills")}
          placeholder="Soft Skills: Problem Solving, Ownership, Agile Collaboration (Optional)"
        />
      </div>

      <div className="divider-subtle my-1" />

      <div className="flex flex-col gap-2">
        <h3 className="text-xs font-bold uppercase tracking-widest text-indigo-400 flex items-center gap-2">
          <Award size={14} /> Certifications (Comma Separated, Optional)
        </h3>
        <Input
          {...register("certifications")}
          placeholder="e.g. HackerRank Node.js Intermediate, AWS Cloud Practitioner"
        />
      </div>
    </div>
  );
};