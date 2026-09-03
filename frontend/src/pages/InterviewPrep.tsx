import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { ChevronDown, ChevronUp, Code2, Download, Lightbulb, Users } from "lucide-react";
import type { InterviewData, Question } from "../types";
import {  toBase64 } from "../utils/file";
import { downloadInterview } from "../utils/resume";
import { extractErrorMessage } from "../utils/error";
import { useToolForm } from "../hooks/useToolForm";
import { aiApi } from "../api/ai";
import { InterviewManualInputForm } from "../components/InterviewManualInputForm";
import { Dropzone } from "../components/ui/DropZone";
import { ErrorAlert, LoadingState } from "../components/ui/Feedback";

function QCard({ q }: { q: Question }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="glass-card overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-start justify-between gap-4 py-4 px-5 text-left hover:bg-white/2 transition-colors"
      >
        <div className="flex gap-3 items-start">
          <span className="text-xs font-bold text-indigo-400 mt-0.5">Q{q.id}</span>
          <div>
            <p className="text-sm text-white/80 leading-relaxed">{q.question}</p>
            <span className="text-[10px] text-white/25 uppercase tracking-widest mt-1 block">
              {q.category}
            </span>
          </div>
        </div>
        {open ? (
          <ChevronUp size={14} className="text-white/30 shrink-0 mt-1" />
        ) : (
          <ChevronDown size={14} className="text-white/30 shrink-0 mt-1" />
        )}
        {open && (
          <div className="px-5 pb-4 flex items-start gap-2 border-t border-white/6 pt-3">
            <Lightbulb size={13} className="text-amber-400 shrink-0 mt-0.5" />
            <p className="text-xs text-white/45 leading-relaxed">{q.hint}</p>
          </div>
        )}
      </button>
    </div>
  );
}

const InterviewPrep = () => {
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

  const [round, setRound] = useState<"hr" | "technical">("hr");
  const [result, setResult] = useState<InterviewData | null>(null);

  async function handleSubmit(submittedSkills?: string, submittedExperience?: string) {
    setError("");
    setResult(null);

    if (mode === "manual" && (!submittedSkills?.trim() || !submittedExperience?.trim())) {
      return setError("Please add your skills and experience.");
    }
    if (mode === "resume" && !file) {
      return setError("Please upload your resume PDF.");
    }

    setLoading(true);
    try {
      const payload: any = { mode, round };
      
      if (mode === "manual") {
        payload.skills = submittedSkills;
        payload.experience = submittedExperience;
      } else {
        payload.pdfBase64 = await toBase64(file!);
      }

      const data = await aiApi.generateInterview(payload);
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

        <div className="glass-card p-1.5 flex gap-1.5">
          {[
            { key: "hr", label: "HR Round", Icon: Users },
            { key: "technical", label: "Technical Round", Icon: Code2 },
          ].map(({ key, label, Icon }) => (
            <button
              key={key}
              onClick={() => {
                setRound(key as "hr" | "technical");
                setResult(null);
              }}
              className={`flex-1 py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all duration-200 ${
                round === key ? "btn-primary" : "text-white/40 hover:text-white/70"
              }`}
            >
              <Icon size={14} /> {label}
            </button>
          ))}
        </div>

        {mode === "manual" && <InterviewManualInputForm onSubmit={handleSubmit} />}

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
            <Code2 size={16} /> Get Interview Questions
          </button>
        )}

        {loading && <LoadingState message="Getting Interview Questions..." />}

        {result && !loading && (
          <div className="flex flex-col gap-4 animate-fade-in">
            <div className="glass-card p-5 flex items-center justify-between flex-wrap gap-3">
              <div>
                <p className="font-semibold text-white">{result.role}</p>
                <p className="text-white/40 text-sm mt-0.5">
                  {result.round === "hr" ? "HR Round" : "Technical Round"} •{" "}
                  {result.questions.length} questions
                </p>
              </div>
              <button
                onClick={() => downloadInterview(result)}
                className="feature-pill gap-2 cursor-pointer hover:border-white/20 transition-colors"
              >
                <Download size={11} /> Download PDF
              </button>
            </div>

            {result.questions.map((q) => (
              <QCard key={q.id} q={q} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default InterviewPrep;
