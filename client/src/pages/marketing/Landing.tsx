import { useState } from "react";
import { Link } from "react-router-dom";
import { CURRENCIES } from "@setu/types";
import xintoLogo from "../../assets/xinto-logo.png";

const NAV_LINKS = [
  { href: "#how-it-works", label: "How It Works" },
  { href: "#features", label: "Features" },
  { href: "#pricing", label: "Pricing" },
  { href: "#security", label: "Security" },
  { href: "#faq", label: "FAQ" },
];

const HOW_IT_WORKS = [
  {
    step: "01",
    title: "Virtual account provisioned",
    body: "Xinto opens a dedicated virtual account in your buyer's currency, backed by a regulated partner bank. No entity setup needed on your end.",
  },
  {
    step: "02",
    title: "Your buyer transfers directly",
    body: "Your buyer pays into that virtual account with a local transfer in their own currency — no SWIFT, no correspondent-bank delays.",
  },
  {
    step: "03",
    title: "Funds lock into escrow instantly",
    body: "The moment payment arrives, escrow locks it. You see it in your Xinto dashboard in real time. Neither side can unilaterally move it.",
  },
  {
    step: "04",
    title: "You confirm delivery on the platform",
    body: "Once goods are delivered and the buyer confirms receipt, one click releases escrow. No paperwork, no phone calls.",
  },
  {
    step: "05",
    title: "Currency converts at a transparent rate",
    body: "Xinto applies a flat 0.5% spread, published upfront. You see the exact INR you'll receive before conversion happens.",
  },
  {
    step: "06",
    title: "INR credited + compliance filed automatically",
    body: "Funds land in your Indian account, and EDPMS/FIRC/eBRC filings are generated automatically — zero calls to your bank.",
  },
];

const FEATURES = [
  {
    icon: "🌍",
    title: "Multi-currency virtual accounts",
    body: `One dashboard, six currencies (${CURRENCIES.join(", ")}) — trade with buyers anywhere without opening a foreign entity.`,
  },
  {
    icon: "🔒",
    title: "Bank-grade escrow",
    body: "Every payment locks the moment it lands. Funds release only when you confirm delivery — fully auditable, no unilateral moves.",
  },
  {
    icon: "💱",
    title: "Transparent FX rate",
    body: "Flat 0.5% spread, published before every conversion. No hidden treasury cuts, no last-minute surprises.",
  },
  {
    icon: "📄",
    title: "Auto compliance filing",
    body: "EDPMS filing, e-FIRC, and eBRC generated automatically the moment funds settle. Share with your CA in one click.",
  },
  {
    icon: "🧾",
    title: "Immutable audit trail",
    body: "Every state change — payment, escrow, dispute, settlement — is logged permanently and visible to your ops team.",
  },
  {
    icon: "🤝",
    title: "Dispute protection",
    body: "If a buyer disputes delivery, escrow holds. Resolve back into the flow or refund — never a frozen, ambiguous limbo.",
  },
];

const COMPARISON_ROWS = [
  { label: "FX Spread", bank: "3.5% – 4%", setu: "0.5% flat" },
  { label: "Settlement Time", bank: "3–5 business days", setu: "Same day" },
  { label: "Compliance Filing", bank: "5–15 days (manual)", setu: "Instant (auto)" },
  { label: "Payment Visibility", bank: "Black hole, 3 days", setu: "Real-time dashboard" },
  { label: "Escrow Protection", bank: "None", setu: "100% every transaction" },
  { label: "Dispute Resolution", bank: "Legal, months", setu: "In-app, instant" },
];

const PRICING_TIERS = [
  {
    name: "Starter",
    price: "₹12K",
    blurb: "For exporters under ₹2 Cr annual exports",
    features: ["Virtual multi-currency accounts", "Up to 5 transactions/month", "Escrow protection", "Auto compliance filing"],
    highlight: false,
  },
  {
    name: "Growth",
    price: "₹15K",
    blurb: "For exporters ₹2–8 Cr annual exports",
    features: [
      "Virtual multi-currency accounts",
      "Up to 15 transactions/month",
      "Escrow on all transactions",
      "Auto compliance + priority FX rate",
    ],
    highlight: true,
  },
  {
    name: "Enterprise",
    price: "₹20K",
    blurb: "For exporters ₹8 Cr+ annual exports",
    features: ["Virtual multi-currency accounts", "Unlimited transactions", "Negotiated FX rate", "Dedicated relationship manager"],
    highlight: false,
  },
];

const FAQS = [
  {
    q: "Do I need to set up a company abroad?",
    a: "No. You don't need a foreign entity of any kind. Xinto provisions a virtual account number under our bank partner's account. Your buyers transfer to it like a local account. All you need is your existing Indian company.",
  },
  {
    q: "Is this RBI-approved? Is it legal?",
    a: "Xinto operates on the FEMA-compliant purpose code for export proceeds, with every transaction reported correctly — this MVP demo reproduces that compliance workflow end to end.",
  },
  {
    q: "What if my buyer refuses to confirm delivery?",
    a: "You or the buyer can raise a dispute instead — escrow holds the funds until it's resolved back into the flow, or refunded. Nothing sits in ambiguous limbo.",
  },
  {
    q: "Which currencies are supported?",
    a: `Six currencies today: ${CURRENCIES.join(", ")} — each with its own dedicated virtual account and live FX rate to INR.`,
  },
];

function Section({ id, children, className = "" }: { id?: string; children: React.ReactNode; className?: string }) {
  return (
    <section id={id} className={`mx-auto max-w-6xl px-6 py-20 ${className}`}>
      {children}
    </section>
  );
}

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-3 flex items-center justify-center gap-2 text-xs font-semibold uppercase tracking-widest text-primary">
      {children} <span className="h-px w-6 bg-primary" />
    </p>
  );
}

