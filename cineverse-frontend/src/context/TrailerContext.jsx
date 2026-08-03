import { createContext, useContext, useState } from "react";
import TrailerModal from "../components/TrailerModal";
import { getMovieTrailers } from "../lib/api";

const TrailerContext = createContext(null);

export function TrailerProvider({ children }) {
  const [open, setOpen] = useState(false);
  const [trailers, setTrailers] = useState([]);
  const [title, setTitle] = useState("Trailer");

  const playTrailer = async (id, movieTitle = "Trailer") => {
    // Always open the modal so the user gets feedback even when no embeddable
    // trailer exists — the modal shows an "unavailable / Watch on YouTube"
    // fallback instead of the button silently doing nothing.
    setTitle(movieTitle);
    try {
      const list = await getMovieTrailers(id);
      setTrailers(Array.isArray(list) ? list : []);
      if (!list || !list.length) {
        console.warn("Official trailer not found for movie:", id);
      }
    } catch (e) {
      console.error("Error playing trailer:", e);
      setTrailers([]);
    } finally {
      setOpen(true);
    }
  };

  return (
    <TrailerContext.Provider value={{ playTrailer }}>
      {children}
      <TrailerModal
        open={open}
        onClose={() => setOpen(false)}
        trailers={trailers}
        title={title}
      />
    </TrailerContext.Provider>
  );
}

export const useTrailer = () => {
  const ctx = useContext(TrailerContext);
  if (!ctx) throw new Error("useTrailer must be used within TrailerProvider");
  return ctx;
};
