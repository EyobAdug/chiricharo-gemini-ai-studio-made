import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, Package, Truck, DollarSign, ArrowRight } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function SellerWelcome() {
  const { t } = useLanguage();

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center px-4 py-12 bg-gray-50">
      <div className="w-full max-w-3xl bg-white rounded-3xl shadow-xl p-8 md:p-12 border border-gray-100 text-center">
        <div className="h-20 w-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="h-10 w-10 text-green-600" />
        </div>
        
        <h1 className="text-4xl font-extrabold text-gray-900 mb-4">Welcome to Chiricharo Sellers!</h1>
        <p className="text-lg text-gray-600 mb-12 max-w-2xl mx-auto">
          Your seller application has been submitted successfully. While you wait for admin approval, here is how selling on Chiricharo works:
        </p>

        <div className="grid md:grid-cols-3 gap-8 mb-12">
          <div className="flex flex-col items-center text-center">
            <div className="h-16 w-16 bg-emerald-50 rounded-2xl flex items-center justify-center mb-4 text-emerald-700">
              <Package className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">1. Add Products</h3>
            <p className="text-sm text-gray-600">
              Once approved, go to your Dashboard to list your products. Add clear photos, descriptions, and competitive prices in ETB.
            </p>
          </div>

          <div className="flex flex-col items-center text-center">
            <div className="h-16 w-16 bg-emerald-50 rounded-2xl flex items-center justify-center mb-4 text-emerald-700">
              <Truck className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">2. Fulfill Orders</h3>
            <p className="text-sm text-gray-600">
              You will receive notifications when customers place orders. Prepare the items for delivery or pickup promptly.
            </p>
          </div>

          <div className="flex flex-col items-center text-center">
            <div className="h-16 w-16 bg-emerald-50 rounded-2xl flex items-center justify-center mb-4 text-emerald-700">
              <DollarSign className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">3. Get Paid</h3>
            <p className="text-sm text-gray-600">
              Payments are collected upon delivery. You will receive your earnings minus the platform commission directly to your account.
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link 
            to="/dashboard" 
            className="inline-flex items-center justify-center gap-2 rounded-full bg-emerald-700 px-8 py-4 text-base font-bold text-white hover:bg-emerald-800 transition-all shadow-lg shadow-emerald-100"
          >
            Go to Dashboard <ArrowRight className="h-5 w-5" />
          </Link>
          <Link 
            to="/seller-guide" 
            className="inline-flex items-center justify-center gap-2 rounded-full bg-emerald-100 px-8 py-4 text-base font-bold text-emerald-800 hover:bg-emerald-200 transition-all"
          >
            Read Seller Guide
          </Link>
          <Link 
            to="/" 
            className="inline-flex items-center justify-center gap-2 rounded-full bg-gray-100 px-8 py-4 text-base font-bold text-gray-900 hover:bg-gray-200 transition-all"
          >
            Return to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
