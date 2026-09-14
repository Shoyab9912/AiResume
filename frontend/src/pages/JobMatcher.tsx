import { useState } from "react";
import { useIsMutating } from "@tanstack/react-query";
import { matchBg, matchColor } from "../utils/ui";
import { toBase64 } from "../utils/file";
import { Briefcase, ChevronRight } from "lucide-react";
import { extractErrorMessage } from "../utils/error";
import { useToolForm } from "../hooks/useToolForm";
import { useAiMutations, AI_QUERY_KEYS } from "../hooks/useAiMutations";
import { useCachedResult } from "../hooks/useCachedResult";
import type { JobMatchPayload } from "../hooks/useAiMutations";
import type { JobMatchResponse } from "../types";
import { JobManualInputForm } from "../components/JobManualInputForm";
import { Dropzone } from "../components/ui/Dropzone";
import { ErrorAlert, LoadingState } from "../components/ui/Feedback";

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

  const { jobMatcherMutation } = useAiMutations();
  const { mutate } = jobMatcherMutation;
  const isPending =
    useIsMutating({ mutationKey: AI_QUERY_KEYS.jobMatches }) > 0;
  const { result, clearResult } = useCachedResult<JobMatchResponse>(
    AI_QUERY_KEYS.jobMatches,
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(
    submittedSkills?: string[],
    submittedExperience?: string,
  ) {
    if (isSubmitting) return;
    setIsSubmitting(true);
    setError("");
    clearResult();

    if (
      mode === "manual" &&
      (!submittedSkills?.length || !submittedExperience?.trim())
    ) {
      setIsSubmitting(false);
      return setError("Please add at least one skill and your experience.");
    }
    if (mode === "resume" && !file) {
      setIsSubmitting(false);
      return setError("Please upload your resume PDF.");
    }

    try {
      const payload: JobMatchPayload =
        mode === "manual"
          ? {
              mode: "manual",
              skills: submittedSkills!,
              experience: submittedExperience!,
            }
          : { mode: "resume", pdfBase64: await toBase64(file!) };

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
      <div className="max-w-3xl mx-auto flex flex-col gap-4">
        <div className="glass-card p-1.5 flex gap-1.5">
          {(["manual", "resume"] as const).map((m) => (
            <button
              key={m}
              disabled={isPending}
              onClick={() => {
              if (isPending) return;
                setMode(m);
                clearResult();
                setError("");
              }}
              className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 capitalize ${
                mode === m ? "btn-primary" : "text-white/40 hover:text-white/70"
              }`}
            >
              {m === "manual" ? "Enter Skills Manually" : "Upload Resume"}
            </button>
          ))}
        </div>

        {mode === "manual" && <JobManualInputForm onSubmit={handleSubmit} />}

        {mode === "resume" && (
          <Dropzone
            file={file}
            loading={isPending}
            fileRef={fileRef}
            getDropzoneProps={() => getDropzoneProps(isPending)}
            handleFileChange={handleFileChange}
          />
        )}

        <ErrorAlert message={error} />

        {mode === "resume" && !isSubmitting && !isPending && (
          <button
            onClick={() => handleSubmit()}
            className="btn-primary py-3.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2"
          >
            <Briefcase size={16} /> Find Matching Jobs
          </button>
        )}

        {(isSubmitting || isPending) && (
          <LoadingState message="Analyzing your profile against job market..." />
        )}

        {result && !isPending && (
          <div className="flex flex-col gap-4 animate-fade-in">
            {result.jobs.map((job, i) => (
              <div
                key={i}
                className={`glass-card p-6 flex flex-col gap-4 border ${matchBg(job.matchScore)}`}
              >
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div>
                    <h3 className="font-bold text-white text-lg">
                      {job.title}
                    </h3>
                    <p className="text-white/45 text-sm mt-0.5">
                      {job.company} • {job.location} • {job.type}
                    </p>
                  </div>
                  <span
                    className={`text-2xl font-black shrink-0 ${matchColor(job.matchScore)}`}
                  >
                    {job.matchScore}%
                  </span>
                </div>

                <div className="divider-subtle" />

                <div className="flex flex-col gap-2">
                  <p className="text-xs text-white/30 uppercase tracking-widest">
                    Why you match
                  </p>
                  <p className="text-sm text-white/55 leading-relaxed">
                    {job.whyMatch}
                  </p>
                </div>

                <div className="flex items-start gap-2 text-sm text-white/60 bg-white/4 rounded-xl p-3 mt-1">
                  <ChevronRight
                    size={16}
                    className="text-indigo-400 shrink-0 mt-0.5"
                  />
                  <p>{job.applyTip}</p>
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
