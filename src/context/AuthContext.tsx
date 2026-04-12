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
        
        // Check for suspended or deleted account
        if (data.status === 'suspended' || data.status === 'deleted') {
          setError(data.deletionReason || 'Your account has been suspended or deleted by an administrator.');
          setProfile(null);
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
    <AuthContext.Provider value={{ user, profile, loading, isAuthReady, error, refreshProfile }}>
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
