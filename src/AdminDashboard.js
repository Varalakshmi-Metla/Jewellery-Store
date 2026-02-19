import React, { useState, useEffect } from 'react';

// Top lo import add cheyandi
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('AddProducts');
  const [imagePreview, setImagePreview] = useState(null);
  const [success, setSuccess] = useState(false);
  const [products, setProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null); // for CategoriesTab
  const [manageFilterCategory, setManageFilterCategory] = useState('ALL'); // for Manage Tab filter

  
  
  // Orders state
  const [orders, setOrders] = useState([]);
  
  const GOLD = "#C5A059"; 
  const LIGHT_BG = "#f8f9fa";

  // ---------- CATEGORIES (with localStorage sync) ----------
  const [categories, setCategories] = useState(() => {
    const savedCats = JSON.parse(localStorage.getItem('jewel_cats'));
    return savedCats || [
      { name: 'Bangles', icon: '💎' },
      { name: 'Rings', icon: '💍' },
      { name: 'Necklace', icon: '📿' }
    ];
  });


  useEffect(() => {
  const isAuth = localStorage.getItem('isAdminAuthenticated');
  if (isAuth !== 'true') {
    // Session  login page ki redirect
    navigate('/admin-login'); 
  }
}, [navigate]);

  // Save categories to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('jewel_cats', JSON.stringify(categories));
  }, [categories]);

  const [showNewCatInput, setShowNewCatInput] = useState(false);
  const [newCatName, setNewCatName] = useState("");

  // ---------- PRODUCT FORM ----------
  const [formData, setFormData] = useState({
    name: '', originalPrice: '', sellingPrice: '', stock: '', category: '', description: ''
  });

  // ---------- LOAD PRODUCTS & ORDERS ----------
  useEffect(() => {
    const savedProducts = JSON.parse(localStorage.getItem('jewels')) || [];
    setProducts(savedProducts);
    const savedOrders = JSON.parse(localStorage.getItem('jewel_orders')) || [];
    setOrders(savedOrders);
  }, [activeTab]);

  // ---------- CATEGORY HANDLER ----------
  const handleAddCategory = () => {
    if (newCatName && !categories.find(c => c.name.toLowerCase() === newCatName.toLowerCase())) {
      const updatedCats = [...categories, { name: newCatName, icon: '🏷️' }];
      setCategories(updatedCats); // state update + localStorage sync via useEffect
      setFormData({ ...formData, category: newCatName });
      setNewCatName("");
      setShowNewCatInput(false);
    }
  };

  // Compress image before converting to base64
const compressImage = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (e) => {
      const img = new Image();
      img.src = e.target.result;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 800;
        const MAX_HEIGHT = 800;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        // Compress with 0.8 quality
        const compressedBase64 = canvas.toDataURL('image/jpeg', 0.8);
        resolve(compressedBase64);
      };
      img.onerror = reject;
    };
    reader.onerror = reject;
  });
};

  // ---------- IMAGE HANDLER ----------
 const handleImageChange = async (e) => {
  const file = e.target.files[0];
  if (file) {
    try {
      const compressed = await compressImage(file);
      setImagePreview(compressed);
    } catch (error) {
      alert("Image compression failed. Please try another image.");
    }
  }
};

  // ---------- SAVE PRODUCT ----------
const handleSave = () => {
  if(!formData.name || !formData.sellingPrice || !formData.category) {
    alert("Please fill name, price and category!");
    return;
  }

  const existing = JSON.parse(localStorage.getItem('jewels')) || [];
  const newProduct = { 
    ...formData, 
    image: imagePreview,      // Already compressed
    id: Date.now(),
    stock: formData.stock || 0 
  };
  
  try {
    localStorage.setItem('jewels', JSON.stringify([...existing, newProduct]));
    setProducts([...existing, newProduct]);
    
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
    setFormData({ name: '', originalPrice: '', sellingPrice: '', stock: '', category: '', description: '' });
    setImagePreview(null);
  } catch (error) {
    if (error.name === 'QuotaExceededError' || error.code === 22) {
      alert("Storage full! Please delete some old products or use smaller images.");
    } else {
      alert("Failed to save product: " + error.message);
    }
  }
};
  // ---------- DELETE PRODUCT ----------
  const deleteProduct = (id) => {
    if(window.confirm("Are you sure you want to delete this product?")) {
      const filtered = products.filter(p => p.id !== id);
      localStorage.setItem('jewels', JSON.stringify(filtered));
      setProducts(filtered);
    }
  };

  // ---------- INCREASE STOCK ----------
  const increaseStock = (id) => {
    const updated = products.map(p => 
      p.id === id ? { ...p, stock: (parseInt(p.stock) || 0) + 1 } : p
    );
    localStorage.setItem('jewels', JSON.stringify(updated));
    setProducts(updated);
  };

  // ---------- FILTERED PRODUCTS FOR MANAGE TAB ----------
  const filteredManageProducts = manageFilterCategory === 'ALL'
    ? products
    : products.filter(p => p.category === manageFilterCategory);

  // ---------- FILTERED PRODUCTS FOR CATEGORIES TAB ----------
  const filteredCategoryProducts = selectedCategory 
    ? products.filter(p => p.category === selectedCategory)
    : products;

  // ---------- STYLES ----------
  const sidebarItemStyle = (active) => ({ 
    padding: '18px 30px', 
    cursor: 'pointer', 
    backgroundColor: active ? '#fff' : 'transparent', 
    color: active ? GOLD : '#666', 
    borderLeft: active ? `5px solid ${GOLD}` : 'none',
    fontWeight: active ? 'bold' : 'normal',
    fontSize: '14px',
    transition: '0.2s all'
  });

  const catCardStyle = (active) => ({ 
    padding: '15px', 
    background: active ? GOLD : '#fff', 
    borderRadius: '12px', 
    textAlign: 'center', 
    cursor: 'pointer', 
    border: `1px solid ${active ? GOLD : '#ddd'}`, 
    minWidth: '90px', 
    color: active ? '#fff' : '#333',
    boxShadow: active ? '0 5px 15px rgba(197, 160, 89, 0.3)' : 'none'
  });

  const filterButtonStyle = (active) => ({
    padding: '10px 20px',
    borderRadius: '30px',
    border: active ? 'none' : '1px solid #ddd',
    background: active ? GOLD : '#fff',
    color: active ? '#fff' : '#333',
    fontWeight: active ? 'bold' : 'normal',
    cursor: 'pointer',
    transition: '0.2s',
    boxShadow: active ? '0 2px 8px rgba(197,160,89,0.3)' : 'none'
  });

  const inputStyle = { width: '100%', padding: '12px', background: '#fff', border: '1px solid #ddd', color: '#333', borderRadius: '6px', boxSizing: 'border-box', outline: 'none' };
  const goldBtnSmall = { border: 'none', padding: '10px', cursor: 'pointer', borderRadius: '6px', fontWeight: 'bold', color: '#fff' };
  const goldBtnFull = { width: '100%', padding: '15px', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' };
  const tdStyle = { padding: '15px', textAlign: 'left', fontSize: '14px' };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: LIGHT_BG, color: '#333', fontFamily: 'Arial, sans-serif' }}>
      
      {/* ---------- SIDEBAR ---------- */}
      <div style={{ width: '260px', background: '#f1f1f1', borderRight: '1px solid #ddd', position: 'fixed', height: '100vh', zIndex: 10 }}>
        <div style={{ padding: '40px 20px', textAlign: 'center', borderBottom: '1px solid #ddd' }}>
          <h1 style={{ color: '#000', margin: 0, letterSpacing: '2px', fontSize: '22px', fontWeight: 'bold' }}>JEWEL<span style={{color: GOLD}}>STORE</span></h1>
          <p style={{fontSize: '10px', color: '#999', marginTop: '5px', letterSpacing: '1px'}}>ADMIN PANEL</p>
        </div>
        <div style={{ padding: '20px 0' }}>
          <div onClick={() => setActiveTab('AddProducts')} style={sidebarItemStyle(activeTab === 'AddProducts')}>➕ ADD PRODUCTS</div>
          <div onClick={() => setActiveTab('Manage')} style={sidebarItemStyle(activeTab === 'Manage')}>📋 MANAGE STORE</div>
          <div onClick={() => setActiveTab('CategoriesTab')} style={sidebarItemStyle(activeTab === 'CategoriesTab')}>🏷️ CATEGORIES</div>
          <div onClick={() => setActiveTab('Orders')} style={sidebarItemStyle(activeTab === 'Orders')}>📦 VIEW ORDERS</div>
          <div onClick={() => { localStorage.removeItem('isAdminAuthenticated'); navigate('/admin-secure-login'); }} 
          style={{ ...sidebarItemStyle(false), color: 'red', marginTop: 'auto' }}>
         🚪 LOGOUT
           </div>
        </div>
      </div>

      <div style={{ marginLeft: '260px', flex: 1, padding: '40px', background: LIGHT_BG }}>
        
        {/* ---------- ADD PRODUCTS TAB ---------- */}
        {activeTab === 'AddProducts' && (
          <div style={{ maxWidth: '800px', margin: 'auto' }}>
            <h2 style={{color: '#333', marginBottom: '25px'}}>Add New Product</h2>
            {success && (
              <div style={{background: '#d4edda', color: '#155724', padding: '15px', borderRadius: '8px', marginBottom: '20px', textAlign: 'center', border: '1px solid #c3e6cb'}}>
                ✅ Product added successfully!
              </div>
            )}
            <div style={{ background: '#fff', padding: '30px', borderRadius: '12px', border: '1px solid #eee', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '15px', marginBottom: '20px' }}>
                <input style={inputStyle} placeholder="Product Name" value={formData.name} onChange={(e)=>setFormData({...formData, name: e.target.value})} />
                <input style={inputStyle} placeholder="Cost (₹)" value={formData.originalPrice} onChange={(e)=>setFormData({...formData, originalPrice: e.target.value})} />
                <input style={inputStyle} placeholder="Selling (₹)" value={formData.sellingPrice} onChange={(e)=>setFormData({...formData, sellingPrice: e.target.value})} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                <div style={{ border: `2px dashed #ddd`, height: '150px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fafafa', borderRadius: '8px' }}>
                  {imagePreview ? 
                    <img src={imagePreview} style={{height: '100%', borderRadius: '4px', objectFit: 'contain'}} alt=""/> : 
                    <label style={{cursor: 'pointer', color: '#999', textAlign: 'center'}}>
                        <input type="file" hidden onChange={handleImageChange}/>
                        📸<br/>Upload Image
                    </label>
                  }
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                   {!showNewCatInput ? (
                     <div style={{display: 'flex', gap: '10px'}}>
                        <select style={{...inputStyle, flex: 1}} value={formData.category} onChange={(e)=>setFormData({...formData, category: e.target.value})}>
                          <option value="">Category</option>
                          {categories.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
                        </select>
                        <button onClick={() => setShowNewCatInput(true)} style={{...goldBtnSmall, background: GOLD}}>+</button>
                     </div>
                   ) : (
                     <div style={{display: 'flex', gap: '10px'}}>
                        <input style={inputStyle} placeholder="New Category Name" value={newCatName} onChange={(e)=>setNewCatName(e.target.value)} />
                        <button onClick={handleAddCategory} style={{...goldBtnSmall, background: GOLD}}>ADD</button>
                     </div>
                   )}
                   <input style={inputStyle} placeholder="Stock Quantity" value={formData.stock} onChange={(e)=>setFormData({...formData, stock: e.target.value})} />
                </div>
              </div>
              <textarea style={{...inputStyle, height: '80px', marginBottom: '20px'}} placeholder="Product Description..." value={formData.description} onChange={(e)=>setFormData({...formData, description: e.target.value})} />
              <button onClick={handleSave} style={{...goldBtnFull, background: GOLD}}>SAVE PRODUCT</button>
            </div>
          </div>
        )}

        {/* ---------- MANAGE STORE TAB (with category filter & stock increase) ---------- */}
        {activeTab === 'Manage' && (
          <div>
            <h2 style={{ marginBottom: '20px' }}>Manage Store</h2>
            
            {/* Category Filter Buttons */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginBottom: '30px', alignItems: 'center' }}>
              <button 
                onClick={() => setManageFilterCategory('ALL')} 
                style={filterButtonStyle(manageFilterCategory === 'ALL')}
              >
                All Products
              </button>
              {categories.map(cat => (
                <button
                  key={cat.name}
                  onClick={() => setManageFilterCategory(cat.name)}
                  style={filterButtonStyle(manageFilterCategory === cat.name)}
                >
                  {cat.icon} {cat.name}
                </button>
              ))}
            </div>

            {/* Products Table */}
            <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #eee', overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead style={{background: '#f1f1f1'}}>
                  <tr>
                    <th style={tdStyle}>IMAGE</th>
                    <th style={tdStyle}>NAME</th>
                    <th style={tdStyle}>PRICE</th>
                    <th style={tdStyle}>STOCK</th>
                    <th style={tdStyle}>ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredManageProducts.length === 0 ? (
                    <tr>
                      <td colSpan="5" style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
                        No products found in this category.
                      </td>
                    </tr>
                  ) : (
                    filteredManageProducts.map(p => (
                      <tr key={p.id} style={{borderBottom: '1px solid #eee'}}>
                        <td style={tdStyle}><img src={p.image} width="40" height="40" style={{objectFit: 'cover', borderRadius: '4px'}} alt=""/></td>
                        <td style={tdStyle}>{p.name}</td>
                        <td style={{...tdStyle, color: GOLD, fontWeight: 'bold'}}>₹{p.sellingPrice}</td>
                        <td style={tdStyle}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <span>{p.stock || 0}</span>
                            <button 
                              onClick={() => increaseStock(p.id)}
                              style={{ 
                                background: GOLD, 
                                color: '#fff', 
                                border: 'none', 
                                borderRadius: '4px',
                                width: '28px',
                                height: '28px',
                                fontSize: '18px',
                                fontWeight: 'bold',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                              }}
                              title="Increase stock by 1"
                            >
                              +
                            </button>
                          </div>
                        </td>
                        <td style={tdStyle}>
                          <button 
                            onClick={()=>deleteProduct(p.id)} 
                            style={{color: 'red', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline'}}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ---------- CATEGORIES TAB ---------- */}
        {activeTab === 'CategoriesTab' && (
          <div>
            <h2 style={{ marginBottom: '20px' }}>Categories</h2>
            <div style={{ display: 'flex', gap: '15px', marginBottom: '30px', flexWrap: 'wrap' }}>
              {categories.map(cat => (
                <div key={cat.name} onClick={() => setSelectedCategory(cat.name)} style={catCardStyle(selectedCategory === cat.name)}>
                  <p style={{margin: 0, fontSize: '12px', fontWeight: 'bold'}}>{cat.name}</p>
                </div>
              ))}
              <button onClick={() => setSelectedCategory(null)} style={{background: '#fff', border: '1px solid #ddd', borderRadius: '10px', padding: '0 15px', cursor: 'pointer'}}>ALL</button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '20px' }}>
              {filteredCategoryProducts.map(p => (
                <div key={p.id} style={{ background: '#fff', padding: '15px', borderRadius: '12px', border: '1px solid #eee', textAlign: 'center' }}>
                  <img src={p.image} width="100%" height="120" style={{objectFit: 'cover', borderRadius: '8px'}} alt=""/>
                  <h4 style={{margin: '10px 0 5px 0', fontSize: '14px'}}>{p.name}</h4>
                  <p style={{color: GOLD, fontWeight: 'bold'}}>₹{p.sellingPrice}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ---------- ORDERS TAB ---------- */}
        {activeTab === 'Orders' && (
          <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #eee', overflow: 'hidden', padding: '20px' }}>
            <h2 style={{ marginBottom: '20px' }}>Recent Customer Orders</h2>
            {orders.length === 0 ? (
              <p style={{textAlign: 'center', padding: '40px', color: '#999'}}>No orders received yet! 📦</p>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead style={{background: '#f1f1f1'}}>
                  <tr>
                    <th style={tdStyle}>ORDER ID</th>
                    <th style={tdStyle}>CUSTOMER</th>
                    <th style={tdStyle}>ITEMS</th>
                    <th style={tdStyle}>TOTAL</th>
                    <th style={tdStyle}>ADDRESS & CONTACT</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order.orderId} style={{borderBottom: '1px solid #eee'}}>
                      <td style={{...tdStyle, fontWeight: 'bold'}}>{order.orderId}</td>
                      <td style={tdStyle}>
                        {order.customerName} <br/> 
                        <small style={{color: '#888'}}>{order.customerEmail}</small>
                      </td>
                      <td style={tdStyle}>
                        {order.items?.map((item, idx) => (
                          <div key={idx} style={{fontSize: '12px'}}>
                            • {item.name} (x{item.quantity})
                          </div>
                        ))}
                      </td>
                      <td style={{...tdStyle, color: '#108a00', fontWeight: 'bold'}}>₹{order.totalAmount}</td>
                      <td style={{...tdStyle, fontSize: '12px'}}>
                        {order.shippingDetails?.street}, {order.shippingDetails?.city} - {order.shippingDetails?.pincode} <br/>
                        <b style={{color: GOLD}}>Ph: {order.shippingDetails?.phone}</b>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;