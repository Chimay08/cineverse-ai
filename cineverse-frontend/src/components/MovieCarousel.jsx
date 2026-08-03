import React, { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

const MovieCarousel = ({ movies, title = "Recommended for you" }) => {
  const navigate = useNavigate();
  const containerRef = useRef(null);
  const [visibleCount, setVisibleCount] = useState(10);

  if (!movies?.length) return null;

  const scrollLeft = () => {
    containerRef.current?.scrollBy({
      left: -800,
      behavior: "smooth",
    });
  };

  const scrollRight = () => {
    containerRef.current?.scrollBy({
      left: 800,
      behavior: "smooth",
    });
  };

  const visibleMovies = movies.slice(0, visibleCount);

  return (
    <div className="mt-6 w-full">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-xl font-bold text-white sm:text-2xl">
          {title}
        </h2>

        <div className="flex items-center gap-2">
          <button
            onClick={scrollLeft}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-800 text-sm text-white transition hover:bg-zinc-700 active:scale-95"
            aria-label="Scroll left"
          >
            ◀
          </button>

          <button
            onClick={scrollRight}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-800 text-sm text-white transition hover:bg-zinc-700 active:scale-95"
            aria-label="Scroll right"
          >
            ▶
          </button>
        </div>
      </div>

      <div
        ref={containerRef}
        className="flex gap-3 sm:gap-4 overflow-x-auto pb-3 scrollbar-hide snap-x snap-mandatory"
      >
        {visibleMovies.map((movie) => (
          <div
            key={movie.id}
            onClick={() => navigate(`/movies/${movie.id}`)}
            className="min-w-[145px] max-w-[145px] sm:min-w-[170px] sm:max-w-[170px] md:min-w-[185px] md:max-w-[185px] shrink-0 snap-start cursor-pointer rounded-xl bg-zinc-900/90 p-2.5 sm:p-3 transition-transform hover:scale-105"
          >
            <img
              src={movie.poster}
              alt={movie.title}
              className="h-[200px] sm:h-[240px] md:h-[250px] w-full rounded-lg object-cover"
            />

            <h3 className="mt-2 truncate text-sm sm:text-base font-semibold text-white">
              {movie.title}
            </h3>

            <p className="mt-1 line-clamp-2 text-xs text-gray-400">
              {movie.reason}
            </p>

            <div className="mt-2 flex flex-wrap gap-1.5">
              <span className="rounded-full bg-zinc-800 px-2 py-0.5 text-[10px] text-gray-300">
                {movie.mood}
              </span>

              <span className="rounded-full bg-zinc-800 px-2 py-0.5 text-[10px] text-amber-400">
                ⭐ {movie.rating}
              </span>
            </div>
          </div>
        ))}
      </div>

      {visibleCount < movies.length && (
        <div className="mt-2 flex justify-end">
          <button
            onClick={() => setVisibleCount((prev) => prev + 10)}
            className="text-xs font-semibold text-accent hover:underline"
          >
            See more ({movies.length - visibleCount} more) →
          </button>
        </div>
      )}
    </div>
  );
};

export default MovieCarousel;
