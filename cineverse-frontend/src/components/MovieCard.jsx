import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { posterUrl } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import { useTrailer } from "../context/TrailerContext";
import { Star, Plus, Check, Play } from "./icons";

function Poster({ movie }) {
  const [loaded, setLoaded] = useState(false);
  const src = posterUrl(movie.poster, "w500");
  return (
    <div className="absolute inset-0 overflow-hidden bg-noir-800">
      {!loaded && <div className="absolute inset-0 skeleton" />}
      {src ? (
        <img
          src={src}
          alt={movie.title}
          loading="lazy"
          onLoad={() => setLoaded(true)}
          className={`h-full w-full object-cover transition-all duration-700 group-hover:scale-[1.06] ${
            loaded ? "opacity-100" : "opacity-0"
          }`}
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-noir-700 to-noir-900">
          <span className="display px-3 text-center text-lg text-white/30">{movie.title}</span>
        </div>
      )}
    </div>
  );
}

export default function MovieCard({ movie, index = 0, width = "w-[180px]" }) {
  const { isInWatchlist, toggleWatchlist } = useAuth();
  const { playTrailer } = useTrailer();
  const saved = isInWatchlist(movie.id);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.6, delay: Math.min(index * 0.05, 0.3), ease: [0.16, 1, 0.3, 1] }}
      className={`group relative shrink-0 ${width}`}
    >
      <Link
        to={`/movie/${movie.id}`}
        className="block"
      >
        <div className="relative aspect-[2/3] overflow-hidden rounded-xl border border-white/[0.06] shadow-card transition-all duration-500 group-hover:border-white/15 group-hover:shadow-float">
          <Poster movie={movie} />

          {/* gradient + reveal overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-noir-950 via-noir-950/10 to-transparent opacity-80" />
          <div className="absolute inset-0 bg-gradient-to-t from-noir-950/95 via-noir-950/30 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

          {/* rating badge */}
          {movie.rating > 0 && (
            <div className="absolute left-2.5 top-2.5 flex items-center gap-1 rounded-full border border-gold/30 bg-noir-950/70 px-2 py-1 backdrop-blur-md">
              <Star className="text-gold" size={11} />
              <span className="text-[11px] font-semibold text-gold">
                {movie.rating.toFixed(1)}
              </span>
            </div>
          )}

          {/* quick add */}
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              toggleWatchlist(movie);
            }}
            aria-label={saved ? "Remove from watchlist" : "Add to watchlist"}
            className={`absolute right-2 top-2 sm:right-2.5 sm:top-2.5 flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-full border backdrop-blur-md transition-all duration-300 ${
              saved
                ? "border-accent/50 bg-accent/80 text-white opacity-100"
                : "border-white/20 bg-noir-950/60 text-white/80 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 hover:bg-white/15"
            }`}
          >
            {saved ? <Check size={14} /> : <Plus size={14} />}
          </button>

          {/* hover info — clickable Watch Trailer button */}
          <div className="absolute inset-x-0 bottom-0 p-2 sm:p-3 opacity-100 sm:opacity-0 transition-all duration-500 sm:translate-y-2 sm:group-hover:translate-y-0 sm:group-hover:opacity-100">
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                playTrailer(movie.id, movie.title);
              }}
              className="inline-flex items-center gap-1.5 rounded-full bg-accent px-2.5 py-1 sm:px-3 sm:py-1.5 text-[10px] sm:text-[11px] font-semibold text-white transition hover:scale-105 hover:bg-accent-alt active:scale-95 duration-200"
            >
              <Play size={11} /> Watch Trailer
            </button>
          </div>
        </div>
      </Link>

      <div className="mt-3 px-0.5">
        <Link to={`/movie/${movie.id}`}>
          <h3 className="truncate text-sm font-semibold text-white/90 transition-colors group-hover:text-white">
            {movie.title}
          </h3>
        </Link>
        <div className="mt-0.5 flex items-center gap-2 text-[12px] text-white/40">
          {movie.year && <span>{movie.year}</span>}
          {movie.genres?.[0] && (
            <>
              <span className="h-1 w-1 rounded-full bg-white/20" />
              <span className="truncate">{movie.genres[0]}</span>
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
}

