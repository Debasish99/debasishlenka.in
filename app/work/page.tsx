import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { DomainCard } from "@/components/work/DomainCard";
import { getDomains } from "@/lib/work";

export const metadata: Metadata = { title: "Work" };

export default function WorkPage() {
  const domains = getDomains();

  return (
    <Container className="pb-24 pt-20 md:pt-28">
      <SectionHeading
        eyebrow="Professional"
        title="Systems, not slides."
        description="I design and run infrastructure — Windows Server, Active Directory, Linux, Azure, and VMware. The kind of work that's invisible when it's done right, which is exactly the point."
      />

      <Link
        href="/resume"
        className="mt-8 inline-block bg-accent px-5 py-3 font-mono text-sm text-background transition-opacity hover:opacity-90"
      >
        View Resume →
      </Link>

      <div className="mt-16">
        {domains.map((domain, i) => (
          <DomainCard key={domain.slug} domain={domain} index={i} />
        ))}
      </div>
    </Container>
  );
}
