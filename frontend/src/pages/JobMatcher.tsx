import { matchBg, matchColor,} from "../utils/ui";
import { toBase64 } from "../utils/file";
import {  useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  AlertCircle,
  Briefcase,
  ChevronRight,
  FileText,
  Loader2,
  Plus,
  Upload,
  X,
} from "lucide-react";
import type { Job } from "../types";
import { aiApi, type JobMatchPayload } from "../api/ai";
import { Input } from "../components/ui/Input";
import { Textarea } from "../components/ui/Textarea";
import { useToolForm } from "../hooks/useToolForm";
import { extractErrorMessage } from "../utils/error";


interface Result {
  jobs: Job[];
  summary: string;
}

const ManualInputForm = ({ onSubmit }: { onSubmit: (skills: string[], exp: string) => void }) => {
  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState("");
  const [experience, setExperience] = useState("");

  function addSkill(e?: React.KeyboardEvent | React.MouseEvent) {
    if (e) e.preventDefault();
    const s = skillInput.trim();
    if (s && !skills.includes(s)) {
      setSkills((prev) => [...prev, s]);
    }
    setSkillInput("");
  }

  return (
    <div className="glass-card p-6 flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <label className="text-xs text-white/30 uppercase tracking-widest">
          Your Skills
        </label>

        <div className="flex gap-2">
          <Input
            value={skillInput}
            onChange={(e) => setSkillInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addSkill(e)}
            placeholder="e.g. React, Python, SQL..."
            className="flex-1 rounded-xl text-sm placeholder-white/25"
          />
          <button
            onClick={addSkill}
            className="btn-primary px-4 py-2.5 rounded-xl text-sm flex items-center gap-1.5"
          >
            <Plus size={14} /> Add
          </button>
        </div>

        {skills.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-1">
            {skills.map((s) => (
              <span className="feature-pill gap-2" key={s}>
                {s}{" "}
                <button onClick={() => setSkills((prev) => prev.filter((x) => x !== s))}>
                  <X size={10} />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      <Textarea
        label="Experience & Background"
        value={experience}
        onChange={(e) => setExperience(e.target.value)}
        rows={4}
        placeholder="e.g. 2 Years of frontend development..."
        className="rounded-xl text-sm placeholder-white/25"
      />

      <button
        onClick={() => onSubmit(skills, experience)}
        className="btn-primary py-3.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 mt-2"
      >
        <Briefcase size={16} /> Find Matching Jobs
      </button>
    </div>
  );
};

const JobMatcherPage = () => {
  const queryClient = useQueryClient();
  const { 
    mode, setMode, 
    file, 
    loading, setLoading, 
    error, setError, 
    fileRef, handleFileChange, getDropzoneProps 
  } = useToolForm();
  const [result, setResult] = useState<Result | null>(null);
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
      const payload: JobMatchPayload = { mode };
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
       setError(extractErrorMessage(err))
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

        {mode === "manual" && <ManualInputForm onSubmit={handleSubmit} />}

        {mode === "resume" && (
          <div
            {...getDropzoneProps()}
            onClick={() => {
              if (loading) return;
              fileRef.current?.click();
            }}
            className={`glass-card border-dashed flex flex-col items-center justify-center gap-3 py-10 transition-all duration-300 group ${
              loading
                ? "border-white/5 opacity-50 cursor-not-allowed"
                : "border-white/15 cursor-pointer hover:border-indigo-500/40 hover:bg-white/2"
            }`}
          >
            <div
              className={`w-14 h-14 rounded-2xl bg-indigo-500/10 border-dashed border-indigo-500/20 flex items-center justify-center transition-transform ${
                !loading && "group-hover:scale-105"
              }`}
            >
              {file ? (
                <FileText size={22} className="text-emerald-400" />
              ) : (
                <Upload size={32} className="text-indigo-400" />
              )}
            </div>
            <div className="text-center">
              <p className="font-semibold text-white/80">
                {loading ? "Analyzing..." : file ? file.name : "Drop your resume here"}
              </p>
              <p className="text-white/35 text-sm mt-0.5">
                or click to browse • PDF only • max 5MB
              </p>
            </div>
            <input
              type="file"
              ref={fileRef}
              accept=".pdf"
              disabled={loading}
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleFileChange(f);
                e.target.value = "";
              }}
            />
          </div>
        )}

        {error && (
          <p className="text-red-400 text-sm flex items-center gap-1.5">
            <AlertCircle size={14} /> {error}
          </p>
        )}

        {mode === "resume" && !loading && (
          <button
            onClick={() => handleSubmit()}
            className="btn-primary py-3.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2"
          >
            <Briefcase size={16} /> Find Matching Jobs
          </button>
        )}

        {loading && (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 size={36} className="text-indigo-400 animate-spin" />
            <p className="text-white/40 text-sm">Finding your best job matches...</p>
          </div>
        )}

        {result && !loading && (
          <div className="flex flex-col gap-4 animate-fade-in">
            <div className="glass-card p-5">
              <p className="text-xs text-white/30 uppercase tracking-widest mb-2">Summary</p>
              <p className="text-sm text-white/60 leading-relaxed">{result.summary}</p>
            </div>

            {result.jobs.map((job, i) => (
              <div
                key={i}
                className={`glass-card p-6 flex flex-col gap-4 border ${matchBg(job.matchScore)}`}
              >
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div>
                    <h3 className="font-bold text-white">{job.title}</h3>
                    <p className="text-white/45 text-sm mt-0.5">
                      {job.company} • {job.location} • {job.type}
                    </p>
                  </div>

                  <span className={`text-2xl font-black shrink-0 ${matchColor(job.matchScore)}`}>
                    {job.matchScore}%
                  </span>
                </div>

                <div className="flex flex-wrap gap-2">
                  {job.skills.map((s) => (
                    <span key={s} className="feature-pill">
                      {s}
                    </span>
                  ))}
                </div>

                <div className="divider-subtle" />

                <div className="flex flex-col gap-2">
                  <p className="text-xs text-white/30 uppercase tracking-widest">Why you match</p>
                  <p className="text-sm text-white/55 leading-relaxed">{job.whyMatch}</p>
                </div>

                <div className="flex items-start gap-2 text-sm text-white/60 bg-white/4 rounded-xl p-3">
                  <ChevronRight size={14} className="text-indigo-400 shrink-0 mt-0.5" />
                  {job.applyTip}
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