import {
  createContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import type { User } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

import { db } from "../firebase/firebase";
import {
  login,
  logout,
  subscribeToAuthChanges,
} from "../firebase/auth";

export interface AuthContextType {
  user: User | null;
  role: "admin" | "user" | null;
  loading: boolean;

  loginUser: (email: string, password: string) => Promise<void>;
  logoutUser: () => Promise<void>;
}

// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);

  const [role, setRole] = useState<"admin" | "user" | null>(null);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = subscribeToAuthChanges(async (firebaseUser) => {
      setLoading(true);

      if (!firebaseUser) {
        setUser(null);
        setRole(null);
        setLoading(false);
        return;
      }

      setUser(firebaseUser);

      try {
        const userRef = doc(db, "users", firebaseUser.uid);

        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          const data = userSnap.data();

          setRole((data.role as "admin" | "user") ?? "user");
        } else {
          setRole("user");
        }
      } catch (error) {
        console.error("Error fetching user role:", error);
        setRole("user");
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loginUser = async (
    email: string,
    password: string
  ): Promise<void> => {
    await login(email, password);
  };

  const logoutUser = async (): Promise<void> => {
    await logout();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        loading,
        loginUser,
        logoutUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};