"use client";

import { useMemo, useState } from "react";

type Bubble = {
  from: "user" | "bot";
  text?: string;
  meta?: string;
  card?: "eligible" | "scam" | "savings" | "scheme";
};

const conversations: Record<
  string,
  { language: string; label: string; bubbles: Bubble[] }
> = {
  Priya: {
    language: "Marathi",
    label: "Explains ULIP vs ELSS without pushing a product.",
    bubbles: [
      {
        from: "user",
        text: "मी ULIP घेतला आहे. ELSS पेक्षा तो चांगला आहे का?"
      },
      {
        from: "bot",
        text: "ULIP मध्ये insurance आणि investment एकत्र असतात. ELSS फक्त equity mutual fund आहे आणि tax saving साठी वापरला जातो."
      },
      {
        from: "bot",
        text: "तुमचा निर्णय surrender charge, lock-in, fund value आणि insurance need पाहून घ्या. मी comparison सोप्या भाषेत देतो."
      }
    ]
  },
  Rajesh: {
    language: "Hindi",
    label: "Builds an emergency savings range for irregular income.",
    bubbles: [
      {
        from: "user",
        text: "मेरी कमाई हर महीने बदलती है. emergency fund कितना रखना चाहिए?"
      },
      {
        from: "bot",
        text: "आप जैसे gig worker के लिए monthly average नहीं, minimum expense देखना बेहतर है."
      },
      {
        from: "bot",
        card: "savings",
        text: "Suggested range: Rs 18,000 - Rs 30,000\nStart with Rs 150 per working day.\nYou may also check PMSBY eligibility for low-cost accident cover."
      }
    ]
  },
  Kisan: {
    language: "Kannada",
    label: "Checks PM-KISAN eligibility with deterministic rules.",
    bubbles: [
      {
        from: "user",
        text: "ನಾನು 2 ಎಕರೆ ಭೂಮಿಯ ರೈತ. PM-KISAN ಸಿಗುತ್ತದೆಯಾ?"
      },
      {
        from: "bot",
        text: "ನಾನು ಅರ್ಹತೆ ಪರಿಶೀಲಿಸುತ್ತೇನೆ. ಭೂಮಿ ನಿಮ್ಮ ಹೆಸರಲ್ಲಿದೆಯೇ ಮತ್ತು ನೀವು ಆದಾಯ ತೆರಿಗೆ ಪಾವತಿಸುತ್ತೀರಾ?"
      },
      {
        from: "user",
        text: "ಹೌದು, ಭೂಮಿ ನನ್ನ ಹೆಸರಲ್ಲಿದೆ. ಆದಾಯ ತೆರಿಗೆ ಪಾವತಿಸುವುದಿಲ್ಲ."
      },
      {
        from: "bot",
        card: "eligible",
        text: "PM-KISAN — Eligible\nBenefit: Rs 6,000 per year\nApply: pmkisan.gov.in or nearest CSC\nDocuments: Aadhaar, land record, bank account"
      },
      {
        from: "bot",
        card: "scheme",
        text: "Scheme card generated for sharing with family."
      }
    ]
  },
  Divya: {
    language: "English",
    label: "Finds ADIP scheme eligibility in a screen-reader-friendly flow.",
    bubbles: [
      {
        from: "user",
        text: "Can I get support for a hearing aid without asking my family to fill forms?"
      },
      {
        from: "bot",
        text: "Yes. I can check ADIP eligibility and list the documents in order."
      },
      {
        from: "bot",
        card: "eligible",
        text: "ADIP — Likely eligible\nNext step: visit district disability office or registered implementing agency.\nBring: UDID or disability certificate, income proof, Aadhaar."
      }
    ]
  }
};

const people = [
  {
    name: "Priya — Teacher, Thane",
    context: "Stable income, but every major financial decision still arrives through family advice or WhatsApp forwards.",
    pains: [
      "Sold a ULIP she still cannot explain",
      "WhatsApp tips she cannot verify",
      "No guidance in Marathi"
    ],
    does: "Explains products in Marathi, compares choices plainly, and shows when a claim needs verification."
  },
  {
    name: "Rajesh — Delivery Partner, Jaipur",
    context: "Income changes daily, so advice built around fixed monthly salary does not fit his life.",
    pains: [
      "Cannot plan from a monthly average",
      "Loan offers arrive with urgency",
      "Insurance feels unaffordable"
    ],
    does: "Creates small saving ranges, flags risky loan language, and surfaces low-cost protection schemes."
  },
  {
    name: "Kisan — Farmer, Mandya",
    context: "Eligibility is not the same as awareness; scheme rules are clear, but access is scattered.",
    pains: [
      "Unsure which schemes apply",
      "Forms change by office",
      "Kannada support is limited"
    ],
    does: "Runs scheme rules deterministically, lists documents, and gives apply steps in Kannada."
  },
  {
    name: "Divya — Student, Pune",
    context: "Accessibility is not an edge case when the product is supposed to serve everyone.",
    pains: [
      "Needs screen-reader friendly answers",
      "Cannot rely on family assistance",
      "Government portals are dense"
    ],
    does: "Keeps answers structured, checks disability scheme fit, and turns forms into ordered steps."
  }
];

