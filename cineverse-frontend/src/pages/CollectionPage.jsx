import { useParams } from "react-router-dom";
import MovieCard from "../components/MovieCard";
import SectionHeader from "../components/SectionHeader";
import Reveal from "../components/Reveal";
import {
  getTrending,
  getTopRated,
  getUpcoming
} from "../lib/api";
import useAsync, { useScrollTop } from "../lib/useAsync";

export default function CollectionPage() {
  const { type } = useParams();

  useScrollTop(type);

  let fetchFunction = getTrending;
  let title = "Movies";
  let subtitle = "";

  if (type === "trending") {
    fetchFunction = getTrending;
    title = "Trending This Week";
    subtitle = "What the world is watching.";
  }

  if (type === "top-rated") {
    fetchFunction = getTopRated;
    title = "Top Rated Movies";
    subtitle = "Highest rated masterpieces.";
  }

  if (type === "latest") {
    fetchFunction = getUpcoming;
    title = "Latest Releases";
    subtitle = "Fresh cinema ready to discover.";
  }

  const { data, loading } = useAsync(fetchFunction, [type]);

  return (
    <div className="mx-auto max-w-7xl px-6 pt-32 pb-10 sm:px-10">

      <SectionHeader
        eyebrow="CineVerse Collection"
        title={title}
        subtitle={subtitle}
      />

      {loading ? (
        <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {Array.from({ length: 15 }).map((_, i) => (
            <div key={i} className="aspect-[2/3] rounded-xl skeleton" />
          ))}
        </div>
      ) : (
        <Reveal>
          <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {(data || []).map((movie, i) => (
              <MovieCard
                key={movie.id}
                movie={movie}
                index={i}
                width="w-full"
              />
            ))}
          </div>
        </Reveal>
      )}
    </div>
  );
}