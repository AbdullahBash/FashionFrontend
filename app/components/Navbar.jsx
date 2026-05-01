'use client';
import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext'; 
import { useRouter } from 'next/navigation';
import { API_BASE_URL } from '@/app/config.js';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  
  const [stars, setStars] = useState([]);

  const { cart } = useCart();
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) setUser(JSON.parse(storedUser));
  }, []);

  useEffect(() => {
    const newStars = Array.from({ length: 60 }).map(() => {
      const depth = Math.random();
      return {
        top: Math.random() * 100,
        left: Math.random() * 100,
        size: depth * 2 + 0.5, 
        duration: depth * 10 + 10, 
        delay: Math.random() * 5,
        opacity: depth * 0.7 + 0.1
      };
    });
    setStars(newStars);
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
    setShowUserMenu(false);
  };

  const handleLogout = () => {
    document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    localStorage.removeItem('user');
    setUser(null);
    router.push('/');
    setShowUserMenu(false);
    setIsMenuOpen(false);
  };

  const cartItemCount = cart.reduce((sum, item) => sum + (item.quantity || 0), 0);
  const cartScale = cartItemCount > 0 ? 1 + (Math.min(cartItemCount, 20) / 40) : 1;

  const handleNavigation = (path) => {
    router.push(path);
    setIsMenuOpen(false);
    setShowUserMenu(false);
  };

  const logoUrl = API_BASE_URL.replace('/api', '') + '/images/NewLogo.png';

  return (
    <>
      <nav className={`navbar ${isLoaded ? 'loaded' : ''} ${isScrolled ? 'scrolled' : ''}`}>
        
        {/* الخلفية الفضائية */}
        <div className="space-background">
          {stars.map((star, i) => (
            <div
              key={i}
              className="star"
              style={{
                top: `${star.top}%`,
                left: `${star.left}%`,
                width: `${star.size}px`,
                height: `${star.size}px`,
                opacity: star.opacity,
                animationDuration: `${star.duration}s`,
                animationDelay: `-${star.delay}s`
              }}
            />
          ))}
        </div>

        {/* النيزك الطائر (ذيل أطول) */}
        <div className="meteor-shooting">
             <div className="meteor-head"></div>
             <div className="meteor-tail"></div>
        </div>

        <div className="logo-container" onClick={() => handleNavigation('/')}>
          <img src={logoUrl} alt="Logo" className="logo-img" />
          <span className="logo-text">OUTCOLONY</span>
        </div>

        {/* القائمة المنبثقة */}
        <div className={`links ${isMenuOpen ? 'active' : ''}`}>
          <a onClick={() => handleNavigation('/')} className="nav-link">Home</a>
          <a onClick={() => handleNavigation('/about')} className="nav-link">About</a>
          <a onClick={() => handleNavigation('/contact')} className="nav-link">Contact</a>

          {/* قسم المصادقة للموبايل */}
          <div className="mobile-only-auth">
            {!user ? (
              <button onClick={() => handleNavigation('/login')} className="mobile-signin-btn">
                Sign In
              </button>
            ) : (
              <div className="mobile-user-section">
                <div className="mobile-user-name">{user.name}</div>
                <div onClick={() => handleNavigation('/my-orders')} className="mobile-menu-item">
                  My Orders
                </div>
                <div onClick={handleLogout} className="mobile-logout-btn">
                  Sign Out
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="actions-container">

          {/* قسم المصادقة للسطح المكتب */}
          <div className="desktop-only-auth">
            {!user ? (
              <button onClick={() => router.push('/login?redirect=/')} className="btn-signin">
                Sign In
              </button>
            ) : (
              <div className="user-dropdown-wrapper">
                <div onClick={() => setShowUserMenu(!showUserMenu)} className="user-trigger">
                  <span className="user-name">{user.name}</span>
                  <span className={`arrow-icon ${showUserMenu ? 'rotate' : ''}`}>▼</span>
                </div>

                <div className={`dropdown-menu ${showUserMenu ? 'show' : ''}`}>
                  <div onClick={() => handleNavigation('/my-orders')} className="dropdown-item">
                    My Orders
                  </div>
                  <div onClick={handleLogout} className="dropdown-item logout-item">
                    Sign Out
                  </div>
                </div>
              </div>
            )}
          </div>

          <div 
            className="cart-icon-wrapper" 
            onClick={() => router.push('/cart')}
            style={{ transform: `scale(${cartScale})` }}
          >
            <span className="cart-badge">{cartItemCount}</span>
            <span className="cart-emoji">🛒</span>
          </div>

          <div className="hamburger" onClick={toggleMenu}>
            <span className={`line ${isMenuOpen ? 'line1' : ''}`}></span>
            <span className={`line ${isMenuOpen ? 'line2' : ''}`}></span>
            <span className={`line ${isMenuOpen ? 'line3' : ''}`}></span>
          </div>
        </div>
      </nav>

      <style jsx>{`
        body {
          background: #050508;
        }

        .navbar {
          position: sticky;
          top: 0;
          z-index: 10000;
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 18px 60px;

          background: linear-gradient(to bottom, rgba(5, 5, 8, 0.8), rgba(15, 23, 42, 0.6));
          backdrop-filter: blur(8px);
          border-bottom: 1px solid rgba(255,255,255,0.08);

          overflow: visible;
          box-shadow: 0 4px 30px rgba(0, 0, 0, 0.5);

          opacity: 0;
          transform: translateY(-20px);
          transition: all 0.5s ease;
        }

        .navbar.scrolled {
          background: rgba(5, 5, 8, 0.6);
          backdrop-filter: blur(15px);
          border-bottom: 1px solid rgba(255,165,0,0.1);
          box-shadow: 0 0 20px rgba(255, 165, 0, 0.05);
          padding: 10px 20px;
        }

        .navbar.loaded {
          opacity: 1;
          transform: translateY(0);
        }

        .space-background {
          position: absolute;
          inset: -20px;
          z-index: -1;
          overflow: hidden;
          perspective: 1000px;
        }

        .star {
          position: absolute;
          background: white;
          border-radius: 50%;
          animation: spaceTravel linear infinite; 
          box-shadow: 0 0 4px rgba(255, 255, 255, 0.4);
        }

        @keyframes spaceTravel {
          0% { transform: translateY(0) translateX(0); }
          100% { transform: translateY(-200px) translateX(-20px); opacity: 0; }
        }

        /* === النيزك الطويل === */
        .meteor-shooting {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 1;
            overflow: hidden;
        }

        .meteor-head {
            position: absolute;
            top: 50%;
            left: -50px;
            width: 4px;
            height: 4px;
            background: #fff;
            border-radius: 50%;
            box-shadow: 0 0 15px 5px #fff, 0 0 30px 10px orange;
            animation: shootMeteor 2s linear infinite;
        }

        .meteor-tail {
            position: absolute;
            top: 50%;
            left: -350px;
            width: 350px;
            height: 2px;
            background: linear-gradient(90deg, rgba(0,0,0,0) 0%, rgba(255,69,0,0.6) 20%, rgba(255,200,0,0.9) 50%, #fff 100%);
            transform: translateY(-50%) rotate(-45deg);
            filter: blur(1px);
            animation: shootMeteor 2s linear infinite;
        }

        @keyframes shootMeteor {
            0% {
                left: -10%;
                opacity: 1;
            }
            100% {
                left: 120%;
                opacity: 1;
            }
        }

        .logo-container {
          display: flex;
          align-items: center;
          gap: 12px;
          cursor: pointer;
          position: relative;
          z-index: 20;
          flex-shrink: 0;
        }

        .logo-img {
          height: 50px;
          filter: drop-shadow(0 0 8px rgba(255,255,255,0.3));
          transition: all 0.3s ease;
        }

        .logo-container:hover .logo-img {
          transform: scale(1.05);
          filter: drop-shadow(0 0 15px rgba(255,165,0,0.6));
        }

        .logo-text {
          color: #f8fafc;
          font-weight: 700;
          letter-spacing: 3px;
          font-size: 1.4rem;
          text-shadow: 0 0 10px rgba(255, 255, 255, 0.2);
          white-space: nowrap;
        }

        /* === روابط سطح المكتب === */
        .links {
          display: flex;
          gap: 40px;
        }

        .mobile-only-auth {
            display: none;
        }

        .nav-link {
          color: #cbd5e1;
          text-transform: uppercase;
          letter-spacing: 2px;
          font-size: 0.9rem;
          font-weight: 500;
          cursor: pointer;
          position: relative;
          transition: color 0.3s;
        }

        .nav-link:hover {
          color: #fff;
          text-shadow: 0 0 8px rgba(255,255,255,0.5);
        }

        .nav-link::after {
          content: '';
          position: absolute;
          bottom: -6px;
          left: 0;
          width: 100%;
          height: 2px;
          background: #f97316;
          transform: scaleX(0);
          transform-origin: right;
          transition: transform 0.3s ease-out;
          box-shadow: 0 0 8px #f97316;
        }

        .nav-link:hover::after {
          transform: scaleX(1);
          transform-origin: left;
        }

        .actions-container {
          display: flex;
          gap: 25px;
          align-items: center;
          z-index: 1100;
        }

        .btn-signin {
          background: linear-gradient(135deg, #f97316, #c2410c); 
          color: white;
          border: none; 
          padding: 10px 28px;
          cursor: pointer;
          border-radius: 999px; 
          font-weight: 700;
          font-size: 0.85rem;
          letter-spacing: 1px;
          text-transform: uppercase;
          box-shadow: 0 0 20px rgba(249, 115, 22, 0.4); 
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
        }

        .btn-signin:hover {
          transform: translateY(-2px);
          box-shadow: 0 0 30px rgba(249, 115, 22, 0.7);
          filter: brightness(1.2);
        }

        /* قائمة المستخدم سطح المكتب */
        .user-dropdown-wrapper {
          position: relative;
        }

        .user-trigger {
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          padding: 8px 20px;
          border: 1px solid rgba(255,255,255,0.2); 
          border-radius: 999px;
          color: #fff;
          transition: all 0.3s ease;
          background: rgba(255,255,255,0.05);
        }

        .user-trigger:hover {
          background: rgba(255,255,255,0.1);
          border-color: #f97316;
          box-shadow: 0 0 15px rgba(249, 115, 22, 0.3);
        }

        .user-name {
          font-weight: 600;
          font-size: 0.9rem;
          letter-spacing: 0.5px;
        }

        .arrow-icon {
          font-size: 0.6rem;
          transition: transform 0.3s;
        }

        .arrow-icon.rotate {
          transform: rotate(180deg);
        }

        .dropdown-menu {
          position: absolute;
          top: calc(100% + 15px);
          right: 0;
          width: 180px;
          background: rgba(5, 5, 8, 0.95);
          backdrop-filter: blur(15px);
          border: 1px solid rgba(255,165,0,0.2);
          border-radius: 12px;
          box-shadow: 0 10px 40px rgba(0,0,0,0.8);
          opacity: 0;
          visibility: hidden;
          transform: translateY(-10px);
          transition: all 0.3s ease;
          overflow: hidden;
          z-index: 100;
        }

        .dropdown-menu.show {
          opacity: 1;
          visibility: visible;
          transform: translateY(0);
        }

        .dropdown-item {
          padding: 12px 20px;
          color: #cbd5e1;
          cursor: pointer;
          transition: all 0.2s;
          font-size: 0.9rem;
          border-bottom: 1px solid rgba(255,255,255,0.05);
          display: flex;
          align-items: center;
        }

        .dropdown-item:last-child {
          border-bottom: none;
        }

        .dropdown-item:hover {
          background: rgba(249, 115, 22, 0.1);
          color: #fff;
          padding-left: 25px;
        }
        
        .logout-item:hover {
           color: #ff6b6b;
           background: rgba(255, 107, 107, 0.1);
        }

        .cart-icon-wrapper {
          position: relative;
          display: inline-flex; 
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }

        .cart-emoji {
          font-size: 1.8rem;
          line-height: 1;
          filter: drop-shadow(0 0 5px rgba(255,255,255,0.2));
        }

        .cart-badge {
          position: absolute;
          top: -6px; 
          right: -10px; 
          background: #f97316;
          color: #fff;
          font-size: 0.7rem;
          font-weight: bold;
          border-radius: 50%;
          width: 22px;
          height: 22px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 0 10px rgba(249, 115, 22, 0.8);
          z-index: 20; 
          border: 2px solid #050508; 
        }

        .hamburger {
          display: none;
        }

        /* === الموبايل === */
        @media (max-width: 900px) {
          .navbar {
            padding: 10px 15px;
          }

          .logo-img {
            height: 35px;
          }

          /* اللوجو دائماً ظاهر */
          .logo-text {
            font-size: 0.9rem;
            display: block !important;
            letter-spacing: 1px;
          }

          .links {
            position: fixed;
            right: -100%;
            top: 0;
            width: 85%;
            height: 100vh;
            
            background: rgba(5, 5, 8, 0.98);
            backdrop-filter: blur(25px);
            
            flex-direction: column;
            justify-content: center;
            align-items: center;
            gap: 30px;

            transition: 0.4s cubic-bezier(0.77, 0, 0.175, 1);
            z-index: 1050;
            border-left: 1px solid rgba(255,255,255,0.1);
          }

          .links.active {
            right: 0;
            box-shadow: -10px 0 50px rgba(0,0,0,0.9);
          }

          .nav-link {
            font-size: 2rem;
            font-weight: 800;
            color: #fff;
            text-align: center;
          }

          .nav-link:hover {
            color: #f97316;
            transform: scale(1.1);
          }

          .nav-link::after {
            display: none;
          }

          /* إظهار قسم المصادقة */
          .mobile-only-auth {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 15px;
            width: 100%;
            margin-top: 20px;
          }

          .mobile-signin-btn {
            background: #f97316;
            color: white;
            border: none;
            padding: 15px 40px;
            border-radius: 50px;
            font-size: 1.2rem;
            font-weight: bold;
            cursor: pointer;
            box-shadow: 0 0 20px rgba(249, 115, 22, 0.5);
          }

          .mobile-user-section {
            text-align: center;
            display: flex;
            flex-direction: column;
            gap: 15px;
            width: 100%;
            align-items: center;
          }

          .mobile-user-name {
            font-size: 1.2rem;
            color: #fff;
            margin-bottom: 10px;
            font-weight: bold;
          }

          /* زر My Orders */
          .mobile-menu-item {
            color: #cbd5e1;
            font-size: 1.1rem;
            padding: 12px 20px;
            border-bottom: 1px solid rgba(255,255,255,0.1);
            width: 80%;
            text-align: center;
            cursor: pointer;
            transition: color 0.3s;
          }

          .mobile-menu-item:hover {
            color: #f97316;
          }

          .mobile-logout-btn {
            color: #ff6b6b;
            font-size: 1rem;
            cursor: pointer;
            border: 1px solid #ff6b6b;
            padding: 10px 30px;
            border-radius: 8px;
            width: fit-content;
          }

          .desktop-only-auth {
            display: none !important;
          }

          .actions-container {
            gap: 15px;
            margin-left: auto;
          }

          .hamburger {
            display: flex;
            flex-direction: column;
            gap: 6px;
            cursor: pointer;
            z-index: 1150;
            padding: 5px;
          }

          .line {
            width: 25px;
            height: 3px;
            background: #fff;
            transition: all 0.3s;
            border-radius: 2px;
          }

          .line1 { transform: rotate(0deg); }
          .line2 { opacity: 1; }
          .line3 { transform: rotate(0deg); }

          .line1.line1 { transform: rotate(45deg) translate(5px, 6px); }
          .line2.line2 { opacity: 0; }
          .line3.line3 { transform: rotate(-45deg) translate(5px, -6px); }
        }
      `}</style>
    </>
  );
};

export default Navbar;