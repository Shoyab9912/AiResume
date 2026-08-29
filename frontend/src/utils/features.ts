import { BarChart2, Briefcase, Compass, FileEdit, FileText, MessageSquare, ScanText } from "lucide-react";

export const Features = [
  { icon: ScanText, color: "from-indigo-500 to-violet-500", glow: "shadow-indigo-500/20",
    title: "AI Resume Analyser",
    desc: "Upload your resume and get an instant ATS compatibility score. Our AI pinpoints strengths, weaknesses, missing keywords, and formatting issues so you can fix them before recruiters even see it.",
    bullets: ["ATS score out of 100", "Strengths & weaknesses breakdown", "Keyword gap analysis", "Section-by-section feedback"] },
  { icon: Briefcase, color: "from-emerald-500 to-teal-400", glow: "shadow-emerald-500/20",
    title: "Smart Job Matcher",
    desc: "After analysing your resume, CareerAI matches you with roles that actually fit your skills and experience — no more applying blindly and wondering why you hear nothing back.",
    bullets: ["Personalised job recommendations", "Match % per role", "Skill gap for each job", "One-click apply guidance"] },
  { icon: FileEdit, color: "from-pink-500 to-rose-400", glow: "shadow-pink-500/20",
    title: "AI Resume Creator",
    desc: "Answer a few questions about your experience and goals. Our AI crafts a recruiter-ready, ATS-optimised resume tailored to the roles you're targeting.",
    bullets: ["Auto-generated content", "Industry-specific templates", "ATS-friendly formatting", "Export as PDF instantly"] },
  { icon: MessageSquare, color: "from-amber-500 to-orange-400", glow: "shadow-amber-500/20",
    title: "Interview Preparation",
    desc: "Get personalised interview questions based on your skills or resume. Practice with AI feedback, sharpen your answers, and walk into every interview with confidence.",
    bullets: ["Resume-based question sets", "Skill-specific practice", "AI answer feedback", "Behavioural & technical rounds"] },
];

export const features = [
  { icon: FileText, label: "Resume Builder" },
  { icon: BarChart2, label: "Resume Analyser" },
  { icon: Compass, label: "Career Guide" },
  { icon: MessageSquare, label: "Interview Prep" },
];