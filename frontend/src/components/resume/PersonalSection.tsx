import { useFormContext } from "react-hook-form";
import { User } from "lucide-react";
import { Input } from "../ui/Input";
import { Textarea } from "../ui/Textarea";

export const PersonalSection = () => {
  const { register, formState: { errors } } = useFormContext();

  return (
    <div className="glass-card p-6 flex flex-col gap-4">
      <h3 className="text-xs font-bold uppercase tracking-widest text-indigo-400 flex items-center gap-2">
        <User size={14} /> Personal Details
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        <Input
          {...register("name")}
          placeholder="Full Name *"
          error={errors.name?.message as string}
        />
        <Input
          {...register("email")}
          placeholder="Email Address *"
          error={errors.email?.message as string}
        />
        <Input
          {...register("phone")}
          placeholder="Phone Number *"
          error={errors.phone?.message as string}
        />
        <Input
          {...register("location")}
          placeholder="Location (e.g. Hyderabad, India) *"
          error={errors.location?.message as string}
        />
        <div className="sm:col-span-2">
          <Input
            {...register("linkedin")}
            placeholder="LinkedIn / Portfolio URL"
          />
        </div>
      </div>

      <Textarea
        {...register("summary")}
        rows={2}
        placeholder="Professional summary or target role *"
        error={errors.summary?.message as string}
        className="resize-none overflow-hidden"
        onInput={(e) => {
          const target = e.currentTarget;
          target.style.height = "auto";
          target.style.height = `${target.scrollHeight}px`;
        }}
      />
    </div>
  );
};