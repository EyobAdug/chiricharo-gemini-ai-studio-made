import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { ShieldCheck, MapPin, Phone, FileText, AlertCircle } from 'lucide-react';

export default function SellerVerification() {
  const { t } = useLanguage();
  const { user, profile, refreshProfile } = useAuth();
  const navigate = useNavigate();
  
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [verificationDetails, setVerificationDetails] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !profile) return;

    setLoading(true);
    setError('');

    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        'sellerInfo.address': address,
        'sellerInfo.phone': phone,
        'sellerInfo.verificationDetails': verificationDetails,
        'sellerInfo.status': 'pending' // Remains pending until admin approves
      });
      
      await refreshProfile();
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Failed to submit verification details');
    } finally {
      setLoading(false);
    }
  };

  if (profile?.sellerInfo?.status === 'approved') {
    navigate('/dashboard');
    return null;
  }

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-12">
      <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
        <div className="bg-indigo-600 px-8 py-12 text-center text-white">
          <div className="mx-auto h-16 w-16 bg-white/20 rounded-full flex items-center justify-center mb-6 backdrop-blur-sm">
            <ShieldCheck className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-extrabold mb-4">{t('seller.info.title')}</h1>
          <p className="text-indigo-100 max-w-xl mx-auto leading-relaxed">
            {t('seller.info.desc')}
          </p>
        </div>

        <div className="p-8">
          {error && (
            <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl flex items-center gap-3 text-sm font-medium">
              <AlertCircle className="h-5 w-5" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">{t('seller.info.address')}</label>
              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pl-12 pr-4 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all"
                  placeholder="123 Main St, Addis Ababa"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">{t('seller.info.phone')}</label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pl-12 pr-4 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all"
                  placeholder="+251 911 234 567"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">{t('seller.info.details')}</label>
              <div className="relative">
                <FileText className="absolute left-4 top-4 h-5 w-5 text-gray-400" />
                <textarea
                  required
                  rows={4}
                  value={verificationDetails}
                  onChange={(e) => setVerificationDetails(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pl-12 pr-4 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all"
                  placeholder="Business License Number, TIN, etc."
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-full bg-indigo-600 py-4 text-base font-bold text-white hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? '...' : t('seller.info.submit')}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
