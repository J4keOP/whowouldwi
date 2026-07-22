import { createFileRoute, Link, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/app")({
  head: () => ({
    meta: [
      { title: "Who Would Win? — Battle simulator" },
      {
        name: "description",
        content:
          "Simulate any fictional battle. Transparent numerical engine, seeded replays, and matchup analytics.",
      },
    ],
  }),
  component: AppLayout,
});

const NAV: Array<{ label: string; disabled?: boolean }> = [
  { label: "Battles" },
  { label: "Rankings", disabled: true },
  { label: "Daily Challenge", disabled: true },
  { label: "Collection", disabled: true },
  { label: "Profile", disabled: true },
];

function AppLayout() {
  return (
    <div className="min-h-screen bg-[#03060d] text-white">
      {/* Ambient glow */}
      <div
        className="pointer-events-none fixed inset-0 -z-10"
        style={{
          background:
            "radial-gradient(ellipse 60% 40% at 50% 0%, rgba(88,101,242,0.18), transparent 60%), radial-gradient(ellipse 40% 30% at 85% 100%, rgba(139,92,246,0.15), transparent 60%)",
        }}
      />
      <header className="sticky top-0 z-40 border-b border-white/5 bg-[#03060d]/85 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link
            to="/app"
            className="flex items-center gap-2 font-display text-lg font-black tracking-wider text-white"
          >
            <span
              className="inline-block h-2.5 w-2.5 rounded-full"
              style={{
                background: "#4f8dff",
                boxShadow: "0 0 12px #4f8dff",
              }}
            />
            WHO WOULD WIN
            <span className="rounded-full border border-white/10 bg-white/[0.03] px-2 py-0.5 font-sans text-[0.6rem] font-medium uppercase tracking-widest text-white/60">
              Prototype
            </span>
          </Link>
          <nav className="hidden items-center gap-1 md:flex">
            {NAV.map((item) => (
              <span
                key={item.label}
                className={`rounded-md px-3 py-1.5 text-sm ${
                  item.disabled
                    ? "cursor-not-allowed text-white/30"
                    : "text-white/80 hover:bg-white/5"
                }`}
                title={item.disabled ? "Coming soon" : undefined}
              >
                {item.label}
              </span>
            ))}
          </nav>
          <Link
            to="/"
            className="text-xs uppercase tracking-widest text-white/40 hover:text-white/70"
          >
            ← Landing
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8">
        <Outlet />
      </main>

      <footer className="mx-auto mt-16 max-w-7xl border-t border-white/5 px-6 py-6 text-xs text-white/40">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span>Engine v3 prototype — context and character values remain curated test data.</span>
          <Link
            to="/app/engine-test"
            className="text-white/50 underline-offset-4 hover:text-white hover:underline"
          >
            Engine Test →
          </Link>
        </div>
      </footer>
    </div>
  );
}
