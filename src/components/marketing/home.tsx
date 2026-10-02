'use client';

import {
  Fragment,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
} from 'react';
import Link from 'next/link';
import { DM_Sans, Space_Grotesk } from 'next/font/google';
import { useTheme } from '@/hooks/use-theme';
import {
  PROOFLINE_NOTICE,
  PROOFLINE_RIGHTS_HOLDER,
} from '@/lib/legal/trademark';
import { useHomeMotion } from './use-home-motion';
import './home.css';

const bodyFont = DM_Sans({
  subsets: ['latin'],
  variable: '--font-landing-body',
});
const displayFont = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-landing-display',
});

export function HomePage() {
  const { mode, toggleMode } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);
  const [yearly, setYearly] = useState(false);
  const [approved, setApproved] = useState(false);
  const [paused, setPaused] = useState(false);
  const [notice, setNotice] = useState('');
  const root = useRef<HTMLDivElement>(null);
  useHomeMotion(root, paused);
  useEffect(() => {
    if (!notice) return;
    const timer = window.setTimeout(() => setNotice(''), 4200);
    return () => window.clearTimeout(timer);
  }, [notice]);
  function approve() {
    setApproved(!approved);
    setNotice(
      approved
        ? 'Sample approval undone.'
        : 'Sample next step approved. No message was sent.'
    );
  }
  return (
    <div
      ref={root}
      className={`proofline-landing ${bodyFont.variable} ${displayFont.variable}`}
      data-mode={mode}
      onKeyDown={(e) => {
        if (e.key === 'Escape' && menuOpen) {
          setMenuOpen(false);
          root.current
            ?.querySelector<HTMLButtonElement>('#menu-toggle')
            ?.focus();
        }
      }}
    >
      <Link className="skip" href="#main">
        Skip to content
      </Link>
      <svg
        className="symbols"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <defs>
          <symbol id="mark" viewBox="0 0 24 24">
            <path d="M4 19V5h7a5 5 0 0 1 0 10H8M8 9v10m4-12h5a3 3 0 0 1 0 6h-1" />
          </symbol>
          <symbol id="arrow" viewBox="0 0 24 24">
            <path d="M5 12h14m-6-6 6 6-6 6" />
          </symbol>
          <symbol id="check" viewBox="0 0 24 24">
            <path d="m5 12 4 4L19 6" />
          </symbol>
          <symbol id="spark" viewBox="0 0 24 24">
            <path d="m12 3 2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5Z" />
          </symbol>
          <symbol id="inbox" viewBox="0 0 24 24">
            <path d="M4 4h16v16H4Zm0 10h5l1 3h4l1-3h5" />
          </symbol>
          <symbol id="chart" viewBox="0 0 24 24">
            <path d="M4 20h17M7 16v-5m5 5V5m5 11V8" />
          </symbol>
          <symbol id="shield" viewBox="0 0 24 24">
            <path d="m12 3 8 3v6c0 5-8 9-8 9s-8-4-8-9V6Z" />
            <path d="m8 12 3 3 5-6" />
          </symbol>
          <symbol id="flow" viewBox="0 0 24 24">
            <rect x="9" y="3" width="6" height="5" rx="1" />
            <rect x="3" y="16" width="6" height="5" rx="1" />
            <rect x="15" y="16" width="6" height="5" rx="1" />
            <path d="M12 8v4m-6 4v-4h12v4" />
          </symbol>
          <symbol id="key" viewBox="0 0 24 24">
            <circle cx="8" cy="9" r="5" />
            <path d="m12 13 8 8m-4-4 3-3m-6 0 3-3" />
          </symbol>
          <symbol id="sun" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5" />
          </symbol>
          <symbol id="menu" viewBox="0 0 24 24">
            <path d="M4 7h16M4 12h16M4 17h16" />
          </symbol>
          <symbol id="play" viewBox="0 0 24 24">
            <path d="m9 5 10 7-10 7Z" />
          </symbol>
        </defs>
      </svg>
      <header>
        <div className="wrap nav-inner">
          <Link className="brand" href="#" aria-label="Proofline home">
            <svg aria-hidden="true">
              <use href="#mark" />
            </svg>
            proofline.
          </Link>
          <nav
            className={`nav-links ${menuOpen ? 'open' : ''}`}
            onClick={() => setMenuOpen(false)}
            id="navigation"
            aria-label="Main navigation"
          >
            <Link href="#features">Product</Link>
            <Link href="#how">How it works</Link>
            <Link href="#stories">Perspectives</Link>
            <Link href="#pricing">Pricing</Link>
          </nav>
          <div className="nav-actions">
            <Link className="login" href="/login">
              Log in
            </Link>
            <button
              className="icon-btn"
              id="theme"
              onClick={toggleMode}
              aria-label={
                mode === 'dark'
                  ? 'Switch to light theme'
                  : 'Switch to dark theme'
              }
            >
              <svg aria-hidden="true">
                <use href="#sun" />
              </svg>
            </button>
            <Link className="btn primary" href="/signup">
              Get started{' '}
              <svg aria-hidden="true">
                <use href="#arrow" />
              </svg>
            </Link>
            <button
              className="icon-btn menu-btn"
              id="menu-toggle"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label={menuOpen ? 'Close navigation' : 'Open navigation'}
              aria-controls="navigation"
              aria-expanded={menuOpen}
            >
              <svg aria-hidden="true">
                <use href="#menu" />
              </svg>
            </button>
          </div>
        </div>
      </header>
      <main id="main">
        <section className="hero center" aria-labelledby="hero-title">
          <div className="orb one" data-speed=".08"></div>
          <div className="orb two" data-speed="-.05"></div>
          <div className="wrap">
            <div className="hero-top">
              <div className="eyebrow">
                A little clarity. A lot more possibility.
              </div>
              <h1
                id="hero-title"
                aria-label="Good relationships. Clear next steps."
              >
                <span aria-hidden="true">
                  <span
                    className="word"
                    style={{ '--delay': '0ms' } as CSSProperties}
                  >
                    Good
                  </span>{' '}
                  <span
                    className="word"
                    style={{ '--delay': '95ms' } as CSSProperties}
                  >
                    relationships.
                  </span>
                  <br />
                  <em>
                    {['Clear', 'next', 'steps.'].map((word, i) => (
                      <Fragment key={word}>
                        <span
                          className="word"
                          style={
                            { '--delay': `${(i + 2) * 95}ms` } as CSSProperties
                          }
                        >
                          {word}
                        </span>
                        {i < 2 ? ' ' : ''}
                      </Fragment>
                    ))}
                  </em>
                </span>
              </h1>
              <p className="sub">
                Turn your WhatsApp conversations into a focused plan. See which
                deals need you, understand why, and make your next move with
                confidence.
              </p>
              <div className="actions">
                <Link className="btn primary magnetic" href="/signup">
                  Find your next opportunity{' '}
                  <svg aria-hidden="true">
                    <use href="#arrow" />
                  </svg>
                </Link>
                <Link className="btn magnetic" href="#product-demo">
                  <svg aria-hidden="true">
                    <use href="#play" />
                  </svg>
                  Explore the product
                </Link>
              </div>
              <p className="note">
                Your records. Your judgment. Every suggested next step, approved
                by you.
              </p>
            </div>
            <div className="stage" id="product-demo">
              <div
                className="mockup"
                role="region"
                aria-label="Interactive product preview with sample data"
              >
                <div className="window-bar" aria-hidden="true">
                  <i></i>
                  <i></i>
                  <i></i>
                  <span>proofline / your workspace</span>
                </div>
                <div className="app-body">
                  <aside className="sidebar" aria-label="Preview sidebar">
                    <div className="brand">
                      <svg aria-hidden="true">
                        <use href="#mark" />
                      </svg>
                      proofline.
                    </div>
                    <div className="side-link">
                      <svg aria-hidden="true">
                        <use href="#inbox" />
                      </svg>
                      Team inbox
                    </div>
                    <div className="side-link active">
                      <svg aria-hidden="true">
                        <use href="#spark" />
                      </svg>
                      Next best moves
                    </div>
                    <div className="side-link">
                      <svg aria-hidden="true">
                        <use href="#chart" />
                      </svg>
                      Pipeline
                    </div>
                    <div className="side-link">
                      <svg aria-hidden="true">
                        <use href="#flow" />
                      </svg>
                      Automations
                    </div>
                    <p className="note">
                      WORKSPACE
                      <br />
                      The good growth team
                    </p>
                  </aside>
                  <div className="app-main">
                    <div className="app-heading">
                      <div>
                        <h3>A clearer day starts here.</h3>
                        <p>Your pipeline, with a little perspective.</p>
                      </div>
                      <span className="pill">Sample workspace</span>
                    </div>
                    <div className="metrics">
                      <div className="metric">
                        <small>Open pipeline</small>
                        <strong className="number">$48,250</strong>
                      </div>
                      <div className="metric">
                        <small>Ready for review</small>
                        <strong className="number" id="review-count">
                          {approved ? '02' : '03'}
                        </strong>
                      </div>
                      <div className="metric">
                        <small>You&apos;re in control</small>
                        <strong className="number">100%</strong>
                      </div>
                    </div>
                    <div className="queue">
                      <div className="queue-label">
                        <span>NEXT BEST MOVES</span>
                        <span>Evidence before action</span>
                      </div>
                      <div className="deal">
                        <span className="avatar">AL</span>
                        <div>
                          <strong>Alex at Form Studio</strong>
                          <small>Proposal shared · follow-up needed</small>
                        </div>
                        <span className="confidence">
                          {approved ? 'Approved' : 'Ready to review'}
                        </span>
                        <button
                          className="btn primary"
                          id="approve"
                          onClick={approve}
                        >
                          {approved ? 'Undo' : 'Approve'}
                        </button>
                      </div>
                      <div className="deal">
                        <span className="avatar">MJ</span>
                        <div>
                          <strong>Maya at Northstar</strong>
                          <small>New reply · pricing question</small>
                        </div>
                        <span className="confidence">New context</span>
                        <span className="pill">Review</span>
                      </div>
                      <div className="deal">
                        <span className="avatar">JK</span>
                        <div>
                          <strong>Jamie at Layers</strong>
                          <small>Timeline unclear · needs context</small>
                        </div>
                        <span className="confidence">Needs context</span>
                        <span className="pill">On hold</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <p className="note">
                Interactive preview · fictional records · try approving the
                first deal
              </p>
            </div>
          </div>
        </section>
        <section
          className="marquee-section center"
          aria-label="Illustrative team identities"
        >
          <div className="wrap">
            <div className="marquee-header">
              <p>Built for teams with good things ahead</p>
              <button
                className="text-control"
                id="motion-toggle"
                onClick={() => setPaused(!paused)}
                aria-pressed={paused}
              >
                {' '}
                {paused ? 'Resume motion' : 'Pause motion'}
              </button>
            </div>
            <div className="marquee">
              <div className="track">
                <div className="logo-group">
                  <span>layers</span>
                  <span>Northstar®</span>
                  <span>form & field</span>
                  <span>Orbit</span>
                  <span>Goodkind.</span>
                  <span>studio21</span>
                </div>
                <div className="logo-group" aria-hidden="true">
                  <span>layers</span>
                  <span>Northstar®</span>
                  <span>form & field</span>
                  <span>Orbit</span>
                  <span>Goodkind.</span>
                  <span>studio21</span>
                </div>
              </div>
            </div>
            <p className="note">
              Illustrative identities, not customer endorsements.
            </p>
          </div>
        </section>
        <section className="section wrap" id="features">
          <div className="section-head reveal">
            <div>
              <div className="eyebrow">Less noise. More next.</div>
              <h2>
                Everything in context.
                <br />
                Nothing left to guess.
              </h2>
            </div>
            <p className="sub">
              Keep the conversation, the evidence, and the next step together.
              Give your team room to do its best work.
            </p>
          </div>
          <div className="bento">
            <article className="card feature wide reveal">
              <svg aria-hidden="true">
                <use href="#spark" />
              </svg>
              <h3>A shorter list. A better starting point.</h3>
              <p>
                Rank the deals you already have using their stages and notes.
                Start with the opportunities that deserve a closer look.
              </p>
              <div className="art" aria-hidden="true">
                <div className="mini-deal">
                  <span className="avatar">01</span>Form Studio{' '}
                  <strong>Proposal sent</strong>
                </div>
                <div className="mini-deal">
                  <span className="avatar">02</span>Northstar{' '}
                  <strong>New reply</strong>
                </div>
              </div>
            </article>
            <article className="card feature wide reveal">
              <svg aria-hidden="true">
                <use href="#inbox" />
              </svg>
              <h3>One inbox. The whole conversation.</h3>
              <p>
                Keep WhatsApp conversations close to your pipeline, so the next
                person has the context to pick things up.
              </p>
              <div className="art" aria-hidden="true">
                <div className="chat">
                  Could we talk through the proposal this week?
                </div>
                <div className="chat reply">
                  Of course. Let’s find a time that works.
                </div>
              </div>
            </article>
            <article className="card feature reveal">
              <svg aria-hidden="true">
                <use href="#chart" />
              </svg>
              <h3>See where things stand.</h3>
              <p>
                Move from scattered notes to a pipeline your whole team can
                understand.
              </p>
              <div className="art" aria-hidden="true">
                <div className="bar-chart">
                  <i style={{ '--h': '30%' } as CSSProperties}></i>
                  <i style={{ '--h': '48%' } as CSSProperties}></i>
                  <i style={{ '--h': '38%' } as CSSProperties}></i>
                  <i style={{ '--h': '65%' } as CSSProperties}></i>
                  <i style={{ '--h': '79%' } as CSSProperties}></i>
                  <i style={{ '--h': '94%' } as CSSProperties}></i>
                </div>
              </div>
            </article>
            <article className="card feature reveal">
              <svg aria-hidden="true">
                <use href="#flow" />
              </svg>
              <h3>Make room for the human part.</h3>
              <p>
                Organize repeatable work with flows and automations built around
                your process.
              </p>
              <div className="art tokens" aria-hidden="true">
                <span className="token">New conversation</span>
                <span className="token">Assign owner</span>
                <span className="token">Create next step</span>
              </div>
            </article>
            <article className="card feature reveal">
              <svg aria-hidden="true">
                <use href="#key" />
              </svg>
              <h3>Your AI. Your choice.</h3>
              <p>
                Connect your own provider key. Give your team assistance that
                fits the way you work.
              </p>
              <div className="art tokens" aria-hidden="true">
                <span className="token">Your provider</span>
                <span className="token">Your key</span>
                <span className="token">Your model</span>
              </div>
            </article>
            <article className="card feature reveal">
              <svg aria-hidden="true">
                <use href="#shield" />
              </svg>
              <div>
                <h3>The final call is always yours.</h3>
                <p>
                  Approve, snooze, or skip suggested outreach. Proofline brings
                  the evidence; your team brings the judgment.
                </p>
              </div>
              <div className="art">
                <div className="approval">
                  <svg aria-hidden="true">
                    <use href="#check" />
                  </svg>
                  A thoughtful next step starts with your approval.
                </div>
              </div>
            </article>
          </div>
        </section>
        <section className="section workflow" id="how">
          <div className="wrap center">
            <div className="reveal">
              <div className="eyebrow">From conversation to clarity</div>
              <h2>Good work has a rhythm.</h2>
              <p className="sub">
                A simple way to move forward, without losing sight of the person
                on the other side.
              </p>
            </div>
            <div className="steps">
              <svg
                className="connector"
                viewBox="0 0 700 24"
                preserveAspectRatio="none"
                aria-hidden="true"
              >
                <path d="M0 12H700" />
                <circle cx="0" cy="12" r="3" />
              </svg>
              <article className="step reveal">
                <div className="step-num number">01</div>
                <div>
                  <h3>Bring it together.</h3>
                  <p>
                    Connect WhatsApp and organize your existing conversations,
                    deals, and notes.
                  </p>
                </div>
              </article>
              <article className="step reveal">
                <div className="step-num number">02</div>
                <div>
                  <h3>Find your focus.</h3>
                  <p>
                    Review a ranked list of opportunities and the evidence
                    behind each suggestion.
                  </p>
                </div>
              </article>
              <article className="step reveal">
                <div className="step-num number">03</div>
                <div>
                  <h3>Make your move.</h3>
                  <p>
                    Approve the next step, snooze it for later, or skip it. You
                    set the pace.
                  </p>
                </div>
              </article>
            </div>
            <div className="stats reveal" aria-label="Product principles">
              <div className="stat">
                <strong className="number" data-count="1">
                  1
                </strong>
                <p>shared place for context</p>
              </div>
              <div className="stat">
                <strong className="number" data-count="3">
                  3
                </strong>
                <p>choices: approve, snooze, skip</p>
              </div>
              <div className="stat">
                <strong className="number" data-count="4">
                  4
                </strong>
                <p>interface languages</p>
              </div>
              <div className="stat">
                <strong className="number" data-count="100" data-suffix="%">
                  100%
                </strong>
                <p>your call on suggested outreach</p>
              </div>
            </div>
          </div>
        </section>
        <section className="section wrap" id="stories">
          <div className="section-head reveal">
            <div>
              <div className="eyebrow">Designed around people</div>
              <h2>
                A little less busy.
                <br />A little more together.
              </h2>
            </div>
            <p className="sub">
              Illustrative perspectives on the way a calmer workspace should
              feel.
            </p>
          </div>
          <div className="quotes">
            <article className="card reveal">
              <div className="quote-mark" aria-hidden="true">
                “
              </div>
              <blockquote className="quote-text">
                I want to know who needs us today, without opening twelve
                different tabs.
              </blockquote>
              <div className="persona">
                The sales lead<span>Sample persona · daily prioritization</span>
              </div>
            </article>
            <article className="card reveal">
              <div className="quote-mark" aria-hidden="true">
                “
              </div>
              <blockquote className="quote-text">
                The best handoff is the one where I don’t have to ask for the
                whole story again.
              </blockquote>
              <div className="persona">
                The account manager<span>Sample persona · shared context</span>
              </div>
            </article>
            <article className="card reveal">
              <div className="quote-mark" aria-hidden="true">
                “
              </div>
              <blockquote className="quote-text">
                Help me see the next step. Then give me the space to make the
                right call.
              </blockquote>
              <div className="persona">
                The founder<span>Sample persona · thoughtful decisions</span>
              </div>
            </article>
          </div>
          <p className="note">
            Sample testimonial layouts. These are illustrative statements, not
            verified customer quotes.
          </p>
        </section>
        <section className="section wrap center pricing-section" id="pricing">
          <div className="reveal">
            <div className="eyebrow">Room to grow</div>
            <h2>
              A clear next step.
              <br />
              At every stage.
            </h2>
            <p className="sub">
              Illustrative plans for this design preview. Pricing and
              entitlements are not live offers.
            </p>
          </div>
          <div className="billing" role="group" aria-label="Billing period">
            <button
              data-billing="monthly"
              aria-pressed={!yearly}
              onClick={() => setYearly(false)}
            >
              Monthly
            </button>
            <button
              data-billing="yearly"
              aria-pressed={yearly}
              onClick={() => setYearly(true)}
            >
              Yearly · save 20%
            </button>
          </div>
          <div className="pricing-grid" aria-live="polite">
            <article className="card plan reveal">
              <div className="plan-top">
                <h3>Starter</h3>
              </div>
              <p>A little clarity for your first chapter.</p>
              <div className="price number">
                $
                <span data-monthly="19">
                  {yearly ? (19 * 0.8).toFixed(2) : 19}
                </span>
                <small> / month</small>
              </div>
              <p className="billing-note">
                {yearly
                  ? `${(19 * 0.8 * 12).toFixed(2)} USD billed yearly`
                  : 'Billed monthly'}{' '}
                · example pricing
              </p>
              <Link className="btn" href="/signup">
                Explore Starter{' '}
                <svg aria-hidden="true">
                  <use href="#arrow" />
                </svg>
              </Link>
              <ul>
                <li>
                  <svg aria-hidden="true">
                    <use href="#check" />
                  </svg>
                  1 shared workspace
                </li>
                <li>
                  <svg aria-hidden="true">
                    <use href="#check" />
                  </svg>
                  Conversation inbox
                </li>
                <li>
                  <svg aria-hidden="true">
                    <use href="#check" />
                  </svg>
                  Deal pipeline
                </li>
                <li>
                  <svg aria-hidden="true">
                    <use href="#check" />
                  </svg>
                  Suggested next steps
                </li>
              </ul>
            </article>
            <article className="card plan featured reveal">
              <div className="plan-top">
                <h3>Team</h3>
                <span className="badge">The sweet spot</span>
              </div>
              <p>More context for your next chapter.</p>
              <div className="price number">
                $
                <span data-monthly="49">
                  {yearly ? (49 * 0.8).toFixed(2) : 49}
                </span>
                <small> / month</small>
              </div>
              <p className="billing-note">
                {yearly
                  ? `${(49 * 0.8 * 12).toFixed(2)} USD billed yearly`
                  : 'Billed monthly'}{' '}
                · example pricing
              </p>
              <Link className="btn primary magnetic" href="/signup">
                Explore Team{' '}
                <svg aria-hidden="true">
                  <use href="#arrow" />
                </svg>
              </Link>
              <ul>
                <li>
                  <svg aria-hidden="true">
                    <use href="#check" />
                  </svg>
                  Everything in Starter
                </li>
                <li>
                  <svg aria-hidden="true">
                    <use href="#check" />
                  </svg>
                  Team collaboration
                </li>
                <li>
                  <svg aria-hidden="true">
                    <use href="#check" />
                  </svg>
                  Flows and automations
                </li>
                <li>
                  <svg aria-hidden="true">
                    <use href="#check" />
                  </svg>
                  Bring-your-own-key AI
                </li>
              </ul>
            </article>
            <article className="card plan reveal">
              <div className="plan-top">
                <h3>Scale</h3>
              </div>
              <p>A wider view as your world grows.</p>
              <div className="price number">
                $
                <span data-monthly="99">
                  {yearly ? (99 * 0.8).toFixed(2) : 99}
                </span>
                <small> / month</small>
              </div>
              <p className="billing-note">
                {yearly
                  ? `${(99 * 0.8 * 12).toFixed(2)} USD billed yearly`
                  : 'Billed monthly'}{' '}
                · example pricing
              </p>
              <Link className="btn" href="/signup">
                Explore Scale{' '}
                <svg aria-hidden="true">
                  <use href="#arrow" />
                </svg>
              </Link>
              <ul>
                <li>
                  <svg aria-hidden="true">
                    <use href="#check" />
                  </svg>
                  Everything in Team
                </li>
                <li>
                  <svg aria-hidden="true">
                    <use href="#check" />
                  </svg>
                  Advanced workflows
                </li>
                <li>
                  <svg aria-hidden="true">
                    <use href="#check" />
                  </svg>
                  API integrations
                </li>
                <li>
                  <svg aria-hidden="true">
                    <use href="#check" />
                  </svg>
                  Workspace administration
                </li>
              </ul>
            </article>
          </div>
          <p className="note">
            Sample USD pricing. Provider and messaging costs are separate. Final
            plans require confirmation.
          </p>
        </section>
        <section className="wrap">
          <div className="closing reveal">
            <div className="eyebrow">Your next chapter starts with clarity</div>
            <h2>
              More meaningful conversations.
              <br />
              More forward motion.
            </h2>
            <p>
              Bring your team, your context, and your next best move together.
            </p>
            <Link className="btn magnetic" href="/signup">
              Find your focus with Proofline{' '}
              <svg aria-hidden="true">
                <use href="#arrow" />
              </svg>
            </Link>
          </div>
        </section>
      </main>
      <footer className="wrap">
        <div className="footer-top">
          <div>
            <Link className="brand" href="#">
              <svg aria-hidden="true">
                <use href="#mark" />
              </svg>
              proofline.
            </Link>
            <p>
              Good relationships. Clear next steps.
              <br />A more thoughtful way to move forward.
            </p>
          </div>
          <div className="footer-links">
            <div>
              <strong>PRODUCT</strong>
              <Link href="#features">Features</Link>
              <Link href="#how">How it works</Link>
              <Link href="#pricing">Sample plans</Link>
            </div>
            <div>
              <strong>WORKSPACE</strong>
              <Link href="/login">Log in</Link>
              <Link href="/signup">Create account</Link>
              <Link href="#product-demo">Explore the demo</Link>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <span>
            © <span>2026</span> Proofline. Made for the human side of growth.
          </span>
          <span>Your judgment stays at the center.</span>
        </div>
        <p className="legal">{PROOFLINE_NOTICE}</p>
        <p className="legal">© 2026 {PROOFLINE_RIGHTS_HOLDER}</p>
      </footer>
      <div className={`toast ${notice ? 'show' : ''}`} id="toast" role="status">
        {notice}
      </div>
    </div>
  );
}
