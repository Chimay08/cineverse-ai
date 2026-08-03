import { createContext, useContext, useEffect, useState, useCallback } from "react";
import * as apiLib from "../lib/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [watchlist, setWatchlist] = useState([]); // array of {id,title,poster}
  const [ready, setReady] = useState(false);

  // Restore session from localStorage on boot.
  useEffect(() => {
    try {
      const t = localStorage.getItem("cv_token");
      const u = localStorage.getItem("cv_user");
      const w = localStorage.getItem("cv_watchlist");
      if (t) setToken(t);
      if (u) setUser(JSON.parse(u));
      if (w) setWatchlist(JSON.parse(w));
    } catch {
      /* ignore corrupt storage */
    }
    setReady(true);
  }, []);

  // Fetch watchlist from backend once authenticated.
  useEffect(() => {
    if (token) {
      apiLib.getWatchlist()
        .then((movies) => {
          setWatchlist(movies);
          localStorage.setItem("cv_watchlist", JSON.stringify(movies));
        })
        .catch((err) => {
          console.error("Failed to load watchlist from backend:", err);
        });
    } else {
      setWatchlist([]);
      localStorage.removeItem("cv_watchlist");
    }
  }, [token]);

  const persist = (t, u) => {
    if (t) localStorage.setItem("cv_token", t);
    if (u) localStorage.setItem("cv_user", JSON.stringify(u));
  };

  const signIn = useCallback(async ({ email, password }) => {
    const data = await apiLib.login({ email, password });
    setToken(data.token);
    setUser(data.user);
    persist(data.token, data.user);
    return data;
  }, []);

  const signUp = useCallback(async ({ username, email, password }) => {
    await apiLib.register({ username, email, password });
    // auto sign-in after register
    return signIn({ email, password });
  }, [signIn]);

  const signOut = useCallback(() => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("cv_token");
    localStorage.removeItem("cv_user");
  }, []);

  const isInWatchlist = useCallback(
    (id) => watchlist.some((m) => String(m.id) === String(id)),
    [watchlist]
  );

  const toggleWatchlist = useCallback(
    async (movie) => {
      const exists = watchlist.some((m) => String(m.id) === String(movie.id));
      let next;
      if (exists) {
        next = watchlist.filter((m) => String(m.id) !== String(movie.id));
        if (token) apiLib.removeFromWatchlist(movie.id).catch(() => {});
      } else {
        next = [...watchlist, { id: movie.id, title: movie.title, poster: movie.poster }];
        if (token) apiLib.addToWatchlist(movie).catch(() => {});
      }
      setWatchlist(next);
      localStorage.setItem("cv_watchlist", JSON.stringify(next));
      return !exists;
    },
    [watchlist, token]
  );

  const value = {
    user,
    token,
    ready,
    isAuthed: !!token,
    watchlist,
    signIn,
    signUp,
    signOut,
    isInWatchlist,
    toggleWatchlist,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
