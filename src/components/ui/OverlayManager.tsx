"use client";

import { useState, useEffect, useCallback } from "react";
import { AnimatePresence } from "framer-motion";
import { useStore, type Section } from "@/store/useStore";
import OverlayPanel from "./OverlayPanel";
import { audio } from "@/lib/audio";

// =====================================================================
//  PLACEHOLDER DATA
// =====================================================================

const ARTS_PATHS: PathCard[] = [
  {
    section: "dance",
    title: "Chinese Dance",
    subtitle: "Contemporary & Ballet",
    accent: "#E8A0B8",
  },
  {
    section: "gymnastics",
    title: "Rhythmic Gymnastics",
    subtitle: "Grace & Strength",
    accent: "#A8D8D8",
  },
  {
    section: "music",
    title: "Music",
    subtitle: "Piano & Composition",
    accent: "#C4A8D8",
  },
];

const PROJECTS_PATHS: PathCard[] = [
  {
    section: "articles",
    title: "Articles",
    subtitle: "Medium Publications",
    accent: "#C4A8D8",
  },
  {
    section: "xposts",
    title: "X Posts",
    subtitle: "Thoughts & Threads",
    accent: "#A8D8D8",
  },
  {
    section: "pastprojects",
    title: "Past Projects",
    subtitle: "Code & Design",
    accent: "#E8A0B8",
  },
];

const MEDIA_ITEMS: Record<string, MediaItem[]> = {
  dance: [
    { title: "Contemporary Performance — Spring 2025", type: "video" },
    { title: "Ballet Recital Highlights", type: "photo" },
    { title: "Movement Workshop at Studio 404", type: "video" },
    { title: "Dance Practice Sessions", type: "photo" },
  ],
  gymnastics: [
    { title: "Rhythmic Gymnastics Showcase 2025", type: "video" },
    { title: "Ribbon Routine — Competition Reel", type: "video" },
    { title: "Training Highlights Gallery", type: "photo" },
    { title: "Hoop & Ball Choreography", type: "photo" },
  ],
  music: [
    { title: "Piano Recital — Chopin Nocturnes", type: "video" },
    { title: "Original Composition: 'Reflections'", type: "video" },
    { title: "Chamber Music Ensemble Performance", type: "photo" },
    { title: "Studio Session — Behind the Scenes", type: "photo" },
  ],
};

const ARTICLES = [
  {
    title: "Building Interactive 3D Portfolios with React Three Fiber",
    date: "Jan 2026",
    excerpt:
      "A deep dive into creating immersive web experiences using R3F, Three.js, and GSAP animations.",
  },
  {
    title: "My Journey Through Computer Science and the Arts",
    date: "Dec 2025",
    excerpt:
      "Exploring the intersection of technology and creative expression.",
  },
  {
    title: "The Future of Interactive Web Design",
    date: "Nov 2025",
    excerpt:
      "How 3D, motion, and storytelling are reshaping the web.",
  },
];

const X_POSTS = [
  {
    text: "Just shipped my new portfolio website — built with React Three Fiber and inspired by Monument Valley!",
    date: "Feb 7, 2026",
    likes: 42,
    reposts: 8,
  },
  {
    text: "Thoughts on the future of creative coding: we're moving toward a world where every website is a unique, interactive experience.",
    date: "Jan 22, 2026",
    likes: 128,
    reposts: 31,
  },
  {
    text: "Excited to share my latest project combining dance choreography with generative visuals. Thread below...",
    date: "Dec 15, 2025",
    likes: 87,
    reposts: 19,
  },
];

const PROJECTS = [
  {
    title: "Grande Mountain Lodge Website",
    description: "Full-stack hotel booking platform with Flask and modern UI.",
  },
  {
    title: "AI Agents with CrewAI",
    description: "Multi-agent AI system for collaborative problem solving.",
  },
  {
    title: "MuseAI",
    description: "AI-powered creative writing and brainstorming tool.",
  },
  {
    title: "Personal Portfolio",
    description:
      "Monument Valley-inspired 3D interactive portfolio (this site!).",
  },
];

// =====================================================================
//  TYPES
// =====================================================================

interface PathCard {
  section: Section;
  title: string;
  subtitle: string;
  accent: string;
}

interface MediaItem {
  title: string;
  type: "video" | "photo";
}

// =====================================================================
//  ARTS IMAGE SLIDER DATA
// =====================================================================

const ARTS_SLIDER_IMAGES = [
  { src: "/arts/arts-1.jpg", alt: "Arts photo 1" },
  { src: "/arts/arts-2.jpg", alt: "Arts photo 2" },
  { src: "/arts/arts-3.jpg", alt: "Arts photo 3" },
  { src: "/arts/arts-4.jpg", alt: "Arts photo 4" },
  { src: "/arts/arts-5.jpg", alt: "Arts photo 5" },
];

const PROJECTS_SLIDER_IMAGES = [
  { src: "/projects/projects-1.jpg", alt: "Projects photo 1" },
  { src: "/projects/projects-2.jpg", alt: "Projects photo 2" },
  { src: "/projects/projects-3.jpg", alt: "Projects photo 3" }
];

// =====================================================================
//  SUB-COMPONENTS
// =====================================================================

/** Auto-scrolling image slider that cycles every 5 seconds */
function ImageSlider({ images }: { images: { src: string; alt: string }[] }) {
  const [current, setCurrent] = useState(0);

  // Auto-advance every 5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % images.length);
    }, 3500);
    return () => clearInterval(timer);
  }, [images.length]);

  const goTo = useCallback((idx: number) => setCurrent(idx), []);

  return (
    <div className="w-full mb-5">
      {/* Image container */}
      <div
        className="relative w-full overflow-hidden rounded-xl"
        style={{ aspectRatio: "16 / 9" }}
      >
        {images.map((img, i) => (
          <img
            key={i}
            src={img.src}
            alt={img.alt}
            className="absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ease-in-out"
            style={{ opacity: i === current ? 1 : 0 }}
          />
        ))}
      </div>

      {/* Dot indicators */}
      <div className="flex justify-center gap-2 mt-3">
        {images.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            className="w-2.5 h-2.5 rounded-full transition-all duration-300 cursor-pointer"
            style={{
              background: i === current ? "#6858A0" : "rgba(152,136,184,0.3)",
              transform: i === current ? "scale(1.2)" : "scale(1)",
            }}
          />
        ))}
      </div>
    </div>
  );
}

/** 3-path selector grid (used for Arts and Projects doors) */
function SubSectionSelector({
  paths,
}: {
  paths: PathCard[];
}) {
  const navigateTo = useStore((s) => s.navigateTo);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {paths.map((p) => (
        <button
          key={p.section}
          onClick={() => { audio.playTransition(); navigateTo(p.section); }}
          className="group py-4 px-6 rounded-xl text-center transition-all duration-200 hover:scale-[1.02] cursor-pointer"
          style={{
            background: "rgba(255,255,255,0.55)",
            border: `1.5px solid ${p.accent}55`,
          }}
        >
          <span
            className="font-medium text-base"
            style={{ color: "#6858A0" }}
          >
            {p.title}
          </span>
        </button>
      ))}
    </div>
  );
}

/** YouTube embed helper */
function YouTubeEmbed({ videoId, title }: { videoId: string; title?: string }) {
  return (
    <div className="w-full aspect-video rounded-xl overflow-hidden bg-black/5">
      {videoId ? (
        <iframe
          src={`https://www.youtube.com/embed/${videoId}`}
          title={title || "YouTube video"}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="w-full h-full border-0"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center"
          style={{ background: "linear-gradient(135deg, #C4A8D8 0%, #A8D8D8 100%)" }}
        >
          <span className="text-white/80 text-sm font-medium tracking-wide uppercase">
            YouTube Video
          </span>
        </div>
      )}
    </div>
  );
}

/** Chinese Dance section — alternating image/video grid layout */
function ChineseDanceContent() {
  return (
    <div className="flex flex-col gap-8">
      {/* Description */}
      <p
        className="text-sm leading-relaxed text-center"
        style={{ color: "#584888" }}
      >
        As a competitive dancer @DY Dance Studio, I have explored a variety of Chinese ethnic minority culture and come to realize the beauty and creativity in how the body can express itself.
      </p>

      {/* ── Section 1: Large image LEFT | 2 YouTube videos RIGHT ── */}
      <div className="flex flex-col sm:flex-row gap-4" style={{ minHeight: "320px" }}>
        {/* Left: large image */}
        <div className="sm:w-1/2">
          <img
            src="/dance/dance-1.jpg"
            alt="Chinese Dance"
            className="w-full h-full object-cover rounded-xl"
            style={{ minHeight: "300px" }}
          />
        </div>
        {/* Right: 2 YouTube videos stacked */}
        <div className="sm:w-1/2 flex flex-col gap-4">
          <YouTubeEmbed videoId="aXbgkSPSPn8" title="IDO World Dance Challenge: Flashing Sword" />
          <YouTubeEmbed videoId="NGq6DYOcAjs" title="IDO World Dance Competition - Jazz Small Group" />
        </div>
      </div>

      {/* ── Section 2: YouTube + small image LEFT | Large image RIGHT ── */}
      <div className="flex flex-col sm:flex-row gap-4" style={{ minHeight: "320px" }}>
        {/* Left: YouTube video + smaller image stacked */}
        <div className="sm:w-1/2 flex flex-col gap-4">
          <YouTubeEmbed videoId="JqjMrEqXdUw" title="IDO World Dance Competition - Ethnic Small Group" />
          <img
            src="/dance/dance-2.jpg"
            alt="Chinese Dance"
            className="w-full rounded-xl object-cover flex-1"
            style={{ minHeight: "140px" }}
          />
        </div>
        {/* Right: large image */}
        <div className="sm:w-1/2">
          <img
            src="/dance/dance-3.jpg"
            alt="Chinese Dance"
            className="w-full h-full object-cover rounded-xl"
            style={{ minHeight: "300px" }}
          />
        </div>
      </div>

      {/* ── Section 3: Large image LEFT | YouTube + photo RIGHT ── */}
      <div className="flex flex-col sm:flex-row gap-4" style={{ minHeight: "320px" }}>
        {/* Left: large image */}
        <div className="sm:w-1/2">
          <img
            src="/dance/dance-4.jpg"
            alt="Chinese Dance"
            className="w-full h-full object-cover rounded-xl"
            style={{ minHeight: "300px" }}
          />
        </div>
        {/* Right: YouTube video + photo stacked */}
        <div className="sm:w-1/2 flex flex-col gap-4">
          <YouTubeEmbed videoId="dB2GdAV-A7o" title="溯跃 Leap of Origins" />
          <img
            src="/dance/dance-5.jpg"
            alt="Chinese Dance"
            className="w-full rounded-xl object-cover flex-1"
            style={{ minHeight: "140px" }}
          />
        </div>
      </div>
    </div>
  );
}

/** Music section — large image on top, 4 videos in a 2×2 grid below */
function MusicContent() {
  return (
    <div className="flex flex-col gap-6">
      {/* Description */}
      <p
        className="text-sm leading-relaxed text-center"
        style={{ color: "#584888" }}
      >
        A former competitive pianist mentored by Katherine Kim at Mount Royal University, I have developed an emotional sensitivity towards instrumental music, which is why I continue to love it until this day.
      </p>

      {/* Top: large image */}
      <img
        src="/music/music-1.jpg"
        alt="Music"
        className="w-full rounded-xl object-cover"
        style={{ maxHeight: "400px" }}
      />

      {/* Bottom: 2×2 grid of YouTube videos */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <YouTubeEmbed videoId="NwN_6Poc1DA" title="Grieg Piano Concerto in A minor" />
        <YouTubeEmbed videoId="xMEXNLZOJAA" title="CMC Edmonton Trial Xueqi" />
        <YouTubeEmbed videoId="nkyErUZ21SU" title="Calgary Stringfest 2024 - Bacewicz" />
        <YouTubeEmbed videoId="i8tigLTY864" title="Calgary Stringfest 2024 - Schumann" />
      </div>
    </div>
  );
}

/** Rhythmic Gymnastics section — 2 videos + image, then 2 full-width images */
function GymnasticsContent() {
  return (
    <div className="flex flex-col gap-8">
      {/* Description */}
      <p
        className="text-sm leading-relaxed text-center"
        style={{ color: "#584888" }}
      >
        As a retired national senior rhythmic gymnast @Vertigo Rhythmic Gymnastics Club, the spirit of grit and sportsmanship follow me up to this day.
      </p>

      {/* ── Section 1: 2 YouTube videos LEFT | Large image RIGHT ── */}
      <div className="flex flex-col sm:flex-row gap-4" style={{ minHeight: "320px" }}>
        {/* Left: 2 YouTube videos stacked */}
        <div className="sm:w-1/2 flex flex-col gap-4">
          <YouTubeEmbed videoId="C9acVzVD550" title="Vertigo Senior National Gym Canada Hoop" />
          <YouTubeEmbed videoId="8T9QG9Gtvsc" title="Vertigo Senior National Gym Canada Ribbon" />
        </div>
        {/* Right: large image */}
        <div className="sm:w-1/2">
          <img
            src="/gymnastics/gym-1.jpg"
            alt="Rhythmic Gymnastics"
            className="w-full h-full object-cover rounded-xl"
            style={{ minHeight: "300px" }}
          />
        </div>
      </div>

      {/* ── Section 2: Full-width large image ── */}
      <img
        src="/gymnastics/gym-2.jpg"
        alt="Rhythmic Gymnastics"
        className="w-full rounded-xl object-cover"
      />

      {/* ── Section 3: Full-width large image ── */}
      <img
        src="/gymnastics/gym-3.jpg"
        alt="Rhythmic Gymnastics"
        className="w-full rounded-xl object-cover"
      />
    </div>
  );
}

/** Media gallery grid with placeholder thumbnails */
function MediaGallery({ items }: { items: MediaItem[] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {items.map((item, i) => (
        <div
          key={i}
          className="rounded-xl overflow-hidden"
          style={{
            background: "rgba(255,255,255,0.5)",
            border: "1px solid rgba(196,168,216,0.2)",
          }}
        >
          {/* Placeholder thumbnail */}
          <div
            className="w-full h-36 flex items-center justify-center"
            style={{
              background:
                item.type === "video"
                  ? "linear-gradient(135deg, #C4A8D8 0%, #A8D8D8 100%)"
                  : "linear-gradient(135deg, #E8A0B8 0%, #ECD8E8 100%)",
            }}
          >
            <span className="text-white/80 text-sm font-medium tracking-wide uppercase">
              {item.type === "video" ? "Video Placeholder" : "Photo Placeholder"}
            </span>
          </div>
          <div className="p-3">
            <p
              className="text-sm font-medium"
              style={{ color: "#6858A0" }}
            >
              {item.title}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

/** Article cards with "Read on Medium" button */
function ArticleList() {
  return (
    <div className="flex flex-col gap-4">
      {ARTICLES.map((a, i) => (
        <div
          key={i}
          className="flex gap-4 p-4 rounded-xl"
          style={{
            background: "rgba(255,255,255,0.5)",
            border: "1px solid rgba(196,168,216,0.2)",
          }}
        >
          {/* Placeholder thumbnail */}
          <div
            className="w-20 h-20 rounded-lg shrink-0"
            style={{
              background:
                "linear-gradient(135deg, #C4A8D8 0%, #E8A0B8 100%)",
            }}
          />
          <div className="flex flex-col justify-between flex-1 min-w-0">
            <div>
              <h3
                className="font-medium text-sm mb-1 leading-snug"
                style={{ color: "#6858A0" }}
              >
                {a.title}
              </h3>
              <p
                className="text-xs leading-relaxed line-clamp-2"
                style={{ color: "#9888B8" }}
              >
                {a.excerpt}
              </p>
            </div>
            <div className="flex items-center justify-between mt-2">
              <span className="text-xs" style={{ color: "#9888B8" }}>
                {a.date}
              </span>
              <button
                className="text-xs font-medium px-3 py-1 rounded-full transition-colors cursor-pointer"
                style={{
                  background: "#6858A0",
                  color: "#fff",
                }}
              >
                Read on Medium
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

/** Placeholder X/Twitter post cards */
function XPostList() {
  return (
    <div className="flex flex-col gap-4">
      {X_POSTS.map((post, i) => (
        <div
          key={i}
          className="p-4 rounded-xl"
          style={{
            background: "rgba(255,255,255,0.5)",
            border: "1px solid rgba(196,168,216,0.2)",
          }}
        >
          {/* Header row */}
          <div className="flex items-center gap-3 mb-3">
            <div
              className="w-9 h-9 rounded-full"
              style={{ background: "#C4A8D8" }}
            />
          </div>
          {/* Body */}
          <p
            className="text-sm leading-relaxed mb-3"
            style={{ color: "#584888" }}
          >
            {post.text}
          </p>
          {/* Footer */}
          <div
            className="flex items-center gap-6 text-xs"
            style={{ color: "#9888B8" }}
          >
            <span>{post.date}</span>
            <span>{post.likes} likes</span>
            <span>{post.reposts} reposts</span>
          </div>
        </div>
      ))}
    </div>
  );
}

/** Project thumbnail cards */
function ProjectList() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {PROJECTS.map((p, i) => (
        <div
          key={i}
          className="rounded-xl overflow-hidden"
          style={{
            background: "rgba(255,255,255,0.5)",
            border: "1px solid rgba(196,168,216,0.2)",
          }}
        >
          {/* Placeholder thumbnail */}
          <div
            className="w-full h-28 flex items-center justify-center"
            style={{
              background: `linear-gradient(135deg, ${
                ["#E8A0B8", "#A8D8D8", "#C4A8D8", "#ECD8E8"][i % 4]
              } 0%, ${
                ["#C4A8D8", "#C0E8E8", "#E8A0B8", "#C4A8D8"][i % 4]
              } 100%)`,
            }}
          >
            <span className="text-white/80 text-xs font-medium tracking-wide uppercase">
              Thumbnail
            </span>
          </div>
          <div className="p-4">
            <h3
              className="font-medium text-sm mb-1"
              style={{ color: "#6858A0" }}
            >
              {p.title}
            </h3>
            <p className="text-xs" style={{ color: "#9888B8" }}>
              {p.description}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

/** About Me overlay content */
function AboutMeContent() {
  return (
    <div className="flex flex-col gap-6">
      {/* Portrait + Bio — stacked on mobile, side-by-side on desktop */}
      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6">
        {/* Portrait */}
        <img
          src="/portrait.jpg"
          alt="Xueqi Yang"
          className="w-40 h-56 sm:w-56 sm:h-80 rounded-2xl object-cover shrink-0"
        />

        {/* Name + Bio text */}
        <div className="flex flex-col gap-2">
          <p
            className="text-sm leading-relaxed"
            style={{ color: "#584888" }}
          >
            Hi! I&apos;m Xueqi, a first-year Engineering Science undergrad @UofT, passionate about innovating and driving human potential with emerging tech! My research interests are in brain-computer interfaces (imagining its potential to visualize dreams and memories💭) and longevity, though life philosophy also seems fascinating.
            <br />
            <br />
            Where am I right now? On the pathway to becoming the best version of myself.
            <br />
            <br />
            Outside of academia, I&apos;m a pretty artsy person. I love piano and Chinese dance @DY Dance Studio. I used to be a national senior competitive rhythmic gymnast @Vertigo Rhythmic Gymnastics Club.
            <br />
            <br />
            In the past, I was extremely passionate in biometrics🧬. Through TKS, I have consulted with companies such as IKEA and Samsung.
          </p>
        </div>
      </div>

      {/* Places I'm Affiliated With */}
      <div className="mt-2 sm:mt-4">
        <h4
          className="text-xs sm:text-sm font-medium mb-3 sm:mb-4 uppercase tracking-wider text-center"
          style={{ color: "#9888B8" }}
        >
          Places I&apos;m Affiliated With
        </h4>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4 items-center">
          {[
            { src: "/logos/tks.png", alt: "TKS" },
            { src: "/logos/harvard.png", alt: "Harvard Summer School" },
            { src: "/logos/uoft.png", alt: "University of Toronto" },
            { src: "/logos/linkcc.png", alt: "Link CC Youth Society" },
            { src: "/logos/chinook.png", alt: "Chinook Curiosity Central" },
            { src: "/logos/ib.png", alt: "IB Diploma Programme" },
            { src: "/logos/vertigo.png", alt: "Vertigo Rhythmic Gymnastics Club" },
            { src: "/logos/dydance.png", alt: "DY Dance Studio" },
            { src: "/logos/specialolympics.png", alt: "Special Olympics Alberta" },
          ].map((logo) => (
            <div
              key={logo.alt}
              className="flex items-center justify-center p-2"
            >
              <img
                src={logo.src}
                alt={logo.alt}
                title={logo.alt}
                className="max-h-14 max-w-full object-contain"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Social links */}
      <div className="mt-4">
        <h4
          className="text-sm font-medium mb-3 uppercase tracking-wider text-center"
          style={{ color: "#9888B8" }}
        >
          My Contacts
        </h4>
        <div className="flex flex-wrap gap-3 justify-center">
          {[
            { label: "LinkedIn", href: "https://www.linkedin.com/in/xueqi-yang-0b3489322/" },
            { label: "Email", href: "mailto:xueqi.y16@gmail.com" },
            { label: "X", href: "https://x.com/XueqiYang51572" },
            { label: "Medium", href: "https://medium.com/@xueqi.y16" },
            { label: "Instagram", href: "https://www.instagram.com/xqy0916/" },
            { label: "GitHub", href: "https://github.com/xueqiy16" },
            { label: "YouTube", href: "https://www.youtube.com/@XueqiYang/playlists" },
          ].map((link) => (
            <a
              key={link.label}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 rounded-full text-sm font-medium transition-colors"
              style={{
                background: "#6858A0",
                color: "#fff",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = "#584888")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = "#6858A0")
              }
            >
              {link.label}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}

// =====================================================================
//  OVERLAY CONTENT MAPPING
// =====================================================================

function OverlayContent({ section }: { section: Section }) {
  switch (section) {
    // Door A selector
    case "arts":
      return (
        <OverlayPanel title="My Beloved Arts" centerTitle>
          <ImageSlider images={ARTS_SLIDER_IMAGES} />
          <SubSectionSelector paths={ARTS_PATHS} />
        </OverlayPanel>
      );

    // Door B — image slider + Notion link
    case "projects":
      return (
        <OverlayPanel title="My Projects" centerTitle>
          <ImageSlider images={PROJECTS_SLIDER_IMAGES} />
          <div className="flex justify-center mt-2">
            <a
              href="https://held-dry-84c.notion.site/My-Philosophy-Love-Life-2f2007c4f38f80c4be13d0181311d0cd"
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 rounded-full text-sm font-semibold tracking-wide uppercase transition-colors"
              style={{ background: "#6858A0", color: "#fff" }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#584888")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "#6858A0")}
            >
              My Projects
            </a>
          </div>
        </OverlayPanel>
      );

    // Arts sub-sections
    case "dance":
      return (
        <OverlayPanel title="Chinese Dance" maxWidth="max-w-5xl" centerTitle>
          <ChineseDanceContent />
        </OverlayPanel>
      );
    case "gymnastics":
      return (
        <OverlayPanel title="Rhythmic Gymnastics" maxWidth="max-w-5xl" centerTitle>
          <GymnasticsContent />
        </OverlayPanel>
      );
    case "music":
      return (
        <OverlayPanel title="Music" maxWidth="max-w-5xl" centerTitle>
          <MusicContent />
        </OverlayPanel>
      );

    // Projects sub-sections
    case "articles":
      return (
        <OverlayPanel title="Articles">
          <ArticleList />
        </OverlayPanel>
      );
    case "xposts":
      return (
        <OverlayPanel title="X Posts">
          <XPostList />
        </OverlayPanel>
      );
    case "pastprojects":
      return (
        <OverlayPanel title="Past Projects">
          <ProjectList />
        </OverlayPanel>
      );

    // About Me
    case "about":
      return (
        <OverlayPanel title="About Me" centerTitle>
          <AboutMeContent />
        </OverlayPanel>
      );

    default:
      return null;
  }
}

// =====================================================================
//  MAIN EXPORT
// =====================================================================

/**
 * Renders the active content overlay based on the current Zustand section.
 * Handles Framer Motion AnimatePresence for smooth transitions.
 */
export default function OverlayManager() {
  const currentSection = useStore((s) => s.currentSection);
  const showOverlay = currentSection !== "main";

  return (
    <AnimatePresence mode="wait">
      {showOverlay && (
        <OverlayContent key={currentSection} section={currentSection} />
      )}
    </AnimatePresence>
  );
}
