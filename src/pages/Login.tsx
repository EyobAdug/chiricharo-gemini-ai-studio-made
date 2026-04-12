import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  signInWithEmailAndPassword, 
  signInWithPopup, 
  GoogleAuthProvider,
  getMultiFactorResolver,
  PhoneAuthProvider,
  PhoneMultiFactorGenerator,
  RecaptchaVerifier,
  MultiFactorResolver,
  MultiFactorError
} from 'firebase/auth';
import { auth, db } from '../firebase';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, AlertCircle, ShieldCheck } from 'lucide-react';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export default function Login() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { error: authError } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  // MFA State
  const [isMfaStep, setIsMfaStep] = useState(false);
  const [mfaResolver, setMfaResolver] = useState<MultiFactorResolver | null>(null);
  const [verificationId, setVerificationId] = useState('');
  const [mfaCode, setMfaCode] = useState('');
  const [mfaLoading, setMfaLoading] = useState(false);
  const recaptchaRef = useRef<HTMLDivElement>(null);
  const recaptchaVerifier = useRef<RecaptchaVerifier | null>(null);

  useEffect(() => {
    return () => {
      if (recaptchaVerifier.current) {
        recaptchaVerifier.current.clear();
      }
    };
  }, []);

  const initRecaptcha = () => {
    if (!recaptchaVerifier.current && recaptchaRef.current) {
      recaptchaVerifier.current = new RecaptchaVerifier(auth, recaptchaRef.current, {
        size: 'invisible',
        callback: () => {
          // reCAPTCHA solved, allow signInWithPhoneNumber.
        }
      });
    }
  };

  const handleMfaRequired = async (err: MultiFactorError) => {
    const resolver = getMultiFactorResolver(auth, err);
    setMfaResolver(resolver);
    setIsMfaStep(true);
    
    // For this example, we assume the first hint is a phone number
    const phoneInfoOptions = resolver.hints[0];
    if (phoneInfoOptions.factorId === PhoneMultiFactorGenerator.FACTOR_ID) {
      try {
        initRecaptcha();
        const phoneAuthProvider = new PhoneAuthProvider(auth);
        const vId = await phoneAuthProvider.verifyPhoneNumber(
          {
            multiFactorHint: phoneInfoOptions,
            session: resolver.session
          },
          recaptchaVerifier.current!
        );
        setVerificationId(vId);
      } catch (mfaErr: any) {
        console.error("MFA Error:", mfaErr);
        setError("Failed to send verification code. Please try again.");
      }
    }
  };

  const handleMfaSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mfaResolver || !verificationId || !mfaCode) return;
    
    setMfaLoading(true);
    setError('');
    
    try {
      const cred = PhoneAuthProvider.credential(verificationId, mfaCode);
      const multiFactorAssertion = PhoneMultiFactorGenerator.assertion(cred);
      const result = await mfaResolver.resolveSignIn(multiFactorAssertion);
      
      await handlePostLogin(result.user);
    } catch (err: any) {
      console.error("MFA Resolution Error:", err);
      setError(err.message || "Invalid verification code.");
    } finally {
      setMfaLoading(false);
    }
  };

  const handlePostLogin = async (user: any) => {
    // Check if user profile exists
    const docRef = doc(db, 'users', user.uid);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
      // Create default buyer profile if it doesn't exist
      await setDoc(docRef, {
        uid: user.uid,
        email: user.email,
        name: user.displayName || 'User',
        role: 'buyer',
        status: 'active',
        createdAt: new Date().toISOString()
      });
    } else {
      const data = docSnap.data();
      if (data.status === 'suspended' || data.status === 'deleted') {
        setError(data.deletionReason || 'Your account has been suspended or deleted.');
        await auth.signOut();
        return;
      }
    }
    
    navigate('/');
  };

  const handleError = (err: any) => {
    if (err.code === 'auth/multi-factor-auth-required') {
      handleMfaRequired(err);
      return;
    }
    
    if (err.code === 'auth/operation-not-allowed') {
      setError('Email/Password login is not enabled. Please use Google Login or enable it in Firebase Console.');
    } else if (err.code === 'auth/network-request-failed') {
      setError('Network error: Your browser, adblocker, or VPN is blocking the connection to Google. Please disable adblockers/shields and try again.');
    } else if (err.code === 'auth/unauthorized-domain') {
      setError('This domain is not authorized for Google Sign-In. Please contact the administrator.');
    } else {
      setError(err.message || 'Failed to login');
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      await handlePostLogin(result.user);
    } catch (err: any) {
      handleError(err);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      await handlePostLogin(result.user);
    } catch (err: any) {
      handleError(err);
    } finally {
      setLoading(false);
    }
  };

  const displayError = error || authError;

  if (isMfaStep) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
          <div className="text-center mb-8">
            <div className="h-16 w-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <ShieldCheck className="h-8 w-8 text-indigo-600" />
            </div>
            <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Two-Factor Auth</h1>
            <p className="text-gray-600">Enter the verification code sent to your phone.</p>
          </div>

          {displayError && (
            <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl flex items-start gap-3 text-sm font-medium">
              <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
              <p>{displayError}</p>
            </div>
          )}

          <form onSubmit={handleMfaSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">Verification Code</label>
              <input
                type="text"
                required
                value={mfaCode}
                onChange={(e) => setMfaCode(e.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 px-4 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all"
                placeholder="123456"
              />
            </div>

            <button
              type="submit"
              disabled={mfaLoading}
              className="w-full rounded-full bg-indigo-600 py-4 text-base font-bold text-white hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 disabled:opacity-50 active:scale-[0.98]"
            >
              {mfaLoading ? 'Verifying...' : 'Verify & Sign In'}
            </button>

            <button
              type="button"
              onClick={() => setIsMfaStep(false)}
              className="w-full text-sm font-bold text-gray-500 hover:text-gray-700 transition-all"
            >
              Back to Login
            </button>
          </form>
          <div ref={recaptchaRef}></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900 mb-2">{t('auth.login.title')}</h1>
          <p className="text-gray-600">{t('auth.login.subtitle')}</p>
        </div>

        {displayError && (
          <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl flex items-start gap-3 text-sm font-medium">
            <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
            <p>{displayError}</p>
          </div>
        )}

        <div className="mt-6">
          <button
            onClick={handleGoogleLogin}
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

        <p className="mt-8 text-center text-sm text-gray-600">
          Don't have an account?{' '}
          <Link to="/register" className="font-bold text-indigo-600 hover:text-indigo-500">
            {t('nav.register')}
          </Link>
        </p>
      </div>
      <div ref={recaptchaRef}></div>
    </div>
  );
}
