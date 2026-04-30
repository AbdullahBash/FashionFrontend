'use client';
import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { API_BASE_URL } from '@/app/config.js';

const FeaturedProducts = () => {

  const { addToCart } = useCart();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [colors, setColors] = useState([]);
  const [sizes, setSizes] = useState([]);
  const [copies, setCopies] = useState([]);

  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [selectedBrand, setSelectedBrand] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedCopy, setSelectedCopy] = useState('');

  const [searchTerm, setSearchTerm] = useState('');

  const SERVER_BASE_URL = API_BASE_URL.replace('/api', '');

  useEffect(() => {
    const fetchData = async () => {
      const [catRes, brandRes, colRes, sizeRes, copyRes] = await Promise.all([
        fetch(`${API_BASE_URL}/Category`),
        fetch(`${API_BASE_URL}/Brand`),
        fetch(`${API_BASE_URL}/Colors`),
        fetch(`${API_BASE_URL}/Sizes`),
        fetch(`${API_BASE_URL}/CopyOptions`)
      ]);

      if (catRes.ok) setCategories(await catRes.json());
      if (brandRes.ok) setBrands(await brandRes.json());
      if (colRes.ok) setColors(await colRes.json());
      if (sizeRes.ok) setSizes(await sizeRes.json());
      if (copyRes.ok) setCopies(await copyRes.json());

      setLoading(false);
    };

    fetchData();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [selectedCategoryId, selectedBrand, selectedColor, selectedSize, selectedCopy, searchTerm]);

  const fetchProducts = async () => {
    setLoading(true);

    const params = new URLSearchParams();

    if (!selectedCategoryId) params.append('isFeatured', 'true');
    else params.append('categoryId', selectedCategoryId);

    if (selectedBrand) params.append('brandId', selectedBrand);
    if (selectedColor) params.append('colorId', selectedColor);
    if (selectedSize) params.append('sizeId', selectedSize);
    if (selectedCopy) params.append('copyId', selectedCopy);
    if (searchTerm) params.append('search', searchTerm);

    const res = await fetch(`${API_BASE_URL}/Products?${params.toString()}`);
    const data = await res.json();

    setProducts(Array.isArray(data) ? data : []);
    setLoading(false);
  };

  const getImageUrl = (url) => {
    if (!url) return 'https://via.placeholder.com/300';
    if (url.startsWith('http')) return url;
    return `${SERVER_BASE_URL}${url}`;
  };

  return (
    <section className="container">

      {/* Sidebar - سيتم إخفاؤه في الموبايل */}
      <div className="sidebar">
        <button
          className={!selectedCategoryId ? 'active' : ''}
          onClick={() => setSelectedCategoryId(null)}
        >
          ⭐ Featured
        </button>

        {categories.map(cat => (
          <button
            key={cat.id}
            className={selectedCategoryId === cat.id ? 'active' : ''}
            onClick={() => setSelectedCategoryId(cat.id)}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="content">

        <div className="top">

          <input
            className="searchInput"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          <div className="filterGroup">
            <span className="label">Brands:</span>
            <div className="chips">
              {brands.map(b => (
                <button
                  key={b.id}
                  className={selectedBrand === String(b.id) ? 'active' : ''}
                  onClick={() =>
                    setSelectedBrand(selectedBrand === String(b.id) ? '' : String(b.id))
                  }
                >
                  {b.name}
                </button>
              ))}
            </div>
          </div>

          <div className="filterGroup">
            <span className="label">Colors:</span>
            <div className="chips">
              {colors.map(c => (
                <button
                  key={c.colorID}
                  className={selectedColor === String(c.colorID) ? 'active' : ''}
                  onClick={() =>
                    setSelectedColor(selectedColor === String(c.colorID) ? '' : String(c.colorID))
                  }
                >
                  {c.name}
                </button>
              ))}
            </div>
          </div>

          <div className="filterGroup">
            <span className="label">Sizes:</span>
            <div className="chips">
              {sizes.map(s => (
                <button
                  key={s.sizeID}
                  className={selectedSize === String(s.sizeID) ? 'active' : ''}
                  onClick={() =>
                    setSelectedSize(selectedSize === String(s.sizeID) ? '' : String(s.sizeID))
                  }
                >
                  {s.name}
                </button>
              ))}
            </div>
          </div>

          <div className="filterGroup">
            <span className="label">Copies:</span>
            <div className="chips">
              {copies.map(c => (
                <button
                  key={c.copyID}
                  className={selectedCopy === String(c.copyID) ? 'active' : ''}
                  onClick={() =>
                    setSelectedCopy(selectedCopy === String(c.copyID) ? '' : String(c.copyID))
                  }
                >
                  {c.name}
                </button>
              ))}
            </div>
          </div>

        </div>

        {loading ? (
          <div className="loadingContainer">
            <div className="spinner"></div>
            <p>Loading products...</p>
          </div>
        ) : (
          <div className="grid">
            {products.map((product, index) => (
              <div key={product.id} className="card" style={{ animationDelay: `${index * 50}ms` }}>
                
                <div className="imgWrap">
                  <img src={getImageUrl(product.imageUrl)} alt={product.name} loading="lazy" />
                </div>

                <div className="info">
                  <h3>{product.name}</h3>
                  <p className="price">${product.price}</p>
                  
                  {/* الزر الظاهر دائماً مع أنيمشن Floating */}
                  <button className="addToCartBtn" onClick={() => addToCart(product)}>
                    <span className="icon">+</span> Add to Cart
                  </button>
                </div>

              </div>
            ))}
          </div>
        )}
      </div>

      <style jsx>{`

        /* --- Global Reset & Container --- */
        .container {
          display: flex;
          gap: 40px;
          padding: 40px;
          background: #0b0b0c;
          color: #fff;
          min-height: 100vh;
          font-family: 'Inter', sans-serif;
        }

        /* --- Sidebar Styles --- */
        .sidebar {
          width: 220px;
          flex-shrink: 0;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.08);
          padding: 20px;
          border-radius: 16px;
          height: fit-content;
          position: sticky;
          top: 20px;
        }

        .sidebar button {
          width: 100%;
          margin-bottom: 10px;
          padding: 12px;
          background: transparent;
          border: none;
          color: #aaa;
          cursor: pointer;
          border-radius: 8px;
          text-align: left;
          transition: all 0.3s ease;
          font-weight: 500;
        }

        .sidebar button:hover {
          color: #fff;
          background: rgba(255,255,255,0.05);
        }

        .sidebar button.active {
          background: linear-gradient(135deg,#6366f1,#8b5cf6);
          color: #fff;
          box-shadow: 0 4px 15px rgba(99, 102, 241, 0.4);
        }

        /* --- Main Content Area --- */
        .content {
          flex: 1;
        }

        .top {
          margin-bottom: 30px;
          background: rgba(255,255,255,0.02);
          padding: 20px;
          border-radius: 16px;
          border: 1px solid rgba(255,255,255,0.05);
        }

        .searchInput {
          padding: 14px 20px;
          border-radius: 12px;
          border: 1px solid rgba(255,255,255,0.1);
          background: rgba(0,0,0,0.3);
          color: #fff;
          width: 100%;
          margin-bottom: 25px;
          font-size: 1rem;
          outline: none;
          transition: border-color 0.3s;
        }

        .searchInput:focus {
          border-color: #6366f1;
        }

        .filterGroup {
          margin-bottom: 15px;
        }

        .label {
          display: block;
          font-size: 0.85rem;
          color: #888;
          margin-bottom: 8px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .chips {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
        }

        .chips button {
          padding: 8px 16px;
          border-radius: 20px;
          border: 1px solid rgba(255,255,255,0.15);
          background: rgba(255,255,255,0.05);
          color: #ccc;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          font-size: 0.9rem;
        }

        .chips button:hover {
          border-color: #6366f1;
          color: #fff;
          transform: translateY(-2px);
        }

        .chips button.active {
          background: #fff;
          color: #000;
          border-color: #fff;
          box-shadow: 0 0 15px rgba(255,255,255,0.3);
        }

        /* --- Loading State --- */
        .loadingContainer {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 50px;
          color: #aaa;
        }

        .spinner {
          width: 40px;
          height: 40px;
          border: 3px solid rgba(255,255,255,0.1);
          border-radius: 50%;
          border-top-color: #6366f1;
          animation: spin 1s ease-in-out infinite;
          margin-bottom: 15px;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        /* --- Grid Layout --- */
        .grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
          gap: 25px;
        }

        /* --- Card Styles --- */
        .card {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 16px;
          overflow: hidden;
          transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          display: flex;
          flex-direction: column;
          opacity: 0;
          animation: fadeInUp 0.6s ease-out forwards;
        }

        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .card:hover {
          transform: translateY(-8px);
          box-shadow: 0 10px 30px -10px rgba(0,0,0,0.5);
          border-color: rgba(99, 102, 241, 0.3);
        }

        .imgWrap {
          position: relative;
          height: 240px;
          overflow: hidden;
          background: #1a1a1a;
        }

        .imgWrap img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.6s ease;
        }

        .card:hover .imgWrap img {
          transform: scale(1.1);
        }

        .info {
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 8px;
          flex: 1;
        }

        .info h3 {
          margin: 0;
          font-size: 1rem;
          font-weight: 600;
          color: #fff;
          line-height: 1.4;
        }

        .price {
          margin: 0;
          color: #8b5cf6;
          font-weight: 700;
          font-size: 1.1rem;
        }

        /* --- The Button (Always Visible) --- */
        .addToCartBtn {
          margin-top: auto;
          padding: 12px;
          border-radius: 10px;
          border: none;
          background: linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(139, 92, 246, 0.1));
          color: #6366f1;
          cursor: pointer;
          font-weight: 700;
          font-size: 0.9rem;
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
          border: 1px solid rgba(99, 102, 241, 0.2);
          
          /* Awesome Floating Animation */
          animation: floating 3s ease-in-out infinite;
        }

        @keyframes floating {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-3px); }
          100% { transform: translateY(0px); }
        }

        .addToCartBtn:hover {
          background: linear-gradient(135deg,#6366f1,#8b5cf6);
          color: #fff;
          box-shadow: 0 5px 15px rgba(99, 102, 241, 0.4);
          animation: none; /* Stop floating on hover */
          transform: scale(1.02);
        }

        .addToCartBtn:active {
          transform: scale(0.95);
        }

        .addToCartBtn .icon {
          margin-right: 5px;
          font-size: 1.1rem;
        }

        /* --- Mobile Responsive Logic --- */
        @media (max-width: 768px) {
          .container {
            flex-direction: column;
            padding: 20px;
            gap: 20px;
          }

          .sidebar {
            width: 100%;
            position: static; /* Remove sticky on mobile */
            display: flex;
            overflow-x: auto;
            padding: 10px;
            gap: 10px;
            align-items: center;
          }

          .sidebar button {
            width: auto;
            white-space: nowrap;
            margin-bottom: 0;
            flex-shrink: 0;
          }

          .grid {
            grid-template-columns: repeat(2, 1fr); /* 2 columns on mobile */
            gap: 15px;
          }

          .card {
            border-radius: 12px;
          }

          .imgWrap {
            height: 180px; /* Smaller images on mobile */
          }
          
          .info h3 {
            font-size: 0.9rem;
          }
          
          .addToCartBtn {
            padding: 10px;
            font-size: 0.8rem;
          }
        }
        
        @media (max-width: 480px) {
          .grid {
            grid-template-columns: 1fr; /* 1 column on very small screens */
          }
        }

      `}</style>
    </section>
  );
};

export default FeaturedProducts;