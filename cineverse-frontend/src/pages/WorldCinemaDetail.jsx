import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import MovieCard from "../components/MovieCard";
import Reveal from "../components/Reveal";
import { getByLanguage } from "../lib/api";
import useAsync, { useScrollTop } from "../lib/useAsync";

const CINEMA_MAP = {
  hollywood: {
    name: "Hollywood",
    code: "en",
    accent: "#7CC7FF",
    tagline: "Global blockbusters and cinematic universes",
  },

  japanese: {
    name: "Japanese Cinema",
    code: "ja",
    accent: "#C792EA",
    tagline: "Anime, artistry and visionary storytelling",
  },

  korean: {
    name: "Korean Cinema",
    code: "ko",
    accent: "#8FE3C4",
    tagline: "Dark thrillers and world class dramas",
  },
};

const INDIAN_LANGUAGES = [
  { label: "Hindi", code: "hi" },
  { label: "Marathi", code: "mr" },
  { label: "Tamil", code: "ta" },
  { label: "Telugu", code: "te" },
  { label: "Kannada", code: "kn" },
];

export default function WorldCinemaDetail() {
  const { slug } = useParams();

  useScrollTop(slug);

  const isIndia = slug === "india";

  const [selectedLang, setSelectedLang] = useState("hi");

  const cinema = CINEMA_MAP[slug] || {
    name: "Indian Regional Cinema",
    code: selectedLang,
    accent: "#FF8A5B",
    tagline: "Stories from every corner of India",
  };

  const languageCode = isIndia ? selectedLang : cinema.code;

  const { data, loading } = useAsync(
    () => getByLanguage(languageCode),
    [languageCode]
  );

  const movies = data || [];

  return (
    <div>
      {/* Banner */}
      <div className="relative overflow-hidden pt-32">
        <div
          className="absolute -top-20 left-1/2 h-[420px] w-[820px] -translate-x-1/2 rounded-full opacity-25 blur-[120px]"
          style={{ background: cinema.accent }}
        />

        <div className="relative mx-auto max-w-7xl px-6 sm:px-10">
          <Reveal>
            <Link
              to="/world-cinema"
              className="eyebrow text-white/40 transition hover:text-white"
            >
              ← World Cinema
            </Link>

            <h1 className="display mt-4 text-6xl text-white sm:text-8xl">
              {cinema.name}
            </h1>

            <p className="mt-4 max-w-xl text-lg text-white/55">
              {cinema.tagline}
            </p>

            {/* India language filters */}
            {isIndia && (
              <div className="mt-6 flex flex-wrap gap-3">
                {INDIAN_LANGUAGES.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => setSelectedLang(lang.code)}
                    className={`rounded-full px-4 py-2 text-sm transition ${
                      selectedLang === lang.code
                        ? "bg-red-600 text-white"
                        : "bg-white/10 text-white/70"
                    }`}
                  >
                    {lang.label}
                  </button>
                ))}
              </div>
            )}
          </Reveal>
        </div>
      </div>

      {/* Movies Grid */}
      <section className="mx-auto mt-14 max-w-7xl px-6 pb-10 sm:px-10">
        <h3 className="display mb-7 text-2xl text-white">
          Explore {cinema.name}
        </h3>

        {loading ? (
          <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {Array.from({ length: 10 }).map((_, i) => (
              <div
                key={i}
                className="aspect-[2/3] w-full rounded-xl skeleton"
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {movies.map((m, i) => (
              <MovieCard
                key={m.id}
                movie={m}
                index={i}
                width="w-full"
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}