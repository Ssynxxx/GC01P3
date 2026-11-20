import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { storage } from "../config/storage";
import client, { TOKEN_KEY } from "../config/apollo";

const USER_KEY = "currentUser";
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [state, setState] = useState({ loading: true, token: null, user: null });

  // restore session on app start
  useEffect(() => {
    (async () => {
      try {
        const [token, rawUser] = await Promise.all([
          storage.getItem(TOKEN_KEY),
          storage.getItem(USER_KEY),
        ]);
        if (token && rawUser) {
          setState({ loading: false, token, user: JSON.parse(rawUser) });
          return;
        }
      } catch {
        /* fall through to logged-out state */
      }
      setState({ loading: false, token: null, user: null });
    })();
  }, []);

  const signIn = useCallback(async (token, user) => {
    await storage.setItem(TOKEN_KEY, token);
    await storage.setItem(USER_KEY, JSON.stringify(user));
    await client.clearStore();
    setState({ loading: false, token, user });
  }, []);

  const signOut = useCallback(async () => {
    await storage.removeItem(TOKEN_KEY);
    await storage.removeItem(USER_KEY);
    await client.clearStore();
    setState({ loading: false, token: null, user: null });
  }, []);

  const value = useMemo(() => ({ ...state, signIn, signOut }), [state, signIn, signOut]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
