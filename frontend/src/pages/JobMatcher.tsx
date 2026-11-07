import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useIsMutating } from "@tanstack/react-query";
import {
  Briefcase,
  Sparkles,
  Lightbulb,
  CheckCircle2,
  Building2,
  MapPin,
} from "lucide-react";
import { useToolForm } from "../hooks/useToolForm";
import { useAiMutations, AI_QUERY_KEYS } from "../hooks/useAiMutations";
import { useCachedResult } from "../hooks/useCachedResult";
import { extractPdfText } from "../utils/file";
import { extractErrorMessage } from "../utils/error";
import { scoreColor } from "../utils/ui";
import { Dropzone } from "../components/ui/Dropzone";
import { ErrorAlert } from "../components/ui/Feedback";
import { JobMatchSkeleton } from "../components/ui/JobMatchSkeleton";
import { Input } from "../components/ui/Input";       // Custom Input component
import { Textarea } from "../components/ui/Textarea"; // Custom Textarea component
import type { JobMatchResponse, JobMatchPayload } from "../types";

const jobMatcherFormSchema = z.object({
  skills: z
    .string()
    .trim()
    .min(2, "Please enter at least one skill (comma separated)"),
  experience: z
    .string()
    .trim()
    .min(5, "Please enter your experience details or level"),
});

type JobMatcherFormValues = z.infer<typeof jobMatcherFormSchema>;

