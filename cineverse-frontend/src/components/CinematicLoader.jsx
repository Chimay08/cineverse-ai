import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

export default function CinematicLoader({ onComplete }) {
  const [phase, setPhase] = useState("line-expand"); // "line-expand" | "logo-glow" | "split-open" | "complete"

  useEffect(() => {
    // Phase 1: Line expanding horizontally (0s to 0.85s)
    const t1 = setTimeout(() => {
      setPhase("logo-glow");
    }, 850);

    // Phase 2: Logo glowing and pulsing inside the narrow slit (0.85s to 2.1s)
    const t2 = setTimeout(() => {
      setPhase("split-open");
    }, 2100);

    // Phase 3: The letterbox bars split open vertically (2.1s to 2.85s)
    const t3 = setTimeout(() => {
      setPhase("complete");
      if (onComplete) onComplete();
    }, 2850);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [onComplete]);

  if (phase === "complete") return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden bg-noir-950">
      {/* Top shutter/bar */}
      <motion.div
        className="absolute top-0 left-0 w-full bg-noir-950 border-b border-accent/20"
        initial={{ height: "50vh" }}
        animate={{
          height: phase === "split-open" ? "0vh" : "50vh",
        }}
        transition={{
          duration: 0.75,
          ease: [0.76, 0, 0.24, 1], // Custom cinematic cubic bezier
        }}
      />

      {/* Bottom shutter/bar */}
      <motion.div
        className="absolute bottom-0 left-0 w-full bg-noir-950 border-t border-accent/20"
        initial={{ height: "50vh" }}
        animate={{
          height: phase === "split-open" ? "0vh" : "50vh",
        }}
        transition={{
          duration: 0.75,
          ease: [0.76, 0, 0.24, 1],
        }}
      />

      {/* The "Narrow Place" Slit Container */}
      <div className="relative flex items-center justify-center w-full h-[80px] pointer-events-none z-10">
        {/* Horizontal Laser Glowing Line */}
        <motion.div
          className="absolute h-[2px] bg-accent shadow-[0_0_15px_#BE1A1A,0_0_30px_#BE1A1A]"
          initial={{ width: "0%" }}
          animate={{
            width: phase === "split-open" ? "0%" : "100%",
          }}
          transition={{
            duration: phase === "split-open" ? 0.4 : 0.8,
            ease: "easeInOut",
          }}
        />

        {/* Cinematic Logo Text */}
        <AnimatePresence>
          {phase === "logo-glow" && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              transition={{ duration: 0.45, ease: "easeOut" }}
              className="flex flex-col items-center justify-center text-center"
            >
              <h1 className="display text-4xl sm:text-5xl md:text-6xl text-white tracking-[0.35em] pl-[0.35em] drop-shadow-[0_0_20px_rgba(255,255,255,0.4)]">
                CINE<span className="text-accent drop-shadow-[0_0_25px_#BE1A1A]">VERSE</span>
              </h1>
              <p className="text-[9px] sm:text-[10px] font-semibold uppercase tracking-[0.4em] pl-[0.4em] text-white/50 mt-1.5 animate-pulse-glow">
                Preparing the projector
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Ambient center glow */}
      <motion.div
        className="absolute w-[500px] h-[150px] bg-accent/15 rounded-full blur-[80px] pointer-events-none"
        initial={{ scale: 0, opacity: 0 }}
        animate={{
          scale: phase === "logo-glow" ? 1 : 0,
          opacity: phase === "logo-glow" ? 1 : 0,
        }}
        transition={{ duration: 0.5 }}
      />
    </div>
  );
}
