import { matchBg, matchColor,} from "../utils/ui";
import { toBase64 } from "../utils/file";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Briefcase, ChevronRight } from "lucide-react";
import type { JobMatchResponse } from "../api/ai";
import { extractErrorMessage } from "../utils/error";
import { useToolForm } from "../hooks/useToolForm";
import { aiApi } from "../api/ai";
import { JobManualInputForm } from "../components/JobManualInputForm";
import { Dropzone } from "../components/ui/Dropzone";
import { ErrorAlert, LoadingState } from "../components/ui/Feedback";

const JobMatcherPage = () => {
  const queryClient = useQueryClient();
  const {
    mode,
    setMode,
    file,
    loading,
    setLoading,
    error,
    setError,
    fileRef,
    handleFileChange,
    getDropzoneProps,
  } = useToolForm();

  const [result, setResult] = useState<JobMatchResponse | null>(null);

  async function handleSubmit(submittedSkills?: string[], submittedExperience?: string) {
    setError("");
    setResult(null);
    if (mode === "manual" && (!submittedSkills?.length || !submittedExperience?.trim())) {
      return setError("Please add at least one skill and your experience.");
    }
    if (mode === "resume" && !file) {
      return setError("Please upload your resume PDF.");
    }

    setLoading(true);

    try {
      const payload: any = { mode };
      
      if (mode === "manual") {
        payload.skills = submittedSkills;
        payload.experience = submittedExperience;
      } else {
        payload.pdfBase64 = await toBase64(file!);
      }

      const data = await aiApi.matchJobs(payload);
      setResult(data);
      queryClient.invalidateQueries({ queryKey: ["authUser"] });
      
    } catch (err: unknown) {
      setError(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-page min-h-screen pt-20 px-4 md:px-8 pb-12">
      <div className="max-w-3xl mx-auto flex flex-col gap-4">
        
      
        <div className="glass-card p-1.5 flex gap-1.5">
          {(["manual", "resume"] as const).map((m) => (
            <button
              key={m}
              onClick={() => {
                setMode(m);
                setResult(null);
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
            loading={loading} 
            fileRef={fileRef} 
            getDropzoneProps={getDropzoneProps} 
            handleFileChange={handleFileChange} 
          />
        )}

        <ErrorAlert message={error} />

    
        {mode === "resume" && !loading && (
          <button
            onClick={() => handleSubmit()}
            className="btn-primary py-3.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2"
          >
            <Briefcase size={16} /> Find Matching Jobs
          </button>
        )}

        {loading && <LoadingState message="Analyzing your profile against job market..." />}

        {result && !loading && (
          <div className="flex flex-col gap-4 animate-fade-in">
            {result.jobs.map((job, i) => (
              <div
                key={i}
                className={`glass-card p-6 flex flex-col gap-4 border ${matchBg(job.matchScore)}`}
              >
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div>
                    <h3 className="font-bold text-white text-lg">{job.title}</h3>
                    <p className="text-white/45 text-sm mt-0.5">
                      {job.company} • {job.location} • {job.type}
                    </p>
                  </div>
                  <span className={`text-2xl font-black shrink-0 ${matchColor(job.matchScore)}`}>
                    {job.matchScore}%
                  </span>
                </div>

                <div className="divider-subtle" />

                <div className="flex flex-col gap-2">
                  <p className="text-xs text-white/30 uppercase tracking-widest">Why you match</p>
                  <p className="text-sm text-white/55 leading-relaxed">{job.whyMatch}</p>
                </div>

                <div className="flex items-start gap-2 text-sm text-white/60 bg-white/4 rounded-xl p-3 mt-1">
                  <ChevronRight size={16} className="text-indigo-400 shrink-0 mt-0.5" />
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