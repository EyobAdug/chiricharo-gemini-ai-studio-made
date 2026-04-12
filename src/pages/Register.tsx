import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { useLanguage } from '../context/LanguageContext';
import { Mail, Lock, User, AlertCircle, Store, ShoppingBag } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { refreshProfile } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<'buyer' | 'seller'>('buyer');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleError = (err: any) => {
    if (err.code === 'auth/operation-not-allowed') {
      setError('Email/Password registration is not enabled. Please use Google Sign Up or enable it in Firebase Console.');
    } else if (err.code === 'auth/network-request-failed') {
      setError('Network error: Your browser, adblocker, or VPN is blocking the connection to Google. Please disable adblockers/shields and try again.');
    } else {
      setError(err.message || 'Failed to register');
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        email: user.email,
        name,
        role,
        language: 'en',
        createdAt: new Date().toISOString(),
        ...(role === 'seller' ? {
          sellerInfo: {
            status: 'pending',
            address: '',
            phone: '',
            verificationDetails: ''
          }
        } : {})
      });

      await refreshProfile();

      if (role === 'seller') {
        navigate('/seller-verification');
      } else {
        navigate('/');
      }
    } catch (err: any) {
      handleError(err);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleRegister = async () => {
    setError('');
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      
      const docRef = doc(db, 'users', result.user.uid);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        await setDoc(docRef, {
          uid: result.user.uid,
          email: result.user.email,
          name: result.user.displayName || 'User',
          role,
          language: 'en',
          createdAt: new Date().toISOString(),
          ...(role === 'seller' ? {
            sellerInfo: {
              status: 'pending',
              address: '',
              phone: '',
              verificationDetails: ''
            }
          } : {})
        });
      }
      
      await refreshProfile();

      if (role === 'seller' && !docSnap.exists()) {
        navigate('/seller-verification');
      } else {
        navigate('/');
      }
    } catch (err: any) {
      handleError(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900 mb-2">{t('auth.register.title')}</h1>
          <p className="text-gray-600">{t('auth.register.subtitle')}</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl flex items-start gap-3 text-sm font-medium">
            <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
            <p>{error}</p>
          </div>
        )}

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-3">{t('auth.role.select')}</label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setRole('buyer')}
                className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${
                  role === 'buyer' ? 'border-indigo-600 bg-indigo-50 text-indigo-700' : 'border-gray-200 bg-white text-gray-600 hover:border-indigo-200'
                }`}
              >
                <ShoppingBag className="h-6 w-6 mb-2" />
                <span className="text-sm font-bold">{t('auth.role.buyer')}</span>
              </button>
              <button
                type="button"
                onClick={() => setRole('seller')}
                className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${
                  role === 'seller' ? 'border-indigo-600 bg-indigo-50 text-indigo-700' : 'border-gray-200 bg-white text-gray-600 hover:border-indigo-200'
                }`}
              >
                <Store className="h-6 w-6 mb-2" />
                <span className="text-sm font-bold">{t('auth.role.seller')}</span>
              </button>
            </div>
          </div>

          <div className="mt-6">
            <button
              onClick={handleGoogleRegister}
              disabled={loading}
              className="w-full flex justify-center py-4 px-4 border border-gray-300 rounded-xl shadow-sm text-base font-bold text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all disabled:opacity-50 active:scale-[0.98]"
            >
              <svg className="h-6 w-6 mr-3" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Continue with Google
            </button>
          </div>
        </div>

        <p className="mt-8 text-center text-sm text-gray-600">
          Already have an account?{' '}
          <Link to="/login" className="font-bold text-indigo-600 hover:text-indigo-500">
            {t('nav.login')}
          </Link>
        </p>
      </div>
    </div>
  );
}
