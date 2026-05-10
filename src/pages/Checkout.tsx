import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { collection, addDoc, getDoc, doc, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { CreditCard, MapPin, CheckCircle2, Truck, ShieldCheck, ChevronLeft, ArrowRight, Zap, Clock, Globe } from 'lucide-react';
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
          sellerId: item.sellerId || 'admin', 
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

      await addDoc(collection(db, 'notifications'), {
        userId: user.uid,
        title: 'Order Placed Successfully',
        message: `Your order #${orderId.slice(-6)} for ${finalTotal.toLocaleString()} ETB has been placed.`,
        read: false,
        type: 'order',
        link: '/profile',
        createdAt: new Date().toISOString()
      });

      const sellerIds = [...new Set(cart.map(item => item.sellerId).filter(Boolean))] as string[];
      
      for (const sellerId of sellerIds) {
        if (sellerId === 'admin') continue;
        
        await addDoc(collection(db, 'notifications'), {
          userId: sellerId,
          title: 'New Order Received',
          message: `You have a new order #${orderId.slice(-6)} for your products.`,
          read: false,
          type: 'order',
          link: '/dashboard',
          createdAt: new Date().toISOString()
        });

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

      try {
        const adminQuery = query(collection(db, 'users'), where('role', '==', 'admin'));
        const adminSnapshot = await getDocs(adminQuery);
        adminSnapshot.forEach(async (adminDoc) => {
          await addDoc(collection(db, 'notifications'), {
            userId: adminDoc.id,
            title: 'New Platform Order',
            message: `A new order #${orderId.slice(-6)} has been placed for ${finalTotal.toLocaleString()} ETB.`,
            read: false,
            type: 'order',
            link: '/dashboard',
            createdAt: new Date().toISOString()
          });
        });
      } catch (err) {
        console.error("Failed to notify admins", err);
      }

      await addDoc(collection(db, 'mail'), {
        to: 'tvandr32@gmail.com',
        message: {
          subject: `New Platform Order - #${orderId.slice(-6)}`,
          html: `<p>A new order has been placed on Chiricharo.</p><p>Order ID: ${orderId}</p><p>Total: ${finalTotal.toLocaleString()} ETB</p><p>Buyer: ${profile?.name || user.email}</p>`
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
      <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-brand-light">
        <motion.div 
           initial={{ scale: 0, rotate: -45 }} 
           animate={{ scale: 1, rotate: 0 }} 
           className="h-32 w-32 bg-emerald-50 rounded-[2.5rem] flex items-center justify-center mb-10 shadow-xl shadow-emerald-500/10 border border-emerald-100"
        >
          <CheckCircle2 className="h-16 w-16 text-emerald-600" />
        </motion.div>
        <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-4 tracking-tighter italic text-center uppercase">{t('checkout.success')}</h1>
        <p className="text-gray-500 font-bold uppercase tracking-widest text-[10px] animate-pulse">Redirecting to command center...</p>
      </div>
    );
  }

  return (
    <div className="bg-brand-light min-h-screen">
      <div className="mx-auto max-w-[1400px] px-4 py-12 md:py-24">
        
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
           <div>
              <div className="flex items-center gap-2 text-brand-orange font-black text-[10px] uppercase tracking-widest mb-4 italic">
                 <Globe className="h-3 w-3" /> Global Fulfillment Protocol
              </div>
              <h1 className="text-4xl md:text-6xl font-black text-gray-900 tracking-tighter italic">
                {t('checkout.title')}
              </h1>
           </div>
           <Link to="/cart" className="flex items-center gap-2 text-gray-400 font-bold hover:text-brand-orange transition-colors">
              <ChevronLeft className="h-4 w-4" /> Return to Assets
           </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
          
          <div className="lg:col-span-8 flex flex-col gap-12">
            
            {/* Delivery Method */}
            <div className="bg-white rounded-[3rem] p-10 border border-gray-100 shadow-sm">
               <div className="flex items-center gap-4 mb-10">
                  <div className="h-12 w-12 rounded-2xl bg-brand-orange/10 flex items-center justify-center">
                     <Truck className="h-6 w-6 text-brand-orange" />
                  </div>
                  <h2 className="text-2xl font-black text-gray-900 italic">Logistics Selection</h2>
               </div>

               {isFreeStandard && (
                 <div className="mb-8 p-6 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center gap-4">
                    <Zap className="h-6 w-6 text-emerald-600" />
                    <p className="text-emerald-800 text-sm font-bold uppercase tracking-wide">Enterprise Bonus: Free Standard Delivery Activated</p>
                 </div>
               )}

               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {DELIVERY_OPTIONS.map(option => (
                    <label 
                      key={option.id} 
                      className={cn(
                        "relative flex flex-col p-8 rounded-[2rem] border-2 cursor-pointer transition-all",
                        deliveryOption === option.id 
                          ? "border-brand-orange bg-brand-orange/5 shadow-premium" 
                          : "border-gray-100 bg-gray-50/50 hover:border-gray-200"
                      )}
                    >
                      <input 
                        type="radio" 
                        name="delivery" 
                        value={option.id} 
                        checked={deliveryOption === option.id}
                        onChange={(e) => setDeliveryOption(e.target.value)}
                        className="sr-only"
                      />
                      <div className="flex justify-between items-start mb-6">
                         <span className={cn("px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest", deliveryOption === option.id ? "bg-brand-orange text-white" : "bg-gray-200 text-gray-500")}>
                            {option.id === 'standard' ? 'Standard' : 'Express'}
                         </span>
                         <span className="text-xl font-black text-gray-900">
                           {option.id === 'standard' && isFreeStandard ? 'FREE' : `${option.price.toLocaleString()} ETB`}
                         </span>
                      </div>
                      <span className="font-black text-gray-900 italic text-lg">{option.name}</span>
                      <p className="text-xs text-gray-400 mt-2 font-medium">Estimated arrival in {option.id === 'express' ? '1-2' : '3-5'} business cycles.</p>
                      {deliveryOption === option.id && (
                         <div className="absolute top-4 right-4">
                            <CheckCircle2 className="h-5 w-5 text-brand-orange" />
                         </div>
                      )}
                    </label>
                  ))}
               </div>
            </div>

            {/* Shipping Address */}
            <div className="bg-white rounded-[3rem] p-10 border border-gray-100 shadow-sm overflow-hidden flex flex-col">
               <div className="flex items-center gap-4 mb-10">
                  <div className="h-12 w-12 rounded-2xl bg-brand-orange/10 flex items-center justify-center">
                     <MapPin className="h-6 w-6 text-brand-orange" />
                  </div>
                  <h2 className="text-2xl font-black text-gray-900 italic">Strategic Location</h2>
               </div>

               <div className="h-80 w-full rounded-[2rem] overflow-hidden border-4 border-gray-50 mb-8 z-0 relative shadow-inner">
                  <MapContainer center={[9.005401, 38.763611]} zoom={13} scrollWheelZoom={false} className="h-full w-full grayscale contrast-125 brightness-95">
                    <TileLayer
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <LocationMarker setAddress={setAddress} />
                  </MapContainer>
               </div>

               <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest pl-2">Coordinate Input / Intelligence</label>
                  <textarea
                    required
                    rows={4}
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full rounded-[2rem] border-none bg-brand-light p-8 text-sm font-bold text-gray-900 focus:ring-4 focus:ring-brand-orange/10 outline-none transition-all placeholder:text-gray-300 italic"
                    placeholder="Provide detailed spatial coordinates or delivery instructions..."
                  />
               </div>
            </div>

            {/* Payment Method */}
            <div className="bg-white rounded-[3rem] p-10 border border-gray-100 shadow-sm">
               <div className="flex items-center gap-4 mb-10">
                  <div className="h-12 w-12 rounded-2xl bg-brand-orange/10 flex items-center justify-center">
                     <CreditCard className="h-6 w-6 text-brand-orange" />
                  </div>
                  <h2 className="text-2xl font-black text-gray-900 italic">Financial Authorization</h2>
               </div>
               
               <div className="p-8 border-2 border-brand-orange/20 bg-brand-orange/5 rounded-[2.5rem] relative group group overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-brand-orange opacity-5 rounded-full blur-2xl"></div>
                  <div className="flex items-center gap-6 mb-6">
                     <div className="h-14 w-20 bg-brand-dark rounded-xl flex items-center justify-center relative shadow-lg">
                        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white/10 to-transparent"></div>
                        <div className="w-10 h-10 border border-white/20 rounded-full opacity-50"></div>
                     </div>
                     <div>
                        <p className="font-black text-gray-900 italic text-lg uppercase tracking-tight">Deferred Settlement <span className="text-brand-orange">(COD)</span></p>
                        <p className="text-xs text-brand-orange font-bold uppercase tracking-widest mt-1 italic">Enterprise Standard Protocol</p>
                     </div>
                  </div>
                  <p className="text-sm text-gray-500 font-medium leading-relaxed max-w-md">
                     Transaction will be finalized upon physical asset verification at the delivery destination. Standard for decentralized regional trade.
                  </p>
               </div>
            </div>
          </div>

          {/* Sidebar Summary */}
          <div className="lg:col-span-4 sticky top-24">
             <div className="bg-brand-dark rounded-[3rem] p-10 text-white shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-brand-orange opacity-10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                <h2 className="text-3xl font-black mb-10 tracking-tighter italic">Order Protocol</h2>
                
                <div className="space-y-6 mb-12">
                   <div className="flex justify-between items-center group/item cursor-default">
                     <span className="text-white/40 text-[10px] font-black uppercase tracking-widest group-hover/item:text-white/80 transition-colors">Asset Valuation</span>
                     <span className="text-lg font-black">{cartTotal.toLocaleString()} {t('product.price')}</span>
                   </div>
                   <div className="flex justify-between items-center group/item cursor-default">
                     <span className="text-white/40 text-[10px] font-black uppercase tracking-widest group-hover/item:text-white/80 transition-colors">Logistics ({selectedDelivery.name})</span>
                     <span className={cn("text-lg font-black transition-colors", deliveryFee === 0 ? "text-emerald-400" : "")}>
                       {deliveryFee === 0 ? 'FREE' : `${deliveryFee.toLocaleString()} ETB`}
                     </span>
                   </div>
                   <div className="h-px bg-white/10 my-4"></div>
                   <div className="flex justify-between items-center pt-2">
                     <span className="text-white text-xl font-black italic">Final Total</span>
                     <div className="text-right">
                        <span className="text-4xl font-black text-brand-orange">{finalTotal.toLocaleString()}</span>
                        <span className="text-xs font-bold text-white/40 block">ETB (VAT Incl.)</span>
                     </div>
                   </div>
                </div>

                <div className="mb-10 p-6 rounded-2xl bg-white/5 border border-white/5 flex items-center gap-4">
                   <Clock className="h-5 w-5 text-brand-orange shrink-0" />
                   <p className="text-[10px] text-white/60 font-medium uppercase tracking-widest leading-loose">Locked rate for 24 hours under procurement protection.</p>
                </div>

                <button 
                  onClick={handlePlaceOrder}
                  disabled={loading || cart.length === 0}
                  className="w-full h-20 bg-brand-orange text-white rounded-[2rem] font-black uppercase tracking-[0.2em] text-sm flex items-center justify-center gap-4 shadow-xl shadow-brand-orange/30 hover:bg-brand-orange-hover hover:-translate-y-1 active:scale-95 transition-all disabled:opacity-50"
                >
                  {loading ? (
                    <div className="h-6 w-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    <>Deploy Order <ArrowRight className="h-5 w-5" /></>
                  )}
                </button>

                <div className="mt-12 space-y-6">
                   <div className="flex items-start gap-4">
                      <ShieldCheck className="h-6 w-6 text-brand-orange shrink-0" />
                      <div>
                         <p className="text-[10px] font-black uppercase text-white/90 tracking-widest">Enterprise Escrow</p>
                         <p className="text-[10px] text-white/40 font-medium">Funds verified by platform trust layer</p>
                      </div>
                   </div>
                </div>
             </div>

             <div className="mt-8 p-6 text-center">
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Legal Compliance Protocol</p>
                <p className="text-[10px] text-gray-400 mt-2">By deploying, you agree to the regional trade framework and strategic asset delivery terms.</p>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
