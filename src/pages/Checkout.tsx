import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { collection, addDoc, getDoc, doc, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { CreditCard, MapPin, CheckCircle2, Truck } from 'lucide-react';
import { motion } from 'motion/react';
import { DELIVERY_OPTIONS, FREE_DELIVERY_THRESHOLD } from '../constants';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix Leaflet's default icon path issues with Webpack/Vite
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

function LocationMarker({ setAddress }: { setAddress: (addr: string) => void }) {
  const [position, setPosition] = useState<L.LatLng | null>(null);
  
  const map = useMapEvents({
    click(e) {
      setPosition(e.latlng);
      setAddress(`Lat: ${e.latlng.lat.toFixed(4)}, Lng: ${e.latlng.lng.toFixed(4)}`);
      map.flyTo(e.latlng, map.getZoom());
    },
    locationfound(e) {
      setPosition(e.latlng);
      map.flyTo(e.latlng, map.getZoom());
    },
  });

  useEffect(() => {
    map.locate();
  }, [map]);

  return position === null ? null : (
    <Marker position={position}></Marker>
  );
}

export default function Checkout() {
  const { cart, cartTotal, clearCart } = useCart();
  const { user, profile } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  
  const [address, setAddress] = useState('');
  const [deliveryOption, setDeliveryOption] = useState(DELIVERY_OPTIONS[0].id);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const selectedDelivery = DELIVERY_OPTIONS.find(d => d.id === deliveryOption) || DELIVERY_OPTIONS[0];
  const isFreeStandard = cartTotal >= FREE_DELIVERY_THRESHOLD;
  
  const deliveryFee = deliveryOption === 'standard' && isFreeStandard 
    ? 0 
    : selectedDelivery.price;

  const finalTotal = cartTotal + deliveryFee;

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || cart.length === 0) return;
    
    setLoading(true);
    try {
      const orderData = {
        buyerId: user.uid,
        buyerName: profile?.name || user.email,
        buyerEmail: user.email,
        items: cart.map(item => ({
          productId: item.id,
          name: item.name,
          image: item.image,
          sellerId: item.sellerId || 'admin', // fallback
          quantity: item.quantity,
          price: item.price,
          status: 'pending'
        })),
        totalAmount: finalTotal,
        subtotal: cartTotal,
        deliveryFee: deliveryFee,
        deliveryOption: selectedDelivery.name,
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
        message: `Your order #${orderId.slice(-6)} for ${finalTotal.toFixed(2)} ETB has been placed.`,
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

      // Notify Admins in-app
      try {
        const adminQuery = query(collection(db, 'users'), where('role', '==', 'admin'));
        const adminSnapshot = await getDocs(adminQuery);
        adminSnapshot.forEach(async (adminDoc) => {
          await addDoc(collection(db, 'notifications'), {
            userId: adminDoc.id,
            title: 'New Platform Order',
            message: `A new order #${orderId.slice(-6)} has been placed for ${finalTotal.toFixed(2)} ETB.`,
            read: false,
            type: 'order',
            link: '/dashboard',
            createdAt: new Date().toISOString()
          });
        });
      } catch (err) {
        console.error("Failed to notify admins", err);
      }

      // Email for Admin
      await addDoc(collection(db, 'mail'), {
        to: 'tvandr32@gmail.com', // Admin email from context
        message: {
          subject: `New Platform Order - #${orderId.slice(-6)}`,
          html: `<p>A new order has been placed on Chiricharo.</p><p>Order ID: ${orderId}</p><p>Total: ${finalTotal.toFixed(2)} ETB</p><p>Buyer: ${profile?.name || user.email}</p>`
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
      
      <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 mb-8">
        <div className="flex items-center gap-3 mb-6">
          <Truck className="h-6 w-6 text-emerald-700" />
          <h2 className="text-xl font-bold text-gray-900">Delivery Options</h2>
        </div>
        {isFreeStandard && (
          <div className="mb-4 bg-green-50 text-green-700 p-3 rounded-xl text-sm font-bold">
            🎉 Your order is over {FREE_DELIVERY_THRESHOLD} ETB! Standard Delivery is FREE.
          </div>
        )}
        <div className="space-y-3">
          {DELIVERY_OPTIONS.map(option => (
            <label key={option.id} className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all ${deliveryOption === option.id ? 'border-emerald-600 bg-emerald-50' : 'border-gray-200 hover:border-emerald-300'}`}>
              <div className="flex items-center gap-3">
                <input 
                  type="radio" 
                  name="delivery" 
                  value={option.id} 
                  checked={deliveryOption === option.id}
                  onChange={(e) => setDeliveryOption(e.target.value)}
                  className="text-emerald-600 focus:ring-emerald-500 h-4 w-4"
                />
                <span className="font-medium text-gray-900">{option.name}</span>
              </div>
              <span className="font-bold text-gray-900">
                {option.id === 'standard' && isFreeStandard ? 'FREE' : `${option.price} ETB`}
              </span>
            </label>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
        <form onSubmit={handlePlaceOrder} className="space-y-8">
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <MapPin className="h-5 w-5 text-emerald-700" /> {t('checkout.shipping')}
            </h2>
            <div className="h-64 w-full rounded-xl overflow-hidden border border-gray-200 mb-4 z-0 relative">
              <MapContainer center={[9.005401, 38.763611]} zoom={13} scrollWheelZoom={false} className="h-full w-full">
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <LocationMarker setAddress={setAddress} />
              </MapContainer>
            </div>
            <textarea
              required
              rows={3}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 px-4 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all"
              placeholder="Enter your full delivery address in Ethiopia or click on the map..."
            />
          </div>

          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-emerald-700" /> Payment Method
            </h2>
            <div className="p-4 border border-gray-200 rounded-xl bg-gray-50 text-sm text-gray-600">
              <p className="font-bold text-gray-900 mb-1">Cash on Delivery / Telebirr (Coming Soon)</p>
              <p>For this MVP, payment will be collected upon delivery by the admin.</p>
            </div>
          </div>

          <div className="border-t border-gray-100 pt-6">
            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>{cartTotal.toFixed(2)} ETB</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Delivery ({selectedDelivery.name})</span>
                <span>{deliveryFee === 0 ? 'FREE' : `${deliveryFee.toFixed(2)} ETB`}</span>
              </div>
            </div>
            <div className="flex justify-between text-xl font-black text-gray-900 mb-6">
              <span>{t('cart.total')}</span>
              <span>{finalTotal.toFixed(2)} ETB</span>
            </div>
            <button
              type="submit"
              disabled={loading || cart.length === 0}
              className="w-full rounded-full bg-emerald-700 py-4 text-base font-bold text-white hover:bg-emerald-800 transition-all shadow-lg shadow-emerald-100 disabled:opacity-50"
            >
              {loading ? '...' : t('checkout.placeOrder')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
