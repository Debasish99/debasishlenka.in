import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { getResume } from "@/lib/resume";

export const metadata: Metadata = { title: "Resume" };

export default function ResumePage() {
  const resume = getResume();

  return (
    <Container className="max-w-3xl pb-24 pt-20 md:pt-28">
      <Link
        href="/work"
        className="mb-8 inline-block font-mono text-xs uppercase tracking-wide text-text-muted transition-colors hover:text-text"
      >
        ← Work
      </Link>

      <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <SectionHeading eyebrow="Resume" title={resume.name} description={resume.title} />
        </div>
        <a
          href="/resume.pdf"
          download
          className="inline-block whitespace-nowrap bg-accent px-5 py-3 font-mono text-sm text-background transition-opacity hover:opacity-90"
        >
          Download Resume (PDF)
        </a>
      </div>

      <p className="mt-10 max-w-2xl text-text-muted">{resume.summary}</p>

      <section className="mt-16">
        <p className="font-mono text-xs uppercase tracking-[0.1em] text-text-faint">Experience</p>
        <div className="mt-6 flex flex-col gap-10">
          {resume.experience.map((job) => (
            <div key={`${job.role}-${job.company}`}>
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h3 className="font-display text-xl text-text">{job.role}</h3>
                <span className="font-mono text-xs text-text-faint">{job.period}</span>
              </div>
              <p className="mt-1 font-mono text-sm text-accent">{job.company}</p>
              <ul className="mt-3 flex flex-col gap-2">
                {job.bullets.map((bullet, i) => (
                  <li key={i} className="flex gap-3 text-sm text-text-muted">
                    <span className="text-text-faint">—</span>
                    <span>{bullet}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-16">
        <p className="font-mono text-xs uppercase tracking-[0.1em] text-text-faint">Skills</p>
        <div className="mt-6 flex flex-col gap-6">
          {resume.skills.map((group) => (
            <div key={group.group}>
              <p className="font-display text-lg text-text">{group.group}</p>
              <ul className="mt-2 flex flex-wrap gap-2">
                {group.items.map((item) => (
                  <li
                    key={item}
                    className="rounded-full border border-border px-3 py-1 font-mono text-[11px] text-text-faint"
                  >
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-16">
        <p className="font-mono text-xs uppercase tracking-[0.1em] text-text-faint">Education</p>
        <div className="mt-6 flex flex-col gap-4">
          {resume.education.map((edu) => (
            <div key={edu.degree} className="flex flex-wrap items-baseline justify-between gap-2">
              <div>
                <p className="font-display text-lg text-text">{edu.degree}</p>
                <p className="font-mono text-sm text-text-muted">{edu.institution}</p>
              </div>
              <span className="font-mono text-xs text-text-faint">{edu.period}</span>
            </div>
          ))}
        </div>
      </section>
    </Container>
  );
}
