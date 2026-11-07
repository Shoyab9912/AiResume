import { useFormContext, useFieldArray } from "react-hook-form";
import { FolderGit2, Plus, Trash2 } from "lucide-react";
import { Input } from "../ui/Input";
import { Textarea } from "../ui/Textarea";

export const ProjectsSection = () => {
  const { control, register } = useFormContext();
  const { fields, append, remove } = useFieldArray({
    control,
    name: "projects",
  });

  return (
    <div className="glass-card p-6 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold uppercase tracking-widest text-indigo-400 flex items-center gap-2">
          <FolderGit2 size={14} /> Projects
        </h3>
        <button
          type="button"
          onClick={() => append({ name: "", link: "", bulletsText: "" })}
          className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 cursor-pointer"
        >
          <Plus size={14} /> Add Project
        </button>
      </div>

      {fields.map((field, index) => (
        <div
          key={field.id}
          className="p-4 rounded-xl bg-white/3 border border-white/8 flex flex-col gap-3"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-white/50">
              Project #{index + 1}
            </span>
            {fields.length > 1 && (
              <button
                type="button"
                onClick={() => remove(index)}
                className="text-rose-400 hover:text-rose-300 cursor-pointer"
              >
                <Trash2 size={14} />
              </button>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              {...register(`projects.${index}.name`)}
              placeholder="Project Name *"
            />
            <Input
              {...register(`projects.${index}.link`)}
              placeholder="GitHub / Live Link (Optional)"
            />
          </div>
          <div className="flex flex-col gap-1">
            <Textarea
              {...register(`projects.${index}.bulletsText`)}
              rows={3}
              placeholder="Enter bullet points (Press Enter for a new bullet line)..."
              className="resize-none overflow-hidden"
              onInput={(e) => {
                const target = e.currentTarget;
                target.style.height = "auto";
                target.style.height = `${target.scrollHeight}px`;
              }}
            />
            <span className="text-[11px] text-white/60 italic">
              Tip: Each line will automatically format as a bullet point on your resume.
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};