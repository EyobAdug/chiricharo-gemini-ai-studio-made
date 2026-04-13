import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { doc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { User, Mail, Shield, MapPin, Phone, CheckCircle, Package, X } from 'lucide-react';

export default function Profile() {
  const { user, profile, refreshProfile } = useAuth();
  const { t } = useLanguage();
  
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  
  const [orders, setOrders] = useState<any[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);

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

  if (!profile) return null;

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-12">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Profile Info */}
        <div className="lg:col-span-1 space-y-8">
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="bg-indigo-600 px-6 py-8 text-white flex flex-col items-center text-center">
              <div className="h-24 w-24 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm mb-4">
                <User className="h-12 w-12 text-white" />
              </div>
              <h1 className="text-2xl font-extrabold">{t('profile.title') || 'Manage Account'}</h1>
              <p className="text-indigo-100 mt-1 flex items-center gap-2 text-sm">
                <Mail className="h-4 w-4" /> {user?.email}
              </p>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-6">
              {successMsg && (
                <div className="bg-green-50 text-green-700 p-4 rounded-xl flex items-center gap-2 font-medium text-sm">
                  <CheckCircle className="h-5 w-5" /> {successMsg}
                </div>
              )}

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
                <div className="relative flex items-center gap-4">
                  <div className="relative flex-1">
                    <Shield className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input 
                      type="text" 
                      value={profile.role.toUpperCase()} 
                      disabled
                      className="w-full rounded-xl border border-gray-200 bg-gray-100 py-3 pl-10 pr-4 text-sm text-gray-500 cursor-not-allowed font-bold"
                    />
                  </div>
                  {profile.role === 'buyer' && (
                    <button 
                      type="button"
                      onClick={handleUpgradeToSeller}
                      disabled={saving}
                      className="shrink-0 text-sm font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 px-4 py-3 rounded-xl border border-indigo-100 transition-colors disabled:opacity-50"
                    >
                      Become a Seller
                    </button>
                  )}
                </div>
              </div>

              {profile.role === 'seller' && (
                <>
                  <hr className="border-gray-100" />
                  <h3 className="text-lg font-bold text-gray-900">Seller Information</h3>
                  
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
                </>
              )}

              <div className="pt-2">
                <button 
                  type="submit" 
                  disabled={saving}
                  className="w-full rounded-full bg-indigo-600 px-8 py-3 text-sm font-bold text-white hover:bg-indigo-700 transition-all disabled:opacity-50"
                >
                  {saving ? 'Saving...' : (t('profile.save') || 'Save Changes')}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* My Orders */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden h-full flex flex-col">
            <div className="p-6 border-b border-gray-100 flex items-center gap-3">
              <div className="h-10 w-10 bg-indigo-50 rounded-xl flex items-center justify-center">
                <Package className="h-5 w-5 text-indigo-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">My Orders</h2>
            </div>
            
            <div className="flex-1 p-6">
              {loadingOrders ? (
                <div className="flex items-center justify-center h-40 text-gray-500">Loading orders...</div>
              ) : orders.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-40 text-gray-500">
                  <Package className="h-12 w-12 text-gray-300 mb-2" />
                  <p>You haven't placed any orders yet.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map(order => (
                    <div key={order.id} className="border border-gray-100 rounded-2xl p-4 hover:border-indigo-100 transition-colors bg-gray-50/50">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Order #{order.id.slice(0, 8)}</p>
                          <p className="text-sm text-gray-900 font-medium">{new Date(order.createdAt).toLocaleDateString()} at {new Date(order.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                          order.status === 'delivered' ? 'bg-green-100 text-green-700' :
                          order.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                          'bg-yellow-100 text-yellow-700'
                        }`}>
                          {order.status}
                        </span>
                      </div>
                      
                      <div className="flex justify-between items-end">
                        <div className="flex-1">
                          <p className="text-sm font-bold text-gray-900 mb-1">Items:</p>
                          <p className="text-sm text-gray-600 line-clamp-1">
                            {order.items.map((i: any) => i.name || 'Unknown Item').join(', ')}
                          </p>
                        </div>
                        <div className="text-right ml-4">
                          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Total</p>
                          <p className="text-lg font-black text-indigo-600">{order.totalAmount.toFixed(2)} ETB</p>
                        </div>
                      </div>
                      
                      <div className="mt-4 pt-4 border-t border-gray-200 flex justify-end">
                        <button 
                          onClick={() => setSelectedOrder(order)}
                          className="text-sm font-bold text-indigo-600 hover:text-indigo-800"
                        >
                          View Details
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl shadow-xl w-full max-w-2xl overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <h3 className="text-xl font-bold text-gray-900">Order Details</h3>
              <button onClick={() => setSelectedOrder(null)} className="text-gray-400 hover:text-gray-600">
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-bold text-gray-500">Order ID</p>
                  <p className="font-medium text-gray-900">{selectedOrder.id}</p>
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-500">Date</p>
                  <p className="font-medium text-gray-900">{new Date(selectedOrder.createdAt).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-500">Status</p>
                  <span className={`inline-block mt-1 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                    selectedOrder.status === 'delivered' ? 'bg-green-100 text-green-700' :
                    selectedOrder.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                    'bg-yellow-100 text-yellow-700'
                  }`}>
                    {selectedOrder.status}
                  </span>
                </div>
                <div className="col-span-2">
                  <p className="text-sm font-bold text-gray-500">Delivery Address</p>
                  <p className="font-medium text-gray-900 bg-gray-50 p-3 rounded-xl mt-1">{selectedOrder.shippingAddress}</p>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-gray-900 mb-3">Items</h4>
                <div className="space-y-3">
                  {selectedOrder.items.map((item: any, idx: number) => (
                    <div key={idx} className="flex items-center gap-4 bg-gray-50 p-3 rounded-xl">
                      {item.image && <img src={item.image} alt={item.name} className="w-12 h-12 rounded-lg object-cover" />}
                      <div className="flex-1">
                        <p className="font-bold text-gray-900">{item.name || 'Unknown Item'}</p>
                        <p className="text-sm text-gray-500">Qty: {item.quantity} × {item.price} ETB</p>
                      </div>
                      <div className="font-bold text-gray-900">
                        {(item.quantity * item.price).toFixed(2)} ETB
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                <p className="font-bold text-gray-500">Total Amount</p>
                <p className="text-2xl font-black text-indigo-600">{selectedOrder.totalAmount.toFixed(2)} ETB</p>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
