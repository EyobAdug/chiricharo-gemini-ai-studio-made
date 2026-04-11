import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Upload, DollarSign, Tag, FileText, Package, AlertCircle, CheckCircle2, ShieldCheck } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Sell() {
  const { t } = useLanguage();
  const { profile } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-12 text-center">
      <div className="mb-12">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-4">List Your Item</h1>
        <p className="text-gray-600 mb-8">Reach millions of buyers in minutes. It's free to list!</p>
        
        <div className="bg-indigo-50 border border-indigo-100 rounded-3xl p-8 max-w-2xl mx-auto">
          <Package className="h-16 w-16 text-indigo-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Product Management Moved</h2>
          <p className="text-gray-600 mb-8">
            Sellers can now manage and add new products directly from their Dashboard.
          </p>
          <button 
            onClick={() => navigate('/dashboard')}
            className="inline-flex items-center justify-center rounded-full bg-indigo-600 px-8 py-4 text-base font-bold text-white hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
