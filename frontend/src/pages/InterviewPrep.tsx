import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useIsMutating } from "@tanstack/react-query";
import toast from "react-hot-toast";
import {
  MessageSquare,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Lightbulb,
  Code2,
  Users,
  Download,
  Loader2,
} from "lucide-react";
import { useToolForm } from "../hooks/useToolForm";
import { useAiMutations, AI_QUERY_KEYS } from "../hooks/useAiMutations";
import { useCachedResult } from "../hooks/useCachedResult";
import { extractPdfText } from "../utils/file";
import { extractErrorMessage } from "../utils/error";
import { Dropzone } from "../components/ui/Dropzone";
import { ErrorAlert } from "../components/ui/Feedback";
import { InterviewSkeleton } from "../components/ui/InterviewSkeleton";
import { Input } from "../components/ui/Input";
import { Textarea } from "../components/ui/Textarea";
import { downloadInterview } from "../utils/interview";
import type { InterviewData, GenerateInterviewPayload } from "../types";

const interviewFormSchema = z.object({
  skills: z
    .string()
    .trim()
    .min(2, "Please enter target skills (e.g. Node.js, React)"),
  experience: z
    .string()
    .trim()
    .min(5, "Please enter your experience level or role context"),
});

type InterviewFormValues = z.infer<typeof interviewFormSchema>;

