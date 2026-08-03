import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createPortal } from "react-dom";
import { Close } from "./icons";

// Load the YouTube IFrame Player API exactly once and resolve when it's ready.
// We use the API (instead of a raw <iframe>) so we can listen for playback
// errors — codes 101 / 150 mean the video owner disabled embedding, which is
// exactly the "blocked due to claimed content" case we want to fall back from.
let ytApiPromise = null;
function loadYouTubeApi() {
  if (typeof window === "undefined") return Promise.resolve(null);
  if (window.YT && window.YT.Player) return Promise.resolve(window.YT);
  if (ytApiPromise) return ytApiPromise;

  ytApiPromise = new Promise((resolve) => {
    const prev = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      if (typeof prev === "function") prev();
      resolve(window.YT);
    };
    const tag = document.createElement("script");
    tag.src = "https://www.youtube.com/iframe_api";
    document.head.appendChild(tag);
  });
  return ytApiPromise;
}

// Premium cinematic trailer modal — scale + fade in, full-page blur,
// glass video frame with a subtle glowing border.
export default function TrailerModal({ open, onClose, trailers, title }) {
  const list = Array.isArray(trailers) ? trailers.filter((t) => t?.key) : [];
  const mountRef = useRef(null);
  const [index, setIndex] = useState(0);
  const [failedAll, setFailedAll] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  // Whenever a new trailer set is opened, restart from the best candidate.
  useEffect(() => {
    if (open) {
      setIndex(0);
      setFailedAll(false);
    }
  }, [open, trailers]);

  // Mount a YouTube player for the current candidate. On an embed/playback
  // error, automatically advance to the next candidate; if none are left,
  // show the "Watch on YouTube" fallback.
  useEffect(() => {
    if (!open || failedAll) return;
    const current = list[index];
    if (!current) {
      setFailedAll(true);
      return;
    }

    let cancelled = false;
    let player = null;
    let stuckTimer = null;

    const advance = () => {
      if (cancelled) return;
      cancelled = true;
      if (stuckTimer) clearTimeout(stuckTimer);
      if (index + 1 < list.length) {
        setIndex((i) => i + 1);
      } else {
        setFailedAll(true);
      }
    };

    loadYouTubeApi().then((YT) => {
      if (cancelled || !YT || !mountRef.current) return;
      player = new YT.Player(mountRef.current, {
        videoId: current.key,
        playerVars: { autoplay: 1, rel: 0, modestbranding: 1, playsinline: 1 },
        events: {
          // Explicitly kick off playback — clicking "Watch Trailer" and creating
          // the player are async, so the gesture chain is broken and autoplay
          // can otherwise stall on a black frame for some videos.
          onReady: (e) => {
            if (cancelled) return;
            if (stuckTimer) clearTimeout(stuckTimer);
            stuckTimer = null;
            try {
              e.target.playVideo();
            } catch {
              /* ignore — user can press play */
            }
          },
          // 101 & 150: embedding disabled by owner. 2/5/100: bad/unplayable.
          onError: advance,
        },
      });

      // Safety net: if a candidate neither becomes ready nor errors (silently
      // stuck embed), fall back to the next trailer so the modal never hangs.
      stuckTimer = setTimeout(advance, 8000);
    });

    return () => {
      cancelled = true;
      if (stuckTimer) clearTimeout(stuckTimer);
      try {
        if (player && player.destroy) player.destroy();
      } catch {
        /* player already torn down */
      }
    };
  }, [open, index, failedAll, trailers]);

  // External "Watch on YouTube" link. Prefer the specific trailer video when we
  // have a key; otherwise (no embeddable trailer at all) fall back to a YouTube
  // search for the movie title so the user is never left at a dead end.
  const watchKey = list[0]?.key || null;
  const youtubeUrl = watchKey
    ? `https://www.youtube.com/watch?v=${watchKey}`
    : `https://www.youtube.com/results?search_query=${encodeURIComponent(
        `${title || ""} trailer`.trim()
      )}`;

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35 }}
          onClick={onClose}
        >
          {/* premium dark glassmorphism blur overlay */}
          <div className="absolute inset-0 bg-black/65 backdrop-blur-[6px]" />

          <motion.div
            className="relative w-full max-w-5xl"
            initial={{ scale: 0.9, y: 24, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.92, y: 16, opacity: 0 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-end">
              <button
                onClick={onClose}
                aria-label="Close trailer"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/[0.05] text-white/80 backdrop-blur-md transition hover:bg-white/15 hover:text-white hover:rotate-90 duration-300"
              >
                <Close />
              </button>
            </div>

            <div className="relative overflow-hidden rounded-2xl border border-white/15 shadow-float ring-1 ring-accent/20">
              {/* glowing border accent */}
              <div className="pointer-events-none absolute -inset-px rounded-2xl shadow-[0_0_60px_-10px_rgba(190,26,26,0.55)]" />
              <div className="aspect-video w-full bg-black">
                {failedAll ? (
                  <div className="flex h-full flex-col items-center justify-center gap-4 px-6 text-center">
                    <p className="text-white/50">Trailer unavailable inside CineVerse</p>
                    <a
                      href={youtubeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-accent"
                    >
                      Watch on YouTube
                    </a>
                  </div>
                ) : list.length ? (
                  // YouTube IFrame API replaces this node with the player iframe.
                  // `key={index}` forces a fresh node for each fallback attempt.
                  <div key={index} ref={mountRef} className="h-full w-full" />
                ) : (
                  <div className="flex h-full items-center justify-center text-white/40">
                    Trailer unavailable
                  </div>
                )}
              </div>
            </div>

            {title && (
              <p className="mt-4 text-center text-sm text-white/50">{title}</p>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
