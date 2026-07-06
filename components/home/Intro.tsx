export default function Intro() {
  return (
    <section
      id="intro"
      className="max-w-[1200px] mx-auto px-6 md:px-10 py-20 md:py-28 border-t border-border"
    >
      <span className="font-mono text-xs uppercase tracking-[0.12em] text-accent block mb-4">
        The short version
      </span>
      <h2 className="font-display font-semibold leading-[1.05] tracking-[-0.015em] text-[clamp(1.75rem,4vw,3rem)] max-w-[18ch] mb-8">
        Windows, Linux, Azure — and everything in between
      </h2>
      <div className="max-w-[55ch] space-y-5 text-lg leading-[1.7]">
        <p>
          I&apos;ve spent over a decade keeping systems alive that most people never
          think about until they break — Active Directory forests, Windows Server
          fleets, Linux boxes, VMware clusters, and increasingly, Azure.
        </p>
        <p className="text-text-muted">
          Outside of that, I shoot photos, build small things with code just to see
          if I can, and write about whichever of the two is currently eating my
          attention. This site is where all of it lives in one place.
        </p>
      </div>
    </section>
  );
}