const JobMatcherPage = () => {
  const {
    mode,
    setMode,
    file,
    error,
    setError,
    fileRef,
    handleFileChange,
    getDropzoneProps,
  } = useToolForm();

  const [isSubmitting, setIsSubmitting] = useState(false);

  const { jobMatcherMutation } = useAiMutations();
  const { mutate } = jobMatcherMutation;
  const isPending =
    useIsMutating({ mutationKey: AI_QUERY_KEYS.jobMatches }) > 0;
  const { result, clearResult } = useCachedResult<JobMatchResponse>(
    AI_QUERY_KEYS.jobMatches,
  );

  const isBusy = isSubmitting || isPending;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<JobMatcherFormValues>({
    resolver: zodResolver(jobMatcherFormSchema),
    defaultValues: {
      skills: "",
      experience: "",
    },
  });

  function onManualSubmit(values: JobMatcherFormValues) {
    if (isBusy) return;
    setError("");
    setIsSubmitting(true);
    clearResult();

    const skillsArray = values.skills
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    const payload: JobMatchPayload = {
      mode: "manual",
      skills: skillsArray,
      experience: values.experience,
    };

    mutate(payload, {
      onError: (err) => setError(extractErrorMessage(err)),
      onSettled: () => setIsSubmitting(false),
    });
  }

  async function handleResumeSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (isBusy) return;

    setError("");
    setIsSubmitting(true);
    clearResult();

    if (!file) {
      setIsSubmitting(false);
      return setError("Please upload your resume PDF.");
    }

    try {
      const resumeText = await extractPdfText(file);
      const payload: JobMatchPayload = { mode: "resume", resumeText };

      mutate(payload, {
        onError: (err) => setError(extractErrorMessage(err)),
        onSettled: () => setIsSubmitting(false),
      });
    } catch (err) {
      setIsSubmitting(false);
      setError(extractErrorMessage(err));
    }
  }

  return (
    <div className="bg-page min-h-screen pt-20 px-4 md:px-8 pb-12">
      <div className="max-w-3xl mx-auto flex flex-col gap-5">
        {/* Mode Selector Tabs with clearResult() reset */}
        <div className="glass-card p-1.5 grid grid-cols-2 gap-1.5">
          <button
            type="button"
            disabled={isBusy}
            onClick={() => {
              setMode("manual");
              setError("");
              clearResult();
            }}
            className={`py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              mode === "manual"
                ? "bg-indigo-500 text-white shadow-lg shadow-indigo-500/25"
                : "text-white/50 hover:text-white/80"
            }`}
          >
            Manual Skills & Experience
          </button>
          <button
            type="button"
            disabled={isBusy}
            onClick={() => {
              setMode("resume");
              setError("");
              clearResult();
            }}
            className={`py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              mode === "resume"
                ? "bg-indigo-500 text-white shadow-lg shadow-indigo-500/25"
                : "text-white/50 hover:text-white/80"
            }`}
          >
            Upload Resume PDF
          </button>
        </div>

        {/* Conditional Form Render */}
        {mode === "resume" ? (
          <form onSubmit={handleResumeSubmit} className="flex flex-col gap-4">
            <Dropzone
              file={file}
              loading={isBusy}
              fileRef={fileRef}
              getDropzoneProps={() => getDropzoneProps(isBusy)}
              handleFileChange={handleFileChange}
            />

            <ErrorAlert message={error} />

            {!isBusy && (
              <button
                type="submit"
                className="btn-primary py-3.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-indigo-500/20"
              >
                <Sparkles size={16} /> Find Matching Roles
              </button>
            )}
          </form>
        ) : (
          <form
            onSubmit={handleSubmit(onManualSubmit)}
            className="flex flex-col gap-4"
          >
            <div className="glass-card p-6 flex flex-col gap-5">
              <Input
                label="Your Technical & Core Skills (Comma Separated)"
                disabled={isBusy}
                {...register("skills")}
                placeholder="e.g. React, Node.js, TypeScript, MongoDB, Redis"
                error={errors.skills?.message}
              />

              <Textarea
                label="Experience Summary / Level"
                rows={3}
                disabled={isBusy}
                {...register("experience")}
                placeholder="e.g. Fresher / 1 year building full-stack MERN applications with REST APIs and Redis session management..."
                error={errors.experience?.message}
              />
            </div>

            <ErrorAlert message={error} />

            {!isBusy && (
              <button
                type="submit"
                className="btn-primary py-3.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-indigo-500/20"
              >
                <Sparkles size={16} /> Find Matching Roles
              </button>
            )}
          </form>
        )}

        {/* Ghost Skeleton Loader while waiting for AI */}
        {isBusy && <JobMatchSkeleton />}

        {/* Results */}
        {result && !isBusy && (
          <div className="flex flex-col gap-4 animate-fade-in mt-2">
            {result.summary && (
              <div className="glass-card p-5 border border-indigo-500/20">
                <p className="text-xs text-indigo-400 uppercase tracking-widest font-bold mb-1">
                  Profile Market Fit Summary
                </p>
                <p className="text-sm text-white/70 leading-relaxed">
                  {result.summary}
                </p>
              </div>
            )}

            {result.jobs.map((job, idx) => (
              <div
                key={idx}
                className="glass-card p-6 flex flex-col gap-4 border border-white/8 hover:border-indigo-500/30 transition-all"
              >
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div className="flex flex-col gap-1.5">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                      <Briefcase
                        size={18}
                        className="text-indigo-400 shrink-0"
                      />
                      {job.title}
                    </h3>
                    <div className="flex items-center gap-3 flex-wrap text-xs text-white/60">
                      <span className="flex items-center gap-1">
                        <Building2 size={13} className="text-white/60" />
                        {job.company}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin size={13} className="text-white/60" />
                        {job.location}
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-white/5 text-white/60 font-medium">
                        {job.type}
                      </span>
                    </div>
                  </div>

                  <div className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 flex items-center gap-1.5 shrink-0">
                    <span
                      className={`text-base font-black ${scoreColor(job.matchScore)}`}
                    >
                      {job.matchScore}%
                    </span>
                    <span className="text-[10px] text-white/60 uppercase font-bold">
                      Match
                    </span>
                  </div>
                </div>

                {job.skills.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {job.skills.map((skill, i) => (
                      <span
                        key={i}
                        className="text-[11px] px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                )}

                <div className="divider-subtle" />

                <div className="flex flex-col gap-1.5">
                  <span className="text-xs font-bold uppercase tracking-wider text-white/60 flex items-center gap-1.5">
                    <CheckCircle2 size={13} className="text-emerald-400" />
                    Why You Match
                  </span>
                  <p className="text-sm text-white/65 leading-relaxed">
                    {job.whyMatch}
                  </p>
                </div>

                <div className="bg-indigo-500/8 border border-indigo-500/15 rounded-xl p-3.5 flex items-start gap-2.5">
                  <Lightbulb
                    size={16}
                    className="text-indigo-400 shrink-0 mt-0.5"
                  />
                  <p className="text-xs text-indigo-200/90 leading-relaxed">
                    <span className="font-semibold text-indigo-300">
                      Apply Tip:{" "}
                    </span>
                    {job.applyTip}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default JobMatcherPage;