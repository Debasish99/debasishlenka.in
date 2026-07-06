import experimentsData from "@/content/lab/experiments.json";

export type ExperimentLink = { label: string; url: string };

export type Experiment = {
  slug: string;
  title: string;
  status: "ongoing" | "planned" | "done";
  summary: string;
  tags: string[];
  coverImage: string | null;
  video: string | null;
  links: ExperimentLink[];
  body: string[];
};

export function getExperiments(): Experiment[] {
  return experimentsData as Experiment[];
}

export function getExperiment(slug: string): Experiment | undefined {
  return getExperiments().find((e) => e.slug === slug);
}
