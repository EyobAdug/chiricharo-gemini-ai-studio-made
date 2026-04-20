import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, db } from '../firebase';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';

export type Role = 'admin' | 'seller' | 'buyer';

export interface UserProfile {
  uid: string;
  email: string;
  name: string;
  role: Role;
  status?: 'active' | 'deleted' | 'suspended';
  deletionReason?: string;
  language: 'en' | 'am';
  wishlist?: string[];
  sellerInfo?: {
    address: string;
    phone: string;
    verificationDetails: string;
    status: 'pending' | 'approved' | 'rejected';
  };
  createdAt: string;
}

interface AuthContextType {
  user: FirebaseUser | null;
  profile: UserProfile | null;
  loading: boolean;
  isAuthReady: boolean;
  error?: string;
  refreshProfile: () => Promise<void>;
  toggleWishlist: (productId: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);

  const fetchProfile = async (uid: string, email: string | null) => {
    try {
      const docRef = doc(db, 'users', uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data() as UserProfile;
        
        // Check for suspended account
        if (data.status === 'suspended') {
          setError(data.deletionReason || 'Your account has been suspended by an administrator.');
          setProfile(null);
          auth.signOut();
          return;
        }

        // Check for deleted account (force them to login again to reset profile)
        if (data.status === 'deleted') {
          setProfile(null);
          auth.signOut();
          return;
        }

        setError(undefined);
        
        // Auto-assign admin role to specific email
        if (email === 'tvandr32@gmail.com' && data.role !== 'admin') {
          await updateDoc(docRef, { role: 'admin' });
          data.role = 'admin';
        }
        
        setProfile(data);
      } else {
        setProfile(null);
        setError(undefined);
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    }
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.uid, user.email);
    }
  };

  const toggleWishlist = async (productId: string) => {
    if (!user || !profile) return;
    try {
      const docRef = doc(db, 'users', user.uid);
      const currentWishlist = profile.wishlist || [];
      const newWishlist = currentWishlist.includes(productId)
        ? currentWishlist.filter(id => id !== productId)
        : [...currentWishlist, productId];
      
      await updateDoc(docRef, { wishlist: newWishlist });
      setProfile({ ...profile, wishlist: newWishlist });
    } catch (error) {
      console.error("Error toggling wishlist:", error);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        await fetchProfile(firebaseUser.uid, firebaseUser.email);
      } else {
        setProfile(null);
        setError(undefined);
      }
      setLoading(false);
      setIsAuthReady(true);
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, profile, loading, isAuthReady, error, refreshProfile, toggleWishlist }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
