import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { collection, query, where, getDocs, doc, updateDoc, deleteDoc, addDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { Package, Users, ShoppingBag, CheckCircle, XCircle, Plus, Edit, Trash2, X, LayoutDashboard } from 'lucide-react';

export default function Dashboard() {
  const { profile } = useAuth();
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState('overview');
  const [products, setProducts] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // User Management State
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [userAction, setUserAction] = useState<'suspend' | 'delete'>('suspend');
  const [actionReason, setActionReason] = useState('');
  const [updatingUser, setUpdatingUser] = useState(false);

  // Order Details Modal State
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);

  // Add Product Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    category: 'Electronics',
    color: '',
    size: '',
    condition: 'New',
    image: ''
  });
  const [addingProduct, setAddingProduct] = useState(false);

  useEffect(() => {
    fetchData();
  }, [profile]);

  const fetchData = async () => {
    if (!profile) return;
    setLoading(true);
    try {
      // Fetch Products
      let pQuery = profile.role === 'admin' ? query(collection(db, 'products')) : query(collection(db, 'products'), where('sellerId', '==', profile.uid));
      const pSnapshot = await getDocs(pQuery);
      setProducts(pSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));

      // Fetch Orders
      let oQuery = query(collection(db, 'orders'));
      const oSnapshot = await getDocs(oQuery);
      let fetchedOrders = oSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      if (profile.role === 'seller') {
        fetchedOrders = fetchedOrders.filter((order: any) => 
          order.items.some((item: any) => item.sellerId === profile.uid)
        );
      }
      fetchedOrders.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setOrders(fetchedOrders);

      // Fetch Users
      if (profile.role === 'admin') {
        const uSnapshot = await getDocs(query(collection(db, 'users')));
        setUsers(uSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUserAction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser || !actionReason) return;
    setUpdatingUser(true);
    try {
      const status = userAction === 'suspend' ? 'suspended' : 'deleted';
      await updateDoc(doc(db, 'users', selectedUser.id), {
        status,
        deletionReason: actionReason
      });

      // Send email notification to the user
      if (selectedUser.email) {
        await addDoc(collection(db, 'mail'), {
          to: selectedUser.email,
          message: {
            subject: `Your Chiricharo Account has been ${status}`,
            html: `<p>Hello ${selectedUser.name},</p><p>Your account on Chiricharo has been <strong>${status}</strong> by an administrator.</p><p>Reason provided:</p><blockquote style="border-left: 4px solid #ccc; padding-left: 10px; color: #555;">${actionReason}</blockquote><p>If you believe this is an error, please contact support.</p>`
          },
          createdAt: new Date().toISOString()
        });
      }

      setIsUserModalOpen(false);
      setSelectedUser(null);
      setActionReason('');
      fetchData();
    } catch (error) {
      console.error("Error updating user status:", error);
    } finally {
      setUpdatingUser(false);
    }
  };

  const handleProductStatus = async (productId: string, status: 'approved' | 'rejected') => {
    try {
      await updateDoc(doc(db, 'products', productId), { status });
      fetchData();
    } catch (error) {
      console.error("Error updating product status:", error);
    }
  };

  const handleSellerStatus = async (userId: string, status: 'approved' | 'rejected') => {
    try {
      await updateDoc(doc(db, 'users', userId), { 'sellerInfo.status': status });
      fetchData();
    } catch (error) {
      console.error("Error updating seller status:", error);
    }
  };

  const handleOrderStatus = async (orderId: string, status: string) => {
    try {
      await updateDoc(doc(db, 'orders', orderId), { status });
      fetchData();
    } catch (error) {
      console.error("Error updating order status:", error);
    }
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    setAddingProduct(true);
    try {
      await addDoc(collection(db, 'products'), {
        name: newProduct.name,
        description: newProduct.description,
        price: Number(newProduct.price),
        stock: Number(newProduct.stock),
        category: newProduct.category,
        color: newProduct.color,
        size: newProduct.size,
        condition: newProduct.condition,
        image: newProduct.image || `https://picsum.photos/seed/${Math.random()}/600/600`, // Placeholder
        sellerId: profile.uid,
        status: 'pending',
        createdAt: new Date().toISOString()
      });
      setIsAddModalOpen(false);
      setNewProduct({ name: '', description: '', price: '', stock: '', category: 'Electronics', color: '', size: '', condition: 'New', image: '' });
      fetchData();
    } catch (error) {
      console.error("Error adding product:", error);
    } finally {
      setAddingProduct(false);
    }
  };

  const renderOverview = () => {
    const totalProducts = products.length;
    const approvedProducts = products.filter(p => p.status === 'approved').length;
    const pendingProducts = products.filter(p => p.status === 'pending').length;
    
    const totalOrders = orders.length;
    
    let totalEarnings = 0;
    if (profile?.role === 'admin') {
      totalEarnings = orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
    } else {
      orders.forEach(order => {
        order.items.forEach((item: any) => {
          if (item.sellerId === profile?.uid) {
            totalEarnings += (item.price * item.quantity);
          }
        });
      });
    }

    const recentOrders = orders.slice(0, 5);

    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-900">{t('dashboard.overview')}</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <p className="text-sm font-medium text-gray-500">{t('dashboard.totalEarnings')}</p>
            <p className="text-2xl font-bold text-gray-900 mt-2">{totalEarnings.toFixed(2)} ETB</p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <p className="text-sm font-medium text-gray-500">{t('dashboard.totalOrders')}</p>
            <p className="text-2xl font-bold text-gray-900 mt-2">{totalOrders}</p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <p className="text-sm font-medium text-gray-500">{t('dashboard.totalProducts')}</p>
            <p className="text-2xl font-bold text-gray-900 mt-2">{totalProducts}</p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex justify-between items-center">
            <div>
              <p className="text-sm font-medium text-gray-500">{t('dashboard.approved')}</p>
              <p className="text-2xl font-bold text-green-600 mt-2">{approvedProducts}</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-gray-500">{t('dashboard.pending')}</p>
              <p className="text-2xl font-bold text-yellow-600 mt-2">{pendingProducts}</p>
            </div>
          </div>
        </div>

        <h3 className="text-lg font-bold text-gray-900 mt-8 mb-4">{t('dashboard.recentOrders')}</h3>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50 text-gray-900 font-bold">
              <tr>
                <th className="px-6 py-4">Order ID</th>
                <th className="px-6 py-4">Item Name</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {recentOrders.map(order => (
                <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-gray-900">{order.id.slice(0, 8)}...</td>
                  <td className="px-6 py-4">
                    {profile?.role === 'admin' 
                      ? order.items.map((i:any) => i.name).join(', ')
                      : order.items.filter((i:any)=>i.sellerId===profile?.uid).map((i:any) => i.name).join(', ')}
                  </td>
                  <td className="px-6 py-4">
                    {profile?.role === 'admin' 
                      ? order.totalAmount 
                      : order.items.filter((i:any)=>i.sellerId===profile?.uid).reduce((sum:number, i:any)=>sum+(i.price*i.quantity),0)} ETB
                  </td>
                  <td className="px-6 py-4 capitalize">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                      order.status === 'delivered' ? 'bg-green-100 text-green-700' :
                      order.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                      'bg-yellow-100 text-yellow-700'
                    }`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">{new Date(order.createdAt).toLocaleDateString()}</td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => {
                        setSelectedOrder(order);
                        setIsOrderModalOpen(true);
                      }}
                      className="text-indigo-600 hover:text-indigo-800 font-bold text-xs bg-indigo-50 px-3 py-1 rounded-full"
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
              {recentOrders.length === 0 && (
                <tr><td colSpan={4} className="px-6 py-8 text-center text-gray-500">No recent orders.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderProducts = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">{profile?.role === 'admin' ? t('dashboard.allProducts') : t('dashboard.myProducts')}</h2>
        {profile?.role === 'seller' && (
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-xl font-bold hover:bg-indigo-700 transition-colors"
          >
            <Plus className="h-5 w-5" /> {t('dashboard.addProduct')}
          </button>
        )}
      </div>
      
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left text-sm text-gray-600">
          <thead className="bg-gray-50 text-gray-900 font-bold">
            <tr>
              <th className="px-6 py-4">Name</th>
              <th className="px-6 py-4">Price (ETB)</th>
              <th className="px-6 py-4">Stock</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {products.map(product => (
              <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 font-medium text-gray-900">{product.name}</td>
                <td className="px-6 py-4">{product.price}</td>
                <td className="px-6 py-4">{product.stock}</td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                    product.status === 'approved' ? 'bg-green-100 text-green-700' :
                    product.status === 'rejected' ? 'bg-red-100 text-red-700' :
                    'bg-yellow-100 text-yellow-700'
                  }`}>
                    {product.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right space-x-2">
                  {profile?.role === 'admin' && product.status === 'pending' && (
                    <>
                      <button onClick={() => handleProductStatus(product.id, 'approved')} className="text-green-600 hover:text-green-800"><CheckCircle className="h-5 w-5 inline" /></button>
                      <button onClick={() => handleProductStatus(product.id, 'rejected')} className="text-red-600 hover:text-red-800"><XCircle className="h-5 w-5 inline" /></button>
                    </>
                  )}
                  {profile?.role === 'seller' && (
                    <>
                      <button className="text-indigo-600 hover:text-indigo-800"><Edit className="h-5 w-5 inline" /></button>
                      <button className="text-gray-400 hover:text-red-600"><Trash2 className="h-5 w-5 inline" /></button>
                    </>
                  )}
                </td>
              </tr>
            ))}
            {products.length === 0 && (
              <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-500">No products found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderUsers = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">{t('dashboard.users')}</h2>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left text-sm text-gray-600">
          <thead className="bg-gray-50 text-gray-900 font-bold">
            <tr>
              <th className="px-6 py-4">Name</th>
              <th className="px-6 py-4">Email</th>
              <th className="px-6 py-4">Role</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {users.map(user => (
              <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 font-medium text-gray-900">{user.name}</td>
                <td className="px-6 py-4">{user.email}</td>
                <td className="px-6 py-4 capitalize">{user.role}</td>
                <td className="px-6 py-4">
                  <div className="flex flex-col gap-1">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider w-fit ${
                      user.status === 'suspended' ? 'bg-orange-100 text-orange-700' :
                      user.status === 'deleted' ? 'bg-red-100 text-red-700' :
                      'bg-green-100 text-green-700'
                    }`}>
                      {user.status || 'active'}
                    </span>
                    {user.role === 'seller' && user.sellerInfo && (
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider w-fit ${
                        user.sellerInfo.status === 'approved' ? 'bg-indigo-100 text-indigo-700' :
                        user.sellerInfo.status === 'rejected' ? 'bg-gray-100 text-gray-700' :
                        'bg-yellow-100 text-yellow-700'
                      }`}>
                        Seller: {user.sellerInfo.status}
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 text-right space-x-2">
                  {user.role === 'seller' && user.sellerInfo?.status === 'pending' && (
                    <>
                      <button onClick={() => handleSellerStatus(user.id, 'approved')} className="text-green-600 hover:text-green-800" title="Approve Seller"><CheckCircle className="h-5 w-5 inline" /></button>
                      <button onClick={() => handleSellerStatus(user.id, 'rejected')} className="text-red-600 hover:text-red-800" title="Reject Seller"><XCircle className="h-5 w-5 inline" /></button>
                    </>
                  )}
                  {user.role !== 'admin' && (
                    <>
                      <button 
                        onClick={() => {
                          setSelectedUser(user);
                          setUserAction('suspend');
                          setIsUserModalOpen(true);
                        }} 
                        className="text-orange-600 hover:text-orange-800"
                        title="Suspend User"
                      >
                        <XCircle className="h-5 w-5 inline" />
                      </button>
                      <button 
                        onClick={() => {
                          setSelectedUser(user);
                          setUserAction('delete');
                          setIsUserModalOpen(true);
                        }} 
                        className="text-red-600 hover:text-red-800"
                        title="Delete User"
                      >
                        <Trash2 className="h-5 w-5 inline" />
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderOrders = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">{profile?.role === 'admin' ? t('dashboard.allOrders') : t('dashboard.myOrders')}</h2>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left text-sm text-gray-600">
          <thead className="bg-gray-50 text-gray-900 font-bold">
            <tr>
              <th className="px-6 py-4">Order ID</th>
              <th className="px-6 py-4">Item Name</th>
              <th className="px-6 py-4">Amount (ETB)</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Date</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {orders.map(order => (
              <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 font-medium text-gray-900">{order.id.slice(0, 8)}...</td>
                <td className="px-6 py-4">
                  {profile?.role === 'admin' 
                    ? order.items.map((i:any) => i.name).join(', ')
                    : order.items.filter((i:any)=>i.sellerId===profile?.uid).map((i:any) => i.name).join(', ')}
                </td>
                <td className="px-6 py-4">
                  {profile?.role === 'admin' 
                    ? order.totalAmount 
                    : order.items.filter((i:any)=>i.sellerId===profile?.uid).reduce((sum:number, i:any)=>sum+(i.price*i.quantity),0)}
                </td>
                <td className="px-6 py-4 capitalize">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                    order.status === 'delivered' ? 'bg-green-100 text-green-700' :
                    order.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                    'bg-yellow-100 text-yellow-700'
                  }`}>
                    {order.status}
                  </span>
                </td>
                <td className="px-6 py-4">{new Date(order.createdAt).toLocaleDateString()}</td>
                <td className="px-6 py-4 text-right space-x-2">
                  <button 
                    onClick={() => {
                      setSelectedOrder(order);
                      setIsOrderModalOpen(true);
                    }}
                    className="text-indigo-600 hover:text-indigo-800 font-bold text-xs bg-indigo-50 px-3 py-1 rounded-full mr-2"
                  >
                    View Details
                  </button>
                  {profile?.role === 'admin' && order.status !== 'delivered' && order.status !== 'cancelled' && (
                    <select 
                      value={order.status}
                      onChange={(e) => handleOrderStatus(order.id, e.target.value)}
                      className="text-sm border border-gray-200 rounded-lg px-2 py-1 bg-gray-50 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    >
                      <option value="pending">Pending</option>
                      <option value="processing">Processing</option>
                      <option value="shipped">Shipped</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  )}
                </td>
              </tr>
            ))}
            {orders.length === 0 && (
              <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-500">No orders found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 flex flex-col md:flex-row gap-8 relative">
      {/* Sidebar */}
      <aside className="w-full md:w-64 shrink-0 space-y-2">
        <button
          onClick={() => setActiveTab('overview')}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${
            activeTab === 'overview' ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <LayoutDashboard className="h-5 w-5" /> {t('dashboard.overview')}
        </button>
        <button
          onClick={() => setActiveTab('products')}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${
            activeTab === 'products' ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <Package className="h-5 w-5" /> {profile?.role === 'admin' ? t('dashboard.allProducts') : t('dashboard.myProducts')}
        </button>
        <button
          onClick={() => setActiveTab('orders')}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${
            activeTab === 'orders' ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <ShoppingBag className="h-5 w-5" /> {profile?.role === 'admin' ? t('dashboard.allOrders') : t('dashboard.myOrders')}
        </button>
        {profile?.role === 'admin' && (
          <button
            onClick={() => setActiveTab('users')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${
              activeTab === 'users' ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Users className="h-5 w-5" /> {t('dashboard.users')}
          </button>
        )}
      </aside>

      {/* Main Content */}
      <div className="flex-1">
        {loading ? (
          <div className="flex items-center justify-center h-64">Loading...</div>
        ) : (
          <>
            {activeTab === 'overview' && renderOverview()}
            {activeTab === 'products' && renderProducts()}
            {activeTab === 'orders' && renderOrders()}
            {activeTab === 'users' && profile?.role === 'admin' && renderUsers()}
          </>
        )}
      </div>

      {/* Add Product Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl shadow-xl w-full max-w-lg overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <h3 className="text-xl font-bold text-gray-900">Add New Product</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="h-6 w-6" />
              </button>
            </div>
            <form onSubmit={handleAddProduct} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-1">Product Name</label>
                <input 
                  type="text" required value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2 px-4 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-1">Description</label>
                <textarea 
                  required rows={3} value={newProduct.description} onChange={e => setNewProduct({...newProduct, description: e.target.value})}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2 px-4 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-1">Price (ETB)</label>
                  <input 
                    type="number" required min="0" value={newProduct.price} onChange={e => setNewProduct({...newProduct, price: e.target.value})}
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2 px-4 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-1">Stock</label>
                  <input 
                    type="number" required min="0" value={newProduct.stock} onChange={e => setNewProduct({...newProduct, stock: e.target.value})}
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2 px-4 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-1">Category</label>
                  <select 
                    value={newProduct.category} onChange={e => setNewProduct({...newProduct, category: e.target.value})}
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2 px-4 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  >
                    <option value="Electronics">Electronics</option>
                    <option value="Fashion">Fashion</option>
                    <option value="Home Tech">Home Tech</option>
                    <option value="Gaming">Gaming</option>
                    <option value="Collectibles">Collectibles</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-1">Condition</label>
                  <select 
                    value={newProduct.condition} onChange={e => setNewProduct({...newProduct, condition: e.target.value})}
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2 px-4 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  >
                    <option value="New">New</option>
                    <option value="Used">Used</option>
                    <option value="Refurbished">Refurbished</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-1">Color (Optional)</label>
                  <input 
                    type="text" value={newProduct.color} onChange={e => setNewProduct({...newProduct, color: e.target.value})}
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2 px-4 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    placeholder="e.g. Black, Red"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-1">Size (Optional)</label>
                  <input 
                    type="text" value={newProduct.size} onChange={e => setNewProduct({...newProduct, size: e.target.value})}
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2 px-4 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    placeholder="e.g. M, L, 42"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-1">Image URL (Optional)</label>
                <input 
                  type="url" value={newProduct.image} onChange={e => setNewProduct({...newProduct, image: e.target.value})}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2 px-4 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  placeholder="https://example.com/image.jpg"
                />
              </div>
              <div className="pt-4">
                <button 
                  type="submit" disabled={addingProduct}
                  className="w-full rounded-full bg-indigo-600 py-3 text-base font-bold text-white hover:bg-indigo-700 transition-all disabled:opacity-50"
                >
                  {addingProduct ? 'Adding...' : 'Submit for Approval'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* User Action Modal (Suspend/Delete) */}
      {isUserModalOpen && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <h3 className="text-xl font-bold text-gray-900 capitalize">{userAction} User</h3>
              <button onClick={() => setIsUserModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="h-6 w-6" />
              </button>
            </div>
            <form onSubmit={handleUserAction} className="p-6 space-y-4">
              <div className="bg-gray-50 p-4 rounded-xl mb-4">
                <p className="text-sm text-gray-600">User: <span className="font-bold text-gray-900">{selectedUser.name}</span></p>
                <p className="text-sm text-gray-600">Email: <span className="font-bold text-gray-900">{selectedUser.email}</span></p>
              </div>
              
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">Reason for {userAction}</label>
                <textarea 
                  required 
                  rows={4} 
                  value={actionReason} 
                  onChange={e => setActionReason(e.target.value)}
                  placeholder={`Please provide a reason why this account is being ${userAction}ed...`}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 px-4 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
              
              <div className="pt-4">
                <button 
                  type="submit" 
                  disabled={updatingUser}
                  className={`w-full rounded-full py-3 text-base font-bold text-white transition-all disabled:opacity-50 ${
                    userAction === 'delete' ? 'bg-red-600 hover:bg-red-700' : 'bg-orange-600 hover:bg-orange-700'
                  }`}
                >
                  {updatingUser ? 'Updating...' : `Confirm ${userAction}`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Order Details Modal */}
      {isOrderModalOpen && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl shadow-xl w-full max-w-2xl overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <h3 className="text-xl font-bold text-gray-900">Order Details</h3>
              <button onClick={() => setIsOrderModalOpen(false)} className="text-gray-400 hover:text-gray-600">
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
                  <p className="text-sm font-bold text-gray-500">Buyer Name</p>
                  <p className="font-medium text-gray-900">{selectedOrder.buyerName || 'Unknown'}</p>
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-500">Buyer Email</p>
                  <p className="font-medium text-gray-900">{selectedOrder.buyerEmail || 'Unknown'}</p>
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