const qualitySignals = [
  {
    k: "Source-backed",
    v: "RBI + scheme docs",
    detail: "Answers cite curated material, not loose guesses."
  },
  {
    k: "Rule-checked",
    v: "Eligibility engine",
    detail: "Scheme outcomes come from deterministic conditions."
  },
  {
    k: "Language-first",
    v: "Hindi · Marathi · Kannada",
    detail: "Built around how users actually ask for help."
  }
];

const steps = [
  {
    n: "01",
    title: "Ask anything about money, in your language",
    body:
      "The bot answers financial questions in Hindi, Marathi, and Kannada. It retrieves from curated source material, including RBI consumer guidance, scheme documents, and tax basics, so the answer is grounded rather than approximate.",
    mock: [
      { from: "user" as const, text: "FD तोडून mutual fund घ्यावा का?" },
      {
        from: "bot" as const,
        text: "पहिले emergency money ठेवा. मग risk आणि time horizon पाहून fund निवडा."
      }
    ]
  },
  {
    n: "02",
    title: "Find out what government schemes you qualify for",
    body:
      "Scheme eligibility is handled by a rule engine, because scheme rules are deterministic and should not hallucinate. A few answers about land, income, state, and documents produce a clear result with apply steps.",
    mock: [{ from: "bot" as const, card: "eligible" as const, text: "PM-KISAN — Eligible\nRule match: landholding + non-taxpayer\nNext: verify Aadhaar and bank account" }]
  },
  {
    n: "03",
    title: "Check a suspicious investment message before you act on it",
    body:
      "Forward any investment tip, loan offer, or scheme message to the bot. It checks for unrealistic return claims, urgency language, KYC phishing patterns, and other common scam signatures.",
    mock: [{ from: "bot" as const, card: "scam" as const, text: "High risk message\nFlagged: guaranteed 3x return, urgent payment window, unofficial KYC link" }]
  }
];

function ChatBubble({ bubble }: { bubble: Bubble }) {
  const lines = bubble.text?.split("\n") ?? [];
  return (
    <div className={`bubble ${bubble.from} ${bubble.card ? `card ${bubble.card}` : ""}`}>
      {bubble.card === "eligible" && <span className="status-dot" />}
      {bubble.card === "scam" && <span className="warning-mark">!</span>}
      {bubble.card === "scheme" && (
        <div className="scheme-card">
          <span>PM-KISAN</span>
          <strong>Rs 6,000 / year</strong>
          <small>Eligibility confirmed</small>
        </div>
      )}
      {lines.map((line) => (
        <p key={line}>{line}</p>
      ))}
      {bubble.meta && <small>{bubble.meta}</small>}
    </div>
  );
}

function PhoneMockup({
  active,
  compact = false
}: {
  active: keyof typeof conversations;
  compact?: boolean;
}) {
  const data = conversations[active];
  return (
    <div className={`phone ${compact ? "compact" : ""}`} aria-label={`${active} WhatsApp conversation`}>
      <div className="phone-top">
        <span className="avatar">A</span>
        <div>
          <strong>ArthSaathi</strong>
          <small>online</small>
        </div>
      </div>
      <div className="trust-rail" aria-hidden="true">
        <span>source checked</span>
        <span>rule path visible</span>
        <span>plain language</span>
      </div>
      <div className="chat-wall">
        {data.bubbles.map((bubble, index) => (
          <ChatBubble key={`${active}-${index}`} bubble={bubble} />
        ))}
      </div>
      <div className="composer">
        <span>Message</span>
        <b>↗</b>
      </div>
    </div>
  );
}

