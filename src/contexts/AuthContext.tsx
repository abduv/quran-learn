import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  type User,
} from "firebase/auth";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { auth, db, firebaseReady } from "../lib/firebase";

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  signInEmail: (email: string, password: string) => Promise<void>;
  signUpEmail: (email: string, password: string) => Promise<void>;
  signInGoogle: () => Promise<void>;
  signOutUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

async function ensureUserDoc(user: User) {
  const ref = doc(db, "users", user.uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    await setDoc(ref, {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      createdAt: serverTimestamp(),
    });
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!firebaseReady) {
      setLoading(false);
      return;
    }
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) await ensureUserDoc(u);
      setLoading(false);
    });
    return unsub;
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      signInEmail: async (email, password) => {
        await signInWithEmailAndPassword(auth, email, password);
      },
      signUpEmail: async (email, password) => {
        const cred = await createUserWithEmailAndPassword(auth, email, password);
        await ensureUserDoc(cred.user);
      },
      signInGoogle: async () => {
        const cred = await signInWithPopup(auth, new GoogleAuthProvider());
        await ensureUserDoc(cred.user);
      },
      signOutUser: async () => {
        await signOut(auth);
      },
    }),
    [user, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
