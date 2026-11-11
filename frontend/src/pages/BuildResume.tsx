import { useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useIsMutating } from "@tanstack/react-query";
import { Sparkles } from "lucide-react";
import { useToolForm } from "../hooks/useToolForm";
import { useAiMutations, AI_QUERY_KEYS } from "../hooks/useAiMutations";
import { useCachedResult } from "../hooks/useCachedResult";
import { extractPdfText } from "../utils/file";
import { extractErrorMessage } from "../utils/error";
import { Dropzone } from "../components/ui/Dropzone";
import { ErrorAlert } from "../components/ui/Feedback";
import { PersonalSection } from "../components/resume/PersonalSection";
import { SkillsSection } from "../components/resume/SkillsSection";
import { ProjectsSection } from "../components/resume/ProjectsSection";
import { ExperienceSection } from "../components/resume/ExperienceSection";
import { EducationSection } from "../components/resume/EducationSection";
import { ResumePreview } from "../components/resume/ResumePreview";
import { ResumeSkeleton } from "../components/resume/ResumeSkeleton";



import type { ResumeData, ResumeFormData, BuildResumePayload } from "../types";

const buildResumeFormSchema = z.object({
  name: z.string().trim().min(2, "Full name is required"),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .pipe(z.email("Invalid email address")),
  phone: z.string().trim().min(6, "Phone number is required"),
  location: z.string().trim().min(2, "Location is required"),
  linkedin: z.string().trim().optional().default(""),
  summary: z.string().trim().min(10, "Brief summary or target role is required"),
  technicalSkills: z
    .string()
    .trim()
    .min(2, "Enter at least one technical skill"),
  softSkills: z.string().trim().optional().default(""),
  certifications: z.string().trim().optional().default(""),
  experience: z.array(
    z.object({
      title: z.string().trim().min(1, "Job title is required"),
      company: z.string().trim().min(1, "Company is required"),
      location: z.string().trim().min(1, "Location is required"),
      startDate: z.string().trim().min(1, "Start date is required"),
      endDate: z.string().trim().min(1, "End date is required"),
      bulletsText: z.string().trim().min(5, "Add at least one achievement"),
    })
  ),
  education: z
    .array(
      z.object({
        degree: z.string().trim().min(1, "Degree is required"),
        school: z.string().trim().min(1, "School / College is required"),
        location: z.string().trim().min(1, "Location is required"),
        year: z.string().trim().min(1, "Year is required"),
        gpa: z.string().trim().optional(),
      })
    )
    .min(1, "Add at least one education entry"),
  projects: z.array(
    z.object({
      name: z.string().trim().min(1, "Project name is required"),
      link: z.string().trim().optional(),
      bulletsText: z.string().trim().min(5, "Add project highlights"),
    })
  ),
});

type BuildResumeFormValues = z.input<typeof buildResumeFormSchema>;

const splitComma = (val?: string) =>
  (val ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
const splitLines = (val?: string) =>
  (val ?? "")
    .split("\n")
    .map((s) => s.replace(/^[-•*]\s*/, "").trim())
    .filter(Boolean);

const BuildResume = () => {
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

  const { buildResumeMutation } = useAiMutations();
  const { mutate } = buildResumeMutation;
  const isPending =
    useIsMutating({ mutationKey: AI_QUERY_KEYS.builtResume }) > 0;
  const { result, clearResult } = useCachedResult<ResumeData>(
    AI_QUERY_KEYS.builtResume,
  );

  const isBusy = isSubmitting || isPending;

  const methods = useForm<BuildResumeFormValues>({
    resolver: zodResolver(buildResumeFormSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      location: "",
      linkedin: "",
      summary: "",
      technicalSkills: "",
      softSkills: "",
      certifications: "",
      experience: [],
      education: [{ degree: "", school: "", location: "", year: "", gpa: "" }],
      projects: [{ name: "", link: "", bulletsText: "" }],
    },
  });

  async function handleImproveSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (isBusy) return;
    setError("");
    setIsSubmitting(true);
    clearResult();

    if (!file) {
      setIsSubmitting(false);
      return setError("Please upload your existing resume PDF to improve.");
    }

    try {
      const resumeText = await extractPdfText(file);
      const payload: BuildResumePayload = { mode: "improve", resumeText };
      mutate(payload, {
        onError: (err) => setError(extractErrorMessage(err)),
        onSettled: () => setIsSubmitting(false),
      });
    } catch (err) {
      setIsSubmitting(false);
      setError(extractErrorMessage(err));
    }
  }

  function onManualSubmit(values: BuildResumeFormValues) {
    if (isBusy) return;
    setError("");
    setIsSubmitting(true);
    clearResult();

    const formData: ResumeFormData = {
      name: values.name,
      email: values.email,
      phone: values.phone,
      location: values.location,
      linkedin: values.linkedin ?? "",
      summary: values.summary,
      skills: {
        technical: splitComma(values.technicalSkills),
        soft: splitComma(values.softSkills),
      },
      education: values.education.map((edu) => ({
        degree: edu.degree,
        school: edu.school,
        location: edu.location,
        year: edu.year,
        ...(edu.gpa ? { gpa: edu.gpa } : {}),
      })),
      experience: values.experience.map((exp) => ({
        title: exp.title,
        company: exp.company,
        location: exp.location,
        startDate: exp.startDate,
        endDate: exp.endDate,
        bullets: splitLines(exp.bulletsText),
      })),
      projects: values.projects.map((proj) => ({
        name: proj.name,
        ...(proj.link ? { link: proj.link } : {}),
        bullets: splitLines(proj.bulletsText),
      })),
      certifications: splitComma(values.certifications),
    };

    mutate(
      { mode: "manual", formData },
      {
        onError: (err) => setError(extractErrorMessage(err)),
        onSettled: () => setIsSubmitting(false),
      }
    );
  }

  return (
    <div className="bg-page min-h-screen pt-20 px-4 md:px-8 pb-12">
      <div className="max-w-3xl mx-auto flex flex-col gap-5">
        {/* Mode Switcher */}
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
            Build From Scratch
          </button>
          <button
            type="button"
            disabled={isBusy}
            onClick={() => {
              setMode("improve");
              setError("");
              clearResult();
            }}
            className={`py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              mode === "improve"
                ? "bg-indigo-500 text-white shadow-lg shadow-indigo-500/25"
                : "text-white/50 hover:text-white/80"
            }`}
          >
            Improve Existing Resume PDF
          </button>
        </div>

        {mode === "improve" ? (
          <form onSubmit={handleImproveSubmit} className="flex flex-col gap-4">
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
                <Sparkles size={16} /> Rewrite & Optimize Resume with AI
              </button>
            )}
          </form>
        ) : (
          <FormProvider {...methods}>
            <form
              onSubmit={methods.handleSubmit(onManualSubmit)}
              className="flex flex-col gap-5"
            >
              <PersonalSection />
              <SkillsSection />
              <ProjectsSection />
              <ExperienceSection />
              <EducationSection />

              <ErrorAlert message={error} />

              {!isBusy && (
                <button
                  type="submit"
                  className="btn-primary py-3.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-indigo-500/20"
                >
                  <Sparkles size={16} /> Generate ATS-Optimized Resume
                </button>
              )}
            </form>
          </FormProvider>
        )}

       {isBusy && <ResumeSkeleton />}
        {result && !isBusy && <ResumePreview result={result} />}
      </div>
    </div>
  );
};

export default BuildResume;