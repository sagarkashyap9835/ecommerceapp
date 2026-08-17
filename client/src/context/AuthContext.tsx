import React, { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, User as FirebaseUser, signOut as firebaseSignOut } from "firebase/auth";
import { auth } from "../config/firebase";
import api from "../../constants/api";

// Types mimicking Clerk's structure where possible
type ClerkUser = {
  id: string;
  fullName: string;
  firstName: string;
  lastName: string;
  username: string | null;
  emailAddresses: { emailAddress: string }[];
  primaryEmailAddress: { emailAddress: string } | null;
  imageUrl: string;
  publicMetadata: { role?: string };
  reload: () => Promise<void>;
};

type AuthContextType = {
  isLoaded: boolean;
  isSignedIn: boolean;
  user: ClerkUser | null;
  getToken: () => Promise<string | null>;
  signOut: () => Promise<void>;
  firstOrderOffer: any;
  refetchFirstOrderOffer: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  isLoaded: false,
  isSignedIn: false,
  user: null,
  getToken: async () => null,
  signOut: async () => { },
  firstOrderOffer: null,
  refetchFirstOrderOffer: async () => { },
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [userRole, setUserRole] = useState<string | undefined>(undefined);
  const [isLoaded, setIsLoaded] = useState(false);
  const [firstOrderOffer, setFirstOrderOffer] = useState<any>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user);
      if (user) {
        try {
          // Fetch token and force refresh to get latest claims if needed, but normally getIdTokenResult() is fine.
          const tokenResult = await user.getIdTokenResult();

          if (tokenResult.claims.role) {
            setUserRole(tokenResult.claims.role as string);
          } else {
            // If no claim is found, default to 'user'
            setUserRole('user');
          }

          // Fetch first order offer
          try {
            const token = await user.getIdToken();
            const firstOfferRes = await api.get("/first-order/eligibility", { headers: { Authorization: `Bearer ${token}` } });
            const offer = firstOfferRes.data;
            if (offer?.success && offer?.eligible && offer?.isEnabled) {
              setFirstOrderOffer(offer);
            } else {
              setFirstOrderOffer(null);
            }
          } catch (e) { setFirstOrderOffer(null); }

        } catch (e) {
          console.error("Failed to fetch user role from Firebase", e);
          setUserRole('user');
        }
      } else {
        setUserRole(undefined);
        setFirstOrderOffer(null);
      }
      setIsLoaded(true);
    });

    return () => unsubscribe();
  }, []);

  const refetchFirstOrderOffer = async () => {
    if (firebaseUser) {
      try {
        const token = await firebaseUser.getIdToken();
        const firstOfferRes = await api.get("/first-order/eligibility", { headers: { Authorization: `Bearer ${token}` } });
        const offer = firstOfferRes.data;
        if (offer?.success && offer?.eligible && offer?.isEnabled) {
          setFirstOrderOffer(offer);
        } else {
          setFirstOrderOffer(null);
        }
      } catch (e) { setFirstOrderOffer(null); }
    }
  };

  const getToken = async () => {
    if (firebaseUser) {
      return await firebaseUser.getIdToken();
    }
    return null;
  };

  const signOut = async () => {
    await firebaseSignOut(auth);
  };

  // Map Firebase User to Clerk-like User object
  const clerkUser: ClerkUser | null = firebaseUser ? {
    id: firebaseUser.uid,
    fullName: firebaseUser.displayName || "User",
    firstName: firebaseUser.displayName?.split(" ")[0] || "User",
    lastName: firebaseUser.displayName?.split(" ").slice(1).join(" ") || "",
    username: firebaseUser.email?.split("@")[0] || "user",
    emailAddresses: firebaseUser.email ? [{ emailAddress: firebaseUser.email }] : [],
    primaryEmailAddress: firebaseUser.email ? { emailAddress: firebaseUser.email } : null,
    imageUrl: firebaseUser.photoURL || "",
    publicMetadata: { role: userRole },
    reload: async () => {
      await firebaseUser.reload();
      const tokenResult = await firebaseUser.getIdTokenResult(true);
      if (tokenResult.claims.role) {
        setUserRole(tokenResult.claims.role as string);
      }
    }
  } : null;

  return (
    <AuthContext.Provider
      value={{
        isLoaded,
        isSignedIn: !!firebaseUser,
        user: clerkUser,
        getToken,
        signOut,
        firstOrderOffer,
        refetchFirstOrderOffer,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Hooks mimicking Clerk's exports
export const useAuth = () => {
  const context = useContext(AuthContext);
  return {
    isLoaded: context.isLoaded,
    isSignedIn: context.isSignedIn,
    getToken: context.getToken,
    signOut: context.signOut,
    firstOrderOffer: context.firstOrderOffer,
    refetchFirstOrderOffer: context.refetchFirstOrderOffer,
  };
};

export const useUser = () => {
  const context = useContext(AuthContext);
  return {
    isLoaded: context.isLoaded,
    isSignedIn: context.isSignedIn,
    user: context.user,
  };
};
