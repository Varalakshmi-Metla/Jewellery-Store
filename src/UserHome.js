import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const UserHome = () => {
  // --- STATES ---
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [currentBanner, setCurrentBanner] = useState(0);
  const [cartItems, setCartItems] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [user, setUser] = useState(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [authData, setAuthData] = useState({ email: '', password: '', name: '' });
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [address, setAddress] = useState({ phone: '', street: '', city: '', pincode: '' });
  const [isOrderSuccess, setIsOrderSuccess] = useState(false);
  const [viewMode, setViewMode] = useState('home'); // 'home', 'cart', 'myOrders'

  // --- THEME ---
  const goldPrimary = "#C5A059";
  const darkBlack = "#1a1a1a";

  const banners = [
    { image: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce33e?auto=format&fit=crop&w=1500&q=80", title: "The Royal Collection" },
    { image: "https://images.unsplash.com/photo-1601121141461-9d6647bca1ed?auto=format&fit=crop&w=1500&q=80", title: "Elegant Bangles" }
  ];

  // --- EFFECTS ---
  useEffect(() => {
    const savedProducts = JSON.parse(localStorage.getItem('jewels')) || [];
    setProducts(savedProducts);
    const timer = setInterval(() => setCurrentBanner((p) => (p + 1) % banners.length), 5000);
    return () => clearInterval(timer);
  }, [banners.length]);

  // --- CART FUNCTIONS ---
  const addToCart = (product) => {
    setCartItems(prev => {
      const existingItem = prev.find(item => item.id === product.id);
      if (existingItem) {
        return prev.map(item =>
          item.id === product.id ? { ...item, quantity: (item.quantity || 1) + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    alert("Added to cart!");
  };

  const removeFromCart = (productId) => {
    setCartItems(prev => prev.filter(item => item.id !== productId));
  };

  const updateQuantity = (productId, delta) => {
    setCartItems(prev => prev.map(item => {
      if (item.id === productId) {
        const newQty = (item.quantity || 1) + delta;
        return newQty > 0 ? { ...item, quantity: newQty } : item;
      }
      return item;
    }));
  };

  // --- AUTH FUNCTIONS ---
  const handleAuth = () => {
    const users = JSON.parse(localStorage.getItem('jewel_users')) || [];
    if (authMode === 'signup') {
      users.push(authData);
      localStorage.setItem('jewel_users', JSON.stringify(users));
      setUser(authData);
    } else {
      const found = users.find(u => u.email === authData.email && u.password === authData.password);
      if (found) setUser(found);
      else return alert("Invalid Credentials!");
    }
    setIsAuthOpen(false);
  };

  // --- ORDER FUNCTIONS ---
  const handlePlaceOrder = () => {
    if (cartItems.length === 0) return;

    const newOrder = {
      orderId: "ORD" + Date.now(),
      customerName: user?.name || "Guest",
      customerEmail: user?.email || "No Email",
      items: cartItems,
      totalAmount: cartItems.reduce((acc, item) => acc + (Number(item.sellingPrice) * (item.quantity || 1)), 0),
      shippingDetails: address,
      orderDate: new Date().toLocaleString()
    };

    const existingOrders = JSON.parse(localStorage.getItem('jewel_orders')) || [];
    const updatedOrders = [newOrder, ...existingOrders];
    localStorage.setItem('jewel_orders', JSON.stringify(updatedOrders));

    setCartItems([]);
    setIsCheckoutOpen(false);
    setIsOrderSuccess(true);

    setTimeout(() => setIsOrderSuccess(false), 3000);
    alert("Order Placed Successfully!");
  };

  // --- FILTERS ---
  const filtered = products.filter(p => {
    const matchesSearch = p.name?.toLowerCase().includes(searchTerm.toLowerCase()) || false;
    const matchesCategory = selectedCategory === "ALL" || p.category?.toUpperCase() === selectedCategory.toUpperCase();
    return matchesSearch && matchesCategory;
  });

  // --- STYLES ---
  const authInputStyle = { width: '100%', padding: '12px', marginBottom: '15px', border: '1px solid #eee', borderRadius: '5px', boxSizing: 'border-box' };
  const sidebarLinkStyle = { fontSize: '16px', fontWeight: '500', color: '#333', cursor: 'pointer', padding: '12px 0', borderBottom: '1px solid #f9f9f9' };
  const qtyBtnStyle = { padding: '5px 12px', border: 'none', background: '#f0f0f0', cursor: 'pointer', fontSize: '16px', fontWeight: 'bold', borderRadius: '4px' };

  return (
    <div style={{ backgroundColor: '#fff', minHeight: '100vh', fontFamily: "'Playfair Display', serif" }}>
      
      {/* ---------- NAVBAR - Fixed and persistent ---------- */}
      <nav style={{ background: '#fff', padding: '15px 60px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `1px solid #eee`, position: 'sticky', top: 0, zIndex: 1000 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          {user && <div onClick={() => setIsSidebarOpen(true)} style={{ fontSize: '24px', cursor: 'pointer', color: darkBlack }}>☰</div>}
          <h1 onClick={() => setViewMode('home')} style={{ color: darkBlack, margin: 0, fontSize: '28px', letterSpacing: '2px', fontWeight: 'bold', cursor: 'pointer' }}>
            JEWEL<span style={{ color: goldPrimary }}>STORE</span>
          </h1>
        </div>
        
        {/* Search Bar - Only show on home mode */}
        {viewMode === 'home' && (
          <div style={{ flex: 0.4 }}>
            <input 
              type="text" 
              placeholder="Search our masterpiece..." 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)} 
              style={{ width: '100%', padding: '10px 20px', borderRadius: '4px', border: '1px solid #eee', outline: 'none' }} 
            />
          </div>
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          
          
          {/* Cart Icon */}
          <div onClick={() => setViewMode('cart')} style={{ position: 'relative', cursor: 'pointer', border: '1px solid #eee', padding: '8px', borderRadius: '8px', background: viewMode === 'cart' ? '#f0f0f0' : 'transparent' }}>
            🛒 {cartItems.length}
          </div>

          <div onClick={() => !user && setIsAuthOpen(true)} style={{ background: '#108a00', color: '#fff', padding: '8px 12px', borderRadius: '8px', cursor: 'pointer' }}>
            {user ? user.name?.charAt(0).toUpperCase() || 'U' : '👤 LOGIN'}
          </div>
        </div>
      </nav>

      {/* ---------- ORDER SUCCESS MESSAGE ---------- */}
      {isOrderSuccess && (
        <div style={{ background: '#d4edda', color: '#155724', padding: '15px', textAlign: 'center' }}>
          🎉 Order placed successfully!
        </div>
      )}

      {/* ---------- CONDITIONAL CONTENT SWITCHING ---------- */}
      {viewMode === 'cart' ? (
        /* ===== CART PAGE ===== */
        <div style={{ padding: '40px 10%', minHeight: '85vh', animation: 'fadeIn 0.3s' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
            <h2 style={{ fontSize: '32px', margin: 0 }}>My Shopping Bag ({cartItems.length})</h2>
            <button onClick={() => setViewMode('home')} style={{ background: goldPrimary, color: '#fff', border: 'none', padding: '10px 25px', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>
              ← Continue Shopping
            </button>
          </div>

          {cartItems.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '100px' }}>
              <h3>Nee Bag Khali ga undi bro!</h3>
              <button onClick={() => setViewMode('home')} style={{ color: goldPrimary, border: 'none', background: 'none', cursor: 'pointer', textDecoration: 'underline', fontSize: '18px' }}>Go shop something</button>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: '40px' }}>
              {/* LEFT: Items List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {cartItems.map((item) => (
                  <div key={item.id} style={{ 
                    display: 'flex', 
                    gap: '25px', 
                    padding: '20px', 
                    border: '1px solid #eee', 
                    borderRadius: '15px', 
                    alignItems: 'center', 
                    background: '#fff', 
                    position: 'relative'
                  }}>
                    <button 
                      onClick={() => removeFromCart(item.id)}
                      style={{
                        position: 'absolute',
                        top: '15px',
                        right: '15px',
                        border: 'none',
                        background: '#f5f5f5',
                        color: '#999',
                        width: '30px',
                        height: '30px',
                        borderRadius: '50%',
                        cursor: 'pointer',
                        fontSize: '18px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: '0.3s'
                      }}
                      onMouseEnter={(e) => { e.target.style.background = '#ff4d4d'; e.target.style.color = '#fff'; }}
                      onMouseLeave={(e) => { e.target.style.background = '#f5f5f5'; e.target.style.color = '#999'; }}
                    >
                      ×
                    </button>

                    <img src={item.image} style={{ width: '150px', height: '150px', objectFit: 'cover', borderRadius: '12px' }} alt={item.name} />
                    
                    <div style={{ flex: 1 }}>
                      <h3 style={{ margin: '0 0 8px 0', fontSize: '22px' }}>{item.name}</h3>
                      <p style={{ color: '#666', fontSize: '14px', margin: '0 0 20px 0' }}>Category: {item.category}</p>
                      
                      <div style={{ display: 'flex', alignItems: 'center', gap: '30px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #ddd', borderRadius: '6px' }}>
                          <button onClick={() => updateQuantity(item.id, -1)} style={qtyBtnStyle}>-</button>
                          <span style={{ padding: '0 15px', fontWeight: 'bold' }}>{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.id, 1)} style={qtyBtnStyle}>+</button>
                        </div>
                        <h4 style={{ color: goldPrimary, margin: 0, fontSize: '24px' }}>₹{Number(item.sellingPrice) * (item.quantity || 1)}</h4>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* RIGHT: Order Summary */}
              <div style={{ background: '#fafafa', padding: '30px', borderRadius: '15px', border: '1px solid #eee', height: 'fit-content', position: 'sticky', top: '120px' }}>
                <h3 style={{ marginTop: 0, borderBottom: '1px solid #eee', paddingBottom: '15px' }}>Order Summary</h3>
                <div style={{ display: 'flex', justifyContent: 'space-between', margin: '20px 0', fontSize: '18px' }}>
                  <span>Price ({cartItems.length} items)</span>
                  <span>₹{cartItems.reduce((acc, item) => acc + (Number(item.sellingPrice) * (item.quantity || 1)), 0)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', margin: '20px 0', fontSize: '18px', color: 'green' }}>
                  <span>Delivery Charges</span>
                  <span>FREE</span>
                </div>
                <hr style={{ border: 'none', borderTop: '1px solid #ddd', margin: '20px 0' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', margin: '20px 0', fontSize: '24px', fontWeight: 'bold' }}>
                  <span>Total Amount</span>
                  <span style={{ color: goldPrimary }}>₹{cartItems.reduce((acc, item) => acc + (Number(item.sellingPrice) * (item.quantity || 1)), 0)}</span>
                </div>
                <button 
                  onClick={() => { if(!user) setIsAuthOpen(true); else setIsCheckoutOpen(true); }}
                  style={{ width: '100%', padding: '18px', background: darkBlack, color: '#fff', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold', fontSize: '18px' }}
                >
                  PROCEED TO CHECKOUT
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* ===== HOME & MY ORDERS PAGE ===== */
        <>
          {viewMode === 'myOrders' ? (
            /* ----- MY ORDERS PAGE ----- */
            <div style={{ padding: '40px', maxWidth: '1000px', margin: 'auto' }}>
              <h2 style={{ marginBottom: '30px', borderBottom: `2px solid ${goldPrimary}`, paddingBottom: '10px' }}>Your Orders</h2>
              
              {!user ? (
                <div style={{ textAlign: 'center', padding: '50px' }}>
                  <p>Please login to view your orders</p>
                  <button onClick={() => setIsAuthOpen(true)} style={{ background: darkBlack, color: '#fff', padding: '10px 20px', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>Login</button>
                </div>
              ) : (
                <>
                  {JSON.parse(localStorage.getItem('jewel_orders'))?.filter(o => o.customerEmail === user.email)?.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '50px' }}>
                      <p style={{ color: '#999' }}>Inka orders emi levu bro! Konchem shopping cheyi..</p>
                      <button onClick={() => setViewMode('home')} style={{ background: darkBlack, color: '#fff', padding: '10px 20px', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>Shop Now</button>
                    </div>
                  ) : (
                    <div style={{ display: 'grid', gap: '20px' }}>
                      {JSON.parse(localStorage.getItem('jewel_orders'))
                        ?.filter(o => o.customerEmail === user?.email)
                        ?.map((order) => (
                          <div key={order.orderId} style={{ background: '#fff', borderRadius: '12px', padding: '20px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', border: '1px solid #eee' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
                              <div>
                                <span style={{ fontWeight: 'bold', color: goldPrimary }}>Order {order.orderId}</span>
                                <p style={{ fontSize: '12px', color: '#999', margin: '5px 0' }}>Placed on: {order.orderDate}</p>
                              </div>
                              <div style={{ textAlign: 'right' }}>
                                <span style={{ background: '#e3f2fd', color: '#1976d2', padding: '5px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold' }}>PENDING</span>
                                <p style={{ fontSize: '18px', fontWeight: 'bold', marginTop: '5px' }}>₹{order.totalAmount}</p>
                              </div>
                            </div>
                            
                            <div style={{ borderTop: '1px solid #f0f0f0', paddingTop: '15px' }}>
                              {order.items?.map((item, idx) => (
                                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '10px' }}>
                                  <img src={item.image} width="50" height="50" style={{ borderRadius: '5px', objectFit: 'cover' }} alt="" />
                                  <div>
                                    <p style={{ margin: 0, fontSize: '14px', fontWeight: '500' }}>{item.name}</p>
                                    <p style={{ margin: 0, fontSize: '12px', color: '#666' }}>Quantity: {item.quantity}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                    </div>
                  )}
                </>
              )}
            </div>
          ) : (
            /* ----- HOME PAGE (Categories + Banner + Products) ----- */
            <>
              {/* CATEGORIES */}
              <div style={{ display: 'flex', justifyContent: 'center', gap: '45px', padding: '30px 0', background: '#fafafa' }}>
                {[
                  { name: 'Bracelet', img: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&w=150&q=80' },
                  { name: 'Earrings', img: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=150&q=80' },
                  { name: 'Rings', img: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=150&q=80' },
                  { name: 'Necklace', img: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=150&q=80' },
                  { name: 'Bangles', img: 'https://cdn.pixabay.com/photo/2017/08/10/01/53/gold-2616904_1280.jpg' }
                ].map((cat, i) => (
                  <div key={i} onClick={() => setSelectedCategory(cat.name.toUpperCase())} style={{ textAlign: 'center', cursor: 'pointer' }}>
                    <div style={{ width: '85px', height: '85px', borderRadius: '50%', border: `1px solid ${selectedCategory === cat.name.toUpperCase() ? goldPrimary : '#eee'}`, padding: '4px', marginBottom: '10px', background: '#fff', overflow: 'hidden' }}>
                      <img src={cat.img} alt={cat.name} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                    </div>
                    <span style={{ fontSize: '12px', fontWeight: 'bold', color: darkBlack, textTransform: 'uppercase' }}>{cat.name}</span>
                  </div>
                ))}
              </div>

              {/* BANNER */}
              <div style={{ height: '400px', position: 'relative', background: '#f0f0f0' }}>
                <img src={banners[currentBanner].image} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" />
                <h1 style={{ position: 'absolute', top: '40%', left: '10%', color: '#fff', fontSize: '50px', textShadow: '2px 2px 10px rgba(0,0,0,0.5)' }}>{banners[currentBanner].title}</h1>
              </div>

              {/* PRODUCT GRID */}
              <div style={{ padding: '60px', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '30px' }}>
                {filtered.map((p) => (
                  <div key={p.id} style={{ textAlign: 'center', border: '1px solid #f0f0f0', padding: '15px', borderRadius: '12px', background: '#fff', transition: '0.3s' }}>
                    <img src={p.image} style={{ width: '100%', height: '250px', objectFit: 'cover', borderRadius: '8px' }} alt="" />
                    <h3 style={{ margin: '15px 0 5px 0', fontSize: '18px' }}>{p.name}</h3>
                    
                    {/* PRICE SECTION */}
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
                      <span style={{ color: '#999', textDecoration: 'line-through', fontSize: '14px' }}>
                        ₹{p.originalPrice || p.price || "---"}
                      </span>
                      <span style={{ color: goldPrimary, fontWeight: 'bold', fontSize: '18px' }}>
                        ₹{p.sellingPrice}
                      </span>
                    </div>

                    <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                      <button onClick={() => addToCart(p)} style={{ background: darkBlack, color: '#fff', padding: '10px 15px', border: 'none', cursor: 'pointer', borderRadius: '4px', fontSize: '12px' }}>ADD TO CART</button>
                      <button onClick={() => setSelectedProduct(p)} style={{ background: 'transparent', border: `1px solid ${darkBlack}`, padding: '10px 15px', cursor: 'pointer', borderRadius: '4px', fontSize: '12px' }}>VIEW</button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </>
      )}

      {/* ---------- SIDEBAR MODAL ---------- */}
      {isSidebarOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 6000 }}>
          <div onClick={() => setIsSidebarOpen(false)} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)' }}></div>
          <div style={{ position: 'absolute', top: 0, left: 0, width: '280px', height: '100%', background: '#fff', padding: '30px 20px', boxShadow: '5px 0 15px rgba(0,0,0,0.1)' }}>
            
            <h2 style={{ color: goldPrimary, marginBottom: '20px' }}>Menu</h2>
            
            <div onClick={() => { setViewMode('home'); setSelectedCategory("ALL"); setIsSidebarOpen(false); }} style={sidebarLinkStyle}>💎 All Products</div>
            
            {/* CATEGORIES SECTION */}
            <div style={{ marginTop: '30px' }}>
              <p style={{ fontSize: '12px', fontWeight: 'bold', color: '#999', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '15px' }}>Shop By Category</p>
              
              {['BRACELET', 'EARRINGS', 'RINGS', 'NECKLACE', 'BANGLES'].map((cat) => (
                <div 
                  key={cat}
                  onClick={() => {
                    setSelectedCategory(cat);
                    setSearchTerm("");
                    setViewMode('home');
                    setIsSidebarOpen(false);
                  }} 
                  style={{ 
                    ...sidebarLinkStyle, 
                    paddingLeft: '10px', 
                    fontSize: '15px',
                    borderLeft: selectedCategory === cat ? `3px solid ${goldPrimary}` : '3px solid transparent',
                    color: selectedCategory === cat ? goldPrimary : '#333',
                    background: selectedCategory === cat ? '#fafafa' : 'transparent',
                    transition: '0.2s'
                  }}
                >
                  • {cat.charAt(0) + cat.slice(1).toLowerCase()}
                </div>
              ))}
            </div>

            <div onClick={() => { setViewMode('cart'); setIsSidebarOpen(false); }} style={sidebarLinkStyle}>🛒 My Cart ({cartItems.length})</div>
            
            <div onClick={() => { setViewMode('myOrders'); setIsSidebarOpen(false); }} style={sidebarLinkStyle}>📦 My Orders</div>

            {/* Logout */}
            <div style={{ ...sidebarLinkStyle, color: 'red', marginTop: '40px' }} onClick={() => {setUser(null); setViewMode('home'); setIsSidebarOpen(false);}}>
              🚪 Logout
            </div>
          </div>
        </div>
      )}

      {/* ---------- AUTH MODAL ---------- */}
      {isAuthOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div onClick={() => setIsAuthOpen(false)} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.8)' }}></div>
          <div style={{ position: 'relative', background: '#fff', width: '350px', padding: '40px', borderRadius: '15px' }}>
            <h2 style={{ textAlign: 'center' }}>{authMode === 'login' ? 'Login' : 'Sign Up'}</h2>
            {authMode === 'signup' && <input style={authInputStyle} placeholder="Name" onChange={(e)=>setAuthData({...authData, name: e.target.value})} />}
            <input style={authInputStyle} placeholder="Email" onChange={(e)=>setAuthData({...authData, email: e.target.value})} />
            <input style={authInputStyle} type="password" placeholder="Password" onChange={(e)=>setAuthData({...authData, password: e.target.value})} />
            <button onClick={handleAuth} style={{ width: '100%', padding: '12px', background: goldPrimary, color: '#fff', border: 'none', cursor: 'pointer', borderRadius: '5px', fontWeight: 'bold' }}>{authMode === 'login' ? 'LOGIN' : 'SIGN UP'}</button>
            <p onClick={() => setAuthMode(authMode === 'login' ? 'signup' : 'login')} style={{ textAlign: 'center', cursor: 'pointer', marginTop: '15px', fontSize: '13px', color: '#666' }}>Switch to {authMode === 'login' ? 'Sign Up' : 'Login'}</p>
          </div>
        </div>
      )}

      {/* ---------- CHECKOUT MODAL ---------- */}
      {isCheckoutOpen && user && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 8000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div onClick={() => setIsCheckoutOpen(false)} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.8)' }}></div>
          
          <div style={{ position: 'relative', background: '#fff', width: '480px', padding: '30px', borderRadius: '20px', maxHeight: '95vh', overflowY: 'auto' }}>
            <h2 style={{ marginBottom: '20px', textAlign: 'center', color: darkBlack, fontFamily: "'Playfair Display', serif" }}>Checkout</h2>
            
            {/* SHIPPING ADDRESS */}
            <div style={{ marginBottom: '25px', padding: '15px', border: '1px solid #eee', borderRadius: '12px' }}>
              <p style={{ fontWeight: 'bold', fontSize: '14px', marginBottom: '15px', color: goldPrimary }}>📦 SHIPPING ADDRESS</p>
              
              <div style={{ marginBottom: '12px' }}>
                <input 
                  style={authInputStyle} 
                  placeholder="Phone Number" 
                  value={address.phone} 
                  onChange={(e) => setAddress({...address, phone: e.target.value})} 
                />
              </div>
              
              <div style={{ marginBottom: '12px' }}>
                <textarea 
                  style={{ ...authInputStyle, height: '80px', resize: 'none' }} 
                  placeholder="Full Address (House No, Street, Landmark...)" 
                  value={address.street} 
                  onChange={(e) => setAddress({...address, street: e.target.value})} 
                />
              </div>
              
              <div style={{ display: 'flex', gap: '10px' }}>
                <input 
                  style={authInputStyle} 
                  placeholder="City" 
                  value={address.city} 
                  onChange={(e) => setAddress({...address, city: e.target.value})} 
                />
                <input 
                  style={authInputStyle} 
                  placeholder="Pincode" 
                  value={address.pincode} 
                  onChange={(e) => setAddress({...address, pincode: e.target.value})} 
                />
              </div>
            </div>

            {/* PAYMENT SECTION */}
            <div style={{ textAlign: 'center', background: '#fafafa', padding: '20px', borderRadius: '15px', marginBottom: '20px', border: '1px dashed #ccc' }}>
              <p style={{ fontWeight: 'bold', marginBottom: '10px', fontSize: '14px' }}>💳 PAYMENT METHOD (UPI)</p>
              
              <div style={{ background: '#fff', padding: '10px', display: 'inline-block', borderRadius: '10px', border: '1px solid #eee', marginBottom: '10px' }}>
                <img 
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=upi://pay?pa=jewelstore@okaxis&am=${cartItems.reduce((acc, item) => acc + (Number(item.sellingPrice) * (item.quantity || 1)), 0)}&pn=JewelStoreAdmin&cu=INR`} 
                  alt="QR Code" 
                  style={{ width: '140px', height: '140px' }}
                />
              </div>
              
              <p style={{ fontSize: '12px', color: '#666', margin: '5px 0' }}>Payable Amount: <b>₹{cartItems.reduce((acc, item) => acc + (Number(item.sellingPrice) * (item.quantity || 1)), 0)}</b></p>
              
              <div style={{ marginTop: '15px', position: 'relative' }}>
                <input 
                  style={{ ...authInputStyle, textAlign: 'center', marginBottom: '0', background: '#f0f0f0', fontWeight: 'bold', fontSize: '14px' }} 
                  value="jewelstore@okaxis" 
                  readOnly 
                />
                <span 
                  onClick={() => { navigator.clipboard.writeText("jewelstore@okaxis"); alert("UPI ID Copied!"); }}
                  style={{ position: 'absolute', right: '15px', top: '12px', cursor: 'pointer', fontSize: '11px', color: goldPrimary, fontWeight: 'bold' }}
                >
                  COPY
                </span>
              </div>
            </div>

            {/* PLACE ORDER BUTTON */}
            <button 
              onClick={() => handlePlaceOrder()}
              style={{ 
                background: darkBlack, 
                color: '#fff', 
                padding: '18px', 
                width: '100%', 
                border: 'none', 
                borderRadius: '8px', 
                cursor: 'pointer', 
                fontWeight: 'bold',
                marginTop: '20px'
              }}
            >
              PLACE ORDER
            </button>

            <p onClick={() => setIsCheckoutOpen(false)} style={{ textAlign: 'center', color: '#999', cursor: 'pointer', marginTop: '15px', fontSize: '14px' }}>Cancel</p>
          </div>
        </div>
      )}

      {/* ---------- VIEW PRODUCT MODAL ---------- */}
      {selectedProduct && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 3000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div onClick={() => setSelectedProduct(null)} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.7)' }}></div>
          <div style={{ position: 'relative', background: '#fff', width: '850px', display: 'flex', borderRadius: '20px', overflow: 'hidden', boxShadow: '0 10px 40px rgba(0,0,0,0.2)' }}>
            <img src={selectedProduct.image} width="50%" style={{ objectFit: 'cover' }} alt="" />
            
            <div style={{ padding: '50px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <h2 style={{ fontSize: '32px', margin: '0 0 10px 0' }}>{selectedProduct.name}</h2>
              
              {/* PRICE SECTION */}
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '15px', margin: '10px 0 20px 0' }}>
                <span style={{ color: '#999', fontSize: '20px', textDecoration: 'line-through' }}>
                  ₹{selectedProduct.originalPrice || "0"}
                </span>
                <span style={{ color: goldPrimary, fontSize: '32px', fontWeight: 'bold' }}>
                  ₹{selectedProduct.sellingPrice || selectedProduct.price || "0"}
                </span>
              </div>

              {/* DESCRIPTION */}
              <p style={{ 
                color: '#444', 
                fontSize: '16px', 
                lineHeight: '1.6', 
                marginBottom: '30px',
                borderTop: '1px solid #eee',
                paddingTop: '15px' 
              }}>
                {selectedProduct.description || "No description available for this masterpiece."}
              </p>
                
              <button onClick={() => {addToCart(selectedProduct); setSelectedProduct(null);}} 
                style={{ background: darkBlack, color: '#fff', padding: '18px 40px', border: 'none', cursor: 'pointer', fontSize: '16px', fontWeight: 'bold', borderRadius: '8px' }}
              >
                ADD TO BAG
              </button>
            </div>
            
            <button onClick={() => setSelectedProduct(null)} style={{ position: 'absolute', top: '20px', right: '20px', background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer' }}>×</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserHome;