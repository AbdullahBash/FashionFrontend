'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { API_BASE_URL } from '@/app/config.js';

interface Country {
  countryID: number;
  name: string;
}

// 1. محتوى الصفحة الحقيقي (تم نقله هنا)
function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [isLoginMode, setIsLoginMode] = useState(true);
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState(''); 
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState(''); 

  const [countries, setCountries] = useState<Country[]>([]);
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [countryId, setCountryId] = useState(0);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // معالجة العودة من السوشيال ميديا
  useEffect(() => {
    const token = searchParams.get('token');
    const socialName = searchParams.get('name');

    if (token) {
      document.cookie = `token=${token}; path=/; max-age=3600`;
      
      localStorage.setItem('user', JSON.stringify({
        name: decodeURIComponent(socialName || "User"),
        email: "social@user.com"
      }));
      
      // إعادة التوجيه للصفحة الرئيسية بدون تنبيه
      router.push('/'); 
    }
  }, [searchParams, router]);

  // جلب الدول
  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/Countries`);
        if (!res.ok) return;
        const data = await res.json();
        setCountries(data);
      } catch (err) {
        console.error("Failed to fetch countries:", err);
      }
    };
    fetchCountries();
  }, []);

  const handleSocialLogin = (provider: string) => {
    let endpoint = '';

    if (provider === 'Google') {
      endpoint = 'signin-google';
    } else if (provider === 'Facebook' || provider === 'Instagram') {
      endpoint = 'signin-facebook';
    }

    if (endpoint) {
      window.location.href = `${API_BASE_URL}/Authentication/${endpoint}`;
    } else {
      console.error("Unknown provider");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(''); // مسح أي خطأ سابق

    try {
      if (isLoginMode) {
        const response = await fetch(`${API_BASE_URL}/Authentication/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
              email: email, 
              password 
          }),
        });

        if (response.ok) {
          const data = await response.json();
          document.cookie = `token=${data.token}; path=/; max-age=3600`;
          
          localStorage.setItem('user', JSON.stringify({
            name: data.name,
            email: data.email,
            id: data.userId
          }));
          
          localStorage.setItem('isAdmin', data.isAdmin ? 'true' : 'false');

          // توجيه المستخدم للصفحة الرئيسية فوراً
          router.push('/');
          
        } else {
          let errorMessage = 'Login failed. Please check your email or password.';
          
          try {
            const errorData = await response.json();
            if (errorData.message) errorMessage = errorData.message;
            else if (typeof errorData === 'string') errorMessage = errorData;
          } catch (e) {
            console.error("Error parsing error response:", e);
          }
          setError(errorMessage);
        }
      } else {
        const payload: any = { 
          name, 
          email, 
          password, 
          phoneNumber: phone 
        };

        if (address) payload.address = address;
        if (city) payload.city = city;
        if (countryId > 0) payload.countryId = countryId;

        const response = await fetch(`${API_BASE_URL}/Authentication/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload), 
        });

        if (response.ok) {
          setIsLoginMode(true);
          setError(''); 
        } else {
          let errorMessage = 'Registration failed.';
          try {
            const errorData = await response.json();
            if (errorData.message) errorMessage = errorData.message;
            else if (typeof errorData === 'string') errorMessage = errorData;
          } catch (e) {
            console.error(e);
          }
          setError(errorMessage);
        }
      }
    } catch (err) {
      setError('An error occurred. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.heading}>
          {isLoginMode ? 'Welcome Back' : 'Create Account'}
        </h2>
        
        {error && <div style={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit} style={styles.form}>
          {!isLoginMode && (
            <div style={styles.inputGroup}>
              <label style={styles.label}>Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                style={styles.input}
                placeholder="Your Name"
              />
            </div>
          )}

          <div style={styles.inputGroup}>
            <label style={styles.label}>Email or Username</label>
            <input
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={styles.input}
              placeholder="name@example.com or JohnDoe"
            />
          </div>

          {!isLoginMode && (
            <div style={styles.inputGroup}>
              <label style={styles.label}>Phone Number</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                style={styles.input}
                placeholder="+963 ..."
              />
            </div>
          )}

          <div style={styles.inputGroup}>
            <label style={styles.label}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={styles.input}
              placeholder="********"
            />
          </div>

          {!isLoginMode && (
            <>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Address (Optional)</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  style={styles.input}
                  placeholder="Street Address"
                />
              </div>
              
              <div style={{ display: 'flex', gap: '10px' }}>
                <div style={{ ...styles.inputGroup, flex: 1 }}>
                  <label style={styles.label}>City</label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    style={styles.input}
                    placeholder="City"
                  />
                </div>

                <div style={{ ...styles.inputGroup, flex: 1 }}>
                  <label style={styles.label}>Country</label>
                  <select 
                    value={countryId} 
                    onChange={(e) => setCountryId(Number(e.target.value))}
                    style={styles.input}
                  >
                    <option value={0}>Select Country</option>
                    {countries.map(country => (
                      <option key={country.countryID} value={country.countryID}>
                        {country.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </>
          )}

          <div style={styles.divider}>
            <span style={styles.dividerText}>OR</span>
          </div>
          
          <div style={styles.socialButtonsContainer}>
            <button 
              type="button" 
              onClick={() => handleSocialLogin('Google')}
              style={{...styles.socialBtn, ...styles.googleBtn}}
            >
              <span style={{fontSize: '1.2rem', marginRight: '8px'}}>G</span> 
              {isLoginMode ? 'Sign in with Google' : 'Sign up with Google'}
            </button>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button 
                type="button" 
                onClick={() => handleSocialLogin('Facebook')}
                style={{...styles.socialBtn, ...styles.facebookBtn, flex: 1}}
              >
                <span style={{fontSize: '1.2rem', marginRight: '5px'}}>f</span> Facebook
              </button>
              <button 
                type="button" 
                onClick={() => handleSocialLogin('Instagram')}
                style={{...styles.socialBtn, ...styles.instagramBtn, flex: 1}}
              >
                <span style={{fontSize: '1.2rem', marginRight: '5px'}}>Ig</span> Instagram
              </button>
            </div>
          </div>

          <button type="submit" disabled={loading} style={styles.button}>
            {loading ? 'Processing...' : (isLoginMode ? 'Login' : 'Sign Up')}
          </button>
        </form>

        <div style={styles.switchContainer}>
          <span style={styles.switchText}>
            {isLoginMode ? "Don't have an account? " : "Already have an account? "}
          </span>
          <button 
            type="button" 
            onClick={() => { setIsLoginMode(!isLoginMode); setError(''); }} 
            style={styles.switchButton}
          >
            {isLoginMode ? 'Sign Up' : 'Login'}
          </button>
        </div>
      </div>
    </div>
  );
}

// 2. التصدير الرئيسي مع إضافة Suspense
export default function LoginPage() {
  return (
    <Suspense fallback={<div style={styles.loading}>Loading...</div>}>
      <LoginContent />
    </Suspense>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0f172a',
    fontFamily: 'Arial, sans-serif',
  },
  card: {
    backgroundColor: '#1e293b',
    padding: '40px',
    borderRadius: '12px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)',
    width: '100%',
    maxWidth: '450px',
  },
  heading: {
    color: '#fff',
    textAlign: 'center' as const,
    marginBottom: '20px',
    marginTop: 0,
  },
  form: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '12px',
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '6px',
  },
  label: {
    color: '#cbd5e1',
    fontSize: '0.85rem',
    fontWeight: '600',
  },
  input: {
    padding: '12px',
    borderRadius: '6px',
    border: '1px solid #475569',
    backgroundColor: '#0f172a',
    color: '#fff',
    fontSize: '1rem',
    outline: 'none',
  },
  button: {
    padding: '14px',
    backgroundColor: '#6366f1',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'background 0.2s',
    marginTop: '10px',
  },
  error: {
    color: '#fff',
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    border: '1px solid #ef4444',
    padding: '12px',
    borderRadius: '6px',
    fontSize: '0.9rem',
    marginBottom: '10px',
    textAlign: 'center' as const,
  },
  switchContainer: {
    marginTop: '20px',
    textAlign: 'center' as const,
    fontSize: '0.9rem',
  },
  switchText: {
    color: '#94a3b8',
  },
  switchButton: {
    background: 'none',
    border: 'none',
    color: '#6366f1',
    fontWeight: 'bold',
    cursor: 'pointer',
    textDecoration: 'underline',
    fontSize: '0.9rem',
  },
  divider: {
    display: 'flex',
    alignItems: 'center',
    color: '#94a3b8',
    margin: '10px 0',
  },
  dividerText: {
    padding: '0 10px',
    fontSize: '0.8rem',
  },
  socialButtonsContainer: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '10px',
  },
  socialBtn: {
    padding: '10px',
    borderRadius: '6px',
    border: 'none',
    fontSize: '0.9rem',
    fontWeight: '600',
    cursor: 'pointer',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  googleBtn: {
    backgroundColor: '#DB4437',
  },
  facebookBtn: {
    backgroundColor: '#4267B2',
  },
  instagramBtn: {
    backgroundColor: '#C13584',
  },
  loading: {
    color: '#fff',
    textAlign: 'center' as const,
    marginTop: '20px',
  }
};