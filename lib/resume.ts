import resumeData from "@/content/resume/resume.json";

export type ResumeExperience = {
  role: string;
  company: string;
  period: string;
  bullets: string[];
};

export type ResumeSkillGroup = { group: string; items: string[] };
export type ResumeEducation = { degree: string; institution: string; period: string };

export type Resume = {
  name: string;
  title: string;
  summary: string;
  experience: ResumeExperience[];
  skills: ResumeSkillGroup[];
  education: ResumeEducation[];
};

export function getResume(): Resume {
  return resumeData as Resume;
}
