import { Link } from "react-router-dom";
import Hero from "../components/Hero";
import MovieRow from "../components/MovieRow";
import RecommendationCard from "../components/RecommendationCard";
import SectionHeader from "../components/SectionHeader";
import Reveal from "../components/Reveal";
import { Arrow } from "../components/icons";
import {
  getNowPlaying,
  getTopRated,
  getTrending,
  getUpcoming,
  getCachedData,
} from "../lib/api";
import { GENRES } from "../lib/mockData";
import useAsync from "../lib/useAsync";
import { useAuth } from "../context/AuthContext";
import { useTrailer } from "../context/TrailerContext";

function GenreStrip() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-16 sm:px-10">
      <SectionHeader
        eyebrow="Curated Worlds"
        title="Browse by Genre"
        subtitle="Hand-curated editorial collections, not endless grids."
        to="/genres"
      />
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
        {GENRES.map((g, i) => (
          <Reveal key={g.slug} delay={i * 0.05}>
            <Link
              to={`/genres/${g.slug}`}
              className="group relative flex h-36 items-end overflow-hidden rounded-2xl border border-white/[0.07] bg-noir-850 p-5 transition-all duration-500 hover:-translate-y-1 hover:border-white/20 hover:shadow-float sm:h-44"
            >
              <div
                className="absolute -right-8 -top-10 h-40 w-40 rounded-full opacity-20 blur-2xl transition-opacity duration-500 group-hover:opacity-40"
                style={{ background: g.accent }}
              />
              <div className="relative">
                <h3 className="display text-2xl text-white sm:text-3xl">{g.name}</h3>
                <p className="mt-1 text-sm text-white/45">{g.tagline}</p>
              </div>
              <Arrow className="absolute right-5 top-5 text-white/30 transition-all duration-300 group-hover:right-4 group-hover:text-white" />
            </Link>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

export default function Home() {
  const { isAuthed } = useAuth();
  const { playTrailer } = useTrailer();

  const latestReleases = useAsync(getUpcoming, [], getCachedData("upcoming"));
  const topRated = useAsync(getTopRated, [], getCachedData("top-rated"));
  const trending = useAsync(getTrending, [], getCachedData("trending"));

  return (
    <div>
      <Hero
        trendingMovies={trending.data || []}
        loading={trending.loading}
        onPlayTrailer={playTrailer}
      />

      {/* Latest releases */}
      <section className="mx-auto max-w-7xl px-6 pt-20 sm:px-10">
        <SectionHeader
          eyebrow="Fresh from the projector"
          title="Latest Releases"
          subtitle="The newest cinema, ready to discover."
          to="/collection/latest"
        />
        <MovieRow
          movies={latestReleases.data || []}
          loading={latestReleases.loading}
        />
      </section>

      {/* Top rated */}
      <section className="mx-auto max-w-7xl px-6 pt-20 sm:px-10">
        <SectionHeader
          eyebrow="Critically adored"
          title="Top Rated Movies"
          subtitle="Highest rated classics and modern masterpieces."
          to="/collection/top-rated"
        />
        <MovieRow
          movies={topRated.data || []}
          loading={topRated.loading}
        />
      </section>

      {/* Trending */}
      <section className="mx-auto max-w-7xl px-6 pt-20 sm:px-10">
        <SectionHeader
          eyebrow="What the world is watching"
          title="Trending This Week"
          to="/collection/trending"
        />
        <MovieRow movies={trending.data || []} loading={trending.loading} />
      </section>

      <GenreStrip />

      {/* Closing editorial band */}
      <section className="mx-auto mt-24 max-w-7xl px-6 sm:px-10">
        <Reveal className="relative overflow-hidden rounded-[2rem] border border-white/[0.07] bg-noir-radial p-10 text-center sm:p-16">
          <div className="absolute inset-0 bg-accent-glow opacity-30" />
          <div className="relative">
            <span className="eyebrow text-accent/90">Enter CineVerse</span>
            <h2 className="display mx-auto mt-4 max-w-3xl text-4xl text-white sm:text-6xl">
              Escape reality. <br className="hidden sm:block" /> Understand your taste.
            </h2>
            <p className="mx-auto mt-5 max-w-xl text-white/55">
              An intelligent recommendation engine that learns the cinema you love —
              and finds the films you didn't know you were looking for.
            </p>
            <div className="mt-8 flex justify-center gap-3">
              {!isAuthed ? (
                <Link to="/signin" className="btn-accent px-8 py-3.5">
                  Create your account
                </Link>
              ) : (
                <Link to="/dashboard" className="btn-accent px-8 py-3.5">
                  Open your dashboard
                </Link>
              )}
              <Link to="/explore" className="btn-ghost px-7 py-3.5">
                Explore films
              </Link>
            </div>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
