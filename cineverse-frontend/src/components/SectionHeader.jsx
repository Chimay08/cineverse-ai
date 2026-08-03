import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import Reveal from "./Reveal";
import { Arrow } from "./icons";

// Movie Quotes
const MOVIE_QUOTES = [
  { quote: "Freedom begins when fear ends.", movie: "Fight Club" },
  { quote: "Racing is about pushing limits.", movie: "Ford v Ferrari" },
  { quote: "Kindness can change destinies.", movie: "Green Book" },
  { quote: "जगण्याला अर्थ हवा असतो.", movie: "नटसम्राट" },
  { quote: "Babu moshai, zindagi badi honi chahiye, lambi nahi.", movie: "ANAND" }
];

export default function SectionHeader({
  eyebrow,
  title,
  subtitle,
  to,
  linkLabel = "View all"
}) {

  // which quote currently showing
  const [quoteIndex, setQuoteIndex] = useState(0);

  // rotate every 8 sec
  useEffect(() => {
    const interval = setInterval(() => {
      setQuoteIndex((prev) =>
        prev === MOVIE_QUOTES.length - 1 ? 0 : prev + 1
      );
    }, 8000);

    return () => clearInterval(interval);
  }, []);

  return (
    <Reveal className="mb-7 flex items-end justify-between gap-6">
      
      {/* Left side */}
      <div>
        {eyebrow && (
          <div className="mb-3 flex items-center gap-3">
            <span className="h-px w-8 bg-accent" />
            <span className="eyebrow text-accent/90">{eyebrow}</span>
          </div>
        )}

        <h2 className="display text-3xl text-white sm:text-4xl md:text-[2.6rem]">
          {title}
        </h2>

        {subtitle && (
          <p className="mt-2 max-w-xl text-sm text-white/45">
            {subtitle}
          </p>
        )}
      </div>

      {/* Right side */}
      <div className="hidden items-center gap-8 sm:flex">

        {/* Rotating Quote */}
        <div className="max-w-sm text-right">
          <p className="text-sm italic text-white/45">
            "{MOVIE_QUOTES[quoteIndex].quote}"
          </p>

          <p className="mt-1 text-xs text-accent/80">
            — {MOVIE_QUOTES[quoteIndex].movie}
          </p>
        </div>

        {/* View All */}
        {to && (
          <Link
            to={to}
            className="group shrink-0 flex items-center gap-2 text-sm font-medium text-white/55 transition hover:text-white"
          >
            {linkLabel}
            <Arrow
              size={16}
              className="transition-transform group-hover:translate-x-1"
            />
          </Link>
        )}
      </div>

    </Reveal>
  );
}