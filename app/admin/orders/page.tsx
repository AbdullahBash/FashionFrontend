'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { API_BASE_URL } from '@/app/config.js';

// تعريف واجهة الطلب
interface OrderStatus {
  statusID: number;
  statusName: string;
}

interface User {
  name: string;
  phoneNumber?: string;
  address?: string;
  city?: string;
  country?: {
    name: string;
  };
}

interface Order {
  id: number;
  createdAt: string;
  guestName?: string;
  guestPhone?: string;
  guestAddress?: string;
  userId?: number;
  orderStatus?: OrderStatus | null;
  items?: any[];
  totalAmount?: number;
  user?: User;
}

export default function OrdersPage() {
  const router = useRouter();
  
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null); 
  const [loadingDetails, setLoadingDetails] = useState(false);
  
  // --- متغيرات الترقيم ---
  const [currentPage, setCurrentPage] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);
  const [pageSize, setPageSize] = useState(10); 
  // ----------------------------

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  // --- تعريف Base URL للصور ---
  const SERVER_BASE_URL = API_BASE_URL.replace('/api', '');

  const getAuthHeaders = () => {
    const tokenCookie = document.cookie.split('; ').find(row => row.startsWith('token='));
    const token = tokenCookie ? tokenCookie.split('=')[1] : null;
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    return headers;
  };

  const styles: Record<string, React.CSSProperties> = { 
    container: { padding: '40px', maxWidth: '1600px', margin: '0 auto', fontFamily: 'Inter, Segoe UI, Tahoma, Geneva, Verdana, sans-serif', backgroundColor: '#0f172a', minHeight: '100vh', color: '#e2e8f0' } as React.CSSProperties,
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', paddingBottom: '20px', borderBottom: '1px solid #334155' } as React.CSSProperties,
    title: { margin: 0, fontSize: '32px', color: '#f8fafc', fontWeight: '700', letterSpacing: '-0.5px' } as React.CSSProperties,
    searchRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', gap: '20px', backgroundColor: '#1e293b', padding: '20px 30px', borderRadius: '16px', border: '1px solid #334155', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.3)' } as React.CSSProperties,
    searchInput: { padding: '14px 20px', border: '1px solid #475569', borderRadius: '12px', width: '100%', maxWidth: '400px', fontSize: '1rem', outline: 'none', backgroundColor: '#0f172a', color: '#fff', transition: 'all 0.3s ease' } as React.CSSProperties,
    filterSelect: { padding: '14px 20px', border: '1px solid #475569', borderRadius: '12px', fontSize: '1rem', outline: 'none', backgroundColor: '#0f172a', color: '#fff', cursor: 'pointer', width: '100%', maxWidth: '220px', appearance: 'none', backgroundImage: `url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%2394a3b8%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%0A%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem center', backgroundSize: '0.65em auto' } as React.CSSProperties,
    tableContainer: { backgroundColor: '#1e293b', borderRadius: '16px', border: '1px solid #334155', overflow: 'hidden', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.4)' } as React.CSSProperties,
    table: { width: '100%', borderCollapse: 'collapse', minWidth: '1000px' } as React.CSSProperties,
    th: { padding: '20px', textAlign: 'left', backgroundColor: '#0f172a', color: '#94a3b8', fontWeight: '600', borderBottom: '2px solid #334155', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' } as React.CSSProperties,
    td: { padding: '20px', borderBottom: '1px solid #334155', verticalAlign: 'middle', color: '#f1f5f9', fontSize: '1rem', transition: 'background-color 0.2s' } as React.CSSProperties,
    statusPending: { padding: '6px 14px', borderRadius: '50px', backgroundColor: 'rgba(234, 179, 8, 0.15)', color: '#facc15', fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px', border: '1px solid rgba(234, 179, 8, 0.3)' } as React.CSSProperties,
    statusShipped: { padding: '6px 14px', borderRadius: '50px', backgroundColor: 'rgba(34, 197, 94, 0.15)', color: '#4ade80', fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px', border: '1px solid rgba(34, 197, 94, 0.3)' } as React.CSSProperties,
    statusDelivered: { padding: '6px 14px', borderRadius: '50px', backgroundColor: 'rgba(59, 130, 246, 0.15)', color: '#60a5fa', fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px', border: '1px solid rgba(59, 130, 246, 0.3)' } as React.CSSProperties,
    statusCancelled: { padding: '6px 14px', borderRadius: '50px', backgroundColor: 'rgba(239, 68, 68, 0.15)', color: '#f87171', fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px', border: '1px solid rgba(239, 68, 68, 0.3)' } as React.CSSProperties,
    statusProcessing: { padding: '6px 14px', borderRadius: '50px', backgroundColor: 'rgba(168, 85, 247, 0.15)', color: '#c084fc', fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px', border: '1px solid rgba(168, 85, 247, 0.3)' } as React.CSSProperties,
    button: { padding: '10px 18px', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '0.9rem', fontWeight: '600', transition: 'transform 0.1s, opacity 0.2s' } as React.CSSProperties,
    viewBtn: { backgroundColor: '#6366f1', color: '#fff', boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)' } as React.CSSProperties,
    backBtn: { backgroundColor: '#334155', color: '#cbd5e1' } as React.CSSProperties,
    deleteBtn: { padding: '10px 14px', backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#f87171', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '8px', cursor: 'pointer', fontSize: '1rem', transition: 'background 0.2s' } as React.CSSProperties,
    statusSelect: { padding: '8px 12px', borderRadius: '8px', border: '1px solid #475569', fontSize: '0.85rem', backgroundColor: '#0f172a', color: '#e2e8f0', cursor: 'pointer', minWidth: '130px', outline: 'none' } as React.CSSProperties,
    modalOverlay: { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 } as React.CSSProperties,
    modalContent: { backgroundColor: '#1e293b', padding: '40px', borderRadius: '20px', width: '90%', maxWidth: '850px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)', border: '1px solid #334155', color: '#f8fafc' } as React.CSSProperties,
    itemRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px', borderBottom: '1px solid #334155', backgroundColor: '#0f172a', borderRadius: '12px', marginBottom: '10px' } as React.CSSProperties,
    optionsRow: { display: 'flex', gap: '8px', flexWrap: 'wrap' as const, marginTop: '4px' } as React.CSSProperties,
    optionTag: { fontSize: '0.75rem', padding: '3px 8px', backgroundColor: 'rgba(99, 102, 241, 0.15)', color: '#a5b4fc', borderRadius: '4px', fontWeight: '600', textTransform: 'uppercase' as const, border: '1px solid rgba(99, 102, 241, 0.2)', letterSpacing: '0.5px' } as React.CSSProperties,
    paginationContainer: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px', padding: '20px', backgroundColor: '#1e293b', borderRadius: '12px', border: '1px solid #334155' } as React.CSSProperties,
    paginationBtn: { padding: '8px 16px', backgroundColor: '#334155', color: '#e2e8f0', border: '1px solid #475569', borderRadius: '6px', cursor: 'pointer', fontSize: '0.9rem', fontWeight: '600', transition: 'all 0.2s' } as React.CSSProperties,
    paginationBtnDisabled: { opacity: '0.5', cursor: 'not-allowed' } as React.CSSProperties,
    paginationInfo: { color: '#94a3b8', fontSize: '0.9rem', fontWeight: '500' }
  };

  // --- جلب البيانات مع الترقيم ---
  useEffect(() => {
    fetchOrders();
  }, [currentPage, pageSize]); 

   const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/Order?pageNumber=${currentPage}&pageSize=${pageSize}`, { headers: getAuthHeaders() });
      if (res.ok) {
        const response = await res.json();
        const ordersData = response.data || response.Data || [];
        const totalCountVal = response.totalCount || response.TotalCount || 0;
        setOrders(ordersData);
        setTotalOrders(totalCountVal);
      } else {
        alert('Failed to fetch orders');
      }
    } catch (error) {
      console.error("Network Error:", error);
      alert('Network Error');
    } finally {
      setLoading(false);
    }
  };

  const handlePageSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newSize = parseInt(e.target.value);
    setPageSize(newSize);
    setCurrentPage(1);
  };

  const handleViewOrder = async (orderId: number) => {
    setLoadingDetails(true);
    setSelectedOrder(null);
    try {
      const res = await fetch(`${API_BASE_URL}/Order/${orderId}`, { headers: getAuthHeaders() });
      if (res.ok) {
        const data = await res.json();
        setSelectedOrder(data);
      } else {
        alert('Failed to fetch order details');
      }
    } catch (error) {
      console.error(error);
      alert('Error fetching order details');
    } finally {
      setLoadingDetails(false);
    }
  };

  // --- دوال مساعدة للصور والبيانات ---
  
  // دالة معالجة الصور (نسخة من FeaturedProducts)
  const getImageUrl = (url: string | undefined | null): string => {
    if (!url) return 'https://via.placeholder.com/300';
    if (url.startsWith('http')) return url;
    return `${SERVER_BASE_URL}${url}`;
  };

  // دالة استخراج رابط الصورة من العنصر (تعتمد على getImageUrl)
  const getProductImage = (item: any): string => {
    if (!item) return '';
    
    // 1. البحث في الـ item مباشرة
    let url = item.image || item.Image || item.imageUrl || item.ImageUrl;
    
    // 2. البحث داخل كائن product
    if (!url && item.product) {
      url = item.product.image || item.product.Image || item.product.imageUrl || item.product.ImageUrl;
    }
    
    // 3. البحث داخل كائن Product
    if (!url && item.Product) {
      url = item.Product.image || item.Product.Image || item.Product.imageUrl || item.Product.ImageUrl;
    }
    
    // 4. إرجاع الرابط بعد المعالجة
    return getImageUrl(url);
  };

  // --- دالة إرسال واتساب ---
  const sendWhatsAppMessage = (phone: string, status: string, orderId: number) => {
    let cleanPhone = phone.replace(/[^0-9]/g, '');
    if (!cleanPhone.startsWith('00')) {
        // أضف كود الدولة هنا إذا لزم الأمر
        // cleanPhone = '966' + cleanPhone; 
    }

    let message = '';
    if (status === 'Shipped') {
        message = `Hello! Your order #${orderId} has been shipped and is on its way to you. Thank you for shopping with us!`;
    } else if (status === 'Delivered') {
        message = `Hello! Great news, your order #${orderId} has been delivered. We hope you enjoy it!`;
    } else {
        return; 
    }

    const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  const getOrderStatusName = (order: Order): string => {
    return order.orderStatus?.statusName || 'Pending';
  };

  const handleStatusChange = async (orderId: number, newStatus: string) => {
    try {
      const headers = { ...getAuthHeaders(), 'Content-Type': 'application/json' }; 
      const res = await fetch(`${API_BASE_URL}/Order/${orderId}`, {
        method: 'PUT', headers, body: JSON.stringify({ status: newStatus })
      });

      if (res.ok) {
        setOrders(orders.map(order => 
          order.id === orderId ? { ...order, orderStatus: { ...order.orderStatus, statusID: order.orderStatus?.statusID || 0, statusName: newStatus } } : order
        ));

        // --- إصلاح خطأ TypeScript ---
        const order = orders.find(o => o.id === orderId);
        
        if (order) {
            const phone = getPhone(order); 
            if (newStatus === 'Shipped' || newStatus === 'Delivered') {
                sendWhatsAppMessage(phone, newStatus, orderId);
            }
        }
        // ------------------------------

        alert('Status updated' + ( (newStatus === 'Shipped' || newStatus === 'Delivered') ? ' & WhatsApp sent!' : ''));
      } else {
        alert('Failed to update status');
      }
    } catch (error) {
      alert('Error updating status');
    }
  };

  const handleDeleteOrder = async (orderId: number, customerName: string) => {
    if (!confirm(`Delete order #${orderId}?`)) return;
    try {
      const res = await fetch(`${API_BASE_URL}/Order/${orderId}`, { method: 'DELETE', headers: getAuthHeaders() });
      if (res.ok) {
        setOrders(orders.filter(order => order.id !== orderId));
        setTotalOrders(prev => Math.max(0, prev - 1));
        alert('Order deleted');
      }
    } catch (e) { alert('Error'); }
  };

  const getOrderItems = (order: Order) => order.items || [];
  const getItemPrice = (item: any) => item.price || item.Product?.Price || item.product?.Price || 0;
  const getOrderTotal = (items: any[]) => items.reduce((total, item) => total + (getItemPrice(item) * item.quantity), 0).toFixed(2);
  
  const formatDate = (dateStr: string) => { if (!dateStr) return 'No Date'; const d = new Date(dateStr); return isNaN(d.getTime()) ? 'Invalid Date' : d.toLocaleDateString(); };
  const getCustomerName = (order: Order | undefined) => order?.user?.name || order?.guestName || 'Guest';
  const getPhone = (order: Order | undefined) => order?.user?.phoneNumber || order?.guestPhone || 'N/A';
  const getAddress = (order: Order) => order.user?.address ? `${order.user.address}, ${order.user.city || ''}, ${order.user.country?.name || ''}` : (order.guestAddress || 'No address provided');
  
  const getStatusStyle = (status?: string) => {
    switch(status?.toLowerCase()) {
      case 'pending': return styles.statusPending; case 'processing': return styles.statusProcessing;
      case 'shipped': return styles.statusShipped; case 'delivered': return styles.statusDelivered;
      case 'cancelled': return styles.statusCancelled;
      default: return { padding: '6px 14px', borderRadius: '20px', backgroundColor: 'rgba(148, 163, 184, 0.1)', color: '#94a3b8', border: '1px solid #475569' };
    }
  };
  
  const getProductName = (item: any) => item.productName || item.name || item.Name || item.Product?.Name || item.product?.name || 'Unknown Product';

  const filteredOrders = orders.filter(order => {
    const term = searchTerm.toLowerCase().trim();
    const customerName = getCustomerName(order).toLowerCase();
    const matchesText = customerName.includes(term) || getPhone(order).includes(term) || order.id.toString().includes(term);
    const matchesStatus = statusFilter === 'All' || getOrderStatusName(order) === statusFilter;
    return matchesText && matchesStatus;
  });

  const totalPages = Math.ceil(totalOrders / pageSize);
  const goToNext = () => { if (currentPage < totalPages) setCurrentPage(currentPage + 1); };
  const goToPrev = () => { if (currentPage > 1) setCurrentPage(currentPage - 1); };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Orders Management</h1>
        <div style={{display: 'flex', gap: '10px'}}>
            <button onClick={() => router.push('/admin')} style={{...styles.button, ...styles.backBtn}}>+ Add Product</button>
            <button onClick={() => router.push('/admin')} style={{...styles.button, ...styles.backBtn}}>Back to Dashboard</button>
        </div>
      </div>

      <div style={styles.searchRow}>
        <div style={{ display: 'flex', gap: '15px', alignItems: 'center', flex: 1 }}>
          <input type="text" placeholder="🔍 Search (Current Page Only)..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={styles.searchInput} />
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={styles.filterSelect}>
            <option value="All">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="Processing">Processing</option>
            <option value="Shipped">Shipped</option>
            <option value="Delivered">Delivered</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
        <div style={{ fontSize: '0.95rem', fontWeight: '600', color: '#94a3b8' }}>
          Total: <span style={{ color: '#fff' }}>{totalOrders}</span> orders
        </div>
      </div>

      <div style={styles.tableContainer}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Order ID</th>
              <th style={styles.th}>Date</th>
              <th style={styles.th}>Customer</th>
              <th style={styles.th}>Phone</th>
              <th style={styles.th}>Total ($)</th>
              <th style={styles.th}>Status</th>
              <th style={styles.th}>Change Status</th>
              <th style={styles.th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={8} style={{textAlign:'center', padding:'50px'}}>Loading...</td></tr>
            ) : filteredOrders.length === 0 ? (
              <tr><td colSpan={8} style={{textAlign:'center', padding:'50px'}}>No orders found on this page.</td></tr>
            ) : (
              filteredOrders.map(order => (
                <tr key={order.id} style={{ backgroundColor: order.id % 2 === 0 ? 'transparent' : 'rgba(15, 23, 42, 0.5)' }}>
                  <td style={styles.td}><strong>#{order.id}</strong></td>
                  <td style={styles.td}>{formatDate(order.createdAt)}</td>
                  <td style={styles.td}>{getCustomerName(order)}</td>
                  <td style={styles.td}>{getPhone(order)}</td>
                  <td style={styles.td}><strong style={{color:'#60a5fa'}}>${getOrderTotal(getOrderItems(order))}</strong></td>
                  <td style={styles.td}><span style={getStatusStyle(getOrderStatusName(order))}>{getOrderStatusName(order)}</span></td>
                  <td style={styles.td}>
                    <select value={getOrderStatusName(order)} onChange={(e) => handleStatusChange(order.id, e.target.value)} style={styles.statusSelect}>
                      <option value="Pending">Pending</option><option value="Processing">Processing</option><option value="Shipped">Shipped</option><option value="Delivered">Delivered</option><option value="Cancelled">Cancelled</option>
                    </select>
                  </td>
                  <td style={styles.td}>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button onClick={() => handleViewOrder(order.id)} style={{...styles.button, ...styles.viewBtn}} disabled={loadingDetails}>{loadingDetails ? '...' : 'View'}</button>
                      <button onClick={() => handleDeleteOrder(order.id, getCustomerName(order))} style={styles.deleteBtn}>🗑️</button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div style={styles.paginationContainer}>
        <div style={{ fontSize: '0.9rem', color: '#94a3b8' }}>
          Page <strong style={{color: '#fff'}}>{currentPage}</strong> of <strong style={{color: '#fff'}}>{totalPages || 1}</strong>
        </div>
        <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.85rem', color: '#cbd5e1' }}>Rows:</span>
            <select 
              value={pageSize} 
              onChange={handlePageSizeChange} 
              style={{
                padding: '6px 12px',
                backgroundColor: '#0f172a',
                color: '#fff',
                border: '1px solid #475569',
                borderRadius: '6px',
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              <option value="5">5</option>
              <option value="10">10</option>
              <option value="20">20</option>
              <option value="50">50</option>
            </select>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button 
              onClick={goToPrev} 
              disabled={currentPage === 1}
              style={{...styles.paginationBtn, ...(currentPage === 1 ? styles.paginationBtnDisabled : {})}}
            >
              Previous
            </button>
            <button 
              onClick={goToNext} 
              disabled={currentPage >= totalPages}
              style={{...styles.paginationBtn, ...(currentPage >= totalPages ? styles.paginationBtnDisabled : {})}}
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {selectedOrder && (
        <div style={styles.modalOverlay} onClick={() => setSelectedOrder(null)}>
          <div style={styles.modalContent} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '30px', alignItems: 'center', borderBottom: '1px solid #334155', paddingBottom: '20px' }}>
              <h2 style={{ margin: 0, color: '#fff', fontSize: '24px' }}>Order Details #{selectedOrder.id}</h2>
              <span style={getStatusStyle(getOrderStatusName(selectedOrder))}>{getOrderStatusName(selectedOrder)}</span>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', marginBottom: '25px' }}>
              <div style={{ backgroundColor: '#0f172a', padding: '20px', borderRadius: '12px', border: `1px solid #334155` }}>
                <p style={{ margin: '0 0 10px 0', fontSize: '0.8rem', color: '#94a3b8', textTransform: 'uppercase' }}>Customer Name</p>
                <p style={{ margin: 0, fontSize: '1.2rem', fontWeight: 'bold', color: '#fff' }}>{getCustomerName(selectedOrder)}</p>
                <p style={{ margin: '25px 0 10px 0', fontSize: '0.8rem', color: '#94a3b8', textTransform: 'uppercase' }}>Phone Number</p>
                <p style={{ margin: 0, fontSize: '1.1rem', color: '#cbd5e1' }}>{getPhone(selectedOrder)}</p>
              </div>
              <div style={{ backgroundColor: '#0f172a', padding: '20px', borderRadius: '12px', border: `1px solid #334155` }}>
                <p style={{ margin: '0 0 10px 0', fontSize: '0.8rem', color: '#94a3b8', textTransform: 'uppercase' }}>Order Date</p>
                <p style={{ margin: 0, fontSize: '1.1rem', color: '#cbd5e1' }}>{formatDate(selectedOrder.createdAt)}</p>
                <p style={{ margin: '25px 0 10px 0', fontSize: '0.8rem', color: '#94a3b8', textTransform: 'uppercase' }}>Order ID</p>
                <p style={{ margin: 0, fontSize: '1.1rem', color: '#cbd5e1' }}>#{selectedOrder.id}</p>
              </div>
            </div>
            
            <div style={{ backgroundColor: '#0f172a', padding: '25px', borderRadius: '12px', marginBottom: '30px', border: `1px solid #334155` }}>
              <p style={{ margin: '0', fontSize: '0.8rem', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '10px' }}>Shipping Address</p>
              <p style={{ margin: 0, lineHeight: '1.6', color: '#f1f5f9', fontSize: '1.05rem' }}>{getAddress(selectedOrder)}</p>
            </div>

            <div style={{ marginBottom: '30px' }}>
              <h3 style={{ color: '#fff', marginBottom: '20px' }}>Items</h3>
              <div style={{ maxHeight: '400px', overflowY: 'auto', paddingRight: '10px' }}>
                {getOrderItems(selectedOrder).length === 0 ? (
                  <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>No items</div>
                ) : (
                  getOrderItems(selectedOrder).map((item, idx) => {
                    // --- استخدام getProductImage ---
                    const productImageSrc = getProductImage(item);
                    
                    return (
                    <div key={idx} style={styles.itemRow}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flex: 1 }}>
                        {productImageSrc ? (
                          <img 
                            src={productImageSrc} 
                            alt="Product" 
                            style={{ width: '70px', height: '70px', objectFit: 'cover', borderRadius: '10px', border: `1px solid #334155` }} 
                            onError={(e) => { 
                                const target = e.target as HTMLImageElement;
                                target.src = 'https://via.placeholder.com/150?text=No+Img';
                            }}
                          />
                        ) : (
                          <div style={{ width: '70px', height: '70px', backgroundColor: '#1e293b', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', color: '#64748b' }}>No Img</div>
                        )}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          <div style={{ fontWeight: 'bold', fontSize: '1.1rem', color: '#fff' }}>{getProductName(item)}</div>
                          <div style={styles.optionsRow}>
                            {item.colorName && <span style={styles.optionTag}>{item.colorName}</span>}
                            {item.sizeName && <span style={styles.optionTag}>Size: {item.sizeName}</span>}
                            {item.copyName && <span style={styles.optionTag}>Ver: {item.copyName}</span>}
                          </div>
                          <div style={{ fontSize: '0.9rem', color: '#94a3b8' }}>Price: <strong style={{ color: '#cbd5e1' }}>${getItemPrice(item).toFixed(2)}</strong></div>
                          <div style={{ fontSize: '0.9rem', color: '#94a3b8' }}>Qty: <strong style={{ color: '#cbd5e1' }}>{item.quantity}</strong></div>
                        </div>
                      </div>
                      <div style={{ fontWeight: 'bold', color: '#60a5fa', fontSize: '1.3rem', minWidth: '110px', textAlign: 'right' }}>
                        ${(getItemPrice(item) * item.quantity).toFixed(2)}
                      </div>
                    </div>
                  )}
                  )
                )}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '20px', borderTop: `1px solid #334155` }}>
              <div></div> 
              <div style={{ textAlign: 'right' }}>
                <p style={{ margin: '0 0 5px 0', color: '#94a3b8', fontSize: '0.9rem', textTransform: 'uppercase' }}>Grand Total</p>
                <p style={{ margin: 0, fontSize: '2.5rem', fontWeight: 'bold', color: '#fff' }}>${(selectedOrder.totalAmount || 0).toFixed(2)}</p>
              </div>
            </div>

            <button onClick={() => setSelectedOrder(null)} style={{...styles.button, ...styles.viewBtn, width: '100%', marginTop: '30px', padding: '16px', fontSize: '1.1rem'}}>Close Details</button>
          </div>
        </div>
      )}
    </div>
  );
}