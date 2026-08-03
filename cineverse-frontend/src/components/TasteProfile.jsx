import { motion } from "framer-motion";
import useAsync from "../lib/useAsync";
import { getTasteProfile } from "../lib/api";



// Animated taste-profile bars — gold percentage indicators in a glass card.
// Designed to consume the future recommendation engine's preference vector.
export default function TasteProfile() {
  const { data, loading } = useAsync(getTasteProfile, [], []);
  return (
    <div className="rounded-3xl glass-strong p-7 sm:p-9">
      <div className="mb-7 flex items-center justify-between">
        <div>
          <span className="eyebrow text-accent/90">Your Taste Profile</span>
          <h3 className="display mt-2 text-2xl text-white">The shape of your taste</h3>
        </div>
        <span className="rounded-full border border-gold/30 bg-gold/5 px-3 py-1 text-[11px] font-semibold text-gold">
          AI Learned
        </span>
      </div>

      <div className="space-y-5">
        {(!data || data.length === 0) && (
          <p className="text-[13px] leading-relaxed text-white/40">
            {loading
              ? "Learning your taste profile…"
              : "No taste profile yet — watch, save, and rate films to build one."}
          </p>
        )}
        {(data || []).map((row, i) => (
          <div key={row.genre ?? i}>
            <div className="mb-2 flex items-center justify-between text-sm">
              <span className="font-medium text-white/80">{row.genre}</span>
              <span className="font-bold text-gold">{row.percentage}%</span>
            </div>
            <div className="h-2.5 w-full overflow-hidden rounded-full bg-white/[0.06]">
              <motion.div
                initial={{ width: 0 }}
                whileInView={{ width: `${row.percentage}%` }}
                viewport={{ once: true }}
                transition={{ duration: 1.1, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
                className="h-full rounded-full bg-gradient-to-r from-accent via-accent-alt to-gold"
              />
            </div>
          </div>
        ))}
      </div>

      <p className="mt-7 text-[13px] leading-relaxed text-white/40">
        CineVerse continuously refines this profile from the films you watch, save,
        and rate — so every recommendation feels written for you.
      </p>
    </div>
  );
}
