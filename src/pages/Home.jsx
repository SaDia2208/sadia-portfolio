import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Chapter, Icon, Magnetic, Marquee, Portrait, Reveal } from '../components/ui';
import { BrandWorld } from '../components/worlds';
import { ChapterRail, Entrance, Hero, useEntrance } from '../home/Opening';
import Spotlight from '../home/Spotlight';
import PlaygroundTeaser from '../home/PlaygroundTeaser';
import { brands, experience, profile, skills } from '../lib/content';
import { useDocumentTitle, useParallax } from '../lib/hooks';

export default function Home() {
  useDocumentTitle(null);
  const [entrance, finishEntrance] = useEntrance();
  return (
    <>
      {entrance === 'intro' && <Entrance onDone={finishEntrance} />}
      <ChapterRail />
      <Hero holding={entrance === 'intro'} />
      <Marquee items={['Social media design', 'Figma posters', 'Carousels', 'Website banners', 'Campaigns', 'AI-assisted video']}
        className="relative z-[3] border-y-2 border-ink bg-lime py-3 font-display text-3xl uppercase text-ink sm:text-4xl" />
      <Spotlight />
      <PlaygroundTeaser />
      <Worlds />
      <Create />
      <About />
      <Contact />
    </>
  );
}

/* ============ 03 — FOUR CREATIVE WORLDS ============ */
function Worlds() {
  return (
    <section id="worlds" data-chapter="04" data-chapter-title="Four worlds" aria-labelledby="worlds-title" className="relative bg-ink">
      <div className="wrap py-24 sm:py-32">
        <Chapter n="04" title="Four creative worlds" className="text-lime" />
        <h2 id="worlds-title" className="display mt-8 text-[17vw] lg:text-[10vw]">
          <Reveal as="span" className="block">Four brands.</Reveal>
          <Reveal as="span" delay={100} className="block text-lime lg:pl-[22vw]">Four <span className="serif text-paper">worlds.</span></Reveal>
        </h2>
      </div>
      {/* Panels stack over each other while scrolling. */}
      {brands.map((b, i) => (
        <div key={b.slug} className="relative">
          <BrandWorld brand={b} index={i} />
        </div>
      ))}
    </section>
  );
}

/* ============ 04 — WHAT I CREATE ============ */
const CREATE = [
  ['Social Media Design', 'Single posts and daily content made for brand feeds.'],
  ['Figma Poster Design', 'Social media posters designed in Figma — including Bengali-language work.'],
  ['Carousel Design', 'Multi-slide stories that teach, explain and keep people swiping.'],
  ['Website Banners', 'Landscape banners for e-commerce homepages, launches and collections.'],
  ['Promotional Campaigns', 'Sale, seasonal and launch creatives designed to work as a set.'],
  ['AI-Assisted Video Editing', 'Short-form reels and promotional videos for social media.'],
];

function Create() {
  return (
    <section id="create" data-chapter="05" data-chapter-title="What I create" className="relative scroll-mt-0 bg-ink py-24 sm:py-36" aria-labelledby="create-title">
      <div className="wrap">
        <Chapter n="05" title="What I create" className="text-lime" />
        <h2 id="create-title" className="sr-only">What I create</h2>
        <ul className="mt-12 border-t border-white/15">
          {CREATE.map(([t, d], i) => (
            <Reveal as="li" key={t} delay={i * 50} className="group relative overflow-hidden border-b border-white/15">
              <span className="absolute inset-0 origin-bottom scale-y-0 bg-lime transition-transform duration-500 ease-[var(--ease-out-expo)] group-hover:scale-y-100" aria-hidden="true" />
              <div className="relative grid items-center gap-2 py-5 transition-colors duration-300 group-hover:text-ink sm:grid-cols-12 sm:py-7">
                <span className="font-display text-lg text-smoke group-hover:text-ink sm:col-span-1">0{i + 1}</span>
                <span className={`display text-[12vw] sm:col-span-7 sm:text-[6.4vw] ${i % 2 ? 'hollow group-hover:[-webkit-text-fill-color:currentColor] group-hover:text-ink' : ''}`}>{t}</span>
                <span className="text-sm leading-relaxed text-paper/60 group-hover:text-ink sm:col-span-4">{d}</span>
              </div>
            </Reveal>
          ))}
        </ul>

        <div className="mt-24 grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <p className="display text-5xl sm:text-6xl">The <span className="serif text-lime">toolkit</span></p>
            <p className="mt-4 max-w-sm text-sm text-paper/60">Skills I use in my day-to-day work across design, video and e-commerce.</p>
          </div>
          <div className="grid gap-8 sm:grid-cols-2 lg:col-span-8">
            {skills.groups.map((g, i) => (
              <Reveal key={g.title} delay={(i % 2) * 80}>
                <p className="eyebrow border-b border-white/15 pb-3 text-lime">{g.title}</p>
                <ul className="mt-4 flex flex-wrap gap-2">
                  {g.skills.map((s) => (
                    <li key={s} className={`chip ${s.startsWith('Figma') ? 'border-lime bg-lime text-ink' : 'border-white/20 text-paper/85'}`}>{s}</li>
                  ))}
                </ul>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ============ 05 — ABOUT THE CREATIVE MIND ============ */
function About() {
  const para = useParallax();
  const [lead, ...rest] = profile.about;
  return (
    <section id="about" ref={para} data-chapter="06" data-chapter-title="About" className="relative overflow-hidden bg-violet py-24 text-paper sm:py-36" aria-labelledby="about-title">
      <p data-parallax="0.1" className="display hollow-thin pointer-events-none absolute -right-10 top-10 select-none text-[34vw] leading-none text-paper/20" aria-hidden="true">Hello</p>
      <div className="wrap relative grid gap-14 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <Chapter n="06" title="About the creative mind" />
          <Reveal variant="wipe" className="mt-10">
            <Portrait src={profile.portrait} alt={profile.portraitAlt} shape="rect" plate="#0c0c0c" zoom={1.12} focus="50% 70%" className="aspect-[4/5] w-[86%] max-w-[460px]" />
          </Reveal>
          <p className="serif mt-10 text-2xl">— {profile.name}</p>
        </div>
        <div className="lg:col-span-7 lg:pt-24">
          <h2 id="about-title" className="display text-[14vw] leading-[0.88] lg:text-[6.5vw]">
            <Reveal as="span" className="block">Design that</Reveal>
            <Reveal as="span" delay={90} className="block text-lime">speaks first.</Reveal>
          </h2>
          <Reveal as="p" className="mt-10 text-2xl leading-snug sm:text-3xl">{lead}</Reveal>
          {rest.map((p, i) => <Reveal as="p" key={i} delay={i * 80} className="mt-6 max-w-2xl leading-relaxed text-paper/80">{p}</Reveal>)}

          <div id="experience" className="mt-16 scroll-mt-24 space-y-px">
            {experience.education.map((e) => (
              <Reveal key={e.degree} className="grid gap-2 bg-ink/25 p-6 sm:grid-cols-[auto_1fr_auto] sm:items-center sm:gap-6">
                <span className="eyebrow text-lime">Education</span>
                <span><span className="block font-semibold">{e.degree}</span><span className="text-sm text-paper/70">{e.institution}{e.year && ` · ${e.year}`}</span></span>
                {e.result && <span className="font-display text-2xl text-lime">{e.result}</span>}
              </Reveal>
            ))}
            {experience.jobs.map((j) => (
              <Reveal key={j.company} className="grid gap-2 bg-ink/25 p-6 sm:grid-cols-[auto_1fr] sm:gap-6">
                <span className="eyebrow text-lime">Experience</span>
                <span>
                  <span className="block font-semibold">{j.company}{j.role && <span className="font-normal text-paper/70"> — {j.role}</span>}</span>
                  {(j.start || j.end) && <span className="block text-sm text-paper/70">{[j.start, j.end].filter(Boolean).join(' — ')}</span>}
                  <span className="mt-2 block text-sm text-paper/80">{j.responsibilities.join(' · ')}</span>
                </span>
              </Reveal>
            ))}
            <Reveal className="grid gap-2 bg-ink/25 p-6 sm:grid-cols-[auto_1fr] sm:gap-6">
              <span className="eyebrow text-lime">Brand work</span>
              <span className="flex flex-wrap gap-2">
                {brands.map((b) => <Link key={b.slug} to={`/work/${b.slug}`} className="chip border-paper/40 hover:border-lime hover:bg-lime hover:text-ink">{b.name}</Link>)}
              </span>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ============ 06 — FINAL STATEMENT ============ */
function Contact() {
  const links = [
    profile.email && { label: 'Email', value: profile.email, href: `mailto:${profile.email}` },
    profile.linkedin && { label: 'LinkedIn', value: 'View profile', href: profile.linkedin },
    ...(profile.socials || []).map((s) => ({ label: s.label, value: 'Visit', href: s.url })),
  ].filter(Boolean);
  const words = (profile.closing || 'Let’s make something people remember.').split(' ');
  return (
    <section id="contact" data-chapter="07" data-chapter-title="Final scene" className="relative overflow-hidden bg-lime py-24 text-ink sm:py-32" aria-labelledby="contact-title">
      <div className="wrap">
        <Chapter n="07" title="Final statement" />
        <h2 id="contact-title" className="display mt-10 text-[17vw] leading-[0.84] lg:text-[11vw]">
          {words.map((w, i) => (
            <Reveal as="span" key={i} delay={i * 70}
              className={`mr-[0.18em] inline-block ${i === 2 ? 'hollow' : ''} ${i === words.length - 1 ? 'serif text-violet' : ''}`}>{w}</Reveal>
          ))}
        </h2>
        <div className="mt-16 grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-6">
            {links.length ? (
              <ul className="border-t-2 border-ink">
                {links.map((l) => (
                  <li key={l.label} className="border-b-2 border-ink">
                    <a href={l.href} target={l.href.startsWith('mailto') ? undefined : '_blank'} rel="noreferrer" className="group flex items-center justify-between gap-4 py-5">
                      <span className="eyebrow">{l.label}</span>
                      <span className="flex min-w-0 items-center gap-2 truncate font-display text-2xl uppercase sm:text-3xl">{l.value}<Icon name="arrowUpRight" className="h-6 w-6 shrink-0 transition group-hover:rotate-45" /></span>
                    </a>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="max-w-sm text-lg">Contact details will be added here soon.</p>
            )}
            {profile.cv && (
              <Magnetic href={profile.cv} download className="mt-8 items-center gap-2 rounded-full bg-ink px-7 py-4 text-sm font-bold uppercase tracking-wider text-lime">
                Download CV <Icon name="download" className="h-4 w-4" />
              </Magnetic>
            )}
          </div>
          {profile.contactForm && <div className="lg:col-span-5 lg:col-start-8"><ContactForm /></div>}
        </div>
      </div>
    </section>
  );
}

function ContactForm() {
  const [state, setState] = useState('idle');
  const onSubmit = async (e) => {
    e.preventDefault();
    setState('sending');
    try {
      const body = new URLSearchParams(new FormData(e.target)).toString();
      const res = await fetch('/', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body });
      if (!res.ok) throw new Error(String(res.status));
      setState('sent');
      e.target.reset();
    } catch {
      setState('error');
    }
  };
  const field = 'w-full border-b-2 border-ink bg-transparent px-1 py-4 text-lg placeholder:text-ink/50 focus:outline-none focus:border-violet';
  if (state === 'sent') return <p className="display text-5xl">Thank you — message sent.</p>;
  return (
    <form name="contact" method="POST" data-netlify="true" netlify-honeypot="bot-field" onSubmit={onSubmit} className="space-y-4">
      <input type="hidden" name="form-name" value="contact" />
      <p className="hidden"><label>Leave empty <input name="bot-field" /></label></p>
      <label className="block"><span className="sr-only">Name</span><input required name="name" placeholder="Your name" className={field} /></label>
      <label className="block"><span className="sr-only">Email</span><input required type="email" name="email" placeholder="Email address" className={field} /></label>
      <label className="block"><span className="sr-only">Message</span><textarea required name="message" rows={4} placeholder="Tell me about your idea" className={field} /></label>
      <button disabled={state === 'sending'} className="inline-flex items-center gap-2 rounded-full bg-ink px-7 py-4 text-sm font-bold uppercase tracking-wider text-lime disabled:opacity-60">
        {state === 'sending' ? 'Sending…' : 'Send message'} <Icon name="arrowRight" className="h-4 w-4" />
      </button>
      {state === 'error' && <p role="alert" className="text-sm font-semibold">Sorry — the message couldn't be sent. Please try again or use email.</p>}
    </form>
  );
}
