import { Navigate, Link } from "react-router-dom";
import MovieRow from "../components/MovieRow";
import RecommendationCard from "../components/RecommendationCard";
import SectionHeader from "../components/SectionHeader";
import TasteProfile from "../components/TasteProfile";
import MovieCard from "../components/MovieCard";
import Reveal from "../components/Reveal";

import {
  getNowPlaying,
  getRecommendations,
  getActivity,
  getPersonalizedRecommendations,
  getDirectorsProfile,
  getActorsProfile,
  getCinemaMap
} from "../lib/api";
import useAsync, { useScrollTop } from "../lib/useAsync";
import { useAuth } from "../context/AuthContext";
// Varied, per-card "why" lines for the "Because You Watched" row so every card
// doesn't repeat the same reason. Cycled by card index.
const WATCHED_REASONS = [
  "Similar genre and tone",
  "Matches the mood you enjoy",
  "Same emotional storytelling style",
  "Shares themes with your recent watch",
  "A close thematic match",
  "Similar pacing and atmosphere",
];

const initialsOf = (name = "") =>
  name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

function DirectorsCard() {
  const { data, loading } = useAsync(getDirectorsProfile, [], []);

  return (
    <div className="rounded-3xl glass-strong p-7">
      <span className="eyebrow text-accent/90">Directors You Like</span>
      <h3 className="display mt-2 text-2xl text-white">
        Auteurs in your orbit
      </h3>

      <div className="mt-6 space-y-5">
        {(!data || data.length === 0) && (
          <p className="text-[13px] leading-relaxed text-white/40">
            {loading
              ? "Learning your favorite directors…"
              : "Watch more movies to discover your favorite directors."}
          </p>
        )}

        {(data || []).map((row, i) => (
          <div key={row.director ?? i}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-accent to-accent-alt text-sm font-bold text-white">
                  {initialsOf(row.director)}
                </span>

                <div>
                  <p className="text-sm font-medium text-white/90">
                    {row.director}
                  </p>

                  <p className="text-xs text-white/40">
                    {`${row.movies} movie${row.movies > 1 ? "s" : ""} in your history`}
                  </p>
                </div>
              </div>

              <span className="text-sm font-bold text-gold">
                {row.percentage}%
              </span>
            </div>

            <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-white/[0.06]">
              <div
                className="h-full rounded-full bg-gradient-to-r from-accent to-gold"
                style={{
                  width: `${row.percentage}%`,
                  transitionDelay: `${i * 80}ms`
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function FavoriteActorsCard() {
  const {
    data: favoriteActors,
    loading: actorsLoading
  } = useAsync(getActorsProfile, [], []);

  return (
    <div className="rounded-3xl glass-strong p-7">
      <span className="eyebrow text-accent/90">Favorite Actors</span>
      <h3 className="display mt-2 text-2xl text-white">
        Stars in your orbit
      </h3>

      <div className="mt-6 space-y-5">
        {(!favoriteActors || favoriteActors.length === 0) && (
          <p className="text-[13px] leading-relaxed text-white/40">
            {actorsLoading
              ? "Learning your favorite actors..."
              : "Explore more movies to build your favorite actors."}
          </p>
        )}

        {(favoriteActors || []).map((row, i) => (
          <div key={row.actor ?? i}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-accent to-accent-alt text-sm font-bold text-white">
                  {initialsOf(row.actor)}
                </span>

                <div>
                  <p className="text-sm font-medium text-white/90">
                    {row.actor}
                  </p>

                  <p className="text-xs text-white/40">
                    {`${row.movies} movie${row.movies > 1 ? "s" : ""} in your history`}
                  </p>
                </div>
              </div>

              <span className="text-sm font-bold text-gold">
                {row.percentage}%
              </span>
            </div>

            <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-white/[0.06]">
              <div
                className="h-full rounded-full bg-gradient-to-r from-accent to-gold"
                style={{
                  width: `${row.percentage}%`,
                  transitionDelay: `${i * 80}ms`
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* NEW SECTION */
function WorldTraveler() {
  const { data: cinemaMap, loading } = useAsync(getCinemaMap, [], []);

  return (
    <div className="rounded-3xl glass-strong p-7">
      <span className="eyebrow text-accent/90">
        Global Explorer
      </span>

      <h3 className="display mt-2 text-2xl text-white">
        Your Cinema Map
      </h3>

      <p className="mt-2 text-white/40">
        You explored films across the world.
      </p>

      <div className="mt-6 space-y-4">
        {(!cinemaMap || cinemaMap.length === 0) && (
          <p className="text-[13px] leading-relaxed text-white/40">
            {loading
              ? "Loading your cinema map..."
              : "Explore more movies to build your cinema map."}
          </p>
        )}

        {(cinemaMap || []).map((row) => (
          <div
            key={row.code}
            className="flex items-center justify-between border-b border-white/[0.05] pb-3"
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">
                {row.code}
              </span>

              <span className="text-white/85">
                {row.country}
              </span>
            </div>

            <span className="text-gold font-medium">
              {row.movies} films
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ActivityTimeline({ activities }) {
  const ACTION_ICONS = {
    watched_trailer: "▶️",
    viewed_movie: "🎬",
    added_watchlist: "❤️"
  };

  const ACTION_LABELS = {
    watched_trailer: "Watched Trailer",
    viewed_movie: "Opened Movie",
    added_watchlist: "Added To Watchlist"
  };

  return (
    <div className="rounded-3xl glass-strong p-7">

      <span className="eyebrow text-accent/90">
        Your Activity
      </span>

      <h3 className="display mt-2 text-2xl text-white">
        Recent Journey
      </h3>

      <div className="mt-6 space-y-2">

        {activities.map((a, index) => (
          <div
            key={index}
            className="flex items-center gap-4 rounded-2xl bg-white/[0.02] px-4 py-3 transition-colors hover:bg-white/[0.04]"
          >

            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white/[0.05] text-xl leading-none">
              {ACTION_ICONS[a.action_type] || "🎬"}
            </span>

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-white/90">
                {ACTION_LABELS[a.action_type] || a.action_type}
              </p>

              <p className="truncate text-sm text-white/60">
                {a.movie_title}
              </p>

              <p className="mt-0.5 text-xs text-white/35">
                {a.created_at}
              </p>
            </div>

          </div>
        ))}

      </div>
    </div>
  );
}
export default function Dashboard() {
  useScrollTop("dashboard");
  const { isAuthed, user, watchlist, ready } = useAuth();

 const personalized =
  useAsync(getPersonalizedRecommendations, []);
  const continueWatching = useAsync(getNowPlaying, []);
  const activity = useAsync(getActivity, []);

  // Recommendations are driven ONLY by activity history — never the watchlist.
  // Section A ("Recommended For You") = favorite genre (personalized above).
  // Section B ("Because You Watched X") = TMDB recs for the most recently
  // opened movie from activity.
  const favoriteGenre = (() => {
    const counts = {};
    (activity.data || []).forEach((a) => {
      if (a.genre) counts[a.genre] = (counts[a.genre] || 0) + 1;
    });
    return Object.entries(counts).sort((x, y) => y[1] - x[1])[0]?.[0] || null;
  })();

  const recentWatch =
    activity.data?.find((a) => a.action_type === "viewed_movie") ||
    activity.data?.[0];
  const baseMovieId = recentWatch?.movie_id;
  const baseMovieTitle = recentWatch?.movie_title;

  const recommendations = useAsync(
    () =>
      baseMovieId
        ? getRecommendations(baseMovieId)
        : Promise.resolve([]),
    [baseMovieId]
  );

  if (!ready) {
    return (
      <div className="min-h-screen bg-noir-950 flex items-center justify-center text-white">
        <div className="text-center">
          <span className="h-2.5 w-2.5 animate-pulse-glow rounded-full bg-accent inline-block mr-2.5" />
          <span className="font-medium text-sm tracking-wide text-white/70">
            Loading your CineVerse...
          </span>
        </div>
      </div>
    );
  }

  if (!isAuthed) return <Navigate to="/signin" replace />;

  const firstName = (
    user?.username ||
    user?.name ||
    "Cinephile"
  ).split(" ")[0];

  return (
    <div className="mx-auto max-w-7xl px-6 pb-10 pt-32 sm:px-10">

      {/* Welcome */}
      <Reveal>
        <span className="eyebrow text-accent/90">
          Your CineVerse
        </span>

        <h1 className="display mt-3 text-5xl text-white sm:text-7xl">
          Welcome back, {firstName}
        </h1>

        <p className="mt-4 max-w-xl text-white/50">
          Your taste is evolving. Here's what the engine surfaced for you today.
        </p>
      </Reveal>

      {/* Recommended */}
      <section className="mt-14">
        <SectionHeader
          eyebrow="Tuned to your taste"
          title="Recommended For You"
          subtitle="Generated from your viewing behavior and genre preferences."
        />

        <MovieRow
          movies={personalized.data || []}
loading={personalized.loading}
          render={(m, i) => (
            <RecommendationCard
              key={m.id}
              movie={m}
              index={i}
              reason={
                favoriteGenre
                  ? `Because you enjoy ${favoriteGenre} films.`
                  : "Based on your recent viewing activity."
              }
            />
          )}
        />
      </section>

      {/* Continue watching */}
      <section className="mt-20">
        <SectionHeader
          eyebrow="Pick up where you left off"
          title="Continue Watching"
        />

        <MovieRow
          movies={continueWatching.data || []}
          loading={continueWatching.loading}
        />
      </section>

      {/* NEW WORLD TRAVELER */}
      <section className="mt-20">
        <Reveal>
          <WorldTraveler />
        </Reveal>
      </section>

      {/* Taste profile + directors */}
      <section className="mt-20 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <Reveal>
          <TasteProfile />
        </Reveal>

        <Reveal delay={0.1}>
          <DirectorsCard />
        </Reveal>

        <Reveal delay={0.2}>
          <FavoriteActorsCard />
        </Reveal>
      </section>
      <section className="mt-20">
  <Reveal>
    <ActivityTimeline
      activities={activity.data || []}
    />
  </Reveal>
</section>

      {/* Because you watched */}
      <section className="mt-20">
        <SectionHeader
          eyebrow="A thread to pull"
          title={
            baseMovieTitle
              ? `Because You Watched ${baseMovieTitle}`
              : "Because You Watched Interstellar"
          }
          subtitle={
            baseMovieTitle
              ? `Recommendations based on your interest in ${baseMovieTitle}.`
              : "Mind-bending science fiction with emotional gravity."
          }
        />

        <MovieRow
          movies={recommendations.data || []}
          loading={recommendations.loading}
          render={(m, i) => (
            <RecommendationCard
              key={m.id}
              movie={m}
              index={i}
              reason={WATCHED_REASONS[i % WATCHED_REASONS.length]}
            />
          )}
        />
      </section>

      {/* Watchlist */}
      <section className="mt-20">
        <SectionHeader
          eyebrow="Saved for later"
          title="Your Watchlist"
          subtitle={
            watchlist.length
              ? undefined
              : "Nothing saved yet — start collecting films you love."
          }
        />

        {watchlist.length ? (
          <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {watchlist.map((m, i) => (
              <MovieCard
                key={m.id}
                movie={m}
                index={i}
                width="w-full"
              />
            ))}
          </div>
        ) : (
          <Reveal className="rounded-3xl border border-white/[0.07] bg-noir-850/50 py-16 text-center">
            <p className="text-white/50">
              Your watchlist is empty.
            </p>

            <Link
              to="/movies"
              className="btn-accent mt-5"
            >
              Discover films
            </Link>
          </Reveal>
        )}
      </section>
    </div>
  );
}
