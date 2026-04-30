'use client';
import React, { useEffect } from 'react';
import Link from 'next/link';

const HeroSection = () => {

  // ✅ حل مشكلة الريلود (يرجع لأول الصفحة)
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  return (
    <section className="hero">

      {/* Background */}
      <div className="bg"></div>

      {/* Overlay */}
      <div className="overlay"></div>

      {/* Content */}
      <div className="content">
        <h1 className="title">
          OUTCOLONY
          <span className="gradient-text"> REBEL PENGUIN</span>
        </h1>

        <p className="subtitle">
          Premium modern Tools for a new generation
        </p>

        <Link href="/cart" className="cta">
          Shop Now
        </Link>
      </div>

      <style jsx>{`

        .hero {
          height: 100vh;
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          text-align: center;
          overflow: hidden;
        }

        /* Background Image + zoom effect */
        .bg {
          position: absolute;
          width: 100%;
          height: 100%;
          background: url('/hero.png') center/cover no-repeat;
          transform: scale(1.05);
          animation: zoomSlow 8s ease-in-out infinite alternate;
          z-index: 0;
        }

        /* Overlay */
        .overlay {
          position: absolute;
          width: 100%;
          height: 100%;
          background: radial-gradient(circle at center, rgba(0,0,0,0.3), rgba(0,0,0,0.85));
          z-index: 1;
        }

        .content {
          position: relative;
          z-index: 2;
          max-width: 900px;
          padding: 20px;
          animation: fadeUp 1s ease forwards;
        }

        .title {
          font-size: 4.5rem;
          font-weight: 800;
          letter-spacing: 4px;
          color: #fff;
          line-height: 1.1;
        }

        .gradient-text {
          display: block;
          background: linear-gradient(90deg, #6366f1, #a855f7);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .subtitle {
          margin-top: 20px;
          font-size: 1.4rem;
          color: #d1d5db;
          letter-spacing: 2px;
        }

        /* CTA Button */
        .cta {
          display: inline-block;
          margin-top: 40px;
          padding: 14px 40px;
          border-radius: 999px;

          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          color: #fff;
          font-weight: 600;
          letter-spacing: 1px;

          text-decoration: none;
          transition: all 0.3s ease;

          box-shadow: 0 10px 30px rgba(99,102,241,0.5);
        }

        .cta:hover {
          transform: translateY(-4px) scale(1.03);
          box-shadow: 0 20px 50px rgba(99,102,241,0.7);
        }

        /* Animations */
        @keyframes fadeUp {
          from {
            opacity: 0;
            transform: translateY(40px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes zoomSlow {
          from { transform: scale(1.05); }
          to { transform: scale(1.15); }
        }

        /* Responsive */
        @media (max-width: 768px) {
          .title {
            font-size: 2.5rem;
          }

          .subtitle {
            font-size: 1rem;
          }
        }

      `}</style>
    </section>
  );
};

export default HeroSection;