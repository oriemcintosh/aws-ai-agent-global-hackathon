import Link from "next/link";

const personas = [
  {
    title: "Students",
    description:
      "Discover programs that align with your academic interests and the career you want next. Filter by admission requirements, scholarships, campus experience, and long-term earning potential.",
  },
  {
    title: "Parents & Guardians",
    description:
      "Compare tuition, housing, and financial aid in minutes so you can build realistic budgets. Get guidance on deadlines, documentation, and how to support your learner at each step.",
  },
  {
    title: "Education Staff",
    description:
      "Equip advising sessions with personalized program shortlists, cost profiles, and admissions insights sourced from trusted data partners and institutional disclosures.",
  },
];

const highlights = [
  "AI-guided Q&A that surfaces accredited certificates, diplomas, and degrees across the U.S. and Canada",
  "Location-aware suggestions that balance commute, campus life, and regional job prospects",
  "Cost modeling that combines tuition, fees, housing, and aid so families understand the full picture",
];

export default function Home() {
  return (
    <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-16 px-4 py-16 sm:px-8 sm:py-20">
        <section className="grid gap-10 lg:grid-cols-[minmax(0,_3fr)_minmax(0,_2fr)] lg:items-center">
          <div className="space-y-6">
            <span className="inline-flex w-max items-center rounded-full bg-[color-mix(in_srgb,var(--primary)_12%,transparent)] px-4 py-1 text-xs font-semibold uppercase tracking-wide text-[color-mix(in_srgb,var(--primary)_70%,transparent)]">
              Guided post-secondary planning
            </span>
            <h1 className="text-balance text-3xl font-semibold leading-tight sm:text-4xl">
              Chart the next chapter with Academia Agent
            </h1>
            <p className="max-w-2xl text-pretty text-base leading-relaxed text-[color-mix(in_srgb,var(--foreground)_75%,transparent)] sm:text-lg">
              Academia Agent is your AI-powered research companion for higher education planning. Ask about
              programs, compare costs, and get actionable insights tailored to the goals of students, families,
              and advising teams.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <Link
                href="/chat"
                className="inline-flex items-center justify-center rounded-full bg-[var(--primary)] px-6 py-3 text-sm font-semibold text-[var(--primary-foreground)] shadow-sm transition hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
              >
                Explore the chat experience
              </Link>
              <a
                href="#learn-more"
                className="inline-flex items-center justify-center rounded-full border border-[var(--border)] px-6 py-3 text-sm font-semibold text-[color-mix(in_srgb,var(--foreground)_85%,transparent)] transition hover:bg-[color-mix(in_srgb,var(--card)_90%,transparent)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
              >
                Learn how it works
              </a>
            </div>
          </div>
          <div className="rounded-3xl border border-[var(--border)] bg-[color-mix(in_srgb,var(--card)_92%,transparent)] p-6 shadow-sm">
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">What Academia Agent delivers</h2>
              <ul className="space-y-3 text-sm text-[color-mix(in_srgb,var(--foreground)_75%,transparent)]">
                {highlights.map((item) => (
                  <li key={item} className="flex gap-3">
                    <span className="mt-1 inline-block h-2.5 w-2.5 flex-none rounded-full bg-[var(--primary)]" aria-hidden="true" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <section id="learn-more" className="space-y-8">
          <div className="space-y-3">
            <h2 className="text-2xl font-semibold sm:text-3xl">Designed for every decision-maker</h2>
            <p className="max-w-3xl text-sm leading-relaxed text-[color-mix(in_srgb,var(--foreground)_70%,transparent)] sm:text-base">
              Whether you are choosing your first program, supporting a learner, or guiding an entire graduating
              class, Academia Agent adapts to the questions you bring. Every prompt is grounded in current program
              catalogs, labor outlook data, and verified cost information.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {personas.map((persona) => (
              <article
                key={persona.title}
                className="flex flex-col gap-3 rounded-2xl border border-[var(--border)] bg-[color-mix(in_srgb,var(--card)_92%,transparent)] p-6 shadow-sm transition hover:shadow-md"
              >
                <h3 className="text-lg font-semibold text-[color-mix(in_srgb,var(--foreground)_85%,transparent)]">
                  {persona.title}
                </h3>
                <p className="text-sm leading-relaxed text-[color-mix(in_srgb,var(--foreground)_70%,transparent)]">
                  {persona.description}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section className="grid gap-8 rounded-3xl border border-[color-mix(in_srgb,var(--primary)_30%,transparent)] bg-[color-mix(in_srgb,var(--primary)_12%,transparent)] p-8 text-[color-mix(in_srgb,var(--primary)_85%,transparent)] sm:p-10 lg:grid-cols-[minmax(0,_2fr)_minmax(0,_3fr)]">
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold sm:text-3xl">How the agent supports your planning</h2>
            <p className="text-sm leading-relaxed sm:text-base">
              Academia Agent blends institution data, real-time labor insights, and Bedrock AgentCore reasoning to
              produce personalized recommendations. With secure hosting on AWS, your conversations are private and
              persistent across sessions.
            </p>
          </div>
          <dl className="grid gap-5 text-sm sm:grid-cols-2 sm:gap-6">
            <div className="space-y-1">
              <dt className="font-semibold">Program exploration</dt>
              <dd className="text-[color-mix(in_srgb,var(--primary)_75%,transparent)]">
                Surface certificates, diplomas, undergraduate, and graduate pathways that match interests.
              </dd>
            </div>
            <div className="space-y-1">
              <dt className="font-semibold">Budget planning</dt>
              <dd className="text-[color-mix(in_srgb,var(--primary)_75%,transparent)]">
                Review tuition, fees, housing, and financial aid to compare total cost of attendance.
              </dd>
            </div>
            <div className="space-y-1">
              <dt className="font-semibold">Career alignment</dt>
              <dd className="text-[color-mix(in_srgb,var(--primary)_75%,transparent)]">
                Understand graduate outcomes, in-demand roles, and salary ranges for each pathway.
              </dd>
            </div>
            <div className="space-y-1">
              <dt className="font-semibold">Collaborative advising</dt>
              <dd className="text-[color-mix(in_srgb,var(--primary)_75%,transparent)]">
                Share curated plans with families or colleagues and iterate together in real time.
              </dd>
            </div>
          </dl>
        </section>

        <section className="rounded-3xl border border-[var(--border)] bg-[color-mix(in_srgb,var(--card)_94%,transparent)] p-8 text-center shadow-sm sm:p-10">
          <h2 className="text-2xl font-semibold sm:text-3xl">Ready to map the journey?</h2>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-[color-mix(in_srgb,var(--foreground)_70%,transparent)] sm:text-base">
            Sign in with your preferred provider to unlock the full chat experience. Academia Agent remembers your
            preferences, keeps conversations secure, and helps you move from curiosity to a confident plan.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/chat"
              className="inline-flex items-center justify-center rounded-full bg-[var(--primary)] px-6 py-3 text-sm font-semibold text-[var(--primary-foreground)] shadow-sm transition hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
            >
              Start planning with Academia Agent
            </Link>
            <Link
              href="/terms"
              className="inline-flex items-center justify-center rounded-full border border-[var(--border)] px-6 py-3 text-sm font-semibold text-[color-mix(in_srgb,var(--foreground)_85%,transparent)] transition hover:bg-[color-mix(in_srgb,var(--card)_92%,transparent)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
            >
              Review terms & privacy
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
