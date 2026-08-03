import { useRef, useState, useEffect } from "react";
import MovieCard from "./MovieCard";
import { ChevronL, ChevronR } from "./icons";

function CardSkeleton({ width = "w-[180px]" }) {
  return (
    <div className={`shrink-0 ${width}`}>
      <div className="aspect-[2/3] w-full rounded-xl skeleton" />
      <div className="mt-3 h-3.5 w-3/4 rounded skeleton" />
      <div className="mt-2 h-2.5 w-1/2 rounded skeleton" />
    </div>
  );
}

// Horizontal premium discovery row with edge-fade + floating scroll controls.
export default function MovieRow({ movies = [], loading = false, render }) {
  const ref = useRef(null);
  const [edge, setEdge] = useState({ start: true, end: false });

  const update = () => {
    const el = ref.current;
    if (!el) return;
    setEdge({
      start: el.scrollLeft < 8,
      end: el.scrollLeft + el.clientWidth >= el.scrollWidth - 8,
    });
  };

  useEffect(() => {
    update();
  }, [movies, loading]);

  const scroll = (dir) => {
    const el = ref.current;
    if (!el) return;
    el.scrollBy({ left: dir * Math.round(el.clientWidth * 0.8), behavior: "smooth" });
  };

  return (
    <div className="group/row relative">
      {!edge.start && (
        <button
          onClick={() => scroll(-1)}
          aria-label="Scroll left"
          className="absolute -left-3 top-1/2 z-20 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full glass-strong text-white opacity-0 shadow-float transition group-hover/row:opacity-100 hover:bg-white/15 md:flex"
        >
          <ChevronL />
        </button>
      )}
      {!edge.end && (
        <button
          onClick={() => scroll(1)}
          aria-label="Scroll right"
          className="absolute -right-3 top-1/2 z-20 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full glass-strong text-white opacity-0 shadow-float transition group-hover/row:opacity-100 hover:bg-white/15 md:flex"
        >
          <ChevronR />
        </button>
      )}

      <div
        ref={ref}
        onScroll={update}
        className="no-scrollbar flex gap-4 overflow-x-auto scroll-smooth pb-2 sm:gap-5"
      >
        {loading
          ? Array.from({ length: 7 }).map((_, i) => <CardSkeleton key={i} />)
          : movies.map((m, i) =>
              render ? render(m, i) : <MovieCard key={m.id} movie={m} index={i} />
            )}
      </div>
    </div>
  );
}
