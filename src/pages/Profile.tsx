import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { doc, updateDoc, collection, query, where, getDocs, setDoc, deleteDoc, addDoc } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { User, Mail, Shield, MapPin, Phone, CheckCircle2, Package, X, Trash2, Heart, ArrowRight, ShieldCheck, Zap, Globe, PackageCheck, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/src/lib/utils';

export default function Profile() {
  const { user, profile, refreshProfile } = useAuth();
  const { t } = useLanguage();
  
  const [activeTab, setActiveTab] = useState<'orders' | 'wishlist'>('orders');
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  
  const [orders, setOrders] = useState<any[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);

  const [wishlistProducts, setWishlistProducts] = useState<any[]>([]);
  const [loadingWishlist, setLoadingWishlist] = useState(false);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteReason, setDeleteReason] = useState('');
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (profile) {
      setName(profile.name || '');
      if (profile.sellerInfo) {
        setAddress(profile.sellerInfo.address || '');
        setPhone(profile.sellerInfo.phone || '');
      }
    }
  }, [profile]);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!user) return;
      try {
        const q = query(collection(db, 'orders'), where('buyerId', '==', user.uid));
        const snapshot = await getDocs(q);
        const fetchedOrders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        fetchedOrders.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setOrders(fetchedOrders);
      } catch (error) {
        console.error("Error fetching orders:", error);
      } finally {
        setLoadingOrders(false);
      }
    };
    fetchOrders();
  }, [user]);

  useEffect(() => {
    const fetchWishlist = async () => {
      if (!profile?.wishlist || profile.wishlist.length === 0) {
        setWishlistProducts([]);
        return;
      }
      setLoadingWishlist(true);
      try {
        const chunks = [];
        for (let i = 0; i < profile.wishlist.length; i += 10) {
          chunks.push(profile.wishlist.slice(i, i + 10));
        }
        
        let fetched: any[] = [];
        for (const chunk of chunks) {
          const q = query(collection(db, 'products'), where('__name__', 'in', chunk));
          const snap = await getDocs(q);
          fetched = [...fetched, ...snap.docs.map(doc => ({ id: doc.id, ...doc.data() }))];
        }
        setWishlistProducts(fetched);
      } catch (error) {
        console.error("Error fetching wishlist:", error);
      } finally {
        setLoadingWishlist(false);
      }
    };
    
    if (activeTab === 'wishlist') {
      fetchWishlist();
    }
  }, [profile?.wishlist, activeTab]);

  const handleUpgradeToSeller = async () => {
    if (!user || !profile) return;
    setSaving(true);
    try {
      const docRef = doc(db, 'users', user.uid);
      await updateDoc(docRef, {
        role: 'seller',
        sellerInfo: {
          status: 'pending',
          address: '',
          phone: '',
          verificationDetails: ''
        }
      });
      await refreshProfile();
      setSuccessMsg('Successfully upgraded to Seller! Please complete your seller profile.');
    } catch (error) {
      console.error("Error upgrading to seller:", error);
    } finally {
      setSaving(false);
    }
  };

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

  const handleDeleteAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !profile || !deleteReason) return;
    setDeleting(true);
    try {
      if (profile.role === 'seller') {
        const pQuery = query(collection(db, 'products'), where('sellerId', '==', user.uid));
        const pSnapshot = await getDocs(pQuery);
        for (const pDoc of pSnapshot.docs) {
          await deleteDoc(doc(db, 'products', pDoc.id));
        }
      }

      await setDoc(doc(db, 'deleted_users', user.uid), {
        ...profile,
        status: 'deleted',
        deletionReason: deleteReason,
        deletedAt: new Date().toISOString(),
        deletedBy: 'self'
      });

      const adminQuery = query(collection(db, 'users'), where('role', '==', 'admin'));
      const adminSnap = await getDocs(adminQuery);
      for (const adminDoc of adminSnap.docs) {
        await addDoc(collection(db, 'notifications'), {
          userId: adminDoc.id,
          title: 'User Deleted Account',
          message: `User ${profile.name} (${profile.email}) deleted their account. Reason: ${deleteReason}`,
          createdAt: new Date().toISOString(),
          read: false,
          type: 'system'
        });
      }

      await deleteDoc(doc(db, 'users', user.uid));
      await auth.signOut();
    } catch (error) {
      console.error("Error deleting account:", error);
    } finally {
      setDeleting(false);
    }
  };

  if (!profile) return null;

  return (
    <div className="bg-brand-light min-h-screen">
      <div className="mx-auto max-w-[1400px] px-4 py-12 md:py-24">
        
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
           <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
              <div className="flex items-center gap-2 text-brand-orange font-black text-[10px] uppercase tracking-[0.2em] mb-4 italic">
                 <ShieldCheck className="h-3 w-3" /> Command Center 01
              </div>
              <h1 className="text-4xl md:text-6xl font-black text-gray-900 tracking-tighter italic">
                STRATEGIC PROFILE
              </h1>
           </motion.div>
           <Link to="/" className="text-[10px] font-black uppercase text-gray-400 hover:text-brand-orange transition-colors flex items-center gap-2 tracking-[0.2em]">
              Return to Sector Alpha <ArrowRight className="h-3 w-3" />
           </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
          
          {/* Identity Hub - Column 1 */}
          <div className="lg:col-span-4 space-y-12">
            <div className="bg-brand-dark rounded-[3rem] p-10 text-white shadow-2xl relative overflow-hidden group">
               <div className="absolute top-0 right-0 w-32 h-32 bg-brand-orange opacity-10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
               
               <div className="flex items-center gap-6 mb-12">
                  <div className="h-20 w-20 rounded-[1.5rem] bg-white/10 flex items-center justify-center relative overflow-hidden">
                     <div className="absolute inset-0 bg-gradient-to-tr from-brand-orange to-transparent opacity-20"></div>
                     <User className="h-10 w-10 text-white" />
                  </div>
                  <div>
                     <h2 className="text-2xl font-black italic tracking-tight">{profile.name}</h2>
                     <p className="text-brand-orange text-[10px] font-bold uppercase tracking-[0.2em] mt-1">{profile.role === 'admin' ? 'Strategic Admin' : profile.role.toUpperCase()}</p>
                  </div>
               </div>

               <div className="space-y-6 mb-12 italic">
                  <div className="flex items-center gap-4 text-white/50 text-sm font-medium">
                     <Mail className="h-4 w-4 text-brand-orange" />
                     {user?.email}
                  </div>
                  <div className="flex items-center gap-4 text-white/50 text-sm font-medium">
                     <Globe className="h-4 w-4 text-brand-orange" />
                     Region: Ethiopia Sector
                  </div>
               </div>

               <form onSubmit={handleSave} className="space-y-6">
                  {successMsg && (
                    <div className="bg-emerald-500/10 text-emerald-400 p-4 rounded-2xl flex items-center gap-2 font-bold text-[10px] uppercase tracking-widest border border-emerald-500/20">
                      <CheckCircle2 className="h-4 w-4" /> {successMsg}
                    </div>
                  )}

                  <div className="space-y-2">
                    <label className="text-[9px] font-black uppercase text-white/30 tracking-widest ml-1">Identity Vector</label>
                    <input 
                      type="text" 
                      value={name} 
                      onChange={e => setName(e.target.value)}
                      className="w-full rounded-2xl border border-white/5 bg-white/5 py-4 px-6 text-sm font-bold text-white focus:bg-white/10 focus:outline-none transition-all outline-none italic"
                      required
                    />
                  </div>

                  {profile.role === 'seller' && (
                    <>
                      <div className="space-y-2">
                        <label className="text-[9px] font-black uppercase text-white/30 tracking-widest ml-1">Logistics Coordinate</label>
                        <input 
                          type="text" 
                          value={address} 
                          onChange={e => setAddress(e.target.value)}
                          className="w-full rounded-2xl border border-white/5 bg-white/5 py-4 px-6 text-sm font-bold text-white focus:bg-white/10 focus:outline-none transition-all outline-none italic"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[9px] font-black uppercase text-white/30 tracking-widest ml-1">Communication Line</label>
                        <input 
                          type="text" 
                          value={phone} 
                          onChange={e => setPhone(e.target.value)}
                          className="w-full rounded-2xl border border-white/5 bg-white/5 py-4 px-6 text-sm font-bold text-white focus:bg-white/10 focus:outline-none transition-all outline-none italic"
                        />
                      </div>
                    </>
                  )}

                  <div className="pt-4 flex flex-col gap-4">
                    <button 
                      type="submit" 
                      disabled={saving}
                      className="w-full h-16 bg-brand-orange text-white rounded-[1.5rem] font-black uppercase tracking-[0.2em] text-xs shadow-xl shadow-brand-orange/30 hover:bg-brand-orange-hover hover:-translate-y-1 transition-all disabled:opacity-50 italic"
                    >
                      {saving ? 'SYNCING...' : 'Update Protocol'}
                    </button>
                    {profile.role === 'buyer' && (
                        <button 
                          type="button"
                          onClick={handleUpgradeToSeller}
                          disabled={saving}
                          className="w-full h-16 border border-white/10 text-white rounded-[1.5rem] font-black uppercase tracking-[0.2em] text-xs hover:bg-white/5 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                          Establish Merchant Hub <Zap className="h-4 w-4 text-brand-orange" />
                        </button>
                    )}
                  </div>
               </form>
            </div>

            <div className="px-10">
               <button 
                  onClick={() => setIsDeleteModalOpen(true)}
                  className="text-[10px] font-black uppercase tracking-widest text-red-400 hover:text-red-500 transition-colors flex items-center gap-3 italic"
               >
                  <Trash2 className="h-4 w-4" /> Decommission Account
               </button>
            </div>
          </div>

          {/* Activity Logs - Column 2 */}
          <div className="lg:col-span-8 space-y-12">
            <div className="bg-white rounded-[3.5rem] p-4 md:p-10 border border-gray-100 shadow-sm min-h-[600px] flex flex-col">
               
               <div className="flex border-b border-gray-100 mb-10 overflow-x-auto no-scrollbar">
                  <button 
                    onClick={() => setActiveTab('orders')}
                    className={cn(
                        "px-8 py-6 text-[10px] font-black uppercase tracking-[0.3em] transition-all relative shrink-0",
                        activeTab === 'orders' ? "text-brand-orange italic" : "text-gray-300 hover:text-gray-500"
                    )}
                  >
                    DEPLOYMENT HISTORY
                    {activeTab === 'orders' && <motion.div layoutId="tab-underline" className="absolute bottom-0 left-0 right-0 h-1 bg-brand-orange rounded-full" />}
                  </button>
                  <button 
                    onClick={() => setActiveTab('wishlist')}
                    className={cn(
                        "px-8 py-6 text-[10px] font-black uppercase tracking-[0.3em] transition-all relative shrink-0",
                        activeTab === 'wishlist' ? "text-brand-orange italic" : "text-gray-300 hover:text-gray-500"
                    )}
                  >
                    ASSET WATCHLIST
                    {activeTab === 'wishlist' && <motion.div layoutId="tab-underline" className="absolute bottom-0 left-0 right-0 h-1 bg-brand-orange rounded-full" />}
                  </button>
               </div>

               <div className="flex-1">
                  <AnimatePresence mode="wait">
                    {activeTab === 'orders' ? (
                      <motion.div 
                        key="orders"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="space-y-6"
                      >
                        {loadingOrders ? (
                          <div className="flex items-center justify-center h-64 text-gray-400 font-black italic uppercase text-xs tracking-widest animate-pulse">Syncing orders...</div>
                        ) : orders.length === 0 ? (
                          <div className="flex flex-col items-center justify-center h-64 text-gray-400 text-center">
                            <Package className="h-16 w-16 text-gray-100 mb-6" />
                            <p className="text-xs font-black uppercase tracking-widest italic leading-relaxed">No strategic deployments detected in current cycle.</p>
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 gap-6">
                             {orders.map(order => (
                                <div key={order.id} className="group relative bg-brand-light p-8 rounded-[2rem] border border-transparent hover:border-brand-orange/20 transition-all hover:bg-white hover:shadow-premium overflow-hidden">
                                   <div className="absolute top-0 right-0 w-24 h-24 bg-brand-orange/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform"></div>
                                   
                                   <div className="flex flex-wrap justify-between items-start gap-4 mb-8">
                                      <div>
                                         <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2 italic">Operation ID: <span className="text-brand-orange">#{order.id.slice(-8).toUpperCase()}</span></p>
                                         <p className="text-[10px] text-gray-900 font-black italic">{new Date(order.createdAt).toLocaleDateString()} // {new Date(order.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                                      </div>
                                      <div className={cn(
                                          "px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest italic border",
                                          order.status === 'delivered' ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                                          order.status === 'cancelled' ? "bg-red-50 text-red-600 border-red-100" :
                                          "bg-brand-orange/10 text-brand-orange border-brand-orange/20"
                                      )}>
                                         {order.status}
                                      </div>
                                   </div>

                                   {/* Timeline Component */}
                                   <div className="mb-10 px-4">
                                      <div className="flex items-center justify-between relative pt-6">
                                         <div className="absolute left-0 top-1/2 w-full h-[2px] bg-gray-200 z-0"></div>
                                         <div 
                                           className="absolute left-0 top-1/2 h-[2px] bg-brand-orange z-0 transition-all duration-700" 
                                           style={{ 
                                             width: order.status === 'pending' ? '0%' : 
                                                    order.status === 'processing' ? '33.3%' : 
                                                    order.status === 'shipped' ? '66.6%' : 
                                                    order.status === 'delivered' ? '100%' : '0%' 
                                           }}
                                         ></div>
                                         
                                         {['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED'].map((step, idx) => {
                                           const isDone = 
                                             order.status === 'delivered' || 
                                             (order.status === 'shipped' && idx <= 2) || 
                                             (order.status === 'processing' && idx <= 1) || 
                                             (idx === 0);
                                           
                                           return (
                                             <div key={idx} className="relative z-10 flex flex-col items-center">
                                                <div className={cn(
                                                    "h-3 w-3 rounded-full transition-all duration-500",
                                                    isDone ? "bg-brand-orange scale-125 shadow-lg shadow-brand-orange/30" : "bg-white border-2 border-gray-200"
                                                )}></div>
                                                <span className={cn(
                                                    "absolute -bottom-6 text-[8px] font-black uppercase tracking-widest whitespace-nowrap italic",
                                                    isDone ? "text-brand-orange" : "text-gray-300"
                                                )}>{step}</span>
                                             </div>
                                           );
                                         })}
                                      </div>
                                   </div>

                                   <div className="flex flex-wrap items-end justify-between gap-6 pt-6 border-t border-gray-100/50 mt-10">
                                      <div className="flex-1 max-w-sm">
                                         <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-2 italic">Strategic Assets</p>
                                         <p className="text-[10px] font-bold text-gray-900 line-clamp-1 italic">{order.items.map((i: any) => i.name).join(' // ')}</p>
                                      </div>
                                      <div className="flex items-center gap-6">
                                         <div className="text-right">
                                            <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-1 italic">Settlement</p>
                                            <p className="text-xl font-black text-brand-orange italic">{order.totalAmount.toLocaleString()} <span className="text-[10px] tracking-tight">ETB</span></p>
                                         </div>
                                         <button 
                                           onClick={() => setSelectedOrder(order)}
                                           className="h-12 w-12 rounded-xl bg-white border border-gray-100 flex items-center justify-center hover:bg-brand-orange hover:text-white hover:scale-110 transition-all shadow-sm"
                                         >
                                            <ArrowRight className="h-4 w-4" />
                                         </button>
                                      </div>
                                   </div>
                                </div>
                             ))}
                          </div>
                        )}
                      </motion.div>
                    ) : (
                      <motion.div 
                        key="wishlist"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                      >
                        {loadingWishlist ? (
                          <div className="flex items-center justify-center h-64 text-gray-400 font-black italic uppercase text-xs tracking-widest animate-pulse">Syncing assets...</div>
                        ) : wishlistProducts.length === 0 ? (
                          <div className="flex flex-col items-center justify-center h-64 text-gray-400 text-center">
                            <Heart className="h-16 w-16 text-gray-100 mb-6" />
                            <p className="text-xs font-black uppercase tracking-widest italic leading-relaxed">No operational targets identified in watch list.</p>
                            <Link to="/explore" className="mt-8 h-12 px-8 bg-brand-dark text-white rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center hover:bg-brand-orange transition-colors">Target Sourcing Hub</Link>
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            {wishlistProducts.map(product => (
                              <Link 
                                to={`/product/${product.id}`} 
                                key={product.id} 
                                className="group bg-brand-light p-4 rounded-[2rem] flex gap-6 hover:bg-white border border-transparent hover:border-brand-orange/20 transition-all hover:shadow-premium"
                              >
                                <div className="h-24 w-24 rounded-2xl overflow-hidden shrink-0">
                                  <img 
                                    src={product.images?.[0] || product.image || "https://picsum.photos/seed/placeholder/200/200"} 
                                    className="h-full w-full object-cover transition-transform group-hover:scale-110" 
                                    alt={product.name}
                                    referrerPolicy="no-referrer"
                                  />
                                </div>
                                <div className="flex flex-col justify-between py-2">
                                  <div>
                                     <p className="text-[8px] font-black text-brand-orange uppercase tracking-widest mb-1 italic">{product.category}</p>
                                     <h3 className="text-lg font-black text-gray-900 tracking-tighter italic line-clamp-1 group-hover:text-brand-orange transition-colors">{product.name}</h3>
                                  </div>
                                  <p className="text-xl font-black text-gray-900 italic">{product.price.toLocaleString()} <span className="text-[10px] tracking-tight">ETB</span></p>
                                </div>
                              </Link>
                            ))}
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
               </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modern Order Details Modal */}
      <AnimatePresence>
        {selectedOrder && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedOrder(null)} className="absolute inset-0 bg-brand-dark/80 backdrop-blur-md" />
            <motion.div 
               initial={{ opacity: 0, scale: 0.9, y: 20 }} 
               animate={{ opacity: 1, scale: 1, y: 0 }} 
               exit={{ opacity: 0, scale: 0.9, y: 20 }}
               className="bg-white rounded-[3.5rem] shadow-2xl w-full max-w-2xl overflow-hidden relative"
            >
              <div className="flex justify-between items-center px-10 py-10 border-b border-gray-100">
                <div>
                   <h3 className="text-3xl font-black text-gray-900 tracking-tighter italic">OP_DETAILS</h3>
                   <p className="text-[10px] font-black text-brand-orange tracking-widest uppercase italic mt-1 font-bold">Execution Report #{selectedOrder.id.slice(-8).toUpperCase()}</p>
                </div>
                <button onClick={() => setSelectedOrder(null)} className="h-12 w-12 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 hover:text-gray-900 transition-colors">
                  <X className="h-6 w-6" />
                </button>
              </div>
              <div className="p-10 space-y-12 max-h-[70vh] overflow-y-auto no-scrollbar">
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                   <div className="space-y-6 italic">
                      <div>
                         <p className="text-[9px] font-black uppercase text-gray-400 tracking-widest mb-1">Timestamp</p>
                         <p className="text-sm font-bold text-gray-900">{new Date(selectedOrder.createdAt).toLocaleString()}</p>
                      </div>
                      <div>
                         <p className="text-[9px] font-black uppercase text-gray-400 tracking-widest mb-1">Authorization Status</p>
                         <div className="inline-block px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[9px] font-black uppercase tracking-widest border border-emerald-100">PLATFORM_VERIFIED</div>
                      </div>
                   </div>
                   <div className="space-y-2">
                       <p className="text-[9px] font-black uppercase text-gray-400 tracking-widest mb-1 italic">Logistics Destination</p>
                       <div className="p-6 bg-brand-light rounded-[1.5rem] text-[11px] font-bold text-gray-900 leading-relaxed italic border border-gray-200/50">
                          <MapPin className="h-3 w-3 text-brand-orange mb-2" />
                          {selectedOrder.shippingAddress}
                       </div>
                   </div>
                </div>

                <div>
                  <p className="text-[9px] font-black uppercase text-gray-400 tracking-widest mb-6 italic">Strategic Loadout</p>
                  <div className="space-y-4">
                    {selectedOrder.items.map((item: any, idx: number) => (
                      <div key={idx} className="flex items-center gap-6 bg-brand-light/50 p-4 rounded-[1.5rem] border border-gray-100 hover:bg-white transition-colors group">
                        {item.image && <img src={item.image} alt={item.name} className="w-16 h-16 rounded-xl object-cover shadow-sm group-hover:scale-110 transition-transform" />}
                        <div className="flex-1">
                          <p className="text-sm font-black text-gray-900 italic tracking-tight">{item.name}</p>
                          <p className="text-[10px] text-gray-400 font-bold tracking-widest mt-1 italic">QTY: 0{item.quantity} // UNIT_RATE: {item.price.toLocaleString()} ETB</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-black text-brand-orange italic">{(item.quantity * item.price).toLocaleString()} <span className="text-[10px]">ETB</span></p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="flex flex-col items-end pt-10 border-t border-gray-100">
                  <p className="text-[10px] font-black uppercase text-gray-400 tracking-[0.3em] mb-2 italic">Total Settlement</p>
                  <p className="text-5xl font-black text-gray-900 tracking-tighter italic">{selectedOrder.totalAmount.toLocaleString()} <span className="text-xl text-brand-orange uppercase not-italic">ETB</span></p>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modern Delete Modal */}
      <AnimatePresence>
        {isDeleteModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsDeleteModalOpen(false)} className="absolute inset-0 bg-brand-dark/80 backdrop-blur-sm" />
            <motion.div 
               initial={{ opacity: 0, scale: 0.9 }} 
               animate={{ opacity: 1, scale: 1 }} 
               exit={{ opacity: 0, scale: 0.9 }}
               className="bg-white rounded-[3rem] shadow-2xl w-full max-w-md overflow-hidden relative"
            >
              <div className="p-10 border-b border-gray-100 flex justify-between items-center">
                <h3 className="text-2xl font-black text-red-500 italic tracking-tighter">DECOMMISSION</h3>
                <button onClick={() => setIsDeleteModalOpen(false)} className="text-gray-400 hover:text-gray-900">
                  <X className="h-6 w-6" />
                </button>
              </div>
              <form onSubmit={handleDeleteAccount} className="p-10 space-y-8">
                <p className="text-sm text-gray-500 font-bold italic leading-relaxed">
                  Initiating final decommission of identity vector. This action is irreversible. All associated merchant assets and data nodes will be purged.
                </p>
                <div className="space-y-2">
                  <label className="text-[9px] font-black uppercase text-gray-400 tracking-widest pl-1 italic">Termination Log Reason</label>
                  <textarea
                    required
                    value={deleteReason}
                    onChange={(e) => setDeleteReason(e.target.value)}
                    className="w-full rounded-2xl border-none bg-brand-light p-6 text-sm font-bold text-gray-900 focus:ring-2 focus:ring-red-500/20 outline-none transition-all italic"
                    rows={3}
                    placeholder="Log termination reason for platform records..."
                  />
                </div>
                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => setIsDeleteModalOpen(false)}
                    className="flex-1 h-14 rounded-xl border border-gray-100 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:bg-gray-50"
                  >
                    Abort
                  </button>
                  <button
                    type="submit"
                    disabled={deleting || !deleteReason}
                    className="flex-1 h-14 bg-red-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-600 shadow-xl shadow-red-500/20 transition-all disabled:opacity-50"
                  >
                    {deleting ? 'PURGING...' : 'Confirm'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