export function Landing() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  return (
    <div className="bg-[#faf9f6] text-gray-900">
      {/* Nav */}
      <header className="sticky top-0 z-10 border-b border-gray-200 bg-[#faf9f6]/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link to="/" className="flex items-center hover:opacity-80">
            <img src={xintoLogo} alt="Xinto" className="h-7 w-auto" />
          </Link>
          <nav className="hidden gap-6 text-sm text-gray-600 md:flex">
            {NAV_LINKS.map((link) => (
              <a key={link.href} href={link.href} className="hover:text-gray-900">
                {link.label}
              </a>
            ))}
          </nav>
          <div className="flex items-center gap-3">
            <span className="hidden rounded-full border border-gray-300 px-3 py-1 text-xs font-mono text-gray-500 sm:inline">
              6 CURRENCIES
            </span>
            <Link
              to="/login"
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-white"
            >
              Login
            </Link>
            <Link
              to="/register"
              className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:opacity-90"
            >
              Register
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <Section className="grid grid-cols-1 items-center gap-12 pt-16 lg:grid-cols-2">
        <div>
          <span className="mb-6 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" /> Demo mode — try it live
          </span>
          <h1 className="font-display text-5xl leading-tight text-gray-900 sm:text-6xl">
            Your buyer paid.
            <br />
            <em className="text-primary">Where&rsquo;s your money?</em>
          </h1>
          <p className="mt-6 max-w-lg text-lg text-gray-600">
            Xinto gives Indian MSME exporters a dedicated virtual account in {CURRENCIES.join(", ")}, bank-grade
            escrow, and real-time payment visibility — so you stop chasing banks and start growing exports.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to="/register"
              className="rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-white hover:opacity-90"
            >
              Register →
            </Link>
            <a
              href="#how-it-works"
              className="rounded-lg border border-gray-300 px-6 py-3 text-sm font-semibold text-gray-700 hover:bg-white"
            >
              See how it works
            </a>
          </div>
          <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-xs text-gray-500">
            <span>● RBI-style compliant</span>
            <span>● Multi-currency escrow</span>
            <span>● Bank-grade security</span>
          </div>
        </div>

        <div className="relative">
          <div className="absolute -top-6 left-6 flex items-center gap-3 rounded-xl bg-gray-900 px-4 py-3 text-white shadow-lg">
            <span className="text-lg">🔒</span>
            <div>
              <p className="text-sm font-semibold">Escrow Active</p>
              <p className="text-xs text-gray-300">SGD 45,000 protected</p>
            </div>
          </div>
          <div className="rounded-2xl border border-gray-200 bg-white p-6 pt-10 shadow-xl">
            <div className="mb-4 flex items-center justify-between text-sm">
              <span className="font-semibold text-primary">Xinto Platform</span>
              <span className="flex items-center gap-1 text-xs text-emerald-600">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Preview
              </span>
            </div>
            <p className="text-center text-xs uppercase tracking-widest text-gray-400">Incoming payment</p>
            <p className="text-center font-display text-4xl text-gray-900">SGD 45K</p>
            <p className="text-center text-sm text-primary">≈ ₹28,20,000 at 0.5% spread</p>
            <ul className="mt-6 space-y-3 border-t border-gray-100 pt-4 text-sm">
              {[
                { label: "Virtual account credited", note: "Partner Bank · 09:14 AM", tag: "Done" },
                { label: "Escrow locked — awaiting confirm", note: "Automated", tag: "Done" },
                { label: "Delivery confirmation", note: "Pending your approval", tag: "Now" },
                { label: "INR credited", note: "Within 24 hours", tag: "Soon" },
              ].map((row) => (
                <li key={row.label} className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-800">{row.label}</p>
                    <p className="text-xs text-gray-400">{row.note}</p>
                  </div>
                  <span
                    className={`text-xs font-medium ${row.tag === "Done" ? "text-emerald-600" : row.tag === "Now" ? "text-primary" : "text-gray-400"}`}
                  >
                    {row.tag}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Section>

      {/* Stats bar */}
      <div className="border-y border-gray-200 bg-white py-4">
        <div className="mx-auto flex max-w-6xl flex-wrap justify-center gap-x-10 gap-y-2 px-6 text-sm text-gray-600">
          <span>
            <strong className="text-primary">0.5%</strong> FX spread vs. 3.5%+ bank
          </span>
          <span>
            <strong className="text-primary">0</strong> calls to bank for compliance
          </span>
          <span>
            <strong className="text-primary">24 hrs</strong> INR credit vs. 3–5 days SWIFT
          </span>
          <span>
            <strong className="text-primary">100%</strong> escrow-backed payments
          </span>
        </div>
      </div>

      {/* Problem */}
      <Section className="text-center">
        <Eyebrow>The Problem</Eyebrow>
        <h2 className="mx-auto max-w-3xl font-display text-4xl text-gray-900">
          You exported. The buyer paid. Yet you wait, and wait, and wait.
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-gray-600">
          Every MSME exporter trading internationally knows this pain. Xinto was built to end it.
        </p>
        <div className="mx-auto mt-10 grid max-w-2xl grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="rounded-xl border-l-4 border-red-400 bg-white p-6 text-left shadow-sm">
            <p className="font-display text-3xl text-red-500">3 Days</p>
            <p className="mt-1 text-sm text-gray-600">of silence before you know a payment even arrived.</p>
          </div>
          <div className="rounded-xl border-l-4 border-red-400 bg-white p-6 text-left shadow-sm">
            <p className="font-display text-3xl text-red-500">3.5%+</p>
            <p className="mt-1 text-sm text-gray-600">bank FX spread quietly eaten out of every settlement.</p>
          </div>
        </div>
      </Section>

      {/* How it works */}
      <Section id="how-it-works">
        <div className="text-center">
          <Eyebrow>How it works</Eyebrow>
          <h2 className="font-display text-4xl text-gray-900">From payment to INR, on one platform.</h2>
        </div>
        <ol className="mx-auto mt-12 max-w-2xl space-y-8 border-l border-gray-200 pl-8">
          {HOW_IT_WORKS.map((step) => (
            <li key={step.step} className="relative">
              <span className="absolute -left-[38px] flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-semibold text-white">
                {step.step.slice(1)}
              </span>
              <p className="text-xs font-semibold uppercase tracking-wide text-primary">Step {step.step}</p>
              <h3 className="mt-1 font-semibold text-gray-900">{step.title}</h3>
              <p className="mt-1 text-sm text-gray-600">{step.body}</p>
            </li>
          ))}
        </ol>
      </Section>

      {/* Features */}
      <Section id="features" className="bg-white">
        <div className="text-center">
          <Eyebrow>Features</Eyebrow>
          <h2 className="font-display text-4xl text-gray-900">Everything an exporter actually needs.</h2>
        </div>
        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <div key={f.title} className="rounded-xl border border-gray-200 p-6">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 text-lg">
                {f.icon}
              </div>
              <h3 className="font-semibold text-gray-900">{f.title}</h3>
              <p className="mt-2 text-sm text-gray-600">{f.body}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* FX Savings comparison */}
      <Section>
        <div className="text-center">
          <Eyebrow>Bank vs. Xinto</Eyebrow>
          <h2 className="font-display text-4xl text-gray-900">
            The spread difference alone pays for itself many times over.
          </h2>
        </div>
        <div className="mx-auto mt-10 max-w-3xl overflow-hidden rounded-xl border border-gray-200 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-xs uppercase text-gray-400">
              <tr>
                <th className="px-6 py-3">What you pay for</th>
                <th className="px-6 py-3">Your bank (SWIFT)</th>
                <th className="px-6 py-3">Xinto platform</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {COMPARISON_ROWS.map((row) => (
                <tr key={row.label}>
                  <td className="px-6 py-3 font-medium text-gray-900">{row.label}</td>
                  <td className="px-6 py-3 text-red-500">{row.bank}</td>
                  <td className="px-6 py-3 font-medium text-emerald-600">{row.setu}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      {/* Security */}
      <Section id="security" className="bg-white text-center">
        <Eyebrow>Security &amp; compliance</Eyebrow>
        <h2 className="mx-auto max-w-2xl font-display text-4xl text-gray-900">
          Bank-grade trust. <span className="text-primary">Not fintech promises.</span>
        </h2>
        <div className="mx-auto mt-12 grid max-w-4xl grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: "🏛️", title: "FEMA-style Compliant", body: "Purpose code applied. Every transaction logged for reporting." },
            { icon: "🌐", title: "Multi-corridor ready", body: "Six currencies live, each on its own dedicated virtual account." },
            { icon: "🔐", title: "Escrow Protocol", body: "Every payment locks the moment it lands. No unilateral moves." },
            { icon: "🏦", title: "Bank Partner Backed", body: "Funds sit in a real (demo) Nostro-style account, not shadow banking." },
          ].map((s) => (
            <div key={s.title} className="rounded-xl bg-gray-50 p-6 text-left">
              <div className="mb-3 text-2xl">{s.icon}</div>
              <h3 className="font-semibold text-gray-900">{s.title}</h3>
              <p className="mt-2 text-sm text-gray-600">{s.body}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* Pricing */}
      <Section id="pricing">
        <div className="text-center">
          <Eyebrow>Simple pricing</Eyebrow>
          <h2 className="font-display text-4xl text-gray-900">One flat monthly fee. No hidden charges.</h2>
          <p className="mt-3 text-gray-600">Pick the plan that matches your export volume. Cancel anytime.</p>
        </div>
        <div className="mx-auto mt-12 grid max-w-4xl grid-cols-1 gap-6 md:grid-cols-3">
          {PRICING_TIERS.map((tier) => (
            <div
              key={tier.name}
              className={`relative rounded-2xl border p-6 ${tier.highlight ? "border-primary shadow-lg" : "border-gray-200"} bg-white`}
            >
              {tier.highlight && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-white">
                  Most popular
                </span>
              )}
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">{tier.name}</p>
              <p className="mt-2 font-display text-3xl text-gray-900">
                {tier.price}
                <span className="text-sm font-sans text-gray-400">/month</span>
              </p>
              <p className="mt-1 text-sm text-gray-500">{tier.blurb}</p>
              <ul className="mt-4 space-y-2 text-sm text-gray-700">
                {tier.features.map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <span className="text-emerald-600">✓</span> {f}
                  </li>
                ))}
              </ul>
              <Link
                to="/register"
                className={`mt-6 block rounded-lg px-4 py-2 text-center text-sm font-semibold ${
                  tier.highlight ? "bg-primary text-white hover:opacity-90" : "border border-primary text-primary hover:bg-primary/5"
                }`}
              >
                Register →
              </Link>
            </div>
          ))}
        </div>
      </Section>

      {/* Persona */}
      <Section className="bg-white">
        <div className="text-center">
          <h2 className="mx-auto max-w-2xl font-display text-4xl text-gray-900">
            Built for <span className="text-primary">Rajesh Mehta</span> — and exporters like him.
          </h2>
          <p className="mt-3 text-gray-600">Xinto is purpose-built for Indian MSME exporters trading internationally.</p>
        </div>
        <div className="mx-auto mt-10 max-w-2xl rounded-xl bg-gray-50 p-6">
          <p className="text-xs font-semibold uppercase tracking-wide text-primary">Customer persona</p>
          <h3 className="mt-1 font-semibold text-gray-900">Rajesh Mehta, 46 — Tirupur, Tamil Nadu</h3>
          <p className="mt-1 text-sm text-gray-600">
            Textile exporter (Mehta Knitwear Exports Pvt Ltd). Currently using a traditional bank + SWIFT for
            international collections.
          </p>
          <div className="mt-4 grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
            <div>
              <p className="text-xs font-semibold text-gray-400">Biggest frustration</p>
              <p className="text-gray-700">
                &ldquo;I never know if the payment is coming or stuck. Days of silence every time.&rdquo;
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-400">What he needs</p>
              <p className="text-gray-700">Proof the money is safe, real-time updates, and no more bank black holes.</p>
            </div>
          </div>
        </div>
      </Section>

      {/* FAQ */}
      <Section id="faq">
        <h2 className="text-center font-display text-4xl text-gray-900">Questions every exporter asks us.</h2>
        <div className="mx-auto mt-10 max-w-2xl space-y-3">
          {FAQS.map((faq, i) => (
            <div key={faq.q} className="rounded-xl border border-gray-200 bg-white">
              <button
                type="button"
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="flex w-full items-center justify-between px-6 py-4 text-left text-sm font-semibold text-gray-900"
              >
                {faq.q}
                <span className="text-gray-400">{openFaq === i ? "−" : "+"}</span>
              </button>
              {openFaq === i && <p className="px-6 pb-4 text-sm text-gray-600">{faq.a}</p>}
            </div>
          ))}
        </div>
      </Section>

      {/* Final CTA */}
      <Section className="text-center">
        <Eyebrow>Demo mode</Eyebrow>
        <h2 className="mx-auto max-w-2xl font-display text-4xl text-gray-900">
          Stop chasing banks. <span className="text-primary">Start getting paid.</span>
        </h2>
        <p className="mx-auto mt-4 max-w-lg text-gray-600">
          Create your exporter account to get virtual multi-currency accounts, escrow protection, and auto
          compliance filing. Demo data ready to explore.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            to="/register"
            className="rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-white hover:opacity-90"
          >
            Register →
          </Link>
          <Link
            to="/login"
            className="rounded-lg border border-gray-300 px-6 py-3 text-sm font-semibold text-gray-700 hover:bg-white"
          >
            Login
          </Link>
        </div>
      </Section>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white py-10">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <Link to="/" className="flex items-center hover:opacity-80">
                <img src={xintoLogo} alt="Xinto" className="h-6 w-auto" />
              </Link>
              <p className="mt-2 text-sm text-gray-500">
                A cross-border trade + payment platform demo for Indian MSME exporters. Mock services only — no
                real bank, no real money movement.
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Platform</p>
              <ul className="mt-3 space-y-2 text-sm text-gray-600">
                <li>
                  <a href="#how-it-works" className="hover:text-gray-900">
                    How It Works
                  </a>
                </li>
                <li>
                  <a href="#features" className="hover:text-gray-900">
                    Features
                  </a>
                </li>
                <li>
                  <a href="#pricing" className="hover:text-gray-900">
                    Pricing
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Exporters</p>
              <ul className="mt-3 space-y-2 text-sm text-gray-600">
                <li>
                  <Link to="/login" className="hover:text-gray-900">
                    Login
                  </Link>
                </li>
                <li>
                  <Link to="/register" className="hover:text-gray-900">
                    Register
                  </Link>
                </li>
                <li>
                  <a href="#faq" className="hover:text-gray-900">
                    FAQ
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Compliance</p>
              <ul className="mt-3 space-y-2 text-sm text-gray-600">
                <li>{CURRENCIES.join(" · ")}</li>
                <li>Demo / MVP build</li>
              </ul>
            </div>
          </div>
          <p className="mt-10 border-t border-gray-100 pt-6 text-xs text-gray-400">
            © 2026 Xinto — MVP demo. All money movement is simulated.
          </p>
        </div>
      </footer>
    </div>
  );
}
