import { useState } from "react";
import { FilePlus } from "lucide-react";
import { useToolForm } from "../hooks/useToolForm";
import { useAiMutations } from "../hooks/useAiMutations";
import type { BuildResumePayload } from "../hooks/useAiMutations";
import { toBase64 } from "../utils/file";
import type { Experience, Education, Project } from "../types";
import { BasicsForm } from "../components/resume/BasicForm";
import { ExperienceForm } from "../components/resume/ExperienceForm";
import { EducationForm } from "../components/resume/EducationForm";
import { SkillsAndProjectsForm } from "../components/resume/SkillsAndProject";
import { ResumePreview } from "../components/resume/ResumePreview";
import { Dropzone } from "../components/ui/Dropzone";
import { LoadingState, ErrorAlert } from "../components/ui/Feedback";
import { extractErrorMessage } from "../utils/error";
import { useQueryClient } from "@tanstack/react-query";

const createEmptyExperience = (): Experience => ({
  title: "", company: "", location: "", startDate: "", endDate: "", bullets: [""],
});
const createEmptyEducation = (): Education => ({
  degree: "", school: "", location: "", year: "", gpa: "",
});
const createEmptyProject = (): Project => ({ name: "", link: "", bullets: [""] });

const BuildResume = () => {
  const queryClient = useQueryClient();
  const { mode, setMode, file, error, setError, fileRef, getDropzoneProps, handleFileChange } = useToolForm();
  const { buildResumeMutation } = useAiMutations();
  const { mutate, data: result, isPending, reset } = buildResumeMutation;

  const [basics, setBasics] = useState({ name: "", email: "", phone: "", location: "", linkedin: "" });
  const [summary, setSummary] = useState("");
  const [experience, setExperience] = useState<Experience[]>([createEmptyExperience()]);
  const [education, setEducation] = useState<Education[]>([createEmptyEducation()]);
  const [techSkills, setTechSkills] = useState("");
  const [softSkills, setSoftSkills] = useState("");
  const [projects, setProjects] = useState<Project[]>([createEmptyProject()]);
  const [certifications, setCertifications] = useState("");

  const updateExperienceField = <K extends keyof Experience>(index: number, key: K, value: Experience[K]) => {
    setExperience((prev) => prev.map((exp, idx) => (idx === index ? { ...exp, [key]: value } : exp)));
  };

  const updateExperienceBullet = (experienceIndex: number, bulletIndex: number, value: string) => {
    setExperience((prev) =>
      prev.map((exp, i) =>
        i === experienceIndex
          ? { ...exp, bullets: exp.bullets.map((bullet, j) => (j === bulletIndex ? value : bullet)) }
          : exp,
      ),
    );
  };

  const updateEducationField = (index: number, key: keyof Education, value: string) => {
    setEducation((prev) => prev.map((edu, idx) => (idx === index ? { ...edu, [key]: value } : edu)));
  };

  const updateProjectField = <K extends keyof Project>(index: number, key: K, value: Project[K]) => {
    setProjects((prev) => prev.map((proj, idx) => (idx === index ? { ...proj, [key]: value } : proj)));
  };

  const updateProjectBullet = (projectIndex: number, bulletIndex: number, value: string) => {
    setProjects((prev) =>
      prev.map((proj, i) =>
        i === projectIndex
          ? { ...proj, bullets: proj.bullets.map((bullet, j) => (j === bulletIndex ? value : bullet)) }
          : proj,
      ),
    );
  };

  async function handleSubmit() {
    setError("");
    reset();

    if (mode === "improve" && !file) {
      return setError("Please upload your resume pdf.");
    }
    if (mode === "manual" && !basics.name.trim()) {
      return setError("Please Enter your name");
    }

    const cleanedExperience = experience.filter((exp) => exp.title.trim() !== "" || exp.company.trim() !== "");
    const cleanedEducation = education.filter((edu) => edu.degree.trim() !== "" || edu.school.trim() !== "");
    const cleanedProjects = projects.filter((proj) => proj.name.trim() !== "");

    const payload: BuildResumePayload =
      mode === "manual"
        ? {
            mode: "manual",
            formData: {
              ...basics,
              summary,
              experience: cleanedExperience,
              education: cleanedEducation,
              skills: {
                technical: techSkills.split(",").map((s) => s.trim()).filter(Boolean),
                soft: softSkills.split(",").map((s) => s.trim()).filter(Boolean),
              },
              projects: cleanedProjects,
              certifications: certifications.split(",").map((s) => s.trim()).filter(Boolean),
            },
          }
        : { mode: "improve", pdfBase64: await toBase64(file!) };

    mutate(payload, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["authUser"] });
      },
      onError: (err) => setError(extractErrorMessage(err)),
    });
  }

  return (
    <div className="bg-page min-h-screen pt-20 px-4 md:px-8 pb-12">
      <div className="max-w-3xl mx-auto flex flex-col gap-6">
        <div className="glass-card p-1.5 flex gap-1.5">
          {(["manual", "improve"] as const).map((m) => (
            <button
              key={m}
              onClick={() => {
                setMode(m);
                reset();
                setError("");
              }}
              className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 capitalize ${
                mode === m ? "btn-primary" : "text-white/40 hover:text-white/70"
              }`}
            >
              {m === "manual" ? "Build from Scratch" : "Improve Existing Resume"}
            </button>
          ))}
        </div>

        {mode === "manual" && (
          <>
            <BasicsForm
              basics={basics}
              summary={summary}
              onChangeBasics={(k, v) => setBasics((p) => ({ ...p, [k]: v }))}
              onChangeSummary={setSummary}
            />

            <ExperienceForm
              experience={experience}
              onUpdateExp={updateExperienceField}
              onUpdateBullet={updateExperienceBullet}
              onAddExp={() => setExperience((prev) => [...prev, createEmptyExperience()])}
              onRemoveExp={(index) => setExperience((prev) => prev.filter((_, idx) => idx !== index))}
              onAddBullet={(experienceIndex) =>
                updateExperienceField(experienceIndex, "bullets", [...experience[experienceIndex].bullets, ""])
              }
              onRemoveBullet={(experienceIndex, bulletIndex) =>
                updateExperienceField(
                  experienceIndex,
                  "bullets",
                  experience[experienceIndex].bullets.filter((_, j) => j !== bulletIndex)
                )
              }
            />

            <EducationForm
              education={education}
              onUpdateEdu={updateEducationField}
              onAddEdu={() => setEducation((prev) => [...prev, createEmptyEducation()])}
              onRemoveEdu={(index) => setEducation((prev) => prev.filter((_, idx) => idx !== index))}
            />

            <SkillsAndProjectsForm
              techSkills={techSkills}
              softSkills={softSkills}
              projects={projects}
              certs={certifications}
              onChangeTech={setTechSkills}
              onChangeSoft={setSoftSkills}
              onChangeCerts={setCertifications}
              onUpdateProj={updateProjectField}
              onUpdateProjBullet={updateProjectBullet}
              onAddProj={() => setProjects((prev) => [...prev, createEmptyProject()])}
              onRemoveProj={(index) => setProjects((prev) => prev.filter((_, idx) => idx !== index))}
              onAddProjBullet={(projectIndex) =>
                updateProjectField(projectIndex, "bullets", [...projects[projectIndex].bullets, ""])
              }
              onRemoveProjBullet={(projectIndex, bulletIndex) =>
                updateProjectField(
                  projectIndex,
                  "bullets",
                  projects[projectIndex].bullets.filter((_, j) => j !== bulletIndex)
                )
              }
            />
          </>
        )}

        {mode === "improve" && (
          <Dropzone
            file={file}
            loading={isPending}
            fileRef={fileRef}
            getDropzoneProps={() => getDropzoneProps(isPending)}
            handleFileChange={handleFileChange}
          />
        )}

        <ErrorAlert message={error} />

        {!isPending && (
          <button
            onClick={handleSubmit}
            className="btn-primary py-3.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 cursor-pointer"
          >
            <FilePlus size={16} /> {mode === "manual" ? "Build my Resume" : "Improve My Resume"}
          </button>
        )}

        {isPending && <LoadingState message="Building your ATS optimized resume..." />}

        {result && !isPending && <ResumePreview result={result} />}
      </div>
    </div>
  );
};

export default BuildResume;