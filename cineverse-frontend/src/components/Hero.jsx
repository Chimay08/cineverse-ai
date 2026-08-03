import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { backdropUrl, posterUrl, getMovie, getMovieTrailer } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import { Play, Plus, Check, Star, Clock } from "./icons";
import heroFallback from "../assets/hero.png";

// Premium floating Mute/Unmute SVG icons
function Volume({ className = "", size = 18 }) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" fill="currentColor" stroke="none" />
      <path d="M15.54 8.46a5 5 0 0 1 0 7.07M19.07 4.93a10 10 0 0 1 0 14.14" />
    </svg>
  );
}

function VolumeMute({ className = "", size = 18 }) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" fill="currentColor" stroke="none" />
      <line x1="23" y1="9" x2="17" y2="15" />
      <line x1="17" y1="9" x2="23" y2="15" />
    </svg>
  );
}

// Decide background video quality from the user's connection.
// Slow / data-saver / mobile → skip video (poster only). Fast → 1080p, else 720p.
function useAdaptiveVideo() {
  const [mode, setMode] = useState("poster"); // 'poster' | 'small' | 'hd720' | 'hd1080'

  useEffect(() => {
    const conn =
      navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    const small = window.matchMedia?.("(max-width: 768px)").matches;
    const isMobileDevice = /Mobi|Android|iPhone/i.test(navigator.userAgent);
    const isTouchDevice =
      "ontouchstart" in window ||
      (navigator.maxTouchPoints && navigator.maxTouchPoints > 0) ||
      (navigator.msMaxTouchPoints && navigator.msMaxTouchPoints > 0);

    if (reduce || small || isMobileDevice || isTouchDevice) {
      setMode("poster");
      return;
    }
    if (!conn) {
      setMode("hd720");
      return;
    }
    if (conn.saveData) {
      setMode("poster");
      return;
    }
    const type = conn.effectiveType || "4g";
    if (type === "2g" || type === "slow-2g") {
      setMode("poster");
    } else if (type === "3g") {
      setMode("small");
    } else if (type === "4g" && (conn.downlink || 10) < 5) {
      setMode("hd720");
    } else {
      setMode("hd1080");
    }
  }, []);

  return mode;
}

function BrandHero({ loading }) {
  const { isAuthed } = useAuth();
  return (
    <section className="relative flex h-[100svh] min-h-[640px] w-full items-center overflow-hidden">
      <img
        src={heroFallback}
        alt=""
        aria-hidden="true"
        className="absolute inset-0 h-full w-full object-cover opacity-40 animate-slow-zoom"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-noir-950 via-noir-950/80 to-noir-950/40" />
      <div className="absolute inset-0 bg-accent-glow opacity-20" />
      <div className="relative z-10 mx-auto w-full max-w-7xl px-6 sm:px-10">
        <div className="max-w-2xl pt-20">
          <div className="mb-6 inline-flex items-center gap-2.5 rounded-full border border-accent/30 bg-accent/10 px-4 py-1.5 backdrop-blur-md">
            <span className="h-1.5 w-1.5 animate-pulse-glow rounded-full bg-accent" />
            <span className="text-[11px] font-semibold uppercase tracking-wider2 text-white/85">
              {loading ? "Loading the cinema…" : "Welcome to"}
            </span>
          </div>
          <h1 className="display text-[clamp(2.8rem,8vw,6rem)] text-white">
            Enter <span className="text-accent">CineVerse</span>
          </h1>
          <p className="mt-5 max-w-xl text-[15px] leading-relaxed text-white/65 sm:text-base">
            Redefining the cinematic experience. A premium intelligent movie discovery
            platform for people who deeply love cinema.
          </p>
          <div className="mt-9 flex flex-wrap items-center gap-3">
            <Link to="/movies" className="btn-accent px-8 py-3.5 text-[15px]">
              <Play size={17} /> Browse Films
            </Link>
            {!isAuthed && (
              <Link to="/signin" className="btn-ghost px-7 py-3.5 text-[15px]">
                Sign In
              </Link>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

// Module-level cache for enriched hero movies
let cachedEnrichedMovies = [];

export default function Hero({ trendingMovies = [], loading = false, onPlayTrailer }) {
  console.log("Hero movies source:", trendingMovies);
  const mode = useAdaptiveVideo();
  const { isInWatchlist, toggleWatchlist } = useAuth();
  const [enrichedMovies, setEnrichedMovies] = useState(cachedEnrichedMovies);
  const [enriching, setEnriching] = useState(false);
  const [activeIdx, setActiveIdx] = useState(0);
  const [videoReady, setVideoReady] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [offset, setOffset] = useState(0);

  const playerRef = useRef(null);
  const timerRef = useRef(null);
  const activeCardRef = useRef(null);

  // Smooth scroll active card into view in the vertical stack
  useEffect(() => {
    if (activeCardRef.current) {
      activeCardRef.current.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    }
  }, [activeIdx]);

  // Parallax scroll offset
  useEffect(() => {
    const onScroll = () => setOffset(window.scrollY * 0.25);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Fetch full movie details and trailers in parallel for the top 4 trending movies.
  useEffect(() => {
    if (!trendingMovies || trendingMovies.length === 0) return;

    let isCurrent = true;
    setEnriching(true);

    const enrich = async () => {
      try {
        const enriched = await Promise.all(
          trendingMovies.slice(0, 6).map(async (m) => {
            const [details, trailerKey] = await Promise.all([
              getMovie(m.id),
              getMovieTrailer(m.id),
            ]);
            return {
              ...m,
              ...(details || {}),
              trailer: trailerKey,
              badge: "Trending Movie"
            };
          })
        );

        if (isCurrent) {
          setEnrichedMovies(enriched);
          cachedEnrichedMovies = enriched;
          setEnriching(false);
        }
      } catch (err) {
        console.error("Failed to enrich trending movies for Hero:", err);
        if (isCurrent) setEnriching(false);
      }
    };

    enrich();

    return () => {
      isCurrent = false;
    };
  }, [trendingMovies]);

  // Handle switching index automatically.
  const handleNextMovie = () => {
    if (enrichedMovies.length === 0) return;
    setActiveIdx((prev) => (prev + 1) % enrichedMovies.length);
  };

  const handleSelectMovie = (idx) => {
    setActiveIdx(idx);
    setVideoReady(false);
  };

  // YouTube Player API integration logic
  useEffect(() => {
    if (enrichedMovies.length === 0) return;
    const activeMovie = enrichedMovies[activeIdx];

    // Clear any previous fallback timer
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    const hasTrailer = activeMovie?.trailer && mode !== "poster";

    // Set fallback timer if trailer is not available.
    if (!hasTrailer) {
      timerRef.current = setTimeout(() => {
        handleNextMovie();
      }, 12000);
      return;
    }

    // Load YouTube API script if missing
    if (!window.YT) {
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      const firstScriptTag = document.getElementsByTagName("script")[0];
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    }

    let player;
    let checkInterval;

    const setupPlayer = () => {
      if (window.YT && window.YT.Player) {
        if (playerRef.current) {
          try {
            playerRef.current.destroy();
          } catch (e) {
            // ignore
          }
          playerRef.current = null;
        }

        const vq = mode === "hd1080" ? "hd1080" : mode === "small" ? "small" : "hd720";

        player = new window.YT.Player("hero-player", {
          videoId: activeMovie.trailer,
          playerVars: {
            autoplay: 1,
            mute: 1,
            controls: 0,
            cc_load_policy: 3,
            disablekb: 1,
            fs: 0,
            playsinline: 1,
            modestbranding: 1,
            showinfo: 0,
            rel: 0,
            iv_load_policy: 3,
            vq: vq,
          },
          events: {
            onReady: (event) => {
              event.target.playVideo();
              setVideoReady(true);
              if (isMuted) {
                event.target.mute();
              } else {
                event.target.unMute();
              }
              // Force hide captions/subtitles programmatically
              try {
                if (typeof event.target.unloadModule === "function") {
                  event.target.unloadModule("captions");
                  event.target.unloadModule("cc");
                }
              } catch (e) {
                // ignore
              }
              // Prevent focus, touch control activation, disable picture-in-picture, and controls
              try {
                const iframe = event.target.getIframe();
                if (iframe) {
                  iframe.setAttribute("tabindex", "-1");
                  iframe.setAttribute("aria-hidden", "true");
                  iframe.setAttribute("disablepictureinpicture", "true");
                  iframe.setAttribute("controls", "0");
                  iframe.style.pointerEvents = "none";
                  iframe.blur();
                }
              } catch (e) {
                // ignore
              }
            },
            onStateChange: (event) => {
              // 0 means ended
              if (event.data === 0) {
                if (enrichedMovies.length === 1) {
                  event.target.seekTo(0);
                  event.target.playVideo();
                } else {
                  handleNextMovie();
                }
              }
              // Force hide captions on state change
              try {
                if (typeof event.target.unloadModule === "function") {
                  event.target.unloadModule("captions");
                  event.target.unloadModule("cc");
                }
              } catch (e) {
                // ignore
              }
              // Maintain unfocused state, disable controls, and disable picture-in-picture
              try {
                const iframe = event.target.getIframe();
                if (iframe) {
                  iframe.setAttribute("tabindex", "-1");
                  iframe.setAttribute("aria-hidden", "true");
                  iframe.setAttribute("disablepictureinpicture", "true");
                  iframe.setAttribute("controls", "0");
                  iframe.style.pointerEvents = "none";
                  iframe.blur();
                }
              } catch (e) {
                // ignore
              }
            },
            onError: () => {
              // Switch after 5 seconds on video loading error
              timerRef.current = setTimeout(() => {
                handleNextMovie();
              }, 5000);
            }
          },
        });
        playerRef.current = player;
      }
    };

    if (window.YT && window.YT.Player) {
      setupPlayer();
    } else {
      checkInterval = setInterval(() => {
        if (window.YT && window.YT.Player) {
          setupPlayer();
          clearInterval(checkInterval);
        }
      }, 200);
    }

    // Also start a safety timeout of 35 seconds to switch if video gets stuck/unresponsive
    const safetyTimer = setTimeout(() => {
      handleNextMovie();
    }, 35000);

    return () => {
      if (checkInterval) clearInterval(checkInterval);
      clearTimeout(safetyTimer);
      if (playerRef.current && typeof playerRef.current.destroy === "function") {
        try {
          playerRef.current.destroy();
        } catch (e) {
          // ignore
        }
        playerRef.current = null;
      }
    };
  }, [activeIdx, enrichedMovies, mode]);

  // Prevent browser media overlay from exposing controls
  useEffect(() => {
    if (!videoReady) return;

    const disableMediaSession = () => {
      if ("mediaSession" in navigator) {
        try {
          navigator.mediaSession.metadata = null;
          navigator.mediaSession.playbackState = "none";
          
          const dummyHandler = () => {};
          const actions = [
            "play",
            "pause",
            "seekto",
            "seekbackward",
            "seekforward",
            "previoustrack",
            "nexttrack",
          ];
          actions.forEach((action) => {
            try {
              navigator.mediaSession.setActionHandler(action, dummyHandler);
            } catch (e) {
              // ignore
            }
          });
        } catch (e) {
          // ignore
        }
      }
    };

    disableMediaSession();
    // Run periodically to override YouTube Player API's internal Media Session updates
    const interval = setInterval(disableMediaSession, 1000);

    return () => {
      clearInterval(interval);
    };
  }, [videoReady, activeIdx]);

  // Lift browser autoplay block on first click/touchstart to play the video and hide touch controls overlay
  useEffect(() => {
    const handleInteraction = () => {
      if (playerRef.current && typeof playerRef.current.getPlayerState === "function") {
        try {
          const state = playerRef.current.getPlayerState();
          // If player is paused (2) or unstarted (-1), attempt to start playback
          if (state === 2 || state === -1) {
            playerRef.current.playVideo();
          }
        } catch (e) {
          // ignore
        }
      }
    };

    window.addEventListener("click", handleInteraction, { capture: true, passive: true });
    window.addEventListener("touchstart", handleInteraction, { capture: true, passive: true });

    return () => {
      window.removeEventListener("click", handleInteraction, { capture: true });
      window.removeEventListener("touchstart", handleInteraction, { capture: true });
    };
  }, [activeIdx]);

  // Audio Control Toggle Handler
  const toggleMute = () => {
    if (playerRef.current && typeof playerRef.current.mute === "function") {
      if (isMuted) {
        playerRef.current.unMute();
        setIsMuted(false);
      } else {
        playerRef.current.mute();
        setIsMuted(true);
      }
    } else {
      setIsMuted(!isMuted);
    }
  };

  if (enrichedMovies.length === 0) {
    return <BrandHero loading={loading || enriching} />;
  }

  const activeMovie = enrichedMovies[activeIdx];
  const saved = isInWatchlist(activeMovie.id);
  const bg =
    backdropUrl(activeMovie.backdrop, "original") ||
    posterUrl(activeMovie.poster, "w780") ||
    heroFallback;

  const runtimeStr = activeMovie.runtime
    ? `${Math.floor(activeMovie.runtime / 60)}h ${activeMovie.runtime % 60}m`
    : null;

  const hasTrailer = activeMovie.trailer && mode !== "poster";

  return (
    <section className="relative h-[100svh] min-h-[640px] w-full overflow-hidden">
      {/* Background container */}
      <div className="absolute inset-0" style={{ transform: `translateY(${offset}px)` }}>
        <img
          src={bg}
          alt={activeMovie.title}
          className={`absolute inset-0 h-full w-full object-cover animate-slow-zoom transition-opacity duration-1000 ${
            videoReady && hasTrailer ? "opacity-0" : "opacity-100"
          }`}
          style={{ filter: "brightness(1.35)" }}
        />
        {hasTrailer && (
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div
              id="hero-player"
              className="absolute left-1/2 top-1/2 h-[56.25vw] min-h-[100%] w-[177.78vh] min-w-[100%] -translate-x-1/2 -translate-y-1/2"
              style={{ filter: "brightness(1.48) contrast(1.05)", pointerEvents: "none" }}
            />
          </div>
        )}
      </div>

      {/* Cinematic gradients — lightened dynamically when video starts playing to make it brighter */}
      <div className={`absolute inset-0 transition-all duration-1000 ${
        videoReady && hasTrailer
          ? "bg-gradient-to-r from-noir-950/85 via-noir-950/30 to-transparent"
          : "bg-gradient-to-r from-noir-950 via-noir-950/70 to-transparent"
      }`} />
      <div className={`absolute inset-0 transition-all duration-1000 ${
        videoReady && hasTrailer
          ? "bg-gradient-to-t from-noir-950/75 via-transparent to-noir-950/15"
          : "bg-gradient-to-t from-noir-950 via-transparent to-noir-950/40"
      }`} />
      <div className={`absolute inset-0 transition-all duration-1000 ${
        videoReady && hasTrailer ? "bg-noir-950/0" : "bg-noir-950/20"
      }`} />

      {/* Hero Content Grid */}
      <div className="relative z-10 flex h-full items-center">
        <div className="mx-auto w-full max-w-7xl px-6 sm:px-10 flex flex-col lg:flex-row lg:items-center justify-between gap-12 pt-20">
          
          {/* Left Details */}
          <div className="max-w-2xl flex-1">
            <motion.div
              key={`badge-${activeMovie.id}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="mb-6 inline-flex items-center gap-2.5 rounded-full border border-accent/30 bg-accent/10 px-4 py-1.5 backdrop-blur-md"
            >
              <span className="h-1.5 w-1.5 animate-pulse-glow rounded-full bg-accent" />
              <span className="text-[11px] font-semibold uppercase tracking-wider2 text-white/85">
                {activeMovie.badge || "Trending Movie"}
              </span>
            </motion.div>

            <motion.h1
              key={`title-${activeMovie.id}`}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="display text-[clamp(2.2rem,7vw,5.5rem)] leading-none text-white drop-shadow-[0_4px_30px_rgba(0,0,0,0.6)]"
            >
              {activeMovie.title}
            </motion.h1>

            {activeMovie.overview && (
              <motion.p
                key={`desc-${activeMovie.id}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.25 }}
                className="mt-5 max-w-xl text-[15px] leading-relaxed text-white/65 line-clamp-3 sm:text-base"
              >
                {activeMovie.overview}
              </motion.p>
            )}

            <motion.div
              key={`metadata-${activeMovie.id}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-white/55"
            >
              {activeMovie.rating > 0 && (
                <>
                  <span className="flex items-center gap-1.5 font-semibold text-gold">
                    <Star className="text-gold" size={14} /> {activeMovie.rating.toFixed(1)}
                  </span>
                  <span className="h-3 w-px bg-white/20" />
                </>
              )}
              {activeMovie.genres?.length > 0 && (
                <>
                  <span>{activeMovie.genres.join(" · ")}</span>
                  <span className="h-3 w-px bg-white/20" />
                </>
              )}
              {runtimeStr && (
                <>
                  <span className="flex items-center gap-1.5">
                    <Clock size={13} /> {runtimeStr}
                  </span>
                  <span className="h-3 w-px bg-white/20" />
                </>
              )}
              {activeMovie.year && <span>{activeMovie.year}</span>}
            </motion.div>

            <motion.div
              key={`buttons-${activeMovie.id}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="mt-9 flex flex-wrap items-center gap-3"
            >
              <button
                onClick={() => onPlayTrailer(activeMovie.id, activeMovie.title)}
                className="btn-accent px-8 py-3.5 text-[15px]"
                disabled={!activeMovie.trailer}
              >
                <Play size={17} /> Watch Trailer
              </button>
              <button
                onClick={() => toggleWatchlist(activeMovie)}
                className="btn-ghost px-7 py-3.5 text-[15px]"
              >
                {saved ? <Check size={17} /> : <Plus size={17} />}
                {saved ? "In Watchlist" : "Add to Watchlist"}
              </button>
            </motion.div>
          </div>

          {/* Right Selector Cards Stack */}
          <div className="hidden lg:flex flex-col gap-4 w-72 shrink-0 max-w-md">
            <span className="text-xs font-bold uppercase tracking-wider text-white/45 pl-1">
              Trending Spotlight
            </span>
            <div className="flex flex-col gap-3 max-h-[380px] overflow-y-auto no-scrollbar scroll-smooth">
              {enrichedMovies.map((m, idx) => {
                const isActive = idx === activeIdx;
                return (
                  <button
                    key={m.id}
                    ref={isActive ? activeCardRef : null}
                    onClick={() => handleSelectMovie(idx)}
                    className={`flex items-center gap-3.5 p-3 rounded-2xl transition-all duration-300 text-left border ${
                      isActive
                        ? "border-accent/40 bg-white/10 shadow-float"
                        : "border-white/5 bg-white/[0.02] hover:border-white/15 hover:bg-white/[0.04]"
                    }`}
                  >
                    <img
                      src={posterUrl(m.poster, "w92") || heroFallback}
                      alt={m.title}
                      className="w-11 h-15 object-cover rounded-lg shadow-md shrink-0 border border-white/10"
                    />
                    <div className="min-w-0 flex-1">
                      <h4 className="font-semibold text-sm text-white truncate">{m.title}</h4>
                      <p className="text-xs text-white/50 mt-1">
                        {m.rating > 0 && `★ ${m.rating.toFixed(1)}`}
                        {m.year && ` • ${m.year}`}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

        </div>
      </div>

      {/* Floating Audio Control Button (Bottom Right) */}
      {hasTrailer && videoReady && (
        <button
          onClick={toggleMute}
          className="absolute bottom-10 right-10 z-20 flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-black/40 text-white backdrop-blur-md transition hover:scale-105 hover:bg-black/60 hover:border-white/30"
          aria-label={isMuted ? "Unmute trailer" : "Mute trailer"}
        >
          {isMuted ? <VolumeMute size={18} /> : <Volume size={18} />}
        </button>
      )}
    </section>
  );
}