const InterviewPrep = () => {
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

  const [round, setRound] = useState<"technical" | "hr">("technical");
  const [openId, setOpenId] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [exporting, setExporting] = useState(false);

  const { interviewMutation } = useAiMutations();
  const { mutate } = interviewMutation;
  const isPending =
    useIsMutating({ mutationKey: AI_QUERY_KEYS.interviewQuestions }) > 0;
  const { result, clearResult } = useCachedResult<InterviewData>(
    AI_QUERY_KEYS.interviewQuestions,
  );

  const isBusy = isSubmitting || isPending;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<InterviewFormValues>({
    resolver: zodResolver(interviewFormSchema),
    defaultValues: {
      skills: "",
      experience: "",
    },
  });

  async function handleExport() {
    if (!result || exporting) return;
    setExporting(true);
    try {
      await downloadInterview(result);
    } catch {
      toast.error("Could not generate the PDF. Please try again.");
    } finally {
      setExporting(false);
    }
  }

  function onManualSubmit(values: InterviewFormValues) {
    if (isBusy) return;
    setError("");
    setIsSubmitting(true);
    clearResult();

    const payload: GenerateInterviewPayload = {
      mode: "manual",
      round,
      skills: values.skills,
      experience: values.experience,
    };

    mutate(payload, {
      onSuccess: (data) => {
        setOpenId(data.questions[0]?.id ?? null);
      },
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
      const payload: GenerateInterviewPayload = {
        mode: "resume",
        round,
        resumeText,
      };

      mutate(payload, {
        onSuccess: (data) => {
          setOpenId(data.questions[0]?.id ?? null);
        },
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
        {/* Top Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
              Manual Input
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
              From Resume PDF
            </button>
          </div>

          <div className="glass-card p-1.5 grid grid-cols-2 gap-1.5">
            <button
              type="button"
              disabled={isBusy}
              onClick={() => {
                setRound("technical");
                clearResult();
              }}
              className={`py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                round === "technical"
                  ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                  : "text-white/50 hover:text-white/80"
              }`}
            >
              <Code2 size={14} /> Technical Round
            </button>
            <button
              type="button"
              disabled={isBusy}
              onClick={() => {
                setRound("hr");
                clearResult();
              }}
              className={`py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                round === "hr"
                  ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                  : "text-white/50 hover:text-white/80"
              }`}
            >
              <Users size={14} /> HR & Behavioral
            </button>
          </div>
        </div>

        {/* Form */}
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
                <Sparkles size={16} /> Generate{" "}
                {round === "technical" ? "Technical" : "HR"} Questions
              </button>
            )}
          </form>
        ) : (
          <form
            onSubmit={handleSubmit(onManualSubmit)}
            className="flex flex-col gap-4"
          >
            <div className="glass-card p-6 flex flex-col gap-4">
              <Input
                label="Target Skills / Tech Stack"
                disabled={isBusy}
                {...register("skills")}
                placeholder="e.g. Node.js, Express, React, MongoDB, Redis, TypeScript"
                error={errors.skills?.message}
              />

              <Textarea
                label="Experience Level & Role Context"
                rows={3}
                disabled={isBusy}
                {...register("experience")}
                placeholder="e.g. Full-Stack MERN Developer interviewing for product-based software roles..."
                error={errors.experience?.message}
                className="resize-none overflow-hidden"
                onInput={(e) => {
                  const target = e.currentTarget;
                  target.style.height = "auto";
                  target.style.height = `${target.scrollHeight}px`;
                }}
              />
            </div>

            <ErrorAlert message={error} />

            {!isBusy && (
              <button
                type="submit"
                className="btn-primary py-3.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-indigo-500/20"
              >
                <Sparkles size={16} /> Generate{" "}
                {round === "technical" ? "Technical" : "HR"} Questions
              </button>
            )}
          </form>
        )}

        {/* Skeleton Loader */}
        {isBusy && <InterviewSkeleton />}

        {/* Results */}
        {result && !isBusy && (
          <div className="flex flex-col gap-4 animate-fade-in mt-2">
            <div className="glass-card p-5 flex items-center justify-between flex-wrap gap-3">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <MessageSquare size={16} className="text-indigo-400" />
                  {result.role} •{" "}
                  <span className="capitalize text-indigo-300">
                    {result.round} Round
                  </span>
                </h3>
                <p className="text-xs text-white/60 mt-0.5">
                  Click any question to view hints and preparation strategy
                </p>
              </div>

              <button
                type="button"
                onClick={handleExport}
                disabled={exporting}
                className="px-4 py-2 rounded-xl bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 border border-indigo-500/30 text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {exporting ? (
                  <>
                    <Loader2 size={14} className="animate-spin" /> Preparing...
                  </>
                ) : (
                  <>
                    <Download size={14} /> Export PDF
                  </>
                )}
              </button>
            </div>

            {result.questions.map((q, index) => {
              const isOpen = openId === q.id;
              return (
                <div
                  key={q.id}
                  className="glass-card overflow-hidden border border-white/8 transition-all"
                >
                  <button
                    type="button"
                    onClick={() => setOpenId(isOpen ? null : q.id)}
                    className="w-full p-5 flex items-start justify-between gap-4 text-left hover:bg-white/2 transition-colors cursor-pointer"
                  >
                    <div className="flex items-start gap-3">
                      <span className="w-6 h-6 rounded-full bg-indigo-500/15 text-indigo-300 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                        {index + 1}
                      </span>
                      <div className="flex flex-col gap-1">
                        <p className="text-sm font-semibold text-white/90 leading-snug">
                          {q.question}
                        </p>
                        <span className="text-[11px] text-indigo-300/70 font-medium">
                          {q.category}
                        </span>
                      </div>
                    </div>
                    {isOpen ? (
                      <ChevronUp
                        size={18}
                        className="text-white/60 shrink-0 mt-1"
                      />
                    ) : (
                      <ChevronDown
                        size={18}
                        className="text-white/60 shrink-0 mt-1"
                      />
                    )}
                  </button>

                  {isOpen && (
                    <div className="px-5 pb-5 pt-2 border-t border-white/5 bg-white/[0.01]">
                      <div className="p-3.5 rounded-xl bg-indigo-500/8 border border-indigo-500/15 flex items-start gap-2.5">
                        <Lightbulb
                          size={16}
                          className="text-indigo-400 shrink-0 mt-0.5"
                        />
                        <p className="text-xs text-indigo-200/90 leading-relaxed whitespace-pre-line">
                          <span className="font-semibold text-indigo-300">
                            Hint / Strategy:{" "}
                          </span>
                          {q.hint}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default InterviewPrep;