import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";

export const Route = createFileRoute("/")({
  component: Index,
});

const LAUNCH_TARGET = new Date("2026-10-31T00:00:00Z").getTime();

function useCountdown(target: number) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  return useMemo(() => {
    const diff = Math.max(0, target - now);
    const d = Math.floor(diff / 86_400_000);
    const h = Math.floor((diff % 86_400_000) / 3_600_000);
    const m = Math.floor((diff % 3_600_000) / 60_000);
    const s = Math.floor((diff % 60_000) / 1000);
    return { d, h, m, s };
  }, [now, target]);
}

function Index() {
  const { d, h, m, s } = useCountdown(LAUNCH_TARGET);
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  return (
    <main className="bg-ominous grain relative min-h-screen overflow-hidden">
      <div className="grain-overlay" />

      {/* Top bar */}
      <header className="relative z-10 flex items-center justify-between px-6 py-6 md:px-12">
        <div className="flex items-center gap-2 font-display text-sm tracking-[0.3em] text-foreground/80">
          <span className="inline-block h-2 w-2 rounded-full bg-primary animate-ember" />
          WHOWOULDWIN.GG
        </div>
        <div className="hidden text-xs tracking-[0.25em] text-muted-foreground md:block">
          COMING SOON
        </div>
      </header>

      {/* Hero */}
      <section className="relative z-10 mx-auto flex min-h-[calc(100vh-96px)] max-w-5xl flex-col items-center justify-center px-6 pb-16 text-center">
        <p className="animate-rise mb-6 font-display text-[0.7rem] tracking-[0.5em] text-primary/80">
          — AN UPCOMING BATTLE SIMULATOR —
        </p>

        <h1
          className="animate-rise animate-flicker text-glow font-display text-6xl font-black leading-[0.95] tracking-tight text-foreground md:text-8xl lg:text-[9rem]"
          style={{ animationDelay: "0.1s" }}
        >
          Who Would
          <br />
          <span className="italic text-primary">Win?</span>
        </h1>

        <p
          className="animate-rise mt-8 max-w-xl text-base leading-relaxed text-muted-foreground md:text-lg"
          style={{ animationDelay: "0.3s" }}
        >
          Any character. Any universe. Any era.
          <br />
          Choose two fighters. We simulate the impossible.
        </p>

        {/* VS showcase */}
        <div
          className="animate-rise mt-14 flex w-full max-w-2xl items-center justify-center gap-6 md:gap-10"
          style={{ animationDelay: "0.5s" }}
        >
          <FighterSlot label="Fighter I" />
          <div className="flex flex-col items-center">
            <div className="divider-vs h-16 w-px" />
            <span className="my-2 font-display text-2xl font-black tracking-widest text-primary text-glow">
              VS
            </span>
            <div className="divider-vs h-16 w-px" />
          </div>
          <FighterSlot label="Fighter II" />
        </div>

        {/* Countdown */}
        <div
          className="animate-rise mt-16 flex items-center gap-3 md:gap-6"
          style={{ animationDelay: "0.7s" }}
        >
          <TimeCell value={d} label="DAYS" />
          <Colon />
          <TimeCell value={h} label="HRS" />
          <Colon />
          <TimeCell value={m} label="MIN" />
          <Colon />
          <TimeCell value={s} label="SEC" />
        </div>

        {/* Waitlist */}
        <form
          className="animate-rise mt-12 flex w-full max-w-md flex-col gap-3 sm:flex-row"
          style={{ animationDelay: "0.9s" }}
          onSubmit={(e) => {
            e.preventDefault();
            if (email) setSubmitted(true);
          }}
        >
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            className="flex-1 rounded-md border border-border bg-card/60 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/60 backdrop-blur focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            aria-label="Email address"
          />
          <button
            type="submit"
            className="group relative overflow-hidden rounded-md border border-primary/60 bg-primary/10 px-6 py-3 font-display text-xs font-bold tracking-[0.2em] text-foreground transition-all hover:bg-primary/20 hover:shadow-[0_0_30px_oklch(0.65_0.22_25/0.4)]"
          >
            {submitted ? "YOU'RE IN" : "GET EARLY ACCESS"}
          </button>
        </form>

        {submitted && (
          <p className="mt-4 text-xs tracking-widest text-primary/80">
            The arena awaits. We'll be in touch.
          </p>
        )}
      </section>

      {/* Footer */}
      <footer className="relative z-10 flex items-center justify-between px-6 py-6 text-[0.65rem] tracking-[0.3em] text-muted-foreground md:px-12">
        <span>© {new Date().getFullYear()} WHO WOULD WIN</span>
        <span className="hidden md:inline">SIMULATED BATTLES · UNLIMITED UNIVERSES</span>
      </footer>
    </main>
  );
}

function FighterSlot({ label }: { label: string }) {
  return (
    <div className="flex flex-1 flex-col items-center">
      <div className="relative aspect-square w-full max-w-[140px] rounded-md border border-border/70 bg-gradient-to-b from-card/40 to-background/80 backdrop-blur">
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="font-display text-4xl text-muted-foreground/40">?</span>
        </div>
        <div className="absolute -inset-px rounded-md ring-1 ring-inset ring-primary/10" />
      </div>
      <span className="mt-3 font-display text-[0.6rem] tracking-[0.3em] text-muted-foreground">
        {label}
      </span>
    </div>
  );
}

function TimeCell({ value, label }: { value: number; label: string }) {
  const padded = value.toString().padStart(2, "0");
  return (
    <div className="flex flex-col items-center">
      <div className="min-w-[3.5rem] rounded-md border border-border/60 bg-card/50 px-3 py-2 backdrop-blur md:min-w-[5rem] md:px-4 md:py-3">
        <div className="font-display text-3xl font-bold tabular-nums text-foreground md:text-5xl">
          {padded}
        </div>
      </div>
      <span className="mt-2 text-[0.6rem] tracking-[0.3em] text-muted-foreground">{label}</span>
    </div>
  );
}

function Colon() {
  return (
    <span className="pb-6 font-display text-2xl text-primary/60 md:text-3xl">:</span>
  );
}
