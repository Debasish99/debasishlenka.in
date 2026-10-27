import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ExperimentCard } from "@/components/lab/ExperimentCard";
import { getExperiments } from "@/lib/lab";

export const metadata: Metadata = pageMeta({
  title: "Lab",
  description:
    "Side projects, vibe-coded experiments and whatever I'm tinkering with — each with its own write-up.",
  path: "/lab",
});

export default function LabPage() {
  const experiments = getExperiments();

  return (
    <Container className="pb-24 pt-20 md:pt-28">
      <SectionHeading
        eyebrow="Lab"
        title="Things I'm building for fun."
        description="Vibe coding, side experiments, and whatever else I pick up next. This grows over time — check back."
      />
      <div className="mt-16 grid gap-4 sm:grid-cols-2">
        {experiments.map((experiment) => (
          <ExperimentCard key={experiment.slug} experiment={experiment} />
        ))}
      </div>
    </Container>
  );
}
