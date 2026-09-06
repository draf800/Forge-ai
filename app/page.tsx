import Link from "next/link";

const labors = [
  { n: "I", title: "Frontend", detail: "Pages, layout, styling" },
  { n: "II", title: "Backend", detail: "API routes, server logic" },
  { n: "III", title: "Database", detail: "Tables, schema, storage" },
  { n: "IV", title: "Auth", detail: "Sign-up, login, sessions" },
  { n: "V", title: "Payments", detail: "Stripe checkout, test mode" },
  { n: "VI", title: "Hosting", detail: "Deployed, live, shareable" },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-forge-bg text-forge-paper">
      <div className="mx-auto max-w-5xl px-6 py-20">
        <div className="mb-16 flex items-center justify-between">
          <span className="font-mono text-sm tracking-wide text-forge-mute">forge ai</span>
          <Link
            href="/builder"
            className="rounded-sm border border-forge-line px-4 py-2 text-sm text-forge-paper hover:border-forge-ember hover:text-forge-ember transition-colors"
          >
            Open the builder
          </Link>
        </div>

        <h1 className="font-display max-w-2xl text-5xl leading-[1.1] text-forge-paper">
          Describe the site.
          <br />
          It gets built.
        </h1>
        <p className="mt-6 max-w-md text-forge-mute">
          Type what you want in plain language. Forge AI writes the pages, wires up a
          database, adds login, and hooks in payments — all in one pass, all free to run.
        </p>

        <div className="mt-10">
          <Link
            href="/builder"
            className="inline-block rounded-sm bg-forge-ember px-6 py-3 font-medium text-forge-bg hover:brightness-110 transition"
          >
            Start building
          </Link>
        </div>

        <div className="mt-24 grid grid-cols-2 gap-px overflow-hidden rounded-sm border border-forge-line bg-forge-line sm:grid-cols-3">
          {labors.map((l) => (
            <div key={l.n} className="bg-forge-panel p-6">
              <div className="font-display text-2xl text-forge-brass">{l.n}</div>
              <div className="mt-2 text-forge-paper">{l.title}</div>
              <div className="mt-1 text-sm text-forge-mute">{l.detail}</div>
            </div>
          ))}
        </div>

        <p className="mt-8 text-xs text-forge-mute">
          Six pieces, one prompt. Nothing here costs money at the scale one person needs.
        </p>
      </div>
    </main>
  );
}
