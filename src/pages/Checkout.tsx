import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { collection, addDoc, getDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';
import { CreditCard, MapPin, CheckCircle2 } from 'lucide-react';
import { motion } from 'motion/react';

export default function Checkout() {
  const { cart, cartTotal, clearCart } = useCart();
  const { user, profile } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || cart.length === 0) return;
    
    setLoading(true);
    try {
      const orderData = {
        buyerId: user.uid,
        items: cart.map(item => ({
          productId: item.id,
          sellerId: item.sellerId || 'admin', // fallback
          quantity: item.quantity,
          price: item.price,
          status: 'pending'
        })),
        totalAmount: cartTotal,
        shippingAddress: address,
        status: 'pending',
        createdAt: new Date().toISOString()
      };

      const orderRef = await addDoc(collection(db, 'orders'), orderData);
      const orderId = orderRef.id;

      // Notify Buyer
      await addDoc(collection(db, 'notifications'), {
        userId: user.uid,
        title: 'Order Placed Successfully',
        message: `Your order #${orderId.slice(-6)} for ${cartTotal.toFixed(2)} ETB has been placed.`,
        read: false,
        type: 'order',
        link: '/profile',
        createdAt: new Date().toISOString()
      });

      // Notify Sellers and Admin
      const sellerIds = [...new Set(cart.map(item => item.sellerId).filter(Boolean))] as string[];
      
      for (const sellerId of sellerIds) {
        if (sellerId === 'admin') continue;
        
        // In-app notification for seller
        await addDoc(collection(db, 'notifications'), {
          userId: sellerId,
          title: 'New Order Received',
          message: `You have a new order #${orderId.slice(-6)} for your products.`,
          read: false,
          type: 'order',
          link: '/dashboard',
          createdAt: new Date().toISOString()
        });

        // Email for seller
        try {
          const sellerDoc = await getDoc(doc(db, 'users', sellerId));
          if (sellerDoc.exists() && sellerDoc.data().email) {
            await addDoc(collection(db, 'mail'), {
              to: sellerDoc.data().email,
              message: {
                subject: `New Order Received - #${orderId.slice(-6)}`,
                html: `<p>Hello ${sellerDoc.data().name},</p><p>You have received a new order on Chiricharo.</p><p>Order ID: ${orderId}</p><p>Please check your dashboard to fulfill it.</p>`
              },
              createdAt: new Date().toISOString()
            });
          }
        } catch (err) {
          console.error("Failed to queue seller email", err);
        }
      }

      // Email for Admin
      await addDoc(collection(db, 'mail'), {
        to: 'tvandr32@gmail.com', // Admin email from context
        message: {
          subject: `New Platform Order - #${orderId.slice(-6)}`,
          html: `<p>A new order has been placed on Chiricharo.</p><p>Order ID: ${orderId}</p><p>Total: ${cartTotal.toFixed(2)} ETB</p><p>Buyer: ${profile?.name || user.email}</p>`
        },
        createdAt: new Date().toISOString()
      });

      clearCart();
      setSuccess(true);
      setTimeout(() => navigate('/'), 3000);
    } catch (error) {
      console.error("Error placing order:", error);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-4">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="h-24 w-24 bg-green-100 rounded-full flex items-center justify-center mb-6">
          <CheckCircle2 className="h-12 w-12 text-green-600" />
        </motion.div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('checkout.success')}</h1>
        <p className="text-gray-600">Redirecting to home...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-extrabold text-gray-900 mb-8">{t('checkout.title')}</h1>
      
      <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
        <form onSubmit={handlePlaceOrder} className="space-y-8">
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <MapPin className="h-5 w-5 text-indigo-600" /> {t('checkout.shipping')}
            </h2>
            <textarea
              required
              rows={3}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 px-4 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all"
              placeholder="Enter your full delivery address in Ethiopia..."
            />
          </div>

          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-indigo-600" /> Payment Method
            </h2>
            <div className="p-4 border border-gray-200 rounded-xl bg-gray-50 text-sm text-gray-600">
              <p className="font-bold text-gray-900 mb-1">Cash on Delivery / Telebirr (Coming Soon)</p>
              <p>For this MVP, payment will be collected upon delivery by the admin.</p>
            </div>
          </div>

          <div className="border-t border-gray-100 pt-6">
            <div className="flex justify-between text-xl font-black text-gray-900 mb-6">
              <span>{t('cart.total')}</span>
              <span>{cartTotal.toFixed(2)} ETB</span>
            </div>
            <button
              type="submit"
              disabled={loading || cart.length === 0}
              className="w-full rounded-full bg-indigo-600 py-4 text-base font-bold text-white hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 disabled:opacity-50"
            >
              {loading ? '...' : t('checkout.placeOrder')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
