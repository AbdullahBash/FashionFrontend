'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { API_BASE_URL } from '@/app/config.js';

export default function AddProductPage() {
  const router = useRouter();
  const SERVER_BASE_URL = API_BASE_URL.replace('/api', '');

  // --- Product Form State (Explicitly typed as any) ---
  const [formData, setFormData] = useState<any>({
    id: 0,
    name: '',
    price: '',
    quantity: '',
    categoryId: '', 
    brandId: '',
    imageUrl: '',
    colorId: '', 
    sizeId: '',  
    copyId: '',
    sortOrder: 0,
    isFeatured: false,
    isVisible: true
  });
  
  const [uploading, setUploading] = useState(false);
  const [brands, setBrands] = useState<any[]>([]); 
  const [categories, setCategories] = useState<any[]>([]);
  const [colors, setColors] = useState<any[]>([]);
  const [sizes, setSizes] = useState<any[]>([]);
  const [copies, setCopies] = useState<any[]>([]);
  
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // --- Modals States ---
  const [showBrandModal, setShowBrandModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showColorModal, setShowColorModal] = useState(false);
  const [showSizeModal, setShowSizeModal] = useState(false);
  const [showCopyModal, setShowCopyModal] = useState(false);
  const [showProductSearch, setShowProductSearch] = useState(false);

  // --- Editing States (Explicitly any) ---
  const [editingBrand, setEditingBrand] = useState<any>(null);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [editingColor, setEditingColor] = useState<any>(null);
  const [editingSize, setEditingSize] = useState<any>(null);
  const [editingCopy, setEditingCopy] = useState<any>(null);

  // --- New Item States ---
  const [newBrandName, setNewBrandName] = useState('');
  
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategorySortOrder, setNewCategorySortOrder] = useState(0);
  const [newCategoryIsVisible, setNewCategoryIsVisible] = useState(true);

  const [newColorName, setNewColorName] = useState('');
  const [newColorHex, setNewColorHex] = useState('#000000');

  const [newSizeName, setNewSizeName] = useState('');
  const [newCopyName, setNewCopyName] = useState('');

  const [searchTermProducts, setSearchTermProducts] = useState('');
  const [productsList, setProductsList] = useState<any[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);

  const getAuthHeaders = () => {
    const tokenCookie = document.cookie.split('; ').find(row => row.startsWith('token='));
    const token = tokenCookie ? tokenCookie.split('=')[1] : null;
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    return headers;
  };

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        const [brandRes, catRes, colRes, sizeRes, copyRes] = await Promise.all([
          fetch(`${API_BASE_URL}/Brand`),
          fetch(`${API_BASE_URL}/Category`),
          fetch(`${API_BASE_URL}/Colors`),
          fetch(`${API_BASE_URL}/Sizes`),
          fetch(`${API_BASE_URL}/CopyOptions`)
        ]);

        if (brandRes.ok) setBrands(await brandRes.json());
        if (catRes.ok) setCategories(await catRes.json());
        if (colRes.ok) setColors(await colRes.json());
        if (sizeRes.ok) setSizes(await sizeRes.json());
        if (copyRes.ok) setCopies(await copyRes.json());
      } catch (err) {
        console.error("Error fetching lists:", err);
      }
    };
    fetchAllData();
  }, []);

  useEffect(() => {
    if (!showProductSearch) return;
    const delayDebounceFn = setTimeout(() => {
      setLoadingProducts(true);
      let url = `${API_BASE_URL}/Products`;
      if (searchTermProducts) url += `?search=${encodeURIComponent(searchTermProducts)}`;

      fetch(url, { headers: getAuthHeaders() })
        .then(res => res.json())
        .then(data => { setProductsList(data); setLoadingProducts(false); })
        .catch(err => { console.error(err); setLoadingProducts(false); });
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchTermProducts, showProductSearch]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    setFormData({ ...formData, [name]: val });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const formDataUpload = new FormData();
    formDataUpload.append('file', file);
    try {
      const headers = getAuthHeaders();
      const res = await fetch(`${API_BASE_URL}/Products/upload`, {
        method: 'POST',
        headers: headers,
        body: formDataUpload,
      });
      if (res.ok) {
        const data = await res.json();
        setFormData({ ...formData, imageUrl: data.imageUrl });
      } else { alert('Failed to upload image'); }
    } catch (error) {
      console.error(error);
      alert('Error uploading image');
    } finally { setUploading(false); }
  };

  const handleResetForm = () => {
    setFormData({
      id: 0, name: '', price: '', quantity: '',
      categoryId: '', brandId: '', imageUrl: '',
      colorId: '', sizeId: '', copyId: '',
      sortOrder: 0, isFeatured: false, isVisible: true
    });
    setMessage('');
  };

  const handleDelete = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (window.confirm('Are you sure you want to delete this product?')) {
      setLoading(true);
      try {
        const response = await fetch(`${API_BASE_URL}/Products/${formData.id}`, {
          method: 'DELETE',
          headers: getAuthHeaders(),
        });
        if (response.ok) {
          alert('Product deleted successfully.');
          router.push('/admin'); 
        } else { alert('Failed to delete product.'); setLoading(false); }
      } catch (error) {
        console.error(error); alert('An error occurred.'); setLoading(false);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    if (!formData.brandId || !formData.categoryId) {
      setMessage('Please select Brand and Category.');
      setLoading(false);
      return;
    }

    try {
      const payload: any = {
        name: formData.name,
        price: parseFloat(formData.price),
        quantity: parseInt(formData.quantity),
        categoryId: parseInt(formData.categoryId),
        brandId: parseInt(formData.brandId),
        imageUrl: formData.imageUrl,
        colorId: formData.colorId ? parseInt(formData.colorId) : null,
        sizeId: formData.sizeId ? parseInt(formData.sizeId) : null,
        copyId: formData.copyId ? parseInt(formData.copyId) : null,
        sortOrder: parseInt(formData.sortOrder.toString()) || 0,
        isFeatured: formData.isFeatured,
        isVisible: formData.isVisible
      };

      let response;
      const jsonHeaders = { ...getAuthHeaders(), 'Content-Type': 'application/json' };
      
      if (formData.id === 0) {
        response = await fetch(`${API_BASE_URL}/Products`, {
          method: 'POST',
          headers: jsonHeaders,
          body: JSON.stringify(payload),
        });
      } else {
        response = await fetch(`${API_BASE_URL}/Products/${formData.id}`, {
          method: 'PUT',
          headers: jsonHeaders,
          body: JSON.stringify({ ...payload, id: formData.id }),
        });
      }

      if (response.ok) {
        setMessage('Product saved! Ready for next item...');
        setLoading(false);
        setTimeout(() => { handleResetForm(); }, 1500);
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error("Save Error:", errorData);
        setMessage('Error saving product.'); 
        setLoading(false);
      }
    } catch (error) {
      console.error(error); 
      setMessage('Failed to connect.'); 
      setLoading(false);
    }
  };

      const handleSelectProduct = (product: any) => {
    // طباعة البيانات القادمة للتأكد (افتح الـ Console لرؤية النتيجة)
    console.log("Product Data Selected:", product);

    // --- إصلاح مشكلة المطابقة (Using == instead of ===) ---
    // هذا يسمح بمقارنة الرقم 1 مع النص "1"
    let selectedCategory = categories.find((c: any) => c.id == product.categoryId);
    let selectedBrand = brands.find((b: any) => b.id == product.brandId);
    
    // --- التعامل مع التصنيف المخفي ---
    if (!selectedCategory) {
      if (product.categoryId) {
        // التحقق إذا كان موجوداً مسبقاً لتجنب التكرار
        const alreadyExists = categories.some((c: any) => c.id == product.categoryId);
        
        if (!alreadyExists) {
          const hiddenCategory = { 
            id: product.categoryId, 
            name: (product.categoryName || 'Unknown Category') + " (Hidden)" 
          };
          // إضافة العنصر المخفي للقائمة لتظهره في الـ Dropdown
          setCategories(prev => [...prev, hiddenCategory]);
          selectedCategory = hiddenCategory;
          console.log("Added hidden category to list:", hiddenCategory);
        }
      } else {
        console.warn("Product ID exists but Category ID is missing in response!");
      }
    }

    // --- التعامل مع المارك المخفي ---
    if (!selectedBrand) {
      if (product.brandId) {
        const alreadyExists = brands.some((b: any) => b.id == product.brandId);
        if (!alreadyExists) {
          const hiddenBrand = { 
            id: product.brandId, 
            name: (product.brandName || 'Unknown Brand') + " (Hidden)" 
          };
          setBrands(prev => [...prev, hiddenBrand]);
          selectedBrand = hiddenBrand;
          console.log("Added hidden brand to list:", hiddenBrand);
        }
      } else {
        console.warn("Product ID exists but Brand ID is missing in response!");
      }
    }

    // باقي العناصر (Color, Size, Copy)
    const selectedColor = colors.find((c: any) => c.colorID == product.colorID);
    const selectedSize = sizes.find((s: any) => s.sizeID == product.sizeID);
    const selectedCopy = copies.find((cp: any) => cp.copyID == product.copyID);

    // تعيين البيانات للنموذج
    setFormData({
      id: product.id,
      name: product.name || '',
      price: product.price ? product.price.toString() : '',
      quantity: product.quantity ? product.quantity.toString() : '',
      // نستخدم القيمة التي حصلنا عليها سواء من القائمة أو من الإضافة المؤقتة
      categoryId: selectedCategory ? selectedCategory.id.toString() : '',
      brandId: selectedBrand ? selectedBrand.id.toString() : '',
      imageUrl: product.imageUrl || '',
      colorId: selectedColor ? selectedColor.colorID.toString() : '',
      sizeId: selectedSize ? selectedSize.sizeID.toString() : '',
      copyId: selectedCopy ? selectedCopy.copyID.toString() : '',
      sortOrder: product.sortOrder || 0,
      isFeatured: product.isFeatured || false,
      isVisible: product.isVisible !== undefined ? product.isVisible : true
    });
    
    setShowProductSearch(false);
  };
  // --- Unified Helper: Open Modal (Add or Edit) ---
  const openBrandModal = (brand: any = null) => {
    if (brand) {
      setEditingBrand(brand);
      setNewBrandName(brand.name);
    } else {
      setEditingBrand(null);
      setNewBrandName('');
    }
    setShowBrandModal(true);
  };

  const openCategoryModal = (category: any = null) => {
    if (category) {
      setEditingCategory(category);
      setNewCategoryName(category.name);
      setNewCategorySortOrder(category.sortOrder || 0);
      setNewCategoryIsVisible(category.isVisible !== undefined ? category.isVisible : true);
    } else {
      setEditingCategory(null);
      setNewCategoryName('');
      setNewCategorySortOrder(0);
      setNewCategoryIsVisible(true);
    }
    setShowCategoryModal(true);
  };

  const openColorModal = (color: any = null) => {
    if (color) {
      setEditingColor(color);
      setNewColorName(color.name);
      setNewColorHex(color.hex || '#000000');
    } else {
      setEditingColor(null);
      setNewColorName('');
      setNewColorHex('#000000');
    }
    setShowColorModal(true);
  };

  const openSizeModal = (size: any = null) => {
    if (size) {
      setEditingSize(size);
      setNewSizeName(size.name);
    } else {
      setEditingSize(null);
      setNewSizeName('');
    }
    setShowSizeModal(true);
  };

  const openCopyModal = (copy: any = null) => {
    if (copy) {
      setEditingCopy(copy);
      setNewCopyName(copy.name);
    } else {
      setEditingCopy(null);
      setNewCopyName('');
    }
    setShowCopyModal(true);
  };

  // --- Handlers (Save Logic for Add/Edit) ---
  const handleSaveBrand = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBrandName) return;
    try {
      const headers = { ...getAuthHeaders(), 'Content-Type': 'application/json' };
      let res;
      if (editingBrand) {
        res = await fetch(`${API_BASE_URL}/Brand/${editingBrand.id}`, {
          method: 'PUT', headers, body: JSON.stringify({ id: editingBrand.id, name: newBrandName })
        });
        if (res.ok) {
          setBrands(brands.map((b: any) => b.id === editingBrand.id ? { ...b, name: newBrandName } : b));
        }
      } else {
        res = await fetch(`${API_BASE_URL}/Brand`, { method: 'POST', headers, body: JSON.stringify({ name: newBrandName }) });
        if (res.ok) {
          const data = await res.json();
          setBrands([...brands, data]);
          setFormData({ ...formData, brandId: data.id });
        }
      }
      if (res.ok) { setShowBrandModal(false); }
    } catch (error) { alert('Error saving brand'); }
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName) return;
    try {
      const headers = { ...getAuthHeaders(), 'Content-Type': 'application/json' };
      let res;
      const payload: any = { // Explicit any
        name: newCategoryName,
        sortOrder: parseInt(newCategorySortOrder.toString()) || 0,
        isVisible: newCategoryIsVisible
      };

      if (editingCategory) {
        res = await fetch(`${API_BASE_URL}/Category/${editingCategory.id}`, {
          method: 'PUT', headers, body: JSON.stringify({ id: editingCategory.id, ...payload })
        });
        if (res.ok) {
          setCategories(categories.map((c: any) => c.id === editingCategory.id ? { ...c, ...payload } : c));
        }
      } else {
        res = await fetch(`${API_BASE_URL}/Category`, { method: 'POST', headers, body: JSON.stringify(payload) });
        if (res.ok) {
          const data = await res.json();
          setCategories([...categories, data]);
          setFormData({ ...formData, categoryId: data.id });
        }
      }
      if (res.ok) { setShowCategoryModal(false); }
    } catch (error) { alert('Error saving category'); }
  };

  const handleSaveColor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newColorName) return;
    try {
      const headers = { ...getAuthHeaders(), 'Content-Type': 'application/json' };
      let res;
      const payload: any = { name: newColorName, hex: newColorHex };

      if (editingColor) {
        res = await fetch(`${API_BASE_URL}/Colors/${editingColor.colorID}`, {
          method: 'PUT', headers, body: JSON.stringify({ colorID: editingColor.colorID, ...payload })
        });
        if (res.ok) {
          setColors(colors.map((c: any) => c.colorID === editingColor.colorID ? { ...c, ...payload } : c));
        }
      } else {
        res = await fetch(`${API_BASE_URL}/Colors`, { method: 'POST', headers, body: JSON.stringify(payload) });
        if (res.ok) {
          const data = await res.json();
          setColors([...colors, data]);
          setFormData({ ...formData, colorId: data.colorID });
        }
      }
      if (res.ok) { setShowColorModal(false); }
    } catch (error) { alert('Error saving color'); }
  };

  const handleSaveSize = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSizeName) return;
    try {
      const headers = { ...getAuthHeaders(), 'Content-Type': 'application/json' };
      let res;
      if (editingSize) {
        res = await fetch(`${API_BASE_URL}/Sizes/${editingSize.sizeID}`, {
          method: 'PUT', headers, body: JSON.stringify({ sizeID: editingSize.sizeID, name: newSizeName })
        });
        if (res.ok) {
          setSizes(sizes.map((s: any) => s.sizeID === editingSize.sizeID ? { ...s, name: newSizeName } : s));
        }
      } else {
        res = await fetch(`${API_BASE_URL}/Sizes`, { method: 'POST', headers, body: JSON.stringify({ name: newSizeName }) });
        if (res.ok) {
          const data = await res.json();
          setSizes([...sizes, data]);
          setFormData({ ...formData, sizeId: data.sizeID });
        }
      }
      if (res.ok) { setShowSizeModal(false); }
    } catch (error) { alert('Error saving size'); }
  };

  const handleSaveCopy = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCopyName) return;
    try {
      const headers = { ...getAuthHeaders(), 'Content-Type': 'application/json' };
      let res;
      if (editingCopy) {
        res = await fetch(`${API_BASE_URL}/CopyOptions/${editingCopy.copyID}`, {
          method: 'PUT', headers, body: JSON.stringify({ copyID: editingCopy.copyID, name: newCopyName })
        });
        if (res.ok) {
          setCopies(copies.map((c: any) => c.copyID === editingCopy.copyID ? { ...c, name: newCopyName } : c));
        }
      } else {
        res = await fetch(`${API_BASE_URL}/CopyOptions`, { method: 'POST', headers, body: JSON.stringify({ name: newCopyName }) });
        if (res.ok) {
          const data = await res.json();
          setCopies([...copies, data]);
          setFormData({ ...formData, copyId: data.copyID });
        }
      }
      if (res.ok) { setShowCopyModal(false); }
    } catch (error) { alert('Error saving version'); }
  };

  // Styles
  const styles: { [key: string]: React.CSSProperties } = {
    container: { minHeight: '100vh', padding: '50px 20px', backgroundColor: '#0f172a', color: '#f1f5f9', display: 'flex', flexDirection: 'column', alignItems: 'center', fontFamily: 'Inter, Segoe UI, sans-serif', },
    headerRow: { width: '100%', maxWidth: '650px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', gap: '12px', flexWrap: 'wrap' },
    heading: { margin: 0, color: '#fff', fontSize: '28px', flex: '1', minWidth: '200px', fontWeight: '700' },
    searchButton: { padding: '10px 20px', backgroundColor: '#334155', color: '#fff', border: '1px solid #475569', borderRadius: '8px', cursor: 'pointer', fontSize: '1rem', transition: 'background 0.2s' },
    newButton: { padding: '10px 20px', backgroundColor: 'transparent', color: '#94a3b8', border: '1px solid #475569', borderRadius: '8px', cursor: 'pointer', fontSize: '0.9rem', transition: 'all 0.2s' },
    deleteButton: { padding: '10px 20px', backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#f87171', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '8px', cursor: 'pointer', fontSize: '0.9rem', fontWeight: '600', transition: 'all 0.2s' },
    ordersButton: { padding: '10px 20px', backgroundColor: '#334155', color: '#f1f5f9', border: '1px solid #475569', borderRadius: '8px', cursor: 'pointer', fontSize: '0.9rem', fontWeight: '600', transition: 'all 0.2s' },
    form: { backgroundColor: '#1e293b', padding: '40px', borderRadius: '16px', border: '1px solid #334155', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)', width: '100%', maxWidth: '650px', },
    field: { marginBottom: '25px', display: 'flex', flexDirection: 'column', textAlign: 'left', },
    label: { marginBottom: '8px', fontWeight: '600', color: '#cbd5e1', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.05em' },
    input: { padding: '12px 16px', border: '1px solid #475569', borderRadius: '8px', fontSize: '1rem', color: '#fff', backgroundColor: '#0f172a', transition: 'border-color 0.2s', outline: 'none' },
    inputFile: { padding: '12px', border: '1px dashed #64748b', borderRadius: '8px', backgroundColor: 'rgba(15, 23, 42, 0.5)', color: '#94a3b8', cursor: 'pointer' },
    imagePreviewContainer: { marginTop: '15px', padding: '15px', backgroundColor: '#0f172a', borderRadius: '8px', border: '1px solid #334155' },
    imageUrlText: { fontSize: '0.8rem', color: '#64748b', marginBottom: '10px', wordBreak: 'break-all' },
    imageBox: { display: 'flex', justifyContent: 'center' },
    imagePreview: { width: '100px', height: '100px', objectFit: 'contain', borderRadius: '8px', border: '1px solid #475569', backgroundColor: '#000' },
    iconButton: { padding: '0 15px', backgroundColor: '#334155', color: '#fff', border: '1px solid #475569', borderRadius: '8px', cursor: 'pointer', fontSize: '1.1rem', display: 'flex', alignItems: 'center', minWidth: '45px', justifyContent: 'center', transition: 'background 0.2s' },
    buttonGroup: { display: 'flex', justifyContent: 'space-between', marginTop: '30px', gap: '15px' },
    submitButton: { padding: '12px 24px', backgroundColor: '#6366f1', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '1rem', fontWeight: '600', boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)', flex: 1 },
    cancelButton: { padding: '12px 24px', backgroundColor: 'transparent', color: '#94a3b8', border: '1px solid #475569', borderRadius: '8px', cursor: 'pointer', fontSize: '1rem', fontWeight: '500', transition: 'all 0.2s' },
    message: { marginTop: '20px', textAlign: 'center', color: '#4ade80', fontWeight: '600', padding: '10px', backgroundColor: 'rgba(74, 222, 128, 0.1)', borderRadius: '8px', border: '1px solid rgba(74, 222, 128, 0.2)' },
    modalOverlay: { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, },
    modalContent: { backgroundColor: '#1e293b', padding: '30px', borderRadius: '16px', width: '320px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)', border: '1px solid #334155' },
    modalButtons: { display: 'flex', justifyContent: 'space-between', marginTop: '25px', gap: '10px' },
    modalHeading: { color: '#fff', marginBottom: '20px', marginTop: 0, fontSize: '1.2rem' },
    searchModalContent: { backgroundColor: '#1e293b', padding: '30px', borderRadius: '16px', width: '500px', maxHeight: '80vh', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)', border: '1px solid #334155', display: 'flex', flexDirection: 'column', },
    listContainer: { marginTop: '15px', maxHeight: '300px', overflowY: 'auto', border: '1px solid #334155', borderRadius: '8px', backgroundColor: '#0f172a' },
    listItem: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 15px', borderBottom: '1px solid #1e293b', transition: 'background 0.1s' },
    listItemImage: { width: '45px', height: '45px', objectFit: 'contain', borderRadius: '6px', backgroundColor: '#0f172a' },
    listItemNoImage: { width: '45px', height: '45px', backgroundColor: '#1e293b', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', color: '#64748b' },
    listItemName: { fontWeight: '600', color: '#f1f5f9', fontSize: '0.95rem' },
    listItemPrice: { fontSize: '0.8rem', color: '#94a3b8' },
    loadingText: { padding: '20px', textAlign: 'center', color: '#94a3b8' },
    selectButton: { padding: '6px 14px', backgroundColor: '#6366f1', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '500' },
    checkboxContainer: { display: 'flex', alignItems: 'center', gap: '10px', marginTop: '10px', cursor: 'pointer' },
    checkboxInput: { width: '18px', height: '18px', cursor: 'pointer' },
    actionButtonsGroup: { display: 'flex', gap: '5px' }
  };

  return (
    <div style={styles.container}>
      <div style={styles.headerRow}>
        <h1 style={styles.heading}>{formData.id === 0 ? 'Add New Product' : 'Edit Product'}</h1>
        {formData.id !== 0 && <button onClick={handleDelete} style={styles.deleteButton}>Delete</button>}
        {formData.id !== 0 && <button onClick={handleResetForm} style={styles.newButton}>+ New Product</button>}
        <button onClick={() => setShowProductSearch(true)} style={styles.searchButton}>🔍 Search</button>
        <button onClick={() => router.push('/admin/orders')} style={styles.ordersButton}>Orders</button>
      </div>
      
      <form onSubmit={handleSubmit} style={styles.form}>
        <div style={styles.field}>
          <label style={styles.label}>Product Name</label>
          <input type="text" name="name" value={formData.name} onChange={handleChange} required style={styles.input} />
        </div>

        <div style={{ display: 'flex', gap: '20px' }}>
          <div style={styles.field}>
            <label style={styles.label}>Price ($)</label>
            <input type="number" name="price" value={formData.price} onChange={handleChange} required step="0.01" style={styles.input} />
          </div>
          <div style={styles.field}>
            <label style={styles.label}>Quantity</label>
            <input type="number" name="quantity" value={formData.quantity} onChange={handleChange} required style={styles.input} />
          </div>
        </div>

        <div style={{ ...styles.field, maxWidth: '200px' }}>
            <label style={styles.label}>Product Sort Order</label>
            <input type="number" name="sortOrder" value={formData.sortOrder} onChange={handleChange} style={styles.input} />
        </div>

        <div style={styles.field}>
          <label style={styles.label}>Category</label>
          <div style={{ display: 'flex', gap: '10px' }}>
            <select name="categoryId" value={formData.categoryId} onChange={handleChange} required style={styles.input}>
              <option value="">Select Category...</option>
              {categories.map((cat: any) => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
            </select>
            <div style={styles.actionButtonsGroup}>
                <button type="button" onClick={() => openCategoryModal()} style={styles.iconButton} title="Add">+</button>
                <button 
                    type="button" 
                    onClick={() => openCategoryModal(categories.find((c: any) => c.id == formData.categoryId))} 
                    style={{...styles.iconButton, fontSize: '0.9rem'}} 
                    title="Edit Selected"
                    disabled={!formData.categoryId}
                >
                    ✏️
                </button>
            </div>
          </div>
        </div>

        <div style={styles.field}>
          <label style={styles.label}>Brand</label>
          <div style={{ display: 'flex', gap: '10px' }}>
            <select name="brandId" value={formData.brandId} onChange={handleChange} required style={styles.input}>
              <option value="">Select Brand...</option>
              {brands.map((brand: any) => <option key={brand.id} value={brand.id}>{brand.name}</option>)}
            </select>
            <div style={styles.actionButtonsGroup}>
                <button type="button" onClick={() => openBrandModal()} style={styles.iconButton} title="Add">+</button>
                <button 
                    type="button" 
                    onClick={() => openBrandModal(brands.find((b: any) => b.id == formData.brandId))} 
                    style={{...styles.iconButton, fontSize: '0.9rem'}} 
                    title="Edit Selected"
                    disabled={!formData.brandId}
                >
                    ✏️
                </button>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
          
          <div style={{ ...styles.field, flex: 1, minWidth: '200px' }}>
            <label style={styles.label}>Color</label>
            <div style={{ display: 'flex', gap: '10px' }}>
              <select name="colorId" value={formData.colorId} onChange={handleChange} style={styles.input}>
                <option value="">No Color</option>
                {colors.map((c: any) => (
                  <option key={c.colorID} value={c.colorID}>
                    {c.name} {c.hex && `(${c.hex})`}
                  </option>
                ))}
              </select>
              <div style={styles.actionButtonsGroup}>
                <button type="button" onClick={() => openColorModal()} style={styles.iconButton} title="Add Color">+</button>
                <button 
                    type="button" 
                    onClick={() => openColorModal(colors.find((c: any) => c.colorID == formData.colorId))} 
                    style={{...styles.iconButton, fontSize: '0.9rem'}} 
                    title="Edit Selected"
                    disabled={!formData.colorId}
                >
                    ✏️
                </button>
              </div>
            </div>
          </div>

          <div style={{ ...styles.field, flex: 1, minWidth: '200px' }}>
            <label style={styles.label}>Size</label>
            <div style={{ display: 'flex', gap: '10px' }}>
              <select name="sizeId" value={formData.sizeId} onChange={handleChange} style={styles.input}>
                <option value="">No Size</option>
                {sizes.map((s: any) => (
                  <option key={s.sizeID} value={s.sizeID}>{s.name}</option>
                ))}
              </select>
              <div style={styles.actionButtonsGroup}>
                <button type="button" onClick={() => openSizeModal()} style={styles.iconButton} title="Add Size">+</button>
                <button 
                    type="button" 
                    onClick={() => openSizeModal(sizes.find((s: any) => s.sizeID == formData.sizeId))} 
                    style={{...styles.iconButton, fontSize: '0.9rem'}} 
                    title="Edit Selected"
                    disabled={!formData.sizeId}
                >
                    ✏️
                </button>
              </div>
            </div>
          </div>

          <div style={{ ...styles.field, flex: 1, minWidth: '200px' }}>
            <label style={styles.label}>Version / Copy</label>
            <div style={{ display: 'flex', gap: '10px' }}>
              <select name="copyId" value={formData.copyId} onChange={handleChange} style={styles.input}>
                <option value="">Standard</option>
                {copies.map((cp: any) => (
                  <option key={cp.copyID} value={cp.copyID}>{cp.name}</option>
                ))}
              </select>
              <div style={styles.actionButtonsGroup}>
                <button type="button" onClick={() => openCopyModal()} style={styles.iconButton} title="Add Version">+</button>
                <button 
                    type="button" 
                    onClick={() => openCopyModal(copies.find((cp: any) => cp.copyID == formData.copyId))} 
                    style={{...styles.iconButton, fontSize: '0.9rem'}} 
                    title="Edit Selected"
                    disabled={!formData.copyId}
                >
                    ✏️
                </button>
              </div>
            </div>
          </div>

        </div>

        {/* Product Checkboxes */}
        <div style={{ display: 'flex', gap: '30px', marginTop: '10px' }}>
             <label style={styles.checkboxContainer}>
                <input type="checkbox" name="isFeatured" checked={formData.isFeatured} onChange={handleChange} style={styles.checkboxInput} />
                <span style={{ color: '#cbd5e1', fontSize: '0.9rem' }}>Featured Product</span>
            </label>

            <label style={styles.checkboxContainer}>
                <input type="checkbox" name="isVisible" checked={formData.isVisible} onChange={handleChange} style={styles.checkboxInput} />
                <span style={{ color: '#cbd5e1', fontSize: '0.9rem' }}>Visible to Customers</span>
            </label>
        </div>

        <div style={styles.field}>
          <label style={styles.label}>Product Image</label>
          <input type="file" onChange={handleImageUpload} accept="image/*" style={styles.inputFile} />
          {uploading && <span style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: '5px' }}>Uploading...</span>}
          {formData.imageUrl && (
            <div style={styles.imagePreviewContainer}>
              <p style={styles.imageUrlText}>Image URL: {formData.imageUrl}</p>
              <div style={styles.imageBox}>
                <img 
                  src={formData.imageUrl.startsWith('http') ? formData.imageUrl : `${SERVER_BASE_URL}${formData.imageUrl}`} 
                  alt="Preview" style={styles.imagePreview}
                  onError={(e) => { (e.target as HTMLImageElement).src='https://via.placeholder.com/100?text=Error'; }}
                />
              </div>
            </div>
          )}
          <div style={{ marginTop: '15px', borderTop: '1px solid #334155', paddingTop: '15px' }}>
             <label style={{ fontSize: '0.85rem', fontWeight: 'normal', color: '#94a3b8' }}>Or paste URL manually:</label>
             <input type="text" name="imageUrl" value={formData.imageUrl} onChange={handleChange} placeholder="https://..." style={styles.input} />
          </div>
        </div>
        
        <div style={styles.buttonGroup}>
          <button type="submit" style={styles.submitButton} disabled={loading}>
            {loading ? 'Saving...' : (formData.id === 0 ? 'Save Product' : 'Update Product')}
          </button>
          <button type="button" onClick={() => router.push('/admin')} style={styles.cancelButton}>Cancel</button>
        </div>
        {message && <p style={styles.message}>{message}</p>}
      </form>

      {/* --- Modals --- */}
      
      {showColorModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <h3 style={styles.modalHeading}>{editingColor ? 'Edit Color' : 'Add New Color'}</h3>
            <input type="text" placeholder="Color Name (e.g. Red)" value={newColorName} onChange={(e) => setNewColorName(e.target.value)} style={styles.input} />
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '10px' }}>
              <input type="color" value={newColorHex} onChange={(e) => setNewColorHex(e.target.value)} style={{ height: '45px', width: '60px', padding: 0, border: 'none', cursor: 'pointer' }} />
              <input type="text" placeholder="Hex Code" value={newColorHex} onChange={(e) => setNewColorHex(e.target.value)} style={styles.input} />
            </div>
            <div style={styles.modalButtons}>
              <button onClick={handleSaveColor} style={styles.submitButton}>{editingColor ? 'Update' : 'Save'}</button>
              <button onClick={() => setShowColorModal(false)} style={styles.cancelButton}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {showSizeModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <h3 style={styles.modalHeading}>{editingSize ? 'Edit Size' : 'Add New Size'}</h3>
            <input type="text" placeholder="Size Name (e.g. XL)" value={newSizeName} onChange={(e) => setNewSizeName(e.target.value)} style={styles.input} />
            <div style={styles.modalButtons}>
              <button onClick={handleSaveSize} style={styles.submitButton}>{editingSize ? 'Update' : 'Save'}</button>
              <button onClick={() => setShowSizeModal(false)} style={styles.cancelButton}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {showCopyModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <h3 style={styles.modalHeading}>{editingCopy ? 'Edit Version' : 'Add New Version'}</h3>
            <input type="text" placeholder="Version Name (e.g. V2)" value={newCopyName} onChange={(e) => setNewCopyName(e.target.value)} style={styles.input} />
            <div style={styles.modalButtons}>
              <button onClick={handleSaveCopy} style={styles.submitButton}>{editingCopy ? 'Update' : 'Save'}</button>
              <button onClick={() => setShowCopyModal(false)} style={styles.cancelButton}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {showBrandModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <h3 style={styles.modalHeading}>{editingBrand ? 'Edit Brand' : 'Add New Brand'}</h3>
            <input type="text" placeholder="Brand Name" value={newBrandName} onChange={(e) => setNewBrandName(e.target.value)} style={styles.input} />
            <div style={styles.modalButtons}>
              <button onClick={handleSaveBrand} style={styles.submitButton}>{editingBrand ? 'Update' : 'Save'}</button>
              <button onClick={() => setShowBrandModal(false)} style={styles.cancelButton}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {showCategoryModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <h3 style={styles.modalHeading}>{editingCategory ? 'Edit Category' : 'Add New Category'}</h3>
            <input type="text" placeholder="Category Name" value={newCategoryName} onChange={(e) => setNewCategoryName(e.target.value)} style={styles.input} />
            
            <div style={{ marginTop: '15px' }}>
                <label style={{...styles.label, fontSize: '0.8rem'}}>Sort Order</label>
                <input 
                    type="number" 
                    placeholder="0" 
                    value={newCategorySortOrder} 
                    onChange={(e) => setNewCategorySortOrder(parseInt(e.target.value))} 
                    style={styles.input} 
                />
            </div>
            <label style={styles.checkboxContainer}>
                <input 
                    type="checkbox" 
                    checked={newCategoryIsVisible} 
                    onChange={(e) => setNewCategoryIsVisible(e.target.checked)} 
                    style={styles.checkboxInput} 
                />
                <span style={{ color: '#cbd5e1', fontSize: '0.9rem' }}>Visible</span>
            </label>

            <div style={styles.modalButtons}>
              <button onClick={handleSaveCategory} style={styles.submitButton}>{editingCategory ? 'Update' : 'Save'}</button>
              <button onClick={() => setShowCategoryModal(false)} style={styles.cancelButton}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {showProductSearch && (
        <div style={styles.modalOverlay}>
          <div style={styles.searchModalContent}>
            <h3 style={styles.modalHeading}>Search Products</h3>
            <input type="text" placeholder="Type product name..." value={searchTermProducts} onChange={(e) => setSearchTermProducts(e.target.value)} style={styles.input} />
            <div style={styles.listContainer}>
              {loadingProducts ? <div style={styles.loadingText}>Loading...</div> : 
                productsList.map((product: any) => (
                  <div key={product.id} style={styles.listItem}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                      {product.imageUrl ? <img src={product.imageUrl} alt={product.name} style={styles.listItemImage} /> : <div style={styles.listItemNoImage}>No Img</div>}
                      <div><div style={styles.listItemName}>{product.name}</div><div style={styles.listItemPrice}>${product.price}</div></div>
                    </div>
                    <button onClick={() => handleSelectProduct(product)} style={styles.selectButton}>Edit</button>
                  </div>
                ))
              }
            </div>
            <button onClick={() => setShowProductSearch(false)} style={styles.cancelButton}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}