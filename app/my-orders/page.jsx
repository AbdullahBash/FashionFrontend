'use client';
import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '@/app/config.js';
import { useRouter } from 'next/navigation';

export default function MyOrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchMyOrders();
  }, []);

  const fetchMyOrders = async () => {
    const tokenCookie = document.cookie.split('; ').find(row => row.startsWith('token='));
    const token = tokenCookie ? tokenCookie.split('=')[1] : null;

    if (!token) {
      router.push('/login');
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/Order/my-orders`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!res.ok) {
        const errorText = await res.text(); 
        console.error("❌ Error Details:");
        console.error("Status:", res.status); 
        console.error("Body:", errorText);
        throw new Error(`Error ${res.status}: ${errorText}`);
      }

      const data = await res.json();
      setOrders(data);
      setLoading(false);
    } catch (err) {
      console.error("Full Error:", err);
      setError(err.message);
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending': return '#ffa500';
      case 'shipped': return '#007bff';
      case 'delivered': return '#28a745';
      case 'cancelled': return '#dc3545';
      default: return '#6c757d';
    }
  };

  if (loading) return <div style={styles.loading}>Loading your orders...</div>;
  if (error) return <div style={styles.error}>{error}</div>;

  return (
    <div style={styles.container}>
      <h1 style={styles.heading}>My Orders</h1>

      {orders.length === 0 ? (
        <div style={styles.emptyState}>
          <p style={styles.emptyText}>You haven't placed any orders yet.</p>
          <p style={styles.hint}>Note: Orders placed as a "Guest" do not appear here.</p>
          <button onClick={() => router.push('/')} style={styles.shopBtn}>Start Shopping</button>
        </div>
      ) : (
        <div style={styles.ordersList}>
          {orders.map((order) => (
            <div key={order.id} style={styles.orderCard}>
              <div style={styles.orderHeader}>
                <div>
                  <span style={styles.label}>Order ID:</span> <strong>#{order.id}</strong>
                </div>
                <div style={{ color: '#666', fontSize: '0.9rem' }}>
                  {new Date(order.orderDate).toLocaleDateString()}
                </div>
              </div>

              <div style={styles.orderBody}>
                <div>
                  <span style={styles.label}>Total:</span>
                  <span style={styles.total}>${order.totalAmount}</span>
                </div>
                <div style={{ 
                  padding: '5px 12px', 
                  borderRadius: '4px', 
                  backgroundColor: getStatusColor(order.status) + '20',
                  color: getStatusColor(order.status),
                  fontWeight: 'bold',
                  fontSize: '0.85rem',
                  textTransform: 'uppercase'
                }}>
                  {order.status}
                </div>
              </div>

              <div style={styles.itemsPreview}>
                {order.items?.map((item, idx) => (
                  <div key={idx} style={styles.itemText}>
                    • {item.productName} (x{item.quantity})
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    // --- الإصلاح: خلفية بيضاء صريحة ---
    backgroundColor: '#fff', 
    padding: '60px 20px',
    maxWidth: '900px',
    margin: '0 auto',
    fontFamily: 'Arial, sans-serif',
    minHeight: '100vh', // لضمان تغطية الشاشة كاملة باللون الأبيض
    color: '#000' // ضمان اللون الافتراضي للنصوص
  },
  heading: {
    textAlign: 'center',
    fontSize: '2.5rem',
    marginBottom: '40px',
    color: '#000', // عنوان أسود واضح على الخلفية البيضاء
    textTransform: 'uppercase',
    letterSpacing: '2px',
    fontWeight: '700'
  },
  loading: { 
    textAlign: 'center', 
    marginTop: '50px', 
    fontSize: '1.2rem',
    color: '#000' // لون التحميل أسود
  },
  error: { 
    textAlign: 'center', 
    marginTop: '50px', 
    color: 'red', 
    fontSize: '1.1rem',
    backgroundColor: '#fff', // خلفية بيضاء لرسالة الخطأ
    padding: '20px'
  },
  emptyState: { 
    textAlign: 'center', 
    marginTop: '100px',
    backgroundColor: '#fff'
  },
  emptyText: { 
    fontSize: '1.5rem', 
    marginBottom: '20px',
    color: '#333',
    fontWeight: '300'
  },
  hint: { 
    fontSize: '1rem', 
    color: '#555', 
    marginBottom: '30px',
    fontStyle: 'italic'
  },
  shopBtn: {
    marginTop: '20px',
    padding: '15px 40px',
    backgroundColor: '#000',
    color: '#fff',
    border: 'none',
    cursor: 'pointer',
    textTransform: 'uppercase',
    fontSize: '1rem',
    fontWeight: 'bold'
  },
  ordersList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px'
  },
  orderCard: {
    border: '2px solid #000', // حدود سوداء لتتناسب مع التصميم
    borderRadius: '0px', // زوايا حادة
    padding: '20px',
    backgroundColor: '#fff',
    boxShadow: '0 5px 15px rgba(0,0,0,0.05)'
  },
  orderHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '15px',
    borderBottom: '2px solid #000',
    paddingBottom: '10px',
    fontSize: '0.95rem',
    color: '#000'
  },
  orderBody: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '15px'
  },
  label: { color: '#666', marginRight: '5px', fontSize: '0.9rem' },
  total: { fontSize: '1.3rem', fontWeight: 'bold', color: '#000' },
  itemsPreview: {
    borderTop: '1px solid #eee',
    paddingTop: '10px',
    color: '#555',
    fontSize: '0.85rem'
  },
  itemText: { marginBottom: '4px', color: '#000' }
};