export default function Home() {
  const [active, setActive] = useState<keyof typeof conversations>("Kisan");
  const selected = useMemo(() => conversations[active], [active]);

  return (
    <main>
      <nav className="site-nav">
        <a href="#top" className="brand" aria-label="ArthSaathi home">
          ArthSaathi <span>आर्थ साथी</span>
        </a>
        <div className="nav-links">
          <a href="#how">How it works</a>
          <a href="#who">Who it&apos;s for</a>
          <a className="nav-cta" href="https://wa.me/" target="_blank" rel="noreferrer">
            Open in WhatsApp
          </a>
        </div>
      </nav>

      <section id="top" className="hero section reveal">
        <div className="hero-copy">
          <h1>
            Financial guidance
            <br />
            for the India
            <br />
            that actually exists.
          </h1>
          <p>
            Most financial tools were built for someone with a fixed salary, an English
            education, and time to spare. ArthSaathi is for everyone else.
          </p>
          <div className="chips" aria-label="Personas served">
            <span>Salaried</span>
            <span>Gig worker</span>
            <span>Farmer</span>
            <span>Person with disability</span>
          </div>
          <a className="primary-button" href="https://wa.me/" target="_blank" rel="noreferrer">
            Try it on WhatsApp
          </a>
          <div className="quality-strip" aria-label="Product trust signals">
            {qualitySignals.map((signal) => (
              <article key={signal.k}>
                <span>{signal.k}</span>
                <strong>{signal.v}</strong>
                <p>{signal.detail}</p>
              </article>
            ))}
          </div>
        </div>
        <div className="hero-phone">
          <PhoneMockup active="Kisan" compact />
        </div>
      </section>

      <section id="who" className="section reveal">
        <p className="eyebrow">the problem</p>
        <h2>Four people. Four completely different financial realities.</h2>
        <div className="people-grid">
          {people.map((person) => (
            <article className="person-card" key={person.name}>
              <h3>{person.name}</h3>
              <p>{person.context}</p>
              <div className="rule" />
              <div className="pain-list">
                {person.pains.map((pain) => (
                  <span key={pain}>{pain}</span>
                ))}
              </div>
              <div className="does">
                <small>ArthSaathi does —</small>
                <p>{person.does}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section id="how" className="section reveal">
        <p className="eyebrow">the product</p>
        <h2>One WhatsApp number. Three things it actually does well.</h2>
        <div className="steps">
          {steps.map((step) => (
            <article className="step" key={step.n}>
              <span className="step-number">{step.n}</span>
              <div className="step-copy">
                <h3>{step.title}</h3>
                <p>{step.body}</p>
              </div>
              <div className="inline-mock">
                {step.mock.map((bubble, index) => (
                  <ChatBubble key={`${step.n}-${index}`} bubble={bubble} />
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="section demo-section reveal">
        <p className="eyebrow">demo</p>
        <h2>See a conversation</h2>
        <div className="tabs" role="tablist" aria-label="Conversation personas">
          {Object.keys(conversations).map((name) => (
            <button
              key={name}
              className={active === name ? "active" : ""}
              onClick={() => setActive(name as keyof typeof conversations)}
              type="button"
            >
              {name}
            </button>
          ))}
        </div>
        <div className="demo-phone-wrap" key={active}>
          <PhoneMockup active={active} />
        </div>
        <p className="conversation-label">
          <span>{selected.language}</span> · {selected.label}
        </p>
      </section>

      <section className="section tech reveal">
        <div className="tech-copy">
          <p className="eyebrow">under the hood</p>
          <p>
            ArthSaathi uses a hybrid architecture. Intent routing decides whether the user
            needs a deterministic scheme decision, a retrieved explanation, or a risk check
            on a forwarded message.
          </p>
          <p>
            The rule engine handles eligibility because government scheme logic has exact
            conditions. The language model is used where language helps: explaining tradeoffs,
            translating terms, and turning source-backed information into plain speech.
          </p>
          <p>
            BHASHINI provides multilingual support across Hindi, Marathi, and Kannada, with
            WhatsApp as the entry point because the product should meet users where they
            already are.
          </p>
        </div>
        <div className="architecture" aria-label="Architecture diagram">
          <div className="arch-node arch-input">
            <small>input</small>
            <strong>WhatsApp / Web</strong>
            <span>text, voice notes, forwards</span>
          </div>
          <div className="arch-connector" />
          <div className="arch-node arch-router">
            <small>intent router</small>
            <strong>Classify the request</strong>
            <span>question, eligibility, scam check</span>
          </div>
          <div className="arch-connector split" />
          <div className="arch-lanes">
            <div className="arch-node">
              <small>deterministic</small>
              <strong>Rule Engine</strong>
              <span>scheme eligibility</span>
            </div>
            <div className="arch-node">
              <small>source-backed</small>
              <strong>RAG Pipeline</strong>
              <span>RBI, tax, scheme docs</span>
            </div>
            <div className="arch-node">
              <small>risk signals</small>
              <strong>Scam Analyzer</strong>
              <span>urgency, returns, KYC links</span>
            </div>
          </div>
          <div className="arch-connector merge" />
          <div className="arch-data">
            <span>BHASHINI</span>
            <span>KakushIN LLM API</span>
            <span>Curated Knowledge Base</span>
          </div>
          <div className="arch-connector" />
          <div className="arch-node arch-response">
            <small>response</small>
            <strong>Plain-language answer</strong>
            <span>steps, flags, cards, citations</span>
          </div>
        </div>
        <p className="tech-note">
          LLM: KakushIN LLM API (Phi-3.5-Mini-Instruct, 3.8B GGUF, CPU). Multilingual:
          BHASHINI API v1.0 (Hindi, Marathi, Kannada).
        </p>
      </section>

      <footer className="footer reveal">
        <div>
          <h2>ArthSaathi / आर्थ साथी</h2>
          <p>
            Team Code — Shaman Shetty, Vallari Sharma — MPSTME, NMIMS University —
            Nomura Coding Contest 2026
          </p>
        </div>
        <div className="qr-card">
          <div className="qr" aria-hidden="true">
            {Array.from({ length: 49 }).map((_, index) => (
              <span key={index} className={index % 3 === 0 || index % 11 === 0 ? "on" : ""} />
            ))}
          </div>
          <strong>Scan to open in WhatsApp</strong>
          <small>Twilio sandbox number</small>
        </div>
        <p className="footer-note">
          Next.js · WhatsApp-first interface · Rule engine · RAG · Scam signature analysis ·
          BHASHINI multilingual layer
        </p>
      </footer>
    </main>
  );
}
