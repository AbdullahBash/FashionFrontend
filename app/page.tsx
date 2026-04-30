'use client';

import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import HeroSection from './components/HeroSection';
import FeaturedProducts from './components/FeaturedProducts';
import Footer from './components/Footer';

import ImageScraperTool from './components/tech-tools/ImageScraperTool';

export default function Home() {
  return (
    <main>
      <Navbar />
      <HeroSection />
      <FeaturedProducts />

      <section style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
        <h2 style={{ 
            fontSize: '2rem', 
            color: '#000', 
            fontWeight: '300', 
            textTransform: 'uppercase', 
            letterSpacing: '2px', 
            marginBottom: '30px', 
            textAlign: 'center',
            borderBottom: '2px solid #e2e8f0'
        }}>
          Tech Solutions
        </h2>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '30px', marginBottom: '50px' }}>
          
          <ImageScraperTool />
        </div>
      </section>
      {/* --------------------------------------------------------- */}

      <Footer />
    </main>
  );
}