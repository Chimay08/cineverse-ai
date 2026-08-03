import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { posterUrl } from "../lib/api";
import { useTrailer } from "../context/TrailerContext";
import { Sparkle } from "./icons";

const matchFor = (id) => {
  const base = 82 + ((id * 7) % 17); // 82–98
  return Math.min(98, base);
};

export default function RecommendationCard({ movie, index = 0, match, reason }) {
  const [loaded, setLoaded] = useState(false);
  const { playTrailer } = useTrailer();
  const pct = match ?? matchFor(movie.id);
  const why = reason ?? "Recommended based on your viewing activity.";
  const src = posterUrl(movie.poster, "w500");

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.6, delay: Math.min(index * 0.06, 0.36), ease: [0.16, 1, 0.3, 1] }}
      className="group relative shrink-0 w-[180px]"
    >
      <Link
        to={`/movie/${movie.id}`}
        className="block overflow-hidden rounded-2xl border border-white/[0.07] bg-noir-850/60 shadow-card transition-all duration-500 hover:-translate-y-1 hover:border-gold/25 hover:shadow-float"
      >
        <div className="relative aspect-[2/3] overflow-hidden bg-noir-800">
          {!loaded && <div className="absolute inset-0 skeleton" />}
          {src && (
            <img
              src={posterUrl(movie.backdrop || movie.poster, "w780")}
              alt={movie.title}
              loading="lazy"
              onLoad={() => setLoaded(true)}
              className={`h-full w-full object-cover transition-all duration-700 group-hover:scale-105 ${
                loaded ? "opacity-100" : "opacity-0"
              }`}
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-noir-900 via-noir-900/20 to-transparent" />

          {/* gold match badge */}
          <div className="absolute right-3 top-3 flex items-center gap-1.5 rounded-full border border-gold/40 bg-noir-950/70 px-3 py-1.5 backdrop-blur-md shadow-gold-glow">
            <Sparkle className="text-gold" size={13} />
            <span className="text-[13px] font-bold text-gold">{pct}% Match</span>
          </div>
        </div>

        <div className="p-4">
          <h3 className="truncate text-base font-semibold text-white group-hover:text-gold transition-colors">{movie.title}</h3>
          <div className="mt-1 flex items-center gap-2 text-xs text-white/40">
            {movie.year && <span>{movie.year}</span>}
            {movie.genres?.[0] && (
              <>
                <span className="h-1 w-1 rounded-full bg-white/20" />
                <span>{movie.genres.slice(0, 2).join(" · ")}</span>
              </>
            )}
          </div>
          <p className="mt-3 line-clamp-2 text-[13px] leading-relaxed text-white/55">
            <span className="text-gold/80">Why · </span>
            {why}
          </p>
        </div>
      </Link>
    </motion.div>
  );
}
