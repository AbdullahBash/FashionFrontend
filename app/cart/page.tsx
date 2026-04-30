'use client';

import React, { useState, useEffect } from 'react';
import { useCart, CartItem } from '../context/CartContext';
import { useRouter } from 'next/navigation';
import { API_BASE_URL } from '@/app/config.js';

interface Country {
  countryID: number;
  name: string;
  code: string;
}

export default function CartPage() {
  // تم تحديث هذا السطر ليستورد updateQuantity
  const { cart, removeFromCart, addToCart, clearCart, cartTotal, updateQuantity } = useCart();
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const [user, setUser] = useState<any>(null);

  const [countries, setCountries] = useState<Country[]>([]);
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [countryId, setCountryId] = useState(0);

  const [guestInfo, setGuestInfo] = useState({
    name: '',
    phone: ''
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/Countries`);
        if (res.ok) setCountries(await res.json());
      } catch (err) { console.error("Failed to fetch countries", err); }

      const storedUser = localStorage.getItem('user');
      const tokenCookie = document.cookie.split('; ').find(row => row.startsWith('token='));
      const token = tokenCookie ? tokenCookie.split('=')[1] : null;

      if (token) {
        try {
          const userRes = await fetch(`${API_BASE_URL}/Authentication/me`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });

          if (userRes.ok) {
            const userData = await userRes.json();
            setUser(userData);
            setAddress(userData.address || '');
            setCity(userData.city || '');
            setCountryId(userData.countryID || 0);
            setGuestInfo(prev => ({ ...prev, phone: userData.phoneNumber || '' }));
          }
        } catch (err) { console.error("Failed to fetch user profile", err); }
      } else if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    };

    fetchData();
  }, []);

  const totalItems = cart.reduce((sum: number, item: CartItem) => sum + (item.quantity || 0), 0);

  const handleCheckout = async () => {
    if (cart.length === 0) return;

    if (!address || !city || countryId === 0) {
      alert("Please fill in Address, City, and select a Country.");
      return;
    }

    if (!user && !guestInfo.name) {
      alert("Please enter your Name.");
      return;
    }

    setLoading(true);

    const payload: any = {
      items: cart.map((item: CartItem) => ({
        productId: item.id || item.Id,
        quantity: item.quantity,
        colorId: item.colorId,
        sizeId: item.sizeId,
        copyId: item.copyId
      })),
      address: address,
      city: city,
      countryId: countryId
    };

    if (user) {
      payload.userId = user.id;
    } else {
      payload.userId = null;
      payload.guestName = guestInfo.name;
      payload.guestPhone = guestInfo.phone;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/Order/place`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        alert('Order placed successfully! 🎉');
        clearCart();
        router.push('/my-orders');
      } else {
        const errorText = await response.text();
        alert(`Failed to place order: ${errorText}`);
      }
    } catch (error) {
      console.error('Checkout error:', error);
      alert('Network error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getUniqueKey = (item: CartItem) => {
    return `${item.id || item.Id}-${item.colorId || '0'}-${item.sizeId || '0'}-${item.copyId || '0'}`;
  };

  // تم تعديل هذه الدالة لاستخدام updateQuantity
  const handleDecrement = (item: CartItem) => {
    const currentQty = item.quantity || 0;
    if (currentQty > 1) {
      updateQuantity(item, currentQty - 1);
    } else {
      removeFromCart(item); 
    }
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.heading}>
        Shopping Cart ({totalItems} {totalItems === 1 ? 'Item' : 'Items'})
      </h1>

      {cart.length === 0 ? (
        <div style={styles.emptyState}>
          <p style={styles.emptyText}>Your cart is currently empty.</p>
          <button style={styles.shopButton} onClick={() => router.push('/')}>Start Shopping</button>
        </div>
      ) : (
        <div style={styles.cartContent}>
          <div style={styles.itemsList}>
            {cart.map((item: CartItem) => (
              <div key={getUniqueKey(item)} style={styles.cartItem}>
                <div style={styles.itemImageContainer}>
                  <img 
                    src={item.imageUrl || 'https://via.placeholder.com/100'} 
                    alt={item.name} 
                    style={styles.itemImage}
                  />
                </div>
                
                <div style={styles.itemDetails}>
                  <h3 style={styles.itemName}>{item.name}</h3>
                  <p style={styles.itemPrice}>${item.price}</p>
                  
                  <div style={styles.optionsContainer}>
                    {item.colorName && <span style={styles.optionTag}>{item.colorName}</span>}
                    {item.sizeName && <span style={styles.optionTag}>Size: {item.sizeName}</span>}
                    {item.copyName && <span style={styles.optionTag}>Ver: {item.copyName}</span>}
                  </div>
                </div>

                <div style={styles.quantityControl}>
                  <button 
                    style={styles.qtyButton} 
                    onClick={() => {
                      const { quantity, ...productToAdd } = item;
                      addToCart(productToAdd);
                    }}
                  >
                    +
                  </button>
                  <span style={styles.qtyText}>{item.quantity}</span>
                  <button style={styles.qtyButton} onClick={() => handleDecrement(item)}>-</button>
                </div>

                <div style={styles.itemSubtotal}>
                  ${(item.price * (item.quantity || 0)).toFixed(2)}
                </div>

                <button onClick={() => removeFromCart(item)} style={styles.removeButton}>
                  Remove
                </button>
              </div>
            ))}
          </div>

          <div style={styles.summary}>
            <h3 style={styles.summaryTitle}>Order Summary</h3>
            
            <div style={styles.summaryRow}>
              <span>Subtotal</span>
              <span>${cartTotal.toFixed(2)}</span>
            </div>
            
            <div style={styles.summaryRow}>
              <span>Shipping</span>
              <span>Free</span>
            </div>
            
            <div style={styles.totalRow}>
              <span>Total</span>
              <span style={styles.totalAmount}>${cartTotal.toFixed(2)}</span>
            </div>

            <div style={styles.guestForm}>
              <h4 style={styles.formTitle}>Shipping Details</h4>
              
              {!user && (
                <input 
                  type="text" 
                  placeholder="Full Name" 
                  value={guestInfo.name}
                  onChange={(e) => setGuestInfo({...guestInfo, name: e.target.value})}
                  style={styles.inputField}
                />
              )}

              {user && (
                <div style={styles.userBadge}>
                  <p>Logged in as: <strong>{user.name}</strong></p>
                  <p style={styles.note}>Your saved address is loaded below.</p>
                </div>
              )}

              <input 
                type="text" 
                placeholder="Street Address" 
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                style={styles.inputField}
              />
              
              <div style={{ display: 'flex', gap: '10px' }}>
                <input 
                  type="text" 
                  placeholder="City" 
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  style={{ ...styles.inputField, flex: 1 }}
                />

                <select 
                  value={countryId} 
                  onChange={(e) => setCountryId(Number(e.target.value))}
                  style={{ ...styles.inputField, flex: 1, cursor: 'pointer' }}
                >
                  <option value={0}>Select Country</option>
                  {countries.map(country => (
                    <option key={country.countryID} value={country.countryID}>
                      {country.name}
                    </option>
                  ))}
                </select>
              </div>

              <input 
                type="tel" 
                placeholder="Phone Number" 
                value={user ? (user.phoneNumber || '') : guestInfo.phone}
                onChange={(e) => setGuestInfo({...guestInfo, phone: e.target.value})}
                style={styles.inputField}
              />

              <button 
                onClick={handleCheckout}
                style={{
                  ...styles.checkoutButton,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.7 : 1
                }}
                disabled={loading}
              >
                {loading ? 'Processing...' : 'Proceed to Checkout'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    minHeight: '80vh',
    padding: '50px 20px',
    maxWidth: '1200px',
    margin: '0 auto',
    fontFamily: 'Lato, sans-serif',
    color: '#333',
    backgroundColor: '#fff'
  },
  heading: {
    textAlign: 'center' as const,
    fontSize: '2.5rem',
    fontWeight: '300',
    marginBottom: '40px',
    textTransform: 'uppercase' as const,
    letterSpacing: '2px',
  },
  cartContent: {
    display: 'flex',
    gap: '40px',
    flexWrap: 'wrap' as const,
  },
  itemsList: {
    flex: 2,
    minWidth: '300px',
  },
  cartItem: {
    display: 'flex',
    alignItems: 'flex-start',
    padding: '20px 0',
    borderBottom: '1px solid #eee',
    gap: '20px',
  },
  itemImageContainer: {
    width: '100px',
    height: '100px',
    flexShrink: 0,
  },
  itemImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover' as const,
    borderRadius: '4px',
  },
  itemDetails: {
    flex: 1,
  },
  itemName: {
    fontSize: '1.1rem',
    fontWeight: '700',
    margin: '0 0 5px 0',
  },
  itemPrice: {
    fontSize: '1rem',
    color: '#666',
    margin: '0 0 10px 0',
  },
  optionsContainer: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap' as const,
    marginBottom: '10px',
  },
  optionTag: {
    fontSize: '0.75rem',
    padding: '3px 8px',
    backgroundColor: '#f0f0f0',
    color: '#333',
    borderRadius: '4px',
    fontWeight: '600',
    textTransform: 'uppercase' as const,
  },
  quantityControl: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  qtyButton: {
    width: '30px',
    height: '30px',
    border: '1px solid #ddd',
    backgroundColor: '#fff',
    cursor: 'pointer',
    fontSize: '1rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '2px',
  },
  qtyText: {
    fontSize: '0.9rem',
    minWidth: '20px',
    textAlign: 'center' as const,
  },
  itemSubtotal: {
    fontSize: '1.1rem',
    fontWeight: '700',
    minWidth: '80px',
    textAlign: 'right' as const,
  },
  removeButton: {
    padding: '5px 10px',
    fontSize: '0.8rem',
    color: '#ff4d4d',
    border: '1px solid #ff4d4d',
    backgroundColor: 'transparent',
    cursor: 'pointer',
    borderRadius: '2px',
    textTransform: 'uppercase' as const,
    whiteSpace: 'nowrap' as const,
  },
  summary: {
    flex: 1,
    minWidth: '250px',
    backgroundColor: '#f9f9f9',
    padding: '30px',
    borderRadius: '8px',
    height: 'fit-content',
    border: '1px solid #eee'
  },
  summaryTitle: {
    fontSize: '1.2rem',
    fontWeight: '700',
    marginBottom: '20px',
    textTransform: 'uppercase' as const,
  },
  summaryRow: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '15px',
    fontSize: '0.95rem',
  },
  totalRow: {
    display: 'flex',
    justifyContent: 'space-between',
    marginTop: '20px',
    paddingTop: '20px',
    borderTop: '1px solid #ddd',
    fontSize: '1.3rem',
    fontWeight: '900',
  },
  totalAmount: {
    color: '#000',
  },
  guestForm: {
    marginTop: '20px',
    borderTop: '1px dashed #ccc',
    paddingTop: '20px',
  },
  formTitle: {
    fontSize: '1rem',
    fontWeight: '700',
    marginBottom: '15px',
    textTransform: 'uppercase' as const,
  },
  userBadge: {
    backgroundColor: '#e6f4ea',
    color: '#1e7e34',
    padding: '10px 15px',
    borderRadius: '4px',
    marginBottom: '15px',
    border: '1px solid #c3e6cb',
    fontSize: '0.9rem'
  },
  note: {
    fontSize: '0.8rem',
    margin: '5px 0 0 0',
    color: '#555'
  },
  inputField: {
    width: '100%',
    padding: '10px',
    marginBottom: '10px',
    border: '1px solid #ccc',
    borderRadius: '2px',
    fontSize: '0.9rem',
    fontFamily: 'Lato, sans-serif',
  },
  checkoutButton: {
    width: '100%',
    padding: '15px',
    marginTop: '30px',
    backgroundColor: '#000',
    color: '#fff',
    border: 'none',
    fontSize: '1rem',
    textTransform: 'uppercase' as const,
    letterSpacing: '2px',
    fontWeight: '700',
    transition: 'background 0.3s',
  },
  emptyState: {
    textAlign: 'center' as const,
    padding: '50px',
  },
  emptyText: {
    fontSize: '1.2rem',
    marginBottom: '20px',
  },
  shopButton: {
    padding: '12px 30px',
    backgroundColor: '#000',
    color: '#fff',
    border: 'none',
    cursor: 'pointer',
    textTransform: 'uppercase' as const,
  }
};