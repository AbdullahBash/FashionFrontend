'use client';

import React, { useState } from 'react';
import Navbar from '../components/Navbar';

export default function ContactPage() {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [status, setStatus] = useState(''); // '', 'submitting', 'success'

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setStatus('submitting');
    
    // محاكاة إرسال (يمكنك ربطها بالباك إند لاحقاً)
    setTimeout(() => {
      setStatus('success');
      setFormData({ name: '', email: '', message: '' });
      setTimeout(() => setStatus(''), 3000); // إخفاء الرسالة بعد 3 ثواني
    }, 1500);
  };

  return (
    <div style={styles.container}>
      <Navbar />
      
      {/* 1. واجهة بطل بصورة (Hero Image) */}
      <div style={styles.heroImage}>
        <div style={styles.heroOverlay}>
            <h1 style={styles.header}>Get in Touch</h1>
            <p style={styles.subtitle}>We are here to assist you on your journey.</p>
        </div>
      </div>

      {/* 2. المحتوى الرئيسي (معلومات + نموذج) */}
      <div style={styles.content}>
        <div style={styles.grid}>
          
          {/* القسم الأيسر: معلومات الاتصال */}
          <div style={styles.infoColumn}>
            <h2 style={styles.sectionTitle}>Contact Information</h2>
            <p style={styles.infoText}>
                Have a question about an order? Or just want to say hello? 
                Fill out the form and we will get back to you within 24 hours.
            </p>

            <div style={styles.infoItem}>
                <span style={styles.infoIcon}>📍</span>
                <div style={styles.infoDetails}>
                    <h4 style={styles.infoLabel}>Address</h4>
                    <p style={styles.infoValue}>123 Innovation Blvd, Tech City, TC 90210</p>
                </div>
            </div>

            <div style={styles.infoItem}>
                <span style={styles.infoIcon}>📧</span>
                <div style={styles.infoDetails}>
                    <h4 style={styles.infoLabel}>Email</h4>
                    <p style={styles.infoValue}>support@excolony.com</p>
                </div>
            </div>

            <div style={styles.infoItem}>
                <span style={styles.infoIcon}>📞</span>
                <div style={styles.infoDetails}>
                    <h4 style={styles.infoLabel}>Phone</h4>
                    <p style={styles.infoValue}>+1 (555) 123-4567</p>
                </div>
            </div>
          </div>

          {/* القسم الأيمن: نموذج الاتصال */}
          <div style={styles.formColumn}>
            <h2 style={styles.sectionTitle}>Send a Message</h2>
            
            {status === 'success' && (
                <div style={styles.successMessage}>
                    Message sent successfully! We will contact you soon.
                </div>
            )}

            <form onSubmit={handleSubmit} style={styles.form}>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  style={styles.input}
                  placeholder="Your Full Name"
                />
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  style={styles.input}
                  placeholder="your@email.com"
                />
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Message</label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows="6"
                  style={styles.textarea}
                  placeholder="How can we help you?"
                ></textarea>
              </div>

              <button type="submit" style={styles.submitBtn} disabled={status === 'submitting'}>
                {status === 'submitting' ? 'SENDING...' : 'SEND MESSAGE'}
              </button>
            </form>
          </div>

        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    backgroundColor: '#fff',
    minHeight: '100vh',
    color: '#000',
    fontFamily: "'Lato', sans-serif",
    display: 'flex',
    flexDirection: 'column',
  },
  
  // --- Hero Image Styles ---
  heroImage: {
    height: '400px',
    backgroundImage: 'url(https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=2069&auto=format&fit=crop)', // صورة مكتب عصري
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroOverlay: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    padding: '40px 60px',
    textAlign: 'center',
    maxWidth: '800px',
    border: '2px solid #000',
  },
  header: {
    fontSize: '3rem',
    fontWeight: '900',
    textTransform: 'uppercase',
    marginBottom: '10px',
    letterSpacing: '2px',
  },
  subtitle: {
    fontSize: '1.2rem',
    fontWeight: '500',
    color: '#333',
  },

  // --- Main Content ---
  content: {
    maxWidth: '1100px',
    margin: '0 auto',
    padding: '80px 20px',
    flex: 1,
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '60px',
  },
  
  // --- Left Column (Info) ---
  infoColumn: {
    paddingRight: '20px',
  },
  sectionTitle: {
    fontSize: '1.8rem',
    fontWeight: '800',
    textTransform: 'uppercase',
    marginBottom: '20px',
    letterSpacing: '1px',
  },
  infoText: {
    fontSize: '1.1rem',
    lineHeight: '1.7',
    color: '#333',
    marginBottom: '40px',
  },
  infoItem: {
    display: 'flex',
    alignItems: 'flex-start',
    marginBottom: '30px',
  },
  infoIcon: {
    fontSize: '2rem',
    marginRight: '20px',
    minWidth: '30px',
  },
  infoDetails: {
    display: 'flex',
    flexDirection: 'column',
  },
  infoLabel: {
    fontSize: '1rem',
    fontWeight: '800',
    textTransform: 'uppercase',
    marginBottom: '5px',
  },
  infoValue: {
    fontSize: '1.1rem',
    color: '#555',
    fontWeight: '400',
  },

  // --- Right Column (Form) ---
  formColumn: {
    paddingLeft: '20px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  label: {
    fontSize: '0.9rem',
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: '1px',
    color: '#000',
  },
  input: {
    padding: '15px',
    border: '1px solid #000', // حدود سوداء واضحة
    fontSize: '1rem',
    outline: 'none',
    backgroundColor: '#fafafa',
    transition: 'background 0.3s',
  },
  inputFocus: {
    backgroundColor: '#fff', // يتحول لأبيض عند الكتابة
  },
  textarea: {
    padding: '15px',
    border: '1px solid #000',
    fontSize: '1rem',
    outline: 'none',
    fontFamily: 'inherit',
    resize: 'vertical',
    backgroundColor: '#fafafa',
  },
  submitBtn: {
    padding: '18px 0',
    backgroundColor: '#000',
    color: '#fff',
    border: 'none',
    fontSize: '1rem',
    textTransform: 'uppercase',
    letterSpacing: '2px',
    cursor: 'pointer',
    fontWeight: '800',
    transition: 'opacity 0.3s',
  },
  submitBtn: { // دمج التنسيق
    padding: '18px 0',
    backgroundColor: '#000',
    color: '#fff',
    border: 'none',
    fontSize: '1rem',
    textTransform: 'uppercase',
    letterSpacing: '2px',
    cursor: 'pointer',
    fontWeight: '800',
    opacity: 1,
  },
  
  // --- Mobile Responsive ---
  successMessage: {
    padding: '15px',
    backgroundColor: '#d4edda',
    color: '#155724',
    border: '1px solid #c3e6cb',
    textAlign: 'center',
    marginBottom: '20px',
    fontWeight: '700',
    fontSize: '0.9rem',
  },
};