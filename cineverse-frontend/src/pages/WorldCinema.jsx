import { Link } from "react-router-dom";
import { useEffect, useRef } from "react";
import Reveal from "../components/Reveal";
import { Arrow } from "../components/icons";
import { useScrollTop } from "../lib/useAsync";

// Same Vanta loader
const loadScript = (src) =>
  new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[src="${src}"]`);
    if (existing) {
      if (existing.dataset.loaded) return resolve();
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", reject);
      return;
    }
    const s = document.createElement("script");
    s.src = src;
    s.async = true;
    s.onload = () => {
      s.dataset.loaded = "true";
      resolve();
    };
    s.onerror = reject;
    document.body.appendChild(s);
  });

// Static for now (later backend/db if needed)
const WORLD_CINEMA = [
  {
    slug: "hollywood",
    name: "Hollywood",
    tagline: "Global blockbusters and cinematic universes",
    accent: "#7CC7FF",
  },
  {
    slug: "india",
    name: "Indian Regional Cinema",
    tagline: "Stories from every corner of India",
    accent: "#FF8A5B",
  },
  {
    slug: "japanese",
    name: "Japanese Cinema",
    tagline: "Anime, artistry and visionary storytelling",
    accent: "#C792EA",
  },
  {
    slug: "korean",
    name: "Korean Cinema",
    tagline: "Dark thrillers and world-class dramas",
    accent: "#8FE3C4",
  },
];

export default function WorldCinema() {
  useScrollTop("world-cinema");

  const vantaRef = useRef(null);
  const vantaEffect = useRef(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        await loadScript("https://cdnjs.cloudflare.com/ajax/libs/three.js/r121/three.min.js");
        await loadScript("https://cdn.jsdelivr.net/npm/vanta@latest/dist/vanta.globe.min.js");

        if (cancelled || !vantaRef.current || !window.VANTA) return;

        vantaEffect.current = window.VANTA.GLOBE({
          el: vantaRef.current,
          mouseControls: true,
          touchControls: true,
          gyroControls: false,
          minHeight: 200,
          minWidth: 200,
          color: 0xcf0000,
          backgroundColor: 0x050505,
        });
      } catch {}
    })();

    return () => {
      cancelled = true;
      if (vantaEffect.current) {
        vantaEffect.current.destroy();
        vantaEffect.current = null;
      }
    };
  }, []);

  return (
    <div className="relative min-h-screen">
      <div ref={vantaRef} className="pointer-events-none fixed inset-0 z-0" />

      <div className="relative z-10 mx-auto max-w-7xl px-6 pb-10 pt-32 sm:px-10">
        <Reveal>
          <span className="eyebrow text-accent/90">Global Storytelling</span>

          <h1 className="display mt-3 text-5xl text-white sm:text-7xl">
            World Cinema
          </h1>

          <p className="mt-4 max-w-xl text-white/50">
            Discover cinematic worlds beyond borders — curated by culture,
            storytelling and global identity.
          </p>
        </Reveal>

        <div className="mt-12 grid gap-5 sm:grid-cols-2">
          {WORLD_CINEMA.map((c, i) => (
            <Reveal key={c.slug} delay={i * 0.06}>
              <Link
                to={`/world-cinema/${c.slug}`}
                className="group relative flex h-56 flex-col justify-between overflow-hidden rounded-3xl border border-white/[0.07] bg-noir-850 p-8 transition-all duration-500 hover:-translate-y-1 hover:border-white/20 hover:shadow-float"
              >
                <div
                  className="absolute -right-10 -top-10 h-56 w-56 rounded-full opacity-20 blur-3xl transition-opacity duration-500 group-hover:opacity-45"
                  style={{ background: c.accent }}
                />

                <div className="relative">
                  <span className="text-[11px] font-semibold uppercase tracking-wider2 text-white/40">
                    Collection
                  </span>

                  <h2 className="display mt-2 text-4xl text-white sm:text-5xl">
                    {c.name}
                  </h2>
                </div>

                <div className="relative flex items-center justify-between">
                  <p className="text-white/55">{c.tagline}</p>

                  <span className="flex h-11 w-11 items-center justify-center rounded-full border border-white/15 text-white/60 transition-all duration-300 group-hover:border-white/40 group-hover:text-white">
                    <Arrow />
                  </span>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </div>
  );
}