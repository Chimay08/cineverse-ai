import { useParams, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import MovieCard from "../components/MovieCard";
import Reveal from "../components/Reveal";
import { getByGenre } from "../lib/api";
import { GENRES } from "../lib/mockData";
import useAsync, { useScrollTop } from "../lib/useAsync";

export default function GenreDetail() {
  const { slug } = useParams();
  useScrollTop(slug);
  const genre = GENRES.find((g) => g.slug === slug) || { name: slug, tagline: "", accent: "#BE1A1A" };
  const { data, loading } = useAsync(() => getByGenre(genre.id), [slug]);

  const movies = data || [];

// current movie index
const [currentIndex, setCurrentIndex] = useState(0);

// auto change every 8 seconds
useEffect(() => {
  if (!movies.length) return;

  const interval = setInterval(() => {
    setCurrentIndex((prev) =>
      prev === movies.length - 1 ? 0 : prev + 1
    );
  }, 8000);

  return () => clearInterval(interval);
}, [movies]);

// active featured movie
const feature = movies[currentIndex];

// all other movies except active one
const rest = movies.filter((_, index) => index !== currentIndex);

  return (
    <div>
      {/* Editorial banner */}
      <div className="relative overflow-hidden pt-32">
        {feature?.backdrop && (
  <>
    <img
      src={`https://image.tmdb.org/t/p/original${feature.backdrop}`}
      alt={feature.title}
      className="absolute inset-0 h-full w-full object-cover transition-all duration-1000"
    />

    {/* dark overlay so text stays visible */}
    <div className="absolute inset-0 bg-black/70" />
  </>
)}
        <div className="relative mx-auto max-w-7xl px-6 sm:px-10">
          <Reveal>
            <Link to="/genres" className="eyebrow text-white/40 transition hover:text-white">
              ← All genres
            </Link>
            <h1 className="display mt-4 text-6xl text-white sm:text-8xl">{genre.name}</h1>
            <p className="mt-4 max-w-xl text-lg text-white/55">{genre.tagline}</p>
          </Reveal>
        </div>
      </div>

      {/* Featured pick */}
      {feature && !loading && (
        <section className="mx-auto mt-12 max-w-7xl px-6 sm:px-10">
          <Reveal className="relative grid items-center gap-8 overflow-hidden rounded-3xl border border-white/[0.07] bg-noir-850/60 p-6 sm:p-8 md:grid-cols-[200px_1fr]">
            {(feature.backdrop || feature.poster) && (
              <>
                <img
                  src={`https://image.tmdb.org/t/p/w1280${feature.backdrop || feature.poster}`}
                  alt={feature.title}
                  className="absolute inset-0 h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-noir-950/95 via-noir-950/80 to-noir-950/60" />
              </>
            )}
            <Link to={`/movie/${feature.id}`} className="relative block">
              <MovieCard movie={feature} width="w-full" />
            </Link>
            <div className="relative">
              <span className="eyebrow text-gold">Editor's pick</span>
              <h2 className="display mt-3 text-3xl text-white sm:text-4xl">{feature.title}</h2>
              <p className="mt-4 max-w-xl text-white/55 line-clamp-4">
                {feature.overview || "A defining film of the genre."}
              </p>
              <Link to={`/movie/${feature.id}`} className="btn-accent mt-6">
                View details
              </Link>
            </div>
          </Reveal>
        </section>
      )}

      {/* Grid */}
      <section className="mx-auto mt-14 max-w-7xl px-6 pb-10 sm:px-10">
        <h3 className="display mb-7 text-2xl text-white">More in {genre.name}</h3>
        {loading ? (
          <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="aspect-[2/3] w-full rounded-xl skeleton" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {rest.map((m, i) => (
              <MovieCard key={m.id} movie={m} index={i} width="w-full" />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
