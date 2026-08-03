import { useEffect, useState, useRef } from "react";
import { Search, Sparkle } from "../components/icons";
import DiscoveryHub from "../components/DiscoveryHub";
import MovieCarousel from "../components/MovieCarousel";
import MovieDNA from "../components/MovieDNA";
import { getAIRecommendations, getConciergeHome } from "../lib/api";

const emptySections = {
  becauseYouWatched: [],
  directorPicks: [],
  trending: [],
  lateNight: [],
  mindBending: [],
  crimeThrillers: []
};

function Concierge() {
  const [message, setMessage] = useState("");
  const [movies, setMovies] = useState([]);
  const [searchSections, setSearchSections] = useState(null);
  const [sections, setSections] = useState(emptySections);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    const loadHomeRecommendations = async () => {
      const homeSections = await getConciergeHome();

      if (active) {
        setSections(homeSections);
      }
    };

    loadHomeRecommendations();

    return () => {
      active = false;
    };
  }, []);

  const handleSearch = async (eventOrPrompt) => {
    if (eventOrPrompt?.preventDefault) {
      eventOrPrompt.preventDefault();
    }

    const query =
      typeof eventOrPrompt === "string" ? eventOrPrompt : message;

    if (!query.trim()) {
      setMovies([]);
      setSearchSections(null);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await getAIRecommendations(query);
      const recMovies = res.movies || res;
      setMovies(recMovies);
      if (res.searchSections) {
        setSearchSections(res.searchSections);
      } else {
        setSearchSections({
          similarMovies: recMovies,
          moreLikeThis: recMovies.slice(5),
          basedOnHistory: sections.becauseYouWatched || [],
          trendingNow: sections.trending || []
        });
      }
    } catch (err) {
      setMovies([]);
      setSearchSections(null);
      setError(
        err.response?.data?.message ||
          "Unable to fetch AI recommendations right now."
      );
    } finally {
      setLoading(false);
    }
  };

  // Instant search debounce on user input change
  useEffect(() => {
    if (!message.trim()) {
      setMovies([]);
      setSearchSections(null);
      return;
    }

    const timer = setTimeout(() => {
      handleSearch(message);
    }, 300);

    return () => clearTimeout(timer);
  }, [message]);

  const handlePromptClick = (prompt) => {
    setMessage(prompt);
    handleSearch(prompt);
  };

  const isSearching = Boolean(message.trim());

  return (
    <main className="min-h-screen bg-noir-950 px-4 pb-12 pt-20 text-white sm:px-8">
      <section className="mx-auto flex max-w-4xl flex-col items-center justify-center text-center">
        <h1 className="display max-w-4xl text-3xl leading-tight text-white sm:text-5xl">
          ✨ CineVerse Concierge
        </h1>

        <p className="mt-3 max-w-2xl text-base text-white/60 sm:text-lg">
          Movies chosen for you, not for everyone.
        </p>

        <form
          onSubmit={handleSearch}
          className="mt-6 w-full max-w-2xl rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-1.5 shadow-float backdrop-blur-xl"
        >
          <label className="flex items-center gap-3 rounded-[1.2rem] bg-noir-900/70 px-4 py-3 ring-1 ring-white/10 transition focus-within:ring-accent/40">
            <Search className="shrink-0 text-accent" size={20} />
            <input
              type="text"
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              placeholder="Recommend a movie like Interstellar..."
              className="w-full bg-transparent text-sm text-white outline-none placeholder:text-white/35 sm:text-base"
            />
          </label>
        </form>

        <DiscoveryHub
          onPromptClick={handlePromptClick}
          disabled={loading}
        />

        {loading && (
          <p className="mt-4 text-xs font-medium text-accent sm:text-sm">
            Finding recommendations for you...
          </p>
        )}

        {error && (
          <p className="mt-4 text-xs font-medium text-red-300 sm:text-sm">
            {error}
          </p>
        )}
      </section>

      <section className="mx-auto mt-2 w-full max-w-7xl">
        {isSearching && searchSections ? (
          <>
            <MovieCarousel
              title="Similar movies"
              movies={searchSections.similarMovies}
            />
            <MovieCarousel
              title="More like this"
              movies={searchSections.moreLikeThis}
            />
            <MovieCarousel
              title="Based on your history"
              movies={searchSections.basedOnHistory}
            />
            <MovieCarousel
              title="Trending now"
              movies={searchSections.trendingNow}
            />
          </>
        ) : isSearching && movies.length > 0 ? (
          <MovieCarousel
            title="Similar movies"
            movies={movies}
          />
        ) : (
          <>
            <MovieCarousel
              title="Because you watched..."
              movies={sections.becauseYouWatched}
            />
            <MovieCarousel
              title="Based on your favorite directors"
              movies={sections.directorPicks}
            />
            <MovieCarousel
              title="Trending among users like you"
              movies={sections.trending}
            />
            <MovieCarousel
              title="Perfect for tonight"
              movies={sections.lateNight}
            />
            <MovieCarousel
              title="Mind-bending picks"
              movies={sections.mindBending}
            />
            <MovieCarousel
              title="Crime thrillers for you"
              movies={sections.crimeThrillers}
            />
          </>
        )}

        <MovieDNA />
      </section>
    </main>
  );
}

export default Concierge;
