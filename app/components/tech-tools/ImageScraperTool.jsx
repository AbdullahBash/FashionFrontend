'use client';

import React, { useState } from 'react';

export default function ImageScraperTool() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
  
      <div style={cardStyle}>
        <div style={iconContainerStyle}>
           <svg style={iconStyle} fill="none" stroke="currentColor" viewBox="0 0 24 24">
             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 4v4m0 0h4m-4 0l4 4" />
           </svg>
        </div>

        <div style={contentStyle}>
            <div style={tagStyle}>Tech Solution</div>
            <h3 style={titleStyle}>AI Image Scraper Pro</h3>
            <p style={descStyle}>
                قم بتحميل وتضمين آلاف صور المنتجات لملفات Excel الخاصة بك في دقائق معدودة.
            </p>
            
            <div style={priceContainerStyle}>
                <span style={priceStyle}>Starting at</span>
                <span style={amountStyle}>$5/mo</span>
            </div>

            <button onClick={() => setIsModalOpen(true)} style={buttonStyle}>
                Launch Tool
            </button>
        </div>
      </div>

  
      {isModalOpen && <ImageScraperModal onClose={() => setIsModalOpen(false)} />}
    </>
  );
}

// --- المكون الفرعي للنافذة المنبثقة ---
function ImageScraperModal({ onClose }) {
  const [selectedPlan, setSelectedPlan] = useState('free');
  const [mode, setMode] = useState('download');
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleProcess = async (e) => {
    e.preventDefault();
    if (!file) return alert("Please select an Excel file");
    
    setLoading(true);
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('column_name', 'DESCRIPTION'); // اسم العمود الافتراضي في بايثون

    try {
      // الاتصال بسيرفر بايثون المحلي
      const response = await fetch('http://127.0.0.1:8000/api/scrape', {
        method: 'POST',
        body: formData, 
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `scraped_images_${new Date().getTime()}.zip`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);

        alert("Processing Complete! File downloaded.");
        onClose();
      } else {
        const errorText = await response.text();
        alert(`Server Error: ${errorText}`);
      }
    } catch (error) {
      console.error("Upload Error:", error);
      alert("Failed to connect to Python Server. Make sure it's running on port 8000.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={overlayStyle}>
      <div style={modalStyle}>
        {/* Header */}
        <div style={headerStyle}>
          <h2 style={headerTitleStyle}>Image Scraper Pro</h2>
          <button onClick={onClose} style={closeBtnStyle}>✕</button>
        </div>

        <div style={modalBodyStyle}>
          <p style={introTextStyle}>
            Select a plan to configure your scraping limits and processing options.
          </p>

          <div style={plansGridStyle}>
            {[
              { id: 'free', name: 'Free Trial', price: 'Free', limit: '20 Items', features: ['1 Image / Item', 'Download Only'] },
              { id: 'basic', name: 'Basic', price: '$5/mo', limit: '500 Items', features: ['Embed in Excel', '5 Sources', 'Priority Support'] },
              { id: 'pro', name: 'Pro', price: '$10/mo', limit: '1000 Items', features: ['Unlimited Sources', 'Advanced Filters', 'API Access'] },
              { id: 'lifetime', name: 'Lifetime', price: '$20 One-Time', limit: 'Unlimited', features: ['All Pro Features', 'Lifetime Updates'] }
            ].map((plan) => (
              <div 
                key={plan.id}
                onClick={() => setSelectedPlan(plan.id)}
                style={{
                  ...planCardStyle,
                  borderColor: selectedPlan === plan.id ? '#6366f1' : 'transparent',
                  backgroundColor: selectedPlan === plan.id ? 'rgba(99, 102, 241, 0.1)' : '#f8fafc'
                }}
              >
                <h4 style={planTitleStyle}>{plan.name}</h4>
                <div style={planPriceStyle}>{plan.price}</div>
                <div style={planLimitStyle}>{plan.limit}</div>
                <ul style={planFeaturesStyle}>
                    {plan.features.map((f, i) => (
                        <li key={i}>✓ {f}</li>
                    ))}
                </ul>
              </div>
            ))}
          </div>

          <div style={optionsSectionStyle}>
            <h4 style={sectionTitleStyle}>Processing Options</h4>
            <div style={radioGroupStyle}>
              <label style={radioLabelStyle}>
                <input 
                  type="radio" 
                  name="mode" 
                  value="download" 
                  checked={mode === 'download'} 
                  onChange={(e) => setMode(e.target.value)}
                />
                <span>Download as ZIP Folder</span>
              </label>
              <label style={radioLabelStyle}>
                <input 
                  type="radio" 
                  name="mode" 
                  value="embed" 
                  checked={mode === 'embed'} 
                  onChange={(e) => setMode(e.target.value)}
                />
                <span>Embed in Excel File</span>
              </label>
            </div>
          </div>

          <div style={uploadSectionStyle}>
            <h4 style={sectionTitleStyle}>Upload Data</h4>
            <label style={fileInputWrapperStyle}>
              <input type="file" accept=".xlsx, .xls" onChange={handleFileChange} style={{ display: 'none' }} />
              <div style={filePlaceholderStyle}>
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{width: 24, height: 24, marginBottom: 10}}>
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <span>{file ? file.name : "Click to upload Excel file"}</span>
              </div>
            </label>
          </div>

          <button 
            onClick={handleProcess} 
            disabled={loading} 
            style={{...actionButtonStyle, opacity: loading ? 0.7 : 1, cursor: loading ? 'not-allowed' : 'pointer'}}
          >
            {loading ? "Processing..." : "Start Scraping"}
          </button>
        </div>
      </div>
    </div>
  );
}

// --- Styles ---
const cardStyle = {
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: '#1e293b',
    borderRadius: '16px',
    overflow: 'hidden',
    border: '1px solid #334155',
    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
    cursor: 'pointer',
    height: '100%',
    position: 'relative'
};

const iconContainerStyle = {
    height: '200px',
    backgroundColor: '#0f172a',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    borderBottom: '1px solid #334155'
};

const iconStyle = {
    width: 80,
    height: 80,
    color: '#6366f1'
};

const contentStyle = {
    padding: '24px',
    display: 'flex',
    flexDirection: 'column',
    flexGrow: 1,
    justifyContent: 'space-between'
};

const tagStyle = {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(99, 102, 241, 0.2)',
    color: '#818cf8',
    padding: '4px 12px',
    borderRadius: '20px',
    fontSize: '0.75rem',
    fontWeight: '600',
    textTransform: 'uppercase',
    marginBottom: '12px',
    display: 'inline-block'
};

const titleStyle = {
    fontSize: '1.5rem',
    fontWeight: '700',
    color: '#f8fafc',
    margin: '0 0 12px 0'
};

const descStyle = {
    fontSize: '0.95rem',
    color: '#94a3b8',
    lineHeight: '1.6',
    margin: '0 0 20px 0'
};

const priceContainerStyle = {
    marginBottom: '20px'
};

const priceStyle = {
    fontSize: '0.9rem',
    color: '#cbd5e1',
    display: 'block'
};

const amountStyle = {
    fontSize: '1.5rem',
    fontWeight: '700',
    color: '#fff',
    display: 'block'
};

const buttonStyle = {
    backgroundColor: '#6366f1',
    color: '#fff',
    border: 'none',
    padding: '14px',
    borderRadius: '8px',
    fontWeight: '600',
    cursor: 'pointer',
    textAlign: 'center',
    transition: 'background 0.2s',
    width: '100%'
};

// Modal Styles
const overlayStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    backdropFilter: 'blur(5px)',
    zIndex: 1000,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
};

const modalStyle = {
    backgroundColor: '#1e293b',
    width: '90%',
    maxWidth: '900px',
    borderRadius: '20px',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
    maxHeight: '90vh',
    display: 'flex',
    flexDirection: 'column',
    border: '1px solid #334155',
    overflow: 'hidden'
};

const headerStyle = {
    padding: '20px 30px',
    borderBottom: '1px solid #334155',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#0f172a'
};

const headerTitleStyle = {
    margin: 0,
    fontSize: '1.5rem',
    color: '#fff',
    fontWeight: '700'
};

const closeBtnStyle = {
    background: 'none',
    border: 'none',
    color: '#94a3b8',
    fontSize: '1.5rem',
    cursor: 'pointer',
    padding: '0 10px'
};

const modalBodyStyle = {
    padding: '30px',
    overflowY: 'auto'
};

const introTextStyle = {
    color: '#cbd5e1',
    marginBottom: '30px',
    textAlign: 'center',
    fontSize: '1.1rem'
};

const plansGridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '20px',
    marginBottom: '40px'
};

const planCardStyle = {
    border: '2px solid transparent',
    borderRadius: '12px',
    padding: '20px',
    backgroundColor: '#1e293b',
    cursor: 'pointer',
    transition: 'all 0.2s',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center'
};

const planTitleStyle = {
    margin: '0 0 5px 0',
    color: '#fff',
    fontSize: '1.1rem'
};

const planPriceStyle = {
    color: '#6366f1',
    fontSize: '1.25rem',
    fontWeight: '700',
    marginBottom: '5px'
};

const planLimitStyle = {
    color: '#94a3b8',
    fontSize: '0.85rem',
    marginBottom: '15px'
};

const planFeaturesStyle = {
    listStyle: 'none',
    padding: 0,
    margin: 0,
    textAlign: 'left',
    width: '100%',
    fontSize: '0.9rem',
    color: '#cbd5e1'
};

const sectionTitleStyle = {
    fontSize: '1rem',
    fontWeight: '600',
    color: '#f8fafc',
    margin: '0 0 15px 0',
    borderBottom: '1px solid #334155',
    paddingBottom: '10px'
};

const optionsSectionStyle = {
    marginBottom: '30px',
    backgroundColor: '#0f172a',
    padding: '20px',
    borderRadius: '12px',
    border: '1px solid #334155'
};

const radioGroupStyle = {
    display: 'flex',
    gap: '30px'
};

const radioLabelStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    color: '#cbd5e1',
    cursor: 'pointer',
    fontSize: '1rem'
};

const uploadSectionStyle = {
    marginBottom: '30px'
};

const fileInputWrapperStyle = {
    display: 'block',
    border: '2px dashed #475569',
    borderRadius: '12px',
    padding: '40px',
    textAlign: 'center',
    cursor: 'pointer',
    backgroundColor: '#0f172a',
    transition: 'border-color 0.2s'
};

const filePlaceholderStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    color: '#94a3b8'
};

const actionButtonStyle = {
    width: '100%',
    padding: '18px',
    backgroundColor: '#6366f1',
    color: '#fff',
    border: 'none',
    borderRadius: '12px',
    fontSize: '1.1rem',
    fontWeight: '700',
    cursor: 'pointer'
};