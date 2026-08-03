import { useEffect } from "react";
import { Link } from "react-router-dom";

const COLS = [
  { title: "Discover", links: [["Home", "/"], ["Movies", "/movies"], ["Genres", "/genres"], ["Explore", "/explore"]] },
  { title: "Genres", links: [["Sci-Fi", "/genres/sci-fi"], ["Thriller", "/genres/thriller"], ["Drama", "/genres/drama"], ["Horror", "/genres/horror"]] },
  { title: "Account", links: [["Sign In", "/signin"], ["Dashboard", "/dashboard"], ["Watchlist", "/dashboard"]] },
];

export default function Footer() {
  useEffect(() => {
    let vantaEffect = null;
    const initVanta = () => {
      if (window.VANTA && window.VANTA.CLOUDS2) {
        vantaEffect = window.VANTA.CLOUDS2({
          el: "#vanta-footer-bg",
          mouseControls: true,
          touchControls: true,
          gyroControls: false,
          minHeight: 200.00,
          minWidth: 200.00,
          scale: 1.00,
          texturePath: "/noise.png",
          skyColor: 0x3a9cc6,
          cloudColor: 0xffffff,
          cloudShadowColor: 0x1b354f,
          sunColor: 0xff9900,
          sunGlareColor: 0xff3300,
          sunlightColor: 0xff9900
        });
      }
    };

    if (window.VANTA && window.VANTA.CLOUDS2) {
      initVanta();
    } else {
      const checkInterval = setInterval(() => {
        if (window.VANTA && window.VANTA.CLOUDS2) {
          initVanta();
          clearInterval(checkInterval);
        }
      }, 100);
      return () => clearInterval(checkInterval);
    }

    return () => {
      if (vantaEffect && typeof vantaEffect.destroy === "function") {
        vantaEffect.destroy();
      }
    };
  }, []);

  return (
    <footer className="relative mt-24 border-t border-white/[0.06] bg-noir-950 overflow-hidden">
      <div id="vanta-footer-bg" className="absolute inset-0 -z-10 opacity-30 pointer-events-none" />
      <div className="absolute inset-x-0 top-0 h-px bg-gold-line opacity-30" />
      <div className="mx-auto max-w-7xl px-6 py-16 sm:px-10">
        <div className="grid grid-cols-2 gap-10 md:grid-cols-5">
          <div className="col-span-2">
            <Link to="/" className="display text-2xl text-white">
              Cine<span className="text-accent">Verse</span>
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-white/45">
              Redefining the cinematic experience. A premium intelligent movie
              discovery platform for people who deeply love cinema.
            </p>
            <p className="mt-6 text-xs text-white/30">
              Movie data powered by TMDB. This product uses the TMDB API but is not
              endorsed or certified by TMDB.
            </p>
          </div>
          {COLS.map((col) => (
            <div key={col.title}>
              <h4 className="mb-4 text-xs font-semibold uppercase tracking-wider text-white/40">
                {col.title}
              </h4>
              <ul className="space-y-2.5">
                {col.links.map(([label, to]) => (
                  <li key={label}>
                    <Link
                      to={to}
                      className="text-sm text-white/55 transition hover:text-white"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-white/[0.06] pt-7 sm:flex-row">
          <p className="text-xs text-white/35">
            © {new Date().getFullYear()} CineVerse. Crafted for people who love film.
          </p>
          <p className="text-xs uppercase tracking-wider2 text-white/25">
            Redefining the cinematic experience
          </p>
        </div>
      </div>
    </footer>
  );
}
