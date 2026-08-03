const prompts = [
  "Recommend five thoughtful sci-fi movies with emotional depth",
  "Find me tense thrillers with smart twists",
  "Suggest comfort movies for a rainy night",
  "Give me visually stunning world cinema",
];

function DiscoveryHub({ onPromptClick, disabled = false }) {
  return (
    <div className="mt-7 flex w-full max-w-3xl flex-wrap justify-center gap-3">
      {prompts.map((prompt) => (
        <button
          key={prompt}
          type="button"
          onClick={() => onPromptClick(prompt)}
          disabled={disabled}
          className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-white/65 transition hover:border-accent/40 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          {prompt}
        </button>
      ))}
    </div>
  );
}

export default DiscoveryHub;
