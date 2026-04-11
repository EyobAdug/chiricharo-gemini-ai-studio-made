import React from 'react';
import { useLanguage } from '../context/LanguageContext';

export default function Legal() {
  const { t } = useLanguage();

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-12 space-y-16">
      <section>
        <h1 className="text-3xl font-extrabold text-gray-900 mb-6">{t('legal.privacy')}</h1>
        <div className="prose prose-indigo max-w-none text-gray-600 space-y-4">
          <p><strong>1. Data Collection:</strong> We collect personal information such as name, email, and address to facilitate transactions on Chiricharo.</p>
          <p><strong>2. Data Protection:</strong> Your privacy is our priority. We implement robust security measures to protect your personal data from unauthorized access.</p>
          <p><strong>3. Seller Information:</strong> Sellers are required to provide verified business information to ensure trust and prevent scams. This information is securely stored and only used for verification purposes.</p>
          <p><strong>4. Third-Party Sharing:</strong> We do not sell your personal data. Information is only shared with necessary parties (e.g., delivery personnel) to fulfill orders.</p>
        </div>
      </section>

      <section>
        <h1 className="text-3xl font-extrabold text-gray-900 mb-6">{t('legal.terms')}</h1>
        <div className="prose prose-indigo max-w-none text-gray-600 space-y-4">
          <p><strong>1. Platform Role:</strong> Chiricharo acts as an intermediary marketplace connecting buyers and sellers in Ethiopia. We facilitate the transaction and delivery process.</p>
          <p><strong>2. Seller Responsibilities:</strong> 
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Sellers must provide accurate product descriptions and maintain up-to-date stock levels.</li>
              <li>Sellers must prepare items promptly upon receiving an order notification.</li>
              <li>If an item is out of stock, the seller must immediately cancel the order to notify the admin and buyer.</li>
            </ul>
          </p>
          <p><strong>3. Order Handling and Delivery:</strong> All orders are processed through the platform admin. Once a buyer places an order, the admin collects the prepared item from the seller and delivers it to the buyer.</p>
          <p><strong>4. Product Verification:</strong> All products submitted by sellers go through an admin verification process before being published on the platform to ensure quality and prevent scams.</p>
        </div>
      </section>
    </div>
  );
}
