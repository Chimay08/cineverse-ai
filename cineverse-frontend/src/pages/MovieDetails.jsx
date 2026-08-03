import { useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import MovieRow from "../components/MovieRow";
import Reveal from "../components/Reveal";
import { Play, Plus, Check, Star, Clock } from "../components/icons";
import {
  getMovie,
  getMovieCast,
  getRecommendations,
  posterUrl,
  backdropUrl,
  profileUrl,
  trackActivity
} from "../lib/api";
import useAsync, { useScrollTop } from "../lib/useAsync";
import { useAuth } from "../context/AuthContext";
import { useTrailer } from "../context/TrailerContext";

function Meta({ label, value }) {
  if (!value) return null;
  return (
    <div>
      <dt className="text-[11px] font-semibold uppercase tracking-wider text-white/35">{label}</dt>
      <dd className="mt-1 text-sm text-white/80">{value}</dd>
    </div>
  );
}

export default function MovieDetails() {
  const { id } = useParams();
  useScrollTop(id);
  const { isInWatchlist, toggleWatchlist } = useAuth();
  const { playTrailer } = useTrailer();

  const { data: movie, loading } = useAsync(() => getMovie(id), [id]);
  const { data: cast } = useAsync(() => getMovieCast(id), [id], []);
  const { data: related } = useAsync(() => getRecommendations(id), [id], []);
  useEffect(() => {
  if (!movie) return;

  trackActivity({
    movieId: movie.id,
    movieTitle: movie.title,
    genre: movie.genres?.[0] || "Unknown",
    language: "en",
    rating: movie.rating,
    releaseYear: movie.year,
    actionType: "viewed_movie"
  });

}, [movie]);

  const openTrailer = () => {
  if (movie) {

    trackActivity({
      movieId: movie.id,
      movieTitle: movie.title,
      genre: movie.genres?.[0] || "Unknown",
      language: "en",
      rating: movie.rating,
      releaseYear: movie.year,
      actionType: "watched_trailer"
    });

    playTrailer(movie.id, movie.title);
  }
};

  if (loading || !movie) {
    return (
      <div className="pt-32">
        <div className="h-[60vh] w-full skeleton" />
        <div className="mx-auto max-w-7xl px-6 sm:px-10">
          <div className="mt-8 h-10 w-1/2 rounded skeleton" />
          <div className="mt-4 h-24 w-full rounded skeleton" />
        </div>
      </div>
    );
  }

  const saved = isInWatchlist(movie.id);
  const bg = backdropUrl(movie.backdrop || movie.poster, "original");
  const runtimeStr = movie.runtime
    ? `${Math.floor(movie.runtime / 60)}h ${movie.runtime % 60}m`
    : null;

  return (
    <div>
      {/* Cinematic backdrop */}
      <div className="relative h-[78vh] min-h-[560px] w-full overflow-hidden">
        {bg && (
          <img src={bg} alt={movie.title} className="absolute inset-0 h-full w-full object-cover" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-noir-950 via-noir-950/55 to-noir-950/20" />
        <div className="absolute inset-0 bg-gradient-to-r from-noir-950/90 to-transparent" />

        <div className="relative z-10 mx-auto flex h-full max-w-7xl items-end px-6 pb-12 sm:px-10">
          <div className="grid items-end gap-8 md:grid-cols-[220px_1fr]">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="hidden md:block"
            >
              {posterUrl(movie.poster) ? (
                <img
                  src={posterUrl(movie.poster, "w500")}
                  alt={movie.title}
                  className="aspect-[2/3] w-full rounded-2xl border border-white/10 object-cover shadow-float"
                />
              ) : null}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            >
              {movie.genres?.length > 0 && (
                <div className="mb-4 flex flex-wrap gap-2">
                  {movie.genres.slice(0, 3).map((g) => (
                    <span
                      key={g}
                      className="rounded-full border border-white/15 bg-white/[0.05] px-3 py-1 text-xs font-medium text-white/70 backdrop-blur-md"
                    >
                      {g}
                    </span>
                  ))}
                </div>
              )}
              <h1 className="display text-5xl text-white sm:text-7xl">{movie.title}</h1>

              <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-white/60">
                {movie.rating > 0 && (
                  <span className="flex items-center gap-1.5 font-semibold text-gold">
                    <Star className="text-gold" size={15} /> {movie.rating.toFixed(1)}
                  </span>
                )}
                {movie.year && (
                  <>
                    <span className="h-3 w-px bg-white/20" />
                    <span>{movie.year}</span>
                  </>
                )}
                {runtimeStr && (
                  <>
                    <span className="h-3 w-px bg-white/20" />
                    <span className="flex items-center gap-1.5">
                      <Clock size={14} /> {runtimeStr}
                    </span>
                  </>
                )}
              </div>

              <div className="mt-8 flex flex-wrap gap-3">
                <button onClick={openTrailer} className="btn-accent px-8 py-3.5">
                  <Play size={17} /> Watch Trailer
                </button>
                <button
  onClick={() => {

    // Only record an "added_watchlist" activity when actually adding —
    // toggling off (removing) should not log an add.
    if (!saved) {
      trackActivity({
        movieId: movie.id,
        movieTitle: movie.title,
        genre: movie.genres?.[0] || "Unknown",
        language: "en",          // Later we'll make this dynamic
        rating: movie.rating,
        releaseYear: movie.year,
        actionType: "added_watchlist"
      });
    }

    toggleWatchlist(movie);
  }}

  className="btn-ghost px-7 py-3.5"
>
                  {saved ? <Check size={17} /> : <Plus size={17} />}
                  {saved ? "In Watchlist" : "Add to Watchlist"}
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>


      {/* Body */}
      <div className="mx-auto max-w-7xl px-6 sm:px-10">
        <div className="grid gap-12 py-14 lg:grid-cols-[1fr_300px]">
          <div>
            <Reveal>
              <h2 className="display text-2xl text-white">Synopsis</h2>
              <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-white/65">
                {movie.overview || "No synopsis available for this title yet."}
              </p>
            </Reveal>

            {/* Cast */}
            {cast?.length > 0 && (
              <Reveal className="mt-12">
                <h2 className="display text-2xl text-white">Cast</h2>
                <div className="no-scrollbar mt-6 flex gap-5 overflow-x-auto pb-2">
                  {cast.map((p) => (
                    <div key={p.id} className="w-28 shrink-0 text-center">
                      <div className="aspect-square w-28 overflow-hidden rounded-2xl border border-white/[0.07] bg-noir-800">
                        {profileUrl(p.profile) ? (
                          <img
                            src={profileUrl(p.profile)}
                            alt={p.name}
                            loading="lazy"
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-2xl text-white/20">
                            {p.name?.[0]}
                          </div>
                        )}
                      </div>
                      <p className="mt-2 truncate text-sm font-medium text-white/85">{p.name}</p>
                      <p className="truncate text-xs text-white/40">{p.character}</p>
                    </div>
                  ))}
                </div>
              </Reveal>
            )}
          </div>

          {/* Side meta */}
          <Reveal delay={0.1}>
            <div className="rounded-3xl glass-strong p-6">
              <h3 className="mb-5 text-sm font-semibold uppercase tracking-wider text-white/50">
                Details
              </h3>
              <dl className="grid grid-cols-2 gap-5">
                <Meta label="Director" value={movie.director} />
                <Meta label="Release" value={movie.releaseDate || movie.year} />
                <Meta label="Runtime" value={runtimeStr} />
                <Meta label="Rating" value={movie.rating ? `${movie.rating.toFixed(1)} / 10` : null} />
                <Meta label="Genres" value={movie.genres?.join(", ")} />
                <Meta label="Studio" value="CineVerse Pictures" />
              </dl>
            </div>
          </Reveal>
        </div>

        {/* Related */}
        {related?.length > 0 && (
          <section className="pb-6">
            <Reveal className="mb-7">
              <span className="eyebrow text-accent/90">You might also love</span>
              <h2 className="display mt-3 text-3xl text-white">Related Films</h2>
            </Reveal>
            <MovieRow movies={related} />
          </section>
        )}

        <div className="pb-4 pt-6">
          <Link to="/movies" className="text-sm text-white/45 transition hover:text-white">
            ← Back to all movies
          </Link>
        </div>
      </div>
    </div>
  );
}
