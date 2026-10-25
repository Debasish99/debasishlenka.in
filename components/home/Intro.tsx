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
        Everything in between
      </h2>
      <div className="max-w-[55ch] space-y-5 text-lg leading-[1.7]">
        <p>
          I work in IT to make a living. The rest? That&apos;s where things get interesting.
          Most days, you&apos;ll find me jumping between Windows servers, Active Directory, Azure dashboards, vCenter consoles, PowerShell scripts and whatever new technology has managed to grab my attention. Sometimes it&apos;s troubleshooting something that worked perfectly yesterday. Other times, it&apos;s figuring out something new just because I can. There&apos;s always something to fix, something to learn or something that refuses to work for absolutely no reason.
         
        </p>
        <p className="text-text-muted">
          When I&apos;m not doing that, I&apos;m probably behind a camera, lost in a fiction book, watching some new anime or TV series, Writing a blog post or emptying my mind out on my journal, messing around some code or falling down another rabbit hole of things I didn&apos;t plan to get into. The list goes on. My attention span has hobbies of its own.
          This is my little corner of the internet. Things I work on, things I create, and bits of me that don&apos;t fit into a job title.
        </p>
      </div>
    </section>
  );
}
