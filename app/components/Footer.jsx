'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { API_BASE_URL } from '@/app/config.js'; 

const Footer = () => {
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);

  const checkAdminStatus = async () => {
    try {
      const tokenCookie = document.cookie.split('; ').find(row => row.startsWith('token='));
      const token = tokenCookie ? tokenCookie.split('=')[1] : null;

      if (!token) return false;

      const res = await fetch(`${API_BASE_URL}/Authentication/me`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
      });

      if (res.ok) {
        const data = await res.json();
        return data.isAdmin === true;
      } else {
        return false;
      }
    } catch {
      return false;
    }
  };

  useEffect(() => {
    checkAdminStatus().then(setIsAdmin);
  }, []);

  useEffect(() => {
    const handleKeyDown = async (event) => {
      if (event.ctrlKey && event.shiftKey && (event.key === 'A' || event.key === 'a')) {
        event.preventDefault();

        const isValidAdmin = await checkAdminStatus();

        if (isValidAdmin) {
          const password = prompt("Enter Admin Secret Key:");
          if (password === "123456") {
            router.push("/admin");
          } else if (password) {
            alert("Wrong Key!");
          }
        } else {
          alert("Access Denied");
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <>
      <footer className="footer">
        <div className="footer-content">

          <h2 className="brand">OUTCOLONY</h2>

          <p className="text">
            &copy; {new Date().getFullYear()} All rights reserved
          </p>

          <div className="divider"></div>

          <p className="hint">.</p>

        </div>
      </footer>

      <style jsx>{`

        .footer {
          margin-top: 80px;
          padding: 60px 20px;

          background: radial-gradient(circle at top, #111827, #020617);
          border-top: 1px solid rgba(255,255,255,0.08);

          backdrop-filter: blur(10px);
        }

        .footer-content {
          text-align: center;
          max-width: 600px;
          margin: auto;
        }

        .brand {
          font-size: 1.8rem;
          font-weight: 700;
          letter-spacing: 3px;

          background: linear-gradient(90deg, #6366f1, #a855f7);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;

          margin-bottom: 15px;
        }

        .text {
          color: #9ca3af;
          font-size: 0.9rem;
          letter-spacing: 1px;
        }

        .divider {
          width: 60px;
          height: 2px;
          margin: 20px auto;

          background: linear-gradient(90deg, #6366f1, #a855f7);
          opacity: 0.7;
        }

        .hint {
          font-size: 0.7rem;
          color: transparent;
          user-select: none;
        }

        /* subtle hover glow */
        .brand:hover {
          filter: drop-shadow(0 0 10px rgba(99,102,241,0.6));
        }

      `}</style>
    </>
  );
};

export default Footer;