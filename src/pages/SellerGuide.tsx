import React from 'react';
import { motion } from 'motion/react';
import { useLanguage } from '../context/LanguageContext';
import { CATEGORIES } from '../constants';
import { DollarSign, Percent, Package, CreditCard, ShieldCheck } from 'lucide-react';

export default function SellerGuide() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-12">
        
        {/* Header */}
        <div className="text-center space-y-4">
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center justify-center p-4 bg-emerald-100 rounded-full mb-4"
          >
            <DollarSign className="h-10 w-10 text-emerald-700" />
          </motion.div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight">Seller Welcome Guide</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Everything you need to know about selling, earning, and growing your business on our platform.
          </p>
        </div>

        {/* How You Earn */}
        <section className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
          <div className="flex items-center gap-3 mb-6">
            <Percent className="h-8 w-8 text-emerald-700" />
            <h2 className="text-2xl font-bold text-gray-900">How You Earn Money</h2>
          </div>
          <div className="prose prose-emerald max-w-none text-gray-600">
            <p className="text-lg">
              Our platform operates on a simple commission-based model. <strong>You only pay when you sell.</strong> There are no hidden fees, no listing fees, and no monthly subscriptions.
            </p>
            <p className="text-lg">
              When a customer buys your product, the platform takes a small percentage of the sale price to cover marketing, payment processing, and platform maintenance. The rest goes directly to you!
            </p>
            <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-6 mt-6">
              <h3 className="text-emerald-900 font-bold mb-2">Example:</h3>
              <p className="text-emerald-800 m-0">
                If you sell a <strong>Mobile Phone</strong> for <strong>10,000 ETB</strong> (8% commission):<br/>
                Platform Fee: 800 ETB<br/>
                <strong>You Earn: 9,200 ETB</strong>
              </p>
            </div>
          </div>
        </section>

        {/* Commission Rates */}
        <section className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
          <div className="flex items-center gap-3 mb-6">
            <Package className="h-8 w-8 text-emerald-700" />
            <h2 className="text-2xl font-bold text-gray-900">Commission Rates by Category</h2>
          </div>
          <p className="text-gray-600 mb-6">
            Different categories have different commission rates to keep the platform attractive for sellers while maintaining profitability.
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b-2 border-gray-100">
                  <th className="py-4 px-4 font-bold text-gray-900">Product Category</th>
                  <th className="py-4 px-4 font-bold text-gray-900 text-right">Commission Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {CATEGORIES.map((cat) => (
                  <tr key={cat.name} className="hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-4 text-gray-700 font-medium">{cat.name}</td>
                    <td className="py-4 px-4 text-right">
                      <span className="inline-flex items-center px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 font-bold">
                        {cat.commission}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Policies & Process */}
        <div className="grid md:grid-cols-2 gap-8">
          <section className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
            <div className="flex items-center gap-3 mb-6">
              <ShieldCheck className="h-8 w-8 text-emerald-700" />
              <h2 className="text-xl font-bold text-gray-900">Order Handling</h2>
            </div>
            <ul className="space-y-4 text-gray-600">
              <li className="flex gap-3">
                <span className="font-bold text-emerald-700">1.</span>
                <span>You will receive an email and an in-app notification when a new order is placed.</span>
              </li>
              <li className="flex gap-3">
                <span className="font-bold text-emerald-700">2.</span>
                <span>Prepare the item for shipping within 24 hours.</span>
              </li>
              <li className="flex gap-3">
                <span className="font-bold text-emerald-700">3.</span>
                <span>Update the order status in your Dashboard to "Processing" and then "Shipped".</span>
              </li>
            </ul>
          </section>

          <section className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
            <div className="flex items-center gap-3 mb-6">
              <CreditCard className="h-8 w-8 text-emerald-700" />
              <h2 className="text-xl font-bold text-gray-900">Payment Process</h2>
            </div>
            <ul className="space-y-4 text-gray-600">
              <li className="flex gap-3">
                <span className="font-bold text-emerald-700">1.</span>
                <span>Funds are held securely in escrow until the buyer receives the item.</span>
              </li>
              <li className="flex gap-3">
                <span className="font-bold text-emerald-700">2.</span>
                <span>Once marked as "Delivered", funds are released to your seller account.</span>
              </li>
              <li className="flex gap-3">
                <span className="font-bold text-emerald-700">3.</span>
                <span>Payouts are processed every Friday to your registered bank account.</span>
              </li>
            </ul>
          </section>
        </div>

      </div>
    </div>
  );
}
