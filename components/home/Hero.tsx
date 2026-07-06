export default function Hero() {
  return (
    <section className="max-w-[1200px] mx-auto px-6 md:px-10 pt-20 pb-24 md:pt-28 md:pb-32">
      <div className="grid md:grid-cols-[1.5fr_1fr] gap-10 md:gap-12 items-end">
        <h1 className="font-display font-semibold leading-[0.98] tracking-[-0.02em] text-[clamp(2.5rem,6vw,4.5rem)]">
          I keep servers
          <br />
          running <span className="text-accent">and</span>
          <br />
          cameras out
          <span className="text-accent animate-blink">|</span>
        </h1>
        <div className="pb-2">
          <p className="text-text-muted text-base mb-6">
            Systems engineer by trade, photographer and builder by habit. This is the
            running log of both.
          </p>
          <a
            href="#intro"
            className="inline-flex items-center gap-2 border border-border rounded text-sm font-medium px-6 py-3 hover:border-accent hover:text-accent transition-colors"
          >
            Start here ↓
          </a>
        </div>
      </div>
    </section>
  );
}
