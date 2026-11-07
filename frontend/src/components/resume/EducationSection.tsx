import { useFormContext, useFieldArray } from "react-hook-form";
import { GraduationCap, Plus, Trash2 } from "lucide-react";
import { Input } from "../ui/Input";

export const EducationSection = () => {
  const { control, register } = useFormContext();
  const { fields, append, remove } = useFieldArray({
    control,
    name: "education",
  });

  return (
    <div className="glass-card p-6 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold uppercase tracking-widest text-indigo-400 flex items-center gap-2">
          <GraduationCap size={14} /> Education
        </h3>
        <button
          type="button"
          onClick={() =>
            append({ degree: "", school: "", location: "", year: "", gpa: "" })
          }
          className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 cursor-pointer"
        >
          <Plus size={14} /> Add Education
        </button>
      </div>

      {fields.map((field, index) => (
        <div
          key={field.id}
          className="p-4 rounded-xl bg-white/3 border border-white/8 flex flex-col gap-3"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              {...register(`education.${index}.degree`)}
              placeholder="Degree (e.g. B.Tech CS) *"
            />
            <Input
              {...register(`education.${index}.school`)}
              placeholder="School / University *"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-center">
            <Input
              {...register(`education.${index}.location`)}
              placeholder="Location *"
            />
            <Input
              {...register(`education.${index}.year`)}
              placeholder="Year (e.g. 2022 - 2026) *"
            />
            <div className="flex gap-2 items-center">
              <Input
                {...register(`education.${index}.gpa`)}
                placeholder="GPA / % (Optional)"
                className="flex-1"
              />
              {fields.length > 1 && (
                <button
                  type="button"
                  onClick={() => remove(index)}
                  className="text-rose-400 hover:text-rose-300 p-2 cursor-pointer"
                >
                  <Trash2 size={15} />
                </button>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};