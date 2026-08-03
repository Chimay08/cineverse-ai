function MovieDNA() {
  return (
    <div className="mt-12 w-full max-w-3xl rounded-[2rem] border border-white/10 bg-white/[0.03] p-6 text-left shadow-float backdrop-blur-xl">
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-accent/80">
        Movie DNA
      </p>
      <h2 className="mt-3 text-2xl font-semibold text-white">
        Your taste profile will appear here.
      </h2>
      <p className="mt-3 text-sm leading-6 text-white/55">
        Concierge will use genres, directors, actors, and mood signals to shape recommendations.
      </p>
    </div>
  );
}

export default MovieDNA;
