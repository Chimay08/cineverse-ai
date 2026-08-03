import { useState } from "react";
import { Routes, Route, useLocation, Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Movies from "./pages/Movies";
import Genres from "./pages/Genres";
import GenreDetail from "./pages/GenreDetail";
import Explore from "./pages/Explore";
import MovieDetails from "./pages/MovieDetails";
import SignIn from "./pages/SignIn";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import { TrailerProvider } from "./context/TrailerContext";
import CinematicLoader from "./components/CinematicLoader";
import CollectionPage from "./pages/CollectionPage";
import WorldCinema from "./pages/WorldCinema";
import WorldCinemaDetail from "./pages/WorldCinemaDetail";
import Concierge from "./pages/Concierge";

function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <span className="display text-[8rem] leading-none text-accent">404</span>
      <h1 className="display mt-2 text-3xl text-white">Lost in the void</h1>
      <p className="mt-3 max-w-sm text-white/50">
        This reel doesn't exist. Let's get you back to the cinema.
      </p>
      <Link to="/" className="btn-accent mt-7">
        Back home
      </Link>
    </div>
  );
}

function Page({ children }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35 }}
    >
      {children}
    </motion.div>
  );
}

export default function App() {
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  // Sign-in and Register are full-screen immersive pages — no chrome.
  const bare = location.pathname === "/signin" || location.pathname === "/register";

  return (
    <TrailerProvider>
      <AnimatePresence mode="wait">
        {loading && <CinematicLoader onComplete={() => setLoading(false)} />}
      </AnimatePresence>

      <motion.div
        className="min-h-screen bg-noir-950"
        initial={{ scale: 0.97, opacity: 0 }}
        animate={{
          scale: loading ? 0.97 : 1,
          opacity: loading ? 0 : 1,
        }}
        transition={{
          duration: 0.9,
          ease: [0.16, 1, 0.3, 1],
        }}
      >
        {!bare && <Navbar />}
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
  <Route path="/" element={<Page><Home /></Page>} />
  
  <Route path="/movies" element={<Page><Movies /></Page>} />
  
  <Route path="/genres" element={<Page><Genres /></Page>} />
  <Route path="/genres/:slug" element={<Page><GenreDetail /></Page>} />
  <Route path="/world-cinema" element={<Page><WorldCinema /></Page>} />
  <Route path="/world-cinema/:slug" element={<Page><WorldCinemaDetail /></Page>} />

  <Route path="/collection/:type" element={<Page><CollectionPage /></Page>} />

  <Route path="/explore" element={<Page><Explore /></Page>} />
  <Route path="/concierge" element={<Page><Concierge /></Page>} />
  
  <Route path="/movie/:id" element={<Page><MovieDetails /></Page>} />
  <Route path="/movies/:id" element={<Page><MovieDetails /></Page>} />
  
  <Route path="/signin" element={<Page><SignIn /></Page>} />
  <Route path="/register" element={<Page><Register /></Page>} />
  
  <Route path="/dashboard" element={<Page><Dashboard /></Page>} />

  <Route path="*" element={<Page><NotFound /></Page>} />
</Routes>
        </AnimatePresence>
        {!bare && <Footer />}
      </motion.div>
    </TrailerProvider>
  );
}
