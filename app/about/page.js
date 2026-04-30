'use client';

import React from 'react';
import Navbar from '../components/Navbar';

export default function AboutPage() {
  return (
    <div style={styles.container}>
      <Navbar />
      
      {/* 1. واجهة بطل بصورة تأثيرية (Hero Image) */}
      <div style={styles.heroImage}>
        <div style={styles.heroOverlay}>
            <span style={styles.date}>EST. 2026</span>
            <h1 style={styles.header}>Into The Unknown</h1>
            <p style={styles.subtitle}>Starting from nothing, flying towards everything.</p>
        </div>
      </div>

      <div style={styles.content}>
        
        {/* 2. القصة (بنص عريض وواضح) */}
        <div style={styles.storySection}>
            <h2 style={styles.sectionTitle}>The Journey</h2>
            <p style={styles.paragraph}>
                In 2026, we stood at the edge of the unknown. With nothing but a vision and the courage to depart from the familiar, we built EXCOLONY.
            </p>
            <p style={styles.paragraph}>
                Like the great aviators who navigated the skies without modern navigation, we rely on instinct, precision, and an unwavering commitment to the destination. We didn't just start a business; we took flight.
            </p>
            
            <div style={styles.quoteBox}>
                <p style={styles.quote}>
                    "To fly is to step out onto the wing of the airplane at 10,000 feet."
                </p>
                <span style={styles.quoteAuthor}>— Amelia Earhart</span>
            </div>
        </div>

        {/* 3. بطاقات القيم مع صور (Quality Images) */}
        <div style={styles.valuesGrid}>
            <div style={styles.card}>
                <div style={styles.cardImage1}></div>
                <div style={styles.cardContent}>
                    <h3 style={styles.cardTitle}>01. Vision</h3>
                    <p style={styles.cardText}>
                        Seeing what others don't. We look beyond the clouds to find the perfect pieces.
                    </p>
                </div>
            </div>

            <div style={styles.card}>
                <div style={styles.cardImage2}></div>
                <div style={styles.cardContent}>
                    <h3 style={styles.cardTitle}>02. Courage</h3>
                    <p style={styles.cardText}>
                        The bravery to be different. We curate collections that defy the ordinary.
                    </p>
                </div>
            </div>

            <div style={styles.card}>
                <div style={styles.cardImage3}></div>
                <div style={styles.cardContent}>
                    <h3 style={styles.cardTitle}>03. Precision</h3>
                    <p style={styles.cardText}>
                        Every detail counts. Just like every instrument in a cockpit, quality matters.
                    </p>
                </div>
            </div>
        </div>

        {/* 4. Call to Action */}
        <div style={styles.ctaSection}>
            <p style={styles.ctaText}>Ready to take off?</p>
            <button 
                style={styles.ctaBtn} 
                onClick={() => window.location.href = '/'}
            >
              EXPLORE COLLECTIONS
            </button>
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
    height: '500px',
    backgroundImage: 'url(https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?q=80&w=2070&auto=format&fit=crop)', // صورة مبنى عالي/طائرة
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroOverlay: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)', // خلفية بيضاء شفافة فوق الصورة
    padding: '60px',
    textAlign: 'center',
    maxWidth: '800px',
  },
  date: {
    display: 'block',
    fontSize: '1rem',
    letterSpacing: '3px',
    textTransform: 'uppercase',
    color: '#000',
    marginBottom: '15px',
    fontWeight: '800', // خط عريض
  },
  header: {
    fontSize: '3.5rem',
    fontWeight: '900', // خط عريض جداً وواضح
    textTransform: 'uppercase',
    marginBottom: '20px',
    lineHeight: '1.1',
    fontStyle: 'normal', // بدون ميل
  },
  subtitle: {
    fontSize: '1.3rem',
    fontWeight: '500', // متوسط الشدة، واضح
    color: '#333',
  },

  // --- Content Styles ---
  content: {
    maxWidth: '1100px',
    margin: '0 auto',
    padding: '80px 20px',
    textAlign: 'center',
    flex: 1,
  },
  storySection: {
    maxWidth: '800px',
    margin: '0 auto 80px auto',
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: '2rem',
    fontWeight: '800',
    textTransform: 'uppercase',
    marginBottom: '30px',
    letterSpacing: '2px',
  },
  paragraph: {
    fontSize: '1.1rem', // حجم واضح
    lineHeight: '1.8', // مسافة سطرية مريحة
    marginBottom: '25px',
    color: '#222',
    fontWeight: '400', // عادي، لا يسبب إجهاد للعين
  },
  quoteBox: {
    backgroundColor: '#f4f4f4',
    padding: '30px',
    marginTop: '40px',
    borderLeft: '5px solid #000',
    textAlign: 'left',
  },
  quote: {
    fontSize: '1.2rem',
    fontWeight: '700',
    marginBottom: '10px',
    color: '#000',
    fontStyle: 'normal',
  },
  quoteAuthor: {
    display: 'block',
    textAlign: 'right',
    fontWeight: '700',
    fontSize: '0.9rem',
    textTransform: 'uppercase',
    letterSpacing: '1px',
  },

  // --- Grid with Images ---
  valuesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '40px',
    marginBottom: '80px',
  },
  card: {
    boxShadow: '0 10px 30px rgba(0,0,0,0.05)',
    backgroundColor: '#fff',
    overflow: 'hidden',
    textAlign: 'left',
  },
  // صور الخلفية للبطاقات
  cardImage1: {
    height: '250px',
    backgroundImage: 'url(https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072&auto=format&fit=crop)', // صورة كوكب/فضاء
    backgroundSize: 'cover',
    backgroundPosition: 'center',
  },
  cardImage2: {
    height: '250px',
    backgroundImage: 'url(https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=2021&auto=format&fit=crop)', // صورة جبال
    backgroundSize: 'cover',
    backgroundPosition: 'center',
  },
  cardImage3: {
    height: '250px',
    backgroundImage: 'url(https://images.unsplash.com/photo-1504274066651-8d31a536b11a?q=80&w=2070&auto=format&fit=crop)', // صورة دقة/هندسة
    backgroundSize: 'cover',
    backgroundPosition: 'center',
  },
  cardContent: {
    padding: '30px',
  },
  cardTitle: {
    fontSize: '1.3rem',
    fontWeight: '800',
    marginBottom: '10px',
    textTransform: 'uppercase',
    letterSpacing: '1px',
  },
  cardText: {
    fontSize: '1rem',
    lineHeight: '1.6',
    color: '#555',
    fontWeight: '400',
  },

  // --- CTA ---
  ctaSection: {
    backgroundColor: '#000',
    color: '#fff',
    padding: '60px 20px',
    marginTop: 'auto',
  },
  ctaText: {
    fontSize: '1.8rem',
    marginBottom: '30px',
    fontWeight: '700', // واضح
  },
  ctaBtn: {
    padding: '18px 50px',
    backgroundColor: '#fff',
    color: '#000',
    border: 'none',
    fontSize: '1rem',
    textTransform: 'uppercase',
    letterSpacing: '2px',
    cursor: 'pointer',
    fontWeight: '800', // عريض
    transition: 'background 0.3s',
  },
};