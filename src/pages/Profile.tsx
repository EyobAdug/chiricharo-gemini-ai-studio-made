import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { User, Mail, Shield, MapPin, Phone, CheckCircle } from 'lucide-react';

export default function Profile() {
  const { user, profile, refreshProfile } = useAuth();
  const { t } = useLanguage();
  
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    if (profile) {
      setName(profile.name || '');
      if (profile.sellerInfo) {
        setAddress(profile.sellerInfo.address || '');
        setPhone(profile.sellerInfo.phone || '');
      }
    }
  }, [profile]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !profile) return;
    
    setSaving(true);
    setSuccessMsg('');
    
    try {
      const docRef = doc(db, 'users', user.uid);
      const updates: any = { name };
      
      if (profile.role === 'seller') {
        updates['sellerInfo.address'] = address;
        updates['sellerInfo.phone'] = phone;
      }
      
      await updateDoc(docRef, updates);
      await refreshProfile();
      setSuccessMsg(t('profile.success') || 'Profile updated successfully!');
    } catch (error) {
      console.error("Error updating profile:", error);
    } finally {
      setSaving(false);
    }
  };

  if (!profile) return null;

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-12">
      <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
        <div className="bg-indigo-600 px-8 py-10 text-white flex items-center gap-6">
          <div className="h-20 w-20 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
            <User className="h-10 w-10 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold">{t('profile.title') || 'Manage Account'}</h1>
            <p className="text-indigo-100 mt-1 flex items-center gap-2">
              <Mail className="h-4 w-4" /> {user?.email}
            </p>
          </div>
        </div>

        <form onSubmit={handleSave} className="p-8 space-y-6">
          {successMsg && (
            <div className="bg-green-50 text-green-700 p-4 rounded-xl flex items-center gap-2 font-medium">
              <CheckCircle className="h-5 w-5" /> {successMsg}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-1">{t('auth.name') || 'Full Name'}</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input 
                  type="text" 
                  value={name} 
                  onChange={e => setName(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pl-10 pr-4 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-900 mb-1">Role</label>
              <div className="relative">
                <Shield className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input 
                  type="text" 
                  value={profile.role.toUpperCase()} 
                  disabled
                  className="w-full rounded-xl border border-gray-200 bg-gray-100 py-3 pl-10 pr-4 text-sm text-gray-500 cursor-not-allowed font-bold"
                />
              </div>
            </div>
          </div>

          {profile.role === 'seller' && (
            <>
              <hr className="border-gray-100" />
              <h3 className="text-lg font-bold text-gray-900">Seller Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-1">{t('seller.info.address') || 'Business Address'}</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input 
                      type="text" 
                      value={address} 
                      onChange={e => setAddress(e.target.value)}
                      className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pl-10 pr-4 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-1">{t('seller.info.phone') || 'Phone Number'}</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input 
                      type="text" 
                      value={phone} 
                      onChange={e => setPhone(e.target.value)}
                      className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pl-10 pr-4 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                </div>
              </div>
            </>
          )}

          <div className="pt-4 flex justify-end">
            <button 
              type="submit" 
              disabled={saving}
              className="rounded-full bg-indigo-600 px-8 py-3 text-sm font-bold text-white hover:bg-indigo-700 transition-all disabled:opacity-50"
            >
              {saving ? 'Saving...' : (t('profile.save') || 'Save Changes')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
