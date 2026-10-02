import React, { useState, useMemo, useEffect } from 'react';
import {
  ShoppingBag,
  Search,
  User,
  Sparkles,
  Droplets,
  ArrowRight,
  Plus,
  Minus,
  Trash2,
  CheckCircle,
  FileCode,
  LayoutDashboard,
  Store,
  Printer,
  ChevronRight,
  Check,
  MapPin,
  Phone,
  Mail,
  CreditCard,
  QrCode,
  LogOut,
  BarChart3,
  Package,
  Sliders,
  DollarSign
} from 'lucide-react';
import { Product, Category, Article, Order, CartItem, Coupon, AdminUser, PaymentChannel } from './types';
import {
  INITIAL_CATEGORIES,
  INITIAL_PRODUCTS,
  INITIAL_ARTICLES,
  INITIAL_ORDERS,
  INITIAL_COUPONS,
  INITIAL_ANALYTICS_DATA,
  PAYMENT_CHANNELS_LIST
} from './mockData';
import { CodeViewerModal } from './components/CodeViewerModal';
import { AdminLoginView } from './components/AdminLoginView';
import { AdminAnalyticsView } from './components/AdminAnalyticsView';
import { PaymentModal } from './components/PaymentModal';

export default function App() {
  const [appMode, setAppMode] = useState<'store' | 'admin'>('store');
  const [currentView, setCurrentView] = useState<'home' | 'products' | 'product_detail' | 'cart' | 'checkout' | 'order_success' | 'articles' | 'article_detail' | 'about' | 'contact' | 'account'>('home');
  const [selectedProductSlug, setSelectedProductSlug] = useState<string>('niacinamide-10-zinc-glow-serum');
  const [selectedArticleSlug, setSelectedArticleSlug] = useState<string>('how-to-choose-the-right-moisturizer-for-oily-skin');
  const [lastPlacedOrder, setLastPlacedOrder] = useState<Order | null>(null);

  // Admin authentication state (strictly required before viewing admin)
  const [currentAdmin, setCurrentAdmin] = useState<AdminUser | null>(() => {
    const saved = localStorage.getItem('aura_admin_session');
    return saved ? JSON.parse(saved) : null;
  });

  // Active modal for payment simulation
  const [paymentModalOrder, setPaymentModalOrder] = useState<Order | null>(null);

  // Global State
  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('aura_products');
    return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
  });

  const [categories] = useState<Category[]>(INITIAL_CATEGORIES);
  const [articles] = useState<Article[]>(INITIAL_ARTICLES);
  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem('aura_orders');
    return saved ? JSON.parse(saved) : INITIAL_ORDERS;
  });

  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('aura_cart');
    return saved ? JSON.parse(saved) : [
      { product: INITIAL_PRODUCTS[0], quantity: 1 },
      { product: INITIAL_PRODUCTS[2], quantity: 1 }
    ];
  });

  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [couponCodeInput, setCouponCodeInput] = useState<string>('');
  const [couponError, setCouponError] = useState<string>('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Filters
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'newest' | 'price_asc' | 'price_desc' | 'bestseller'>('newest');
  const [isCodeModalOpen, setIsCodeModalOpen] = useState<boolean>(false);

  // Store Settings
  const [siteSettings, setSiteSettings] = useState({
    siteName: 'AURA BOTANICA',
    tagline: 'Haute Botanical Skincare & Barrier Therapy',
    announcementBar: '✨ Gratis Ongkir Se-Indonesia untuk pesanan di atas Rp 250.000 | Promo: GLOWSKIN',
    freeShippingThreshold: 250000,
    shippingFee: 15000,
    whatsapp: '+62 812-3456-7890'
  });

  useEffect(() => {
    localStorage.setItem('aura_products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('aura_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('aura_orders', JSON.stringify(orders));
  }, [orders]);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleAdminLogout = () => {
    setCurrentAdmin(null);
    localStorage.removeItem('aura_admin_session');
    setAppMode('store');
    triggerToast('Berhasil keluar dari sesi Administrator.');
  };

  const handleAdminLogin = (user: AdminUser) => {
    setCurrentAdmin(user);
    localStorage.setItem('aura_admin_session', JSON.stringify(user));
    triggerToast(`Selamat datang kembali, ${user.name} (${user.role})!`);
  };

  const formatRupiah = (val: number) => `Rp ${val.toLocaleString('id-ID')}`;

  // Cart calculations
  const cartSubtotal = useMemo(() => {
    return cart.reduce((acc, item) => {
      const p = item.product.discount_price ?? item.product.price;
      return acc + p * item.quantity;
    }, 0);
  }, [cart]);

  const totalCartCount = useMemo(() => {
    return cart.reduce((acc, item) => acc + item.quantity, 0);
  }, [cart]);

  const discountAmount = useMemo(() => {
    if (!appliedCoupon) return 0;
    if (appliedCoupon.discount_type === 'percentage') {
      return cartSubtotal * (appliedCoupon.discount_value / 100);
    }
    return Math.min(appliedCoupon.discount_value, cartSubtotal);
  }, [appliedCoupon, cartSubtotal]);

  const shippingCost = useMemo(() => {
    if (cartSubtotal === 0) return 0;
    return cartSubtotal >= siteSettings.freeShippingThreshold ? 0 : siteSettings.shippingFee;
  }, [cartSubtotal, siteSettings]);

  const grandTotal = useMemo(() => {
    return Math.max(0, cartSubtotal - discountAmount + shippingCost);
  }, [cartSubtotal, discountAmount, shippingCost]);

  const addToCart = (product: Product, qty: number = 1) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: Math.min(item.quantity + qty, product.stock) }
            : item
        );
      }
      return [...prev, { product, quantity: Math.min(qty, product.stock) }];
    });
    triggerToast(`"${product.name}" ditambahkan ke keranjang!`);
  };

  const updateCartQty = (productId: number, newQty: number) => {
    if (newQty <= 0) {
      setCart((prev) => prev.filter((item) => item.product.id !== productId));
    } else {
      setCart((prev) =>
        prev.map((item) =>
          item.product.id === productId ? { ...item, quantity: Math.min(newQty, item.product.stock) } : item
        )
      );
    }
  };

  const applyCouponCode = (e: React.FormEvent) => {
    e.preventDefault();
    setCouponError('');
    const found = INITIAL_COUPONS.find((c) => c.code.toUpperCase() === couponCodeInput.trim().toUpperCase());
    if (!found) {
      setCouponError('Kode kupon tidak valid atau kedaluwarsa.');
      return;
    }
    if (cartSubtotal < found.min_spend) {
      setCouponError(`Minimal belanja untuk kupon ini adalah ${formatRupiah(found.min_spend)}`);
      return;
    }
    setAppliedCoupon(found);
    setCouponCodeInput('');
    triggerToast(`Kupon ${found.code} berhasil diterapkan!`);
  };

  const filteredProducts = useMemo(() => {
    let result = products.filter((p) => {
      const matchCat = selectedCategory === 'all' || categories.find((c) => c.slug === selectedCategory)?.name.toLowerCase() === p.category_name.toLowerCase();
      const matchSearch = !searchQuery || p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.short_description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchSearch;
    });

    if (sortBy === 'price_asc') result.sort((a, b) => (a.discount_price ?? a.price) - (b.discount_price ?? b.price));
    else if (sortBy === 'price_desc') result.sort((a, b) => (b.discount_price ?? b.price) - (a.discount_price ?? a.price));
    else if (sortBy === 'bestseller') result.sort((a, b) => (b.is_bestseller ? 1 : 0) - (a.is_bestseller ? 1 : 0));
    else result.sort((a, b) => b.id - a.id);

    return result;
  }, [products, selectedCategory, searchQuery, sortBy, categories]);

  const currentProduct = useMemo(() => products.find((p) => p.slug === selectedProductSlug) || products[0], [products, selectedProductSlug]);
  const currentArticle = useMemo(() => articles.find((a) => a.slug === selectedArticleSlug) || articles[0], [articles, selectedArticleSlug]);

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F5] text-[#2C2724]">
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#2C2724] text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 animate-in fade-in">
          <CheckCircle size={18} className="text-[#C4A49C]" />
          <span className="text-sm font-medium">{toastMessage}</span>
        </div>
      )}

      <CodeViewerModal isOpen={isCodeModalOpen} onClose={() => setIsCodeModalOpen(false)} />

      {paymentModalOrder && (
        <PaymentModal
          order={paymentModalOrder}
          isOpen={Boolean(paymentModalOrder)}
          onClose={() => setPaymentModalOrder(null)}
          onSimulatePaySuccess={(id) => {
            setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, payment_status: 'paid', order_status: 'Processing' } : o)));
            if (lastPlacedOrder && lastPlacedOrder.id === id) {
              setLastPlacedOrder((prev) => (prev ? { ...prev, payment_status: 'paid', order_status: 'Processing' } : null));
            }
            triggerToast('Pembayaran berhasil diverifikasi secara otomatis!');
          }}
          formatRupiah={formatRupiah}
        />
      )}

      {/* Top Banner */}
      <div className="bg-[#24201D] text-[#F4EFEB] text-xs py-2 px-4 flex justify-between items-center tracking-wider">
        <div className="container mx-auto flex justify-between items-center text-center">
          <span className="hidden md:inline font-mono text-[11px] text-[#A89E94]">
            PHP Native & MySQLi Architecture &bull; 100% Prepared Statements
          </span>
          <span className="mx-auto font-medium text-xs">{siteSettings.announcementBar}</span>
          <div className="hidden lg:flex items-center gap-4 text-xs font-mono text-[#D4C7B8]">
            <span>WhatsApp CS: {siteSettings.whatsapp}</span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <header className="sticky top-0 z-40 bg-[#FAF8F5]/95 backdrop-blur-md border-b border-[#E8DFD5]">
        <div className="container mx-auto px-4 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setAppMode('store');
                setCurrentView('home');
              }}
              className="text-left group"
            >
              <span className="font-serif-luxury text-2xl lg:text-3xl font-bold tracking-[0.16em] uppercase text-[#1F1C1A] block">
                {siteSettings.siteName}
              </span>
              <span className="text-[10px] tracking-[0.22em] text-[#736B63] uppercase block -mt-1 font-sans">
                Haute Botanical Skincare
              </span>
            </button>
          </div>

          {appMode === 'store' && (
            <nav className="hidden md:flex items-center gap-8 text-[13.5px] font-medium tracking-wide">
              <button onClick={() => setCurrentView('home')} className={`hover:text-[#9B786F] transition ${currentView === 'home' ? 'text-[#9B786F] font-semibold' : ''}`}>Home</button>
              <button onClick={() => { setSelectedCategory('all'); setCurrentView('products'); }} className={`hover:text-[#9B786F] transition ${currentView === 'products' ? 'text-[#9B786F] font-semibold' : ''}`}>Koleksi Produk</button>
              <button onClick={() => { setSelectedCategory('serum'); setCurrentView('products'); }} className="hover:text-[#9B786F] transition">Serum</button>
              <button onClick={() => { setSelectedCategory('moisturizer'); setCurrentView('products'); }} className="hover:text-[#9B786F] transition">Skin Barrier</button>
              <button onClick={() => setCurrentView('articles')} className={`hover:text-[#9B786F] transition ${currentView === 'articles' ? 'text-[#9B786F] font-semibold' : ''}`}>Jurnal Kulit</button>
              <button onClick={() => setCurrentView('about')} className={`hover:text-[#9B786F] transition ${currentView === 'about' ? 'text-[#9B786F] font-semibold' : ''}`}>Tentang Kami</button>
              <button onClick={() => setCurrentView('contact')} className={`hover:text-[#9B786F] transition ${currentView === 'contact' ? 'text-[#9B786F] font-semibold' : ''}`}>Kontak</button>
            </nav>
          )}

          <div className="flex items-center gap-2 sm:gap-3">
            {/* View Mode Switcher Pill */}
            <div className="flex items-center p-1 bg-[#EAE2D8] rounded-full text-xs font-semibold">
              <button
                onClick={() => {
                  setAppMode('store');
                  setCurrentView('home');
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full transition ${appMode === 'store' ? 'bg-[#2C2724] text-white shadow-sm' : 'text-[#5C544E]'}`}
              >
                <Store size={13} />
                <span>Store</span>
              </button>
              <button
                onClick={() => setAppMode('admin')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full transition ${appMode === 'admin' ? 'bg-[#2C2724] text-white shadow-sm' : 'text-[#5C544E]'}`}
              >
                <LayoutDashboard size={13} />
                <span>Admin {currentAdmin ? `(${currentAdmin.role})` : ''}</span>
              </button>
            </div>

            <button
              onClick={() => setIsCodeModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-[#9B786F]/15 hover:bg-[#9B786F]/25 text-[#7D5D55] border border-[#9B786F]/30 rounded-full transition"
            >
              <FileCode size={14} />
              <span className="hidden sm:inline">PHP & SQL</span>
            </button>

            {appMode === 'store' && (
              <>
                <button onClick={() => setCurrentView('account')} className="p-2 text-[#2C2724] hover:text-[#9B786F] transition rounded-full hover:bg-[#EAE2D8]/50">
                  <User size={20} />
                </button>
                <button onClick={() => setCurrentView('cart')} className="relative p-2 text-[#2C2724] hover:text-[#9B786F] transition rounded-full hover:bg-[#EAE2D8]/50">
                  <ShoppingBag size={20} />
                  {totalCartCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#9B786F] text-white text-[11px] font-bold rounded-full flex items-center justify-center shadow-md">
                      {totalCartCount}
                    </span>
                  )}
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* ======================================================== */}
      {/* MODE 1: ADMIN PANEL WITH STRICT LOGIN PROTECTION         */}
      {/* ======================================================== */}
      {appMode === 'admin' ? (
        !currentAdmin ? (
          <AdminLoginView
            onLoginSuccess={handleAdminLogin}
            onBackToStore={() => {
              setAppMode('store');
              setCurrentView('home');
            }}
          />
        ) : (
          <AdminDashboardView
            admin={currentAdmin}
            onLogout={handleAdminLogout}
            products={products}
            setProducts={setProducts}
            categories={categories}
            orders={orders}
            setOrders={setOrders}
            siteSettings={siteSettings}
            setSiteSettings={setSiteSettings}
            triggerToast={triggerToast}
            formatRupiah={formatRupiah}
            onInspectOrderPayment={(o) => setPaymentModalOrder(o)}
          />
        )
      ) : (
        /* ======================================================== */
        /* MODE 2: PUBLIC LUXURY SKINCARE STOREFRONT                */
        /* ======================================================== */
        <main className="flex-1">
          {currentView === 'home' && (
            <div>
              {/* Editorial Luxury Hero */}
              <section className="relative overflow-hidden bg-gradient-to-br from-[#F6EFEA] via-[#EDE4DB] to-[#E3D8CC] border-b border-[#E8DFD5] py-16 lg:py-24">
                <div className="container mx-auto px-4 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                  <div className="lg:col-span-7 space-y-6">
                    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-white/70 backdrop-blur-sm rounded-full border border-[#D8CABE] text-[#7D5D55] text-xs font-semibold tracking-widest uppercase">
                      <Sparkles size={14} /> Haute Botanical Skincare
                    </div>
                    <h1 className="font-serif-luxury text-4xl sm:text-5xl lg:text-6xl font-medium leading-[1.1] text-[#1F1C1A]">
                      Kembalikan Kemilau Sehat Alami Skin Barrier Anda
                    </h1>
                    <p className="text-base sm:text-lg text-[#5C544E] leading-relaxed max-w-xl font-light">
                      Formulasi botani teruji klinis yang diperkaya 5X Ceramide biomimetik,
                      Niacinamide konsentrat murni, dan Centella Jeju tanpa paraben, SLS, atau alkohol.
                    </p>

                    <div className="flex flex-wrap items-center gap-4 pt-2">
                      <button
                        onClick={() => { setSelectedCategory('all'); setCurrentView('products'); }}
                        className="px-8 py-3.5 bg-[#2C2724] hover:bg-[#9B786F] text-white rounded-lg text-sm font-medium tracking-wider uppercase transition shadow-md flex items-center gap-2"
                      >
                        Belanja Koleksi <ArrowRight size={16} />
                      </button>
                      <button
                        onClick={() => setCurrentView('articles')}
                        className="px-6 py-3.5 bg-transparent hover:bg-white/60 text-[#2C2724] border border-[#2C2724] rounded-lg text-sm font-medium tracking-wider uppercase transition"
                      >
                        Jurnal Edukasi
                      </button>
                    </div>

                    <div className="grid grid-cols-3 gap-6 pt-6 border-t border-[#D9CEBF] max-w-md">
                      <div>
                        <div className="font-serif-luxury text-2xl font-bold text-[#1F1C1A]">100%</div>
                        <div className="text-xs text-[#736B63] uppercase tracking-wider">Cruelty Free</div>
                      </div>
                      <div>
                        <div className="font-serif-luxury text-2xl font-bold text-[#1F1C1A]">pH 5.5</div>
                        <div className="text-xs text-[#736B63] uppercase tracking-wider">Barrier Safe</div>
                      </div>
                      <div>
                        <div className="font-serif-luxury text-2xl font-bold text-[#1F1C1A]">0%</div>
                        <div className="text-xs text-[#736B63] uppercase tracking-wider">Paraben & SLS</div>
                      </div>
                    </div>
                  </div>

                  <div className="lg:col-span-5 relative">
                    <div className="relative mx-auto max-w-md rounded-2xl overflow-hidden shadow-2xl border-8 border-white bg-white">
                      <img
                        src="https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=900&q=80"
                        alt="Aura Botanica Serum"
                        className="w-full h-[460px] object-cover hover:scale-105 transition duration-700"
                      />
                      <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-sm p-4 rounded-xl shadow-lg border border-[#E8DFD5] flex items-center justify-between">
                        <div>
                          <div className="text-xs uppercase tracking-wider text-[#9B786F] font-semibold">Hero Formulation</div>
                          <div className="text-sm font-bold text-[#1F1C1A]">Niacinamide 10% Glow Serum</div>
                          <div className="text-xs text-[#736B63]">{formatRupiah(169000)} <span className="line-through text-[11px] text-[#A3978B]">{formatRupiah(189000)}</span></div>
                        </div>
                        <button
                          onClick={() => addToCart(products[0])}
                          className="px-3.5 py-2 bg-[#2C2724] hover:bg-[#9B786F] text-white text-xs font-semibold rounded-lg transition"
                        >
                          + Beli
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Categories */}
              <section className="py-14 border-b border-[#E8DFD5]">
                <div className="container mx-auto px-4 lg:px-8">
                  <div className="text-center max-w-xl mx-auto mb-10">
                    <span className="text-xs font-semibold uppercase tracking-widest text-[#9B786F]">Ritual Perawatan</span>
                    <h2 className="font-serif-luxury text-3xl font-normal mt-1">Kategori Pilihan</h2>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                    {categories.slice(0, 10).map((cat) => (
                      <button
                        key={cat.id}
                        onClick={() => { setSelectedCategory(cat.slug); setCurrentView('products'); }}
                        className="p-5 bg-white border border-[#E8DFD5] hover:border-[#9B786F] rounded-xl text-center group transition duration-300 hover:-translate-y-1 shadow-sm"
                      >
                        <div className="w-12 h-12 rounded-full bg-[#FAF5F0] group-hover:bg-[#9B786F] text-[#9B786F] group-hover:text-white mx-auto mb-3 flex items-center justify-center transition">
                          <Droplets size={20} />
                        </div>
                        <div className="font-semibold text-sm text-[#2C2724]">{cat.name}</div>
                        <div className="text-[11px] text-[#736B63] mt-1 line-clamp-1">{cat.description}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </section>

              {/* Best Sellers */}
              <section className="py-16">
                <div className="container mx-auto px-4 lg:px-8">
                  <div className="flex justify-between items-end mb-10">
                    <div>
                      <span className="text-xs font-semibold uppercase tracking-widest text-[#9B786F]">Paling Diminati</span>
                      <h2 className="font-serif-luxury text-3xl lg:text-4xl font-normal mt-1">Best Sellers Skincare</h2>
                    </div>
                    <button
                      onClick={() => { setSelectedCategory('all'); setSortBy('bestseller'); setCurrentView('products'); }}
                      className="text-xs font-bold uppercase tracking-wider text-[#2C2724] hover:text-[#9B786F] underline underline-offset-4"
                    >
                      Lihat Semua Koleksi &rarr;
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {products.filter((p) => p.is_bestseller).slice(0, 4).map((p) => (
                      <StoreProductCard
                        key={p.id}
                        product={p}
                        onSelect={() => { setSelectedProductSlug(p.slug); setCurrentView('product_detail'); }}
                        onAddToCart={() => addToCart(p)}
                        formatRupiah={formatRupiah}
                      />
                    ))}
                  </div>
                </div>
              </section>

              {/* Supported Payment Gateways Banner */}
              <section className="py-12 bg-white border-y border-[#E8DFD5]">
                <div className="container mx-auto px-4 text-center">
                  <span className="text-xs font-semibold uppercase tracking-widest text-[#736B63]">
                    Metode Pembayaran Resmi Terverifikasi
                  </span>
                  <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10 mt-6 text-xs font-bold text-[#5C544E]">
                    <span className="px-4 py-2 bg-[#FAF8F5] border border-[#E8DFD5] rounded-xl flex items-center gap-2">
                      <QrCode size={16} className="text-emerald-700" /> QRIS Instan (BCA, GoPay, ShopeePay)
                    </span>
                    <span className="px-4 py-2 bg-[#FAF8F5] border border-[#E8DFD5] rounded-xl flex items-center gap-2">
                      <CreditCard size={16} className="text-blue-700" /> Virtual Account BCA, Mandiri, BRI, BNI
                    </span>
                    <span className="px-4 py-2 bg-[#FAF8F5] border border-[#E8DFD5] rounded-xl flex items-center gap-2">
                      <CreditCard size={16} className="text-amber-700" /> Kartu Kredit Visa & Mastercard
                    </span>
                    <span className="px-4 py-2 bg-[#FAF8F5] border border-[#E8DFD5] rounded-xl flex items-center gap-2">
                      <Package size={16} className="text-stone-700" /> Cash on Delivery (COD)
                    </span>
                  </div>
                </div>
              </section>
            </div>
          )}

          {/* PRODUCTS VIEW */}
          {currentView === 'products' && (
            <div className="py-10">
              <div className="container mx-auto px-4 lg:px-8">
                <div className="mb-8">
                  <h1 className="font-serif-luxury text-4xl font-normal text-[#1F1C1A]">Koleksi Produk Skincare</h1>
                  <p className="text-sm text-[#736B63] mt-1 font-light">Formula botani dermatologis teruji klinis untuk perbaikan skin barrier.</p>
                </div>

                <div className="bg-white p-4 rounded-xl border border-[#E8DFD5] shadow-sm mb-8 flex flex-col md:flex-row gap-4 items-center justify-between">
                  <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-none">
                    <button
                      onClick={() => setSelectedCategory('all')}
                      className={`px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition ${selectedCategory === 'all' ? 'bg-[#2C2724] text-white' : 'bg-[#F4EFEB] text-[#4A433E]'}`}
                    >
                      Semua
                    </button>
                    {categories.map((c) => (
                      <button
                        key={c.id}
                        onClick={() => setSelectedCategory(c.slug)}
                        className={`px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition ${selectedCategory === c.slug ? 'bg-[#2C2724] text-white' : 'bg-[#F4EFEB] text-[#4A433E]'}`}
                      >
                        {c.name}
                      </button>
                    ))}
                  </div>

                  <div className="flex items-center gap-3 w-full md:w-auto">
                    <div className="relative flex-1 md:w-56">
                      <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9E9285]" />
                      <input
                        type="text"
                        placeholder="Cari produk / bahan..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-3 py-1.5 bg-[#FAF8F5] border border-[#E8DFD5] rounded-lg text-xs focus:outline-none"
                      />
                    </div>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as any)}
                      className="px-3 py-1.5 bg-[#FAF8F5] border border-[#E8DFD5] rounded-lg text-xs font-medium"
                    >
                      <option value="newest">Terbaru</option>
                      <option value="bestseller">Best Seller</option>
                      <option value="price_asc">Harga Terendah</option>
                      <option value="price_desc">Harga Tertinggi</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {filteredProducts.map((prod) => (
                    <StoreProductCard
                      key={prod.id}
                      product={prod}
                      onSelect={() => { setSelectedProductSlug(prod.slug); setCurrentView('product_detail'); }}
                      onAddToCart={() => addToCart(prod)}
                      formatRupiah={formatRupiah}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* PRODUCT DETAIL VIEW */}
          {currentView === 'product_detail' && currentProduct && (
            <div className="py-10">
              <div className="container mx-auto px-4 lg:px-8 max-w-6xl">
                <div className="flex items-center gap-2 text-xs text-[#736B63] mb-6">
                  <button onClick={() => setCurrentView('home')} className="hover:underline">Home</button>
                  <span>/</span>
                  <button onClick={() => setCurrentView('products')} className="hover:underline">Koleksi</button>
                  <span>/</span>
                  <span className="text-[#2C2724] font-medium">{currentProduct.name}</span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mb-16">
                  <div className="lg:col-span-6">
                    <div className="rounded-2xl overflow-hidden border border-[#E8DFD5] bg-white shadow-sm">
                      <img src={currentProduct.primary_image} alt={currentProduct.name} className="w-full h-[460px] object-cover" />
                    </div>
                  </div>

                  <div className="lg:col-span-6 space-y-6">
                    <div>
                      <span className="text-xs uppercase tracking-widest text-[#9B786F] font-semibold">
                        {currentProduct.brand_name} &bull; {currentProduct.volume_weight}
                      </span>
                      <h1 className="font-serif-luxury text-3xl sm:text-4xl font-normal text-[#1F1C1A] mt-1 mb-2">
                        {currentProduct.name}
                      </h1>
                      <div className="flex items-center gap-3 text-xs text-[#736B63]">
                        <span className="text-amber-400">★★★★★</span>
                        <span>(4.9 dari 142 ulasan)</span>
                        <span>&bull;</span>
                        <span className="font-mono">SKU: {currentProduct.sku}</span>
                      </div>
                    </div>

                    <div className="p-4 bg-white border border-[#E8DFD5] rounded-xl flex items-baseline gap-3">
                      <span className="text-2xl font-bold text-[#1F1C1A]">
                        {formatRupiah(currentProduct.discount_price ?? currentProduct.price)}
                      </span>
                      {currentProduct.discount_price && (
                        <span className="text-sm line-through text-[#9E9285]">{formatRupiah(currentProduct.price)}</span>
                      )}
                    </div>

                    <p className="text-sm text-[#4A433E] leading-relaxed">{currentProduct.short_description}</p>

                    <div className="flex items-center gap-4 pt-2">
                      <button
                        onClick={() => addToCart(currentProduct, 1)}
                        className="flex-1 py-3.5 bg-[#2C2724] hover:bg-[#9B786F] text-white rounded-lg text-sm font-semibold tracking-wider uppercase transition shadow-md"
                      >
                        + Tambahkan ke Keranjang
                      </button>
                      <button
                        onClick={() => { addToCart(currentProduct, 1); setCurrentView('cart'); }}
                        className="px-6 py-3.5 bg-[#FAF8F5] border border-[#2C2724] text-[#2C2724] hover:bg-[#2C2724] hover:text-white rounded-lg text-sm font-semibold tracking-wider uppercase transition"
                      >
                        Beli Langsung
                      </button>
                    </div>

                    <div className="p-4 bg-[#F4EFEB] rounded-xl text-xs space-y-2 text-[#4A433E]">
                      <div className="flex items-center gap-2"><Check size={14} className="text-emerald-700" /><span>Gratis ongkir pesanan di atas Rp 250.000</span></div>
                      <div className="flex items-center gap-2"><Check size={14} className="text-emerald-700" /><span>Tersedia pembayaran QRIS, Virtual Account, & COD</span></div>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-8 rounded-2xl border border-[#E8DFD5] space-y-6">
                  <h3 className="font-serif-luxury text-2xl font-normal">Deskripsi & Cara Penggunaan</h3>
                  <p className="text-sm text-[#4A433E] leading-relaxed">{currentProduct.full_description}</p>
                  <div className="p-4 bg-[#FAF8F5] rounded-lg border border-[#E8DFD5] text-xs font-mono text-[#736B63]">
                    {currentProduct.ingredients}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* CART VIEW */}
          {currentView === 'cart' && (
            <div className="py-10">
              <div className="container mx-auto px-4 lg:px-8 max-w-5xl">
                <h1 className="font-serif-luxury text-3xl font-normal text-[#1F1C1A] mb-8">Keranjang Belanja ({totalCartCount} item)</h1>

                {cart.length === 0 ? (
                  <div className="bg-white p-12 rounded-2xl border border-[#E8DFD5] text-center shadow-sm">
                    <h2 className="font-serif-luxury text-2xl font-medium mb-2">Keranjang Kosong</h2>
                    <button onClick={() => setCurrentView('products')} className="mt-4 px-6 py-3 bg-[#2C2724] text-white text-xs font-semibold rounded-lg">Mulai Belanja</button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    <div className="lg:col-span-8 bg-white p-6 rounded-2xl border border-[#E8DFD5] shadow-sm divide-y divide-[#E8DFD5]">
                      {cart.map((item) => {
                        const price = item.product.discount_price ?? item.product.price;
                        return (
                          <div key={item.product.id} className="py-5 first:pt-0 last:pb-0 flex gap-4 items-center">
                            <img src={item.product.primary_image} alt="" className="w-20 h-20 rounded-xl object-cover border border-[#E8DFD5]" />
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-sm text-[#1F1C1A] truncate">{item.product.name}</h3>
                              <div className="text-xs text-[#736B63] mt-0.5">{formatRupiah(price)} &bull; {item.product.volume_weight}</div>
                              <div className="flex items-center gap-3 mt-3">
                                <div className="flex items-center border border-[#E8DFD5] rounded-md overflow-hidden bg-[#FAF8F5]">
                                  <button onClick={() => updateCartQty(item.product.id, item.quantity - 1)} className="p-1.5"><Minus size={13} /></button>
                                  <span className="px-3 text-xs font-semibold">{item.quantity}</span>
                                  <button onClick={() => updateCartQty(item.product.id, item.quantity + 1)} className="p-1.5"><Plus size={13} /></button>
                                </div>
                                <button onClick={() => updateCartQty(item.product.id, 0)} className="text-rose-600 text-xs flex items-center gap-1"><Trash2 size={13} /> Hapus</button>
                              </div>
                            </div>
                            <span className="font-bold text-sm text-[#1F1C1A]">{formatRupiah(price * item.quantity)}</span>
                          </div>
                        );
                      })}
                    </div>

                    <div className="lg:col-span-4 bg-white p-6 rounded-2xl border border-[#E8DFD5] shadow-sm space-y-5">
                      <h3 className="font-serif-luxury text-xl font-normal border-b border-[#E8DFD5] pb-3">Ringkasan Belanja</h3>
                      <form onSubmit={applyCouponCode} className="space-y-2">
                        <label className="text-xs font-semibold uppercase tracking-wider text-[#736B63]">Kupon Diskon</label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            placeholder="GLOWSKIN"
                            value={couponCodeInput}
                            onChange={(e) => setCouponCodeInput(e.target.value)}
                            className="flex-1 px-3 py-2 text-xs border border-[#E8DFD5] rounded-lg uppercase font-mono"
                          />
                          <button type="submit" className="px-3 py-2 bg-[#2C2724] text-white text-xs font-semibold rounded-lg">Gunakan</button>
                        </div>
                        {couponError && <p className="text-xs text-rose-600">{couponError}</p>}
                        {appliedCoupon && (
                          <div className="p-2 bg-emerald-50 text-emerald-800 rounded-lg text-xs flex justify-between items-center">
                            <span>Kupon aktif: <strong>{appliedCoupon.code}</strong></span>
                            <button type="button" onClick={() => setAppliedCoupon(null)} className="text-rose-600 text-[11px] underline">Batal</button>
                          </div>
                        )}
                      </form>

                      <div className="space-y-2 text-xs text-[#5C544E] border-t border-[#E8DFD5] pt-4">
                        <div className="flex justify-between"><span>Subtotal</span><span className="font-semibold text-[#1F1C1A]">{formatRupiah(cartSubtotal)}</span></div>
                        {discountAmount > 0 && <div className="flex justify-between text-emerald-700"><span>Diskon Kupon</span><span>- {formatRupiah(discountAmount)}</span></div>}
                        <div className="flex justify-between"><span>Ongkos Kirim</span><span className="font-semibold text-[#1F1C1A]">{shippingCost === 0 ? 'Gratis' : formatRupiah(shippingCost)}</span></div>
                        <div className="flex justify-between font-bold text-sm text-[#1F1C1A] border-t border-[#E8DFD5] pt-2">
                          <span>Total</span><span>{formatRupiah(grandTotal)}</span>
                        </div>
                      </div>

                      <button
                        onClick={() => setCurrentView('checkout')}
                        className="w-full py-3.5 bg-[#2C2724] hover:bg-[#9B786F] text-white text-xs font-semibold rounded-xl uppercase tracking-wider transition shadow-md flex items-center justify-center gap-2"
                      >
                        Lanjut ke Pembayaran <ArrowRight size={15} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* CHECKOUT VIEW WITH ENHANCED PAYMENT CHANNELS */}
          {currentView === 'checkout' && (
            <StoreCheckoutView
              cart={cart}
              cartSubtotal={cartSubtotal}
              discountAmount={discountAmount}
              shippingCost={shippingCost}
              grandTotal={grandTotal}
              formatRupiah={formatRupiah}
              onOrderSuccess={(order) => {
                setOrders((prev) => [order, ...prev]);
                setCart([]);
                setAppliedCoupon(null);
                setLastPlacedOrder(order);
                setCurrentView('order_success');
                triggerToast('Pesanan berhasil dibuat!');
              }}
            />
          )}

          {/* ORDER SUCCESS VIEW */}
          {currentView === 'order_success' && lastPlacedOrder && (
            <div className="py-12">
              <div className="container mx-auto px-4 max-w-2xl bg-white p-8 rounded-2xl border border-[#E8DFD5] shadow-lg text-center space-y-6">
                <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 mx-auto flex items-center justify-center text-3xl">✓</div>
                <div>
                  <h1 className="font-serif-luxury text-3xl font-medium text-[#1F1C1A]">Pesanan Berhasil Diproses!</h1>
                  <p className="text-xs text-[#736B63] mt-1 font-mono">Order ID: <strong className="text-base text-[#1F1C1A]">{lastPlacedOrder.order_number}</strong></p>
                </div>

                <div className="p-5 bg-[#FAF8F5] rounded-xl border border-[#E8DFD5] text-left text-xs space-y-3">
                  <div className="font-bold text-[#1F1C1A] uppercase tracking-wider text-[11px]">
                    Kanal Pembayaran: {lastPlacedOrder.payment_method_name}
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Status Pembayaran Saat Ini:</span>
                    <span className={`px-2.5 py-1 rounded-full font-bold text-[11px] ${lastPlacedOrder.payment_status === 'paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                      {lastPlacedOrder.payment_status.toUpperCase()}
                    </span>
                  </div>

                  <button
                    onClick={() => setPaymentModalOrder(lastPlacedOrder)}
                    className="w-full py-2.5 bg-[#9B786F] hover:bg-[#83635B] text-white font-semibold rounded-lg text-xs transition"
                  >
                    Buka Panduan & Kode Pembayaran Gateway
                  </button>
                </div>

                <div className="flex gap-4 justify-center pt-2">
                  <button onClick={() => setCurrentView('home')} className="px-6 py-2.5 bg-[#FAF8F5] border border-[#2C2724] text-[#2C2724] rounded-lg text-xs font-semibold">
                    Kembali ke Beranda
                  </button>
                  <button onClick={() => window.print()} className="px-6 py-2.5 bg-[#2C2724] text-white rounded-lg text-xs font-semibold flex items-center gap-1.5">
                    <Printer size={14} /> Cetak Invoice
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ARTICLES JOURNAL VIEW */}
          {currentView === 'articles' && (
            <div className="py-12">
              <div className="container mx-auto px-4 max-w-5xl">
                <div className="text-center max-w-xl mx-auto mb-10">
                  <span className="text-xs font-semibold uppercase tracking-widest text-[#9B786F]">Aura Journal</span>
                  <h1 className="font-serif-luxury text-4xl font-normal mt-1 mb-2">Jurnal & Edukasi Kulit</h1>
                  <p className="text-xs text-[#736B63]">Sains formulasi botani dan cara merawat skin barrier dari dokter kulit.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {articles.map((art) => (
                    <div
                      key={art.id}
                      onClick={() => { setSelectedArticleSlug(art.slug); setCurrentView('article_detail'); }}
                      className="bg-white rounded-2xl overflow-hidden border border-[#E8DFD5] shadow-sm hover:shadow-xl transition cursor-pointer flex flex-col group"
                    >
                      <img src={art.featured_image} alt="" className="w-full h-52 object-cover group-hover:scale-105 transition duration-500" />
                      <div className="p-6 flex flex-col flex-1">
                        <span className="text-[11px] uppercase tracking-wider font-semibold text-[#9B786F] mb-2">{art.category_name}</span>
                        <h2 className="font-serif-luxury text-xl font-bold leading-snug mb-3 group-hover:text-[#9B786F] transition">{art.title}</h2>
                        <p className="text-xs text-[#736B63] line-clamp-3 mb-4 flex-1">{art.excerpt}</p>
                        <span className="text-xs font-semibold text-[#9B786F]">Baca Selengkapnya &rarr;</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ARTICLE DETAIL VIEW */}
          {currentView === 'article_detail' && currentArticle && (
            <div className="py-12">
              <div className="container mx-auto px-4 max-w-3xl space-y-6">
                <button onClick={() => setCurrentView('articles')} className="text-xs text-[#736B63] hover:text-[#1F1C1A] font-semibold">&larr; Kembali ke Jurnal</button>
                <h1 className="font-serif-luxury text-4xl font-normal text-[#1F1C1A] leading-tight">{currentArticle.title}</h1>
                <div className="rounded-2xl overflow-hidden border border-[#E8DFD5] shadow-md">
                  <img src={currentArticle.featured_image} alt="" className="w-full h-80 object-cover" />
                </div>
                <div className="bg-white p-8 rounded-2xl border border-[#E8DFD5] text-sm text-[#3A342F] leading-relaxed space-y-4">
                  <p className="font-serif-luxury italic text-base border-l-4 border-[#9B786F] pl-4">{currentArticle.excerpt}</p>
                  <p>{currentArticle.content}</p>
                </div>
              </div>
            </div>
          )}

          {/* ABOUT US VIEW */}
          {currentView === 'about' && (
            <div className="py-14">
              <div className="container mx-auto px-4 max-w-3xl bg-white p-8 sm:p-12 rounded-2xl border border-[#E8DFD5] shadow-sm space-y-6">
                <span className="text-xs uppercase tracking-widest text-[#9B786F] font-semibold">Tentang Brand</span>
                <h1 className="font-serif-luxury text-4xl font-normal text-[#1F1C1A]">Kemurnian Botani & Presisi Sains</h1>
                <p className="text-sm text-[#4A433E] leading-relaxed font-light">
                  Aura Botanica menggabungkan kemurnian botani organik dan 5X Ceramide biomimetik untuk melindungi mantel pelindung kulit alami manusia.
                </p>
              </div>
            </div>
          )}

          {/* CONTACT VIEW */}
          {currentView === 'contact' && (
            <div className="py-14">
              <div className="container mx-auto px-4 max-w-3xl bg-white p-8 rounded-2xl border border-[#E8DFD5] shadow-sm space-y-6">
                <h1 className="font-serif-luxury text-3xl font-normal">Hubungi Customer Care</h1>
                <div className="space-y-3 text-xs text-[#4A433E]">
                  <div>📍 <strong>Alamat:</strong> Jl. Senopati No. 88, Kebayoran Baru, Jakarta Selatan</div>
                  <div>💬 <strong>WhatsApp:</strong> {siteSettings.whatsapp}</div>
                  <div>✉️ <strong>Email:</strong> care@aurabotanica.com</div>
                </div>
              </div>
            </div>
          )}

          {/* CUSTOMER ACCOUNT VIEW */}
          {currentView === 'account' && (
            <div className="py-12">
              <div className="container mx-auto px-4 max-w-4xl space-y-8">
                <div className="border-b border-[#E8DFD5] pb-4">
                  <h1 className="font-serif-luxury text-3xl font-normal text-[#1F1C1A]">Akun Pelanggan</h1>
                  <p className="text-xs text-[#736B63]">Anindya Putri &bull; anindya@gmail.com</p>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-[#E8DFD5] shadow-sm space-y-4">
                  <h3 className="font-serif-luxury text-xl font-normal">Riwayat Pesanan Anda</h3>
                  <div className="divide-y divide-[#E8DFD5]">
                    {orders.map((ord) => (
                      <div key={ord.id} className="py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                        <div>
                          <div className="font-mono font-bold text-xs text-[#1F1C1A]">{ord.order_number}</div>
                          <div className="text-[11px] text-[#736B63]">{ord.created_at} &bull; {ord.payment_method_name}</div>
                          <div className="text-xs font-semibold mt-1">{formatRupiah(ord.grand_total)}</div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setPaymentModalOrder(ord)}
                            className="px-2.5 py-1 text-xs border border-[#9B786F] text-[#9B786F] rounded-lg hover:bg-[#FAF5F0]"
                          >
                            Detail Pembayaran
                          </button>
                          <span className={`px-2.5 py-1 text-[11px] font-semibold rounded-full ${ord.order_status === 'Completed' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                            {ord.order_status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      )}

      {/* Footer */}
      <footer className="bg-[#231F1C] text-[#D4C7B8] pt-14 pb-8 border-t border-[#38312B]">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-12 border-b border-[#3E3833]">
            <div className="space-y-3">
              <span className="font-serif-luxury text-2xl font-bold tracking-widest uppercase text-white block">
                {siteSettings.siteName}
              </span>
              <p className="text-xs text-[#9E9285] leading-relaxed">
                {siteSettings.tagline}. PHP Native & MySQLi Architecture.
              </p>
            </div>

            <div>
              <h4 className="text-white font-semibold text-xs uppercase tracking-wider mb-3">Kategori</h4>
              <ul className="text-xs space-y-2 text-[#9E9285]">
                <li><button onClick={() => { setSelectedCategory('serum'); setCurrentView('products'); }}>Serum Wajah</button></li>
                <li><button onClick={() => { setSelectedCategory('toner'); setCurrentView('products'); }}>Hydrating Toner</button></li>
                <li><button onClick={() => { setSelectedCategory('moisturizer'); setCurrentView('products'); }}>Barrier Cream</button></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-semibold text-xs uppercase tracking-wider mb-3">Akses Sistem</h4>
              <ul className="text-xs space-y-2 text-[#9E9285]">
                <li>
                  <button onClick={() => setAppMode('admin')} className="text-[#C4A49C] hover:underline font-semibold">
                    Portal Login Admin &rarr;
                  </button>
                </li>
                <li><button onClick={() => setIsCodeModalOpen(true)}>Source Code & SQL Dump</button></li>
              </ul>
            </div>

            <div className="space-y-3">
              <h4 className="text-white font-semibold text-xs uppercase tracking-wider">Download Database</h4>
              <button
                onClick={() => setIsCodeModalOpen(true)}
                className="px-3.5 py-2 bg-[#9B786F] text-white text-xs font-semibold rounded-lg hover:bg-[#83635B] transition flex items-center gap-1.5"
              >
                <FileCode size={13} /> Unduh database.sql
              </button>
            </div>
          </div>

          <div className="pt-6 flex flex-col sm:flex-row justify-between items-center text-xs text-[#736B63] gap-2">
            <div>&copy; {new Date().getFullYear()} {siteSettings.siteName}. All Rights Reserved.</div>
            <div>Built with Clean PHP Native & MySQLi Architecture.</div>
          </div>
        </div>
      </footer>
    </div>
  );
}

// -------------------------------------------------------------
// Component: Store Product Card
// -------------------------------------------------------------
function StoreProductCard({
  product,
  onSelect,
  onAddToCart,
  formatRupiah
}: {
  product: Product;
  onSelect: () => void;
  onAddToCart: () => void;
  formatRupiah: (val: number) => string;
}) {
  return (
    <div className="bg-white rounded-2xl border border-[#E8DFD5] overflow-hidden flex flex-col group transition duration-300 hover:-translate-y-1 hover:shadow-xl">
      <div className="relative pt-[100%] overflow-hidden bg-[#FAF5F0] cursor-pointer" onClick={onSelect}>
        <img src={product.primary_image} alt="" className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition duration-500" />
        {product.is_bestseller && (
          <span className="absolute top-3 left-3 bg-white/95 text-[#1F1C1A] text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded shadow-sm">
            Best Seller
          </span>
        )}
      </div>

      <div className="p-5 flex flex-col flex-1">
        <span className="text-[11px] uppercase tracking-wider text-[#9B786F] font-semibold mb-1">
          {product.category_name} &bull; {product.volume_weight}
        </span>
        <h3 onClick={onSelect} className="font-serif-luxury font-bold text-base text-[#1F1C1A] group-hover:text-[#9B786F] transition cursor-pointer line-clamp-1 mb-1">
          {product.name}
        </h3>
        <p className="text-xs text-[#736B63] line-clamp-2 leading-relaxed mb-4 flex-1">{product.short_description}</p>
        <div className="flex items-baseline gap-2 mb-4">
          <span className="font-bold text-base text-[#1F1C1A]">{formatRupiah(product.discount_price ?? product.price)}</span>
          {product.discount_price && <span className="text-xs text-[#9E9285] line-through">{formatRupiah(product.price)}</span>}
        </div>
        <button
          onClick={onAddToCart}
          className="w-full py-2.5 bg-[#FAF8F5] border border-[#2C2724] text-[#2C2724] hover:bg-[#2C2724] hover:text-white rounded-lg text-xs font-semibold tracking-wider uppercase transition"
        >
          + Tambah ke Keranjang
        </button>
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// Component: Enhanced Store Checkout View with Indonesian Payment Gateway
// -------------------------------------------------------------
function StoreCheckoutView({
  cart,
  cartSubtotal,
  discountAmount,
  shippingCost,
  grandTotal,
  formatRupiah,
  onOrderSuccess
}: {
  cart: CartItem[];
  cartSubtotal: number;
  discountAmount: number;
  shippingCost: number;
  grandTotal: number;
  formatRupiah: (val: number) => string;
  onOrderSuccess: (order: Order) => void;
}) {
  const [name, setName] = useState('Anindya Putri');
  const [email, setEmail] = useState('anindya@gmail.com');
  const [phone, setPhone] = useState('081234567890');
  const [address, setAddress] = useState('Jl. Senopati No. 42');
  const [province, setProvince] = useState('DKI Jakarta');
  const [city, setCity] = useState('Jakarta Selatan');
  const [district, setDistrict] = useState('Kebayoran Baru');
  const [postalCode, setPostalCode] = useState('12190');
  const [selectedChannel, setSelectedChannel] = useState<PaymentChannel>('bca_va');

  const selectedChannelInfo = PAYMENT_CHANNELS_LIST.find((c) => c.channel === selectedChannel) || PAYMENT_CHANNELS_LIST[0];
  const finalGrandTotal = grandTotal + (selectedChannelInfo.fee || 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const orderNumber = `ORD-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(1000 + Math.random() * 9000)}`;
    const newOrder: Order = {
      id: Date.now(),
      order_number: orderNumber,
      customer_name: name,
      customer_email: email,
      customer_phone: phone,
      shipping_address: address,
      province,
      city,
      district,
      postal_code: postalCode,
      subtotal: cartSubtotal,
      discount_amount: discountAmount,
      shipping_cost: shippingCost,
      payment_fee: selectedChannelInfo.fee,
      grand_total: finalGrandTotal,
      payment_channel: selectedChannel,
      payment_method_name: selectedChannelInfo.title,
      payment_status: 'unpaid',
      order_status: 'Pending',
      items: cart.map((it) => ({
        product_name: it.product.name,
        price: it.product.discount_price ?? it.product.price,
        quantity: it.quantity,
        total: (it.product.discount_price ?? it.product.price) * it.quantity,
        sku: it.product.sku
      })),
      created_at: new Date().toLocaleString('id-ID')
    };
    onOrderSuccess(newOrder);
  };

  return (
    <div className="py-10">
      <div className="container mx-auto px-4 lg:px-8 max-w-5xl">
        <h1 className="font-serif-luxury text-3xl font-normal text-[#1F1C1A] mb-8">Pengiriman & Pilihan Pembayaran</h1>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-8 bg-white p-6 sm:p-8 rounded-2xl border border-[#E8DFD5] shadow-sm space-y-6 text-xs">
            <h2 className="font-serif-luxury text-xl font-normal text-[#1F1C1A] border-b border-[#E8DFD5] pb-3">1. Alamat Pengiriman</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="font-semibold block mb-1">Nama Lengkap *</label>
                <input type="text" required value={name} onChange={(e) => setName(e.target.value)} className="w-full px-3 py-2 border border-[#E8DFD5] rounded-lg" />
              </div>
              <div>
                <label className="font-semibold block mb-1">No. WhatsApp / HP *</label>
                <input type="tel" required value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full px-3 py-2 border border-[#E8DFD5] rounded-lg" />
              </div>
            </div>

            <div>
              <label className="font-semibold block mb-1">Alamat Email *</label>
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-3 py-2 border border-[#E8DFD5] rounded-lg" />
            </div>

            <div>
              <label className="font-semibold block mb-1">Alamat Lengkap Rumah / Kantor *</label>
              <textarea rows={2} required value={address} onChange={(e) => setAddress(e.target.value)} className="w-full px-3 py-2 border border-[#E8DFD5] rounded-lg" />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div><label className="font-semibold block mb-1">Provinsi</label><input type="text" required value={province} onChange={(e) => setProvince(e.target.value)} className="w-full px-3 py-2 border border-[#E8DFD5] rounded-lg" /></div>
              <div><label className="font-semibold block mb-1">Kota</label><input type="text" required value={city} onChange={(e) => setCity(e.target.value)} className="w-full px-3 py-2 border border-[#E8DFD5] rounded-lg" /></div>
              <div><label className="font-semibold block mb-1">Kecamatan</label><input type="text" required value={district} onChange={(e) => setDistrict(e.target.value)} className="w-full px-3 py-2 border border-[#E8DFD5] rounded-lg" /></div>
              <div><label className="font-semibold block mb-1">Kode Pos</label><input type="text" value={postalCode} onChange={(e) => setPostalCode(e.target.value)} className="w-full px-3 py-2 border border-[#E8DFD5] rounded-lg" /></div>
            </div>

            {/* Comprehensive Payment Gateway Selector */}
            <h2 className="font-serif-luxury text-xl font-normal text-[#1F1C1A] border-t border-[#E8DFD5] pt-6">
              2. Pilih Metode Pembayaran Resmi
            </h2>

            <div className="space-y-4">
              {['Virtual Account', 'QRIS & E-Wallet', 'Credit Card', 'Lainnya'].map((group) => {
                const channelsInGroup = PAYMENT_CHANNELS_LIST.filter((c) => c.category === group);
                return (
                  <div key={group} className="space-y-2">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-[#9B786F]">{group}</div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {channelsInGroup.map((channel) => (
                        <label
                          key={channel.channel}
                          className={`flex items-start gap-3 p-3.5 border rounded-xl cursor-pointer transition ${
                            selectedChannel === channel.channel
                              ? 'border-[#9B786F] bg-[#FAF5F0] shadow-sm'
                              : 'border-[#E8DFD5] hover:bg-[#FAF8F5]'
                          }`}
                        >
                          <input
                            type="radio"
                            name="paymentChannel"
                            value={channel.channel}
                            checked={selectedChannel === channel.channel}
                            onChange={() => setSelectedChannel(channel.channel)}
                            className="mt-0.5 text-[#9B786F]"
                          />
                          <div className="min-w-0">
                            <div className="font-semibold text-[#1F1C1A]">{channel.title}</div>
                            <div className="text-[11px] text-[#736B63]">
                              {channel.fee > 0 ? `Biaya penanganan: ${formatRupiah(channel.fee)}` : 'Bebas biaya penanganan'}
                            </div>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="lg:col-span-4 bg-white p-6 rounded-2xl border border-[#E8DFD5] shadow-sm space-y-4">
            <h3 className="font-serif-luxury text-lg font-normal border-b border-[#E8DFD5] pb-3">Ringkasan Tagihan</h3>
            <div className="space-y-2 text-xs text-[#5C544E]">
              <div className="flex justify-between"><span>Subtotal Produk</span><span>{formatRupiah(cartSubtotal)}</span></div>
              {discountAmount > 0 && <div className="flex justify-between text-emerald-700"><span>Diskon</span><span>- {formatRupiah(discountAmount)}</span></div>}
              <div className="flex justify-between"><span>Ongkir</span><span>{shippingCost === 0 ? 'Gratis' : formatRupiah(shippingCost)}</span></div>
              {selectedChannelInfo.fee > 0 && <div className="flex justify-between"><span>Biaya Gateway</span><span>{formatRupiah(selectedChannelInfo.fee)}</span></div>}
              <div className="flex justify-between font-bold text-sm text-[#1F1C1A] border-t border-[#E8DFD5] pt-2">
                <span>Total Bayar</span><span>{formatRupiah(finalGrandTotal)}</span>
              </div>
            </div>

            <button type="submit" className="w-full py-3.5 bg-[#2C2724] hover:bg-[#9B786F] text-white text-xs font-semibold rounded-xl uppercase tracking-wider transition shadow-md">
              Konfirmasi & Buat Pesanan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// Component: Admin Dashboard View with Integrated Analytics
// -------------------------------------------------------------
function AdminDashboardView({
  admin,
  onLogout,
  products,
  setProducts,
  categories,
  orders,
  setOrders,
  siteSettings,
  setSiteSettings,
  triggerToast,
  formatRupiah,
  onInspectOrderPayment
}: {
  admin: AdminUser;
  onLogout: () => void;
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  categories: Category[];
  orders: Order[];
  setOrders: React.Dispatch<React.SetStateAction<Order[]>>;
  siteSettings: any;
  setSiteSettings: any;
  triggerToast: (msg: string) => void;
  formatRupiah: (val: number) => string;
  onInspectOrderPayment: (o: Order) => void;
}) {
  const [adminTab, setAdminTab] = useState<'analytics' | 'orders' | 'products' | 'settings'>('analytics');

  return (
    <div className="flex-1 bg-[#F5F2ED] p-6 lg:p-8">
      <div className="container mx-auto max-w-6xl space-y-6">
        {/* Top Executive Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-[#E8DFD5] shadow-sm">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase tracking-wider text-[#9B786F] font-bold">PORTAL OPERASIONAL ADMIN</span>
              <span className="px-2 py-0.5 bg-[#FAF5F0] text-[#9B786F] text-[11px] font-mono rounded font-semibold border border-[#9B786F]/30">
                {admin.role}
              </span>
            </div>
            <h1 className="font-serif-luxury text-2xl font-bold text-[#1F1C1A]">Aura Botanica Operations Hub</h1>
            <p className="text-xs text-[#736B63]">Sesi terotentikasi: {admin.name} ({admin.email})</p>
          </div>
          <button
            onClick={onLogout}
            className="flex items-center gap-1.5 px-4 py-2 bg-rose-50 text-rose-700 hover:bg-rose-100 rounded-xl text-xs font-semibold border border-rose-200 transition"
          >
            <LogOut size={14} /> Keluar (Logout)
          </button>
        </div>

        {/* Tab Controls */}
        <div className="flex gap-2 border-b border-[#E8DFD5] pb-2 text-xs font-semibold overflow-x-auto">
          <button
            onClick={() => setAdminTab('analytics')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg transition whitespace-nowrap ${adminTab === 'analytics' ? 'bg-[#2C2724] text-white shadow-sm' : 'text-[#736B63] hover:bg-white'}`}
          >
            <BarChart3 size={14} /> Analitik Penjualan
          </button>
          <button
            onClick={() => setAdminTab('orders')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg transition whitespace-nowrap ${adminTab === 'orders' ? 'bg-[#2C2724] text-white shadow-sm' : 'text-[#736B63] hover:bg-white'}`}
          >
            <Package size={14} /> Kelola Pesanan ({orders.length})
          </button>
          <button
            onClick={() => setAdminTab('products')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg transition whitespace-nowrap ${adminTab === 'products' ? 'bg-[#2C2724] text-white shadow-sm' : 'text-[#736B63] hover:bg-white'}`}
          >
            <Droplets size={14} /> Katalog Skincare ({products.length})
          </button>
          <button
            onClick={() => setAdminTab('settings')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg transition whitespace-nowrap ${adminTab === 'settings' ? 'bg-[#2C2724] text-white shadow-sm' : 'text-[#736B63] hover:bg-white'}`}
          >
            <Sliders size={14} /> Pengaturan Toko
          </button>
        </div>

        {/* TAB 1: ANALYTICS */}
        {adminTab === 'analytics' && (
          <AdminAnalyticsView analyticsData={INITIAL_ANALYTICS_DATA} products={products} formatRupiah={formatRupiah} />
        )}

        {/* TAB 2: ORDERS WITH PAYMENT GATEWAY VERIFIER */}
        {adminTab === 'orders' && (
          <div className="bg-white p-6 rounded-2xl border border-[#E8DFD5] shadow-sm space-y-4">
            <h3 className="font-semibold text-sm">Daftar Pesanan & Status Gateway</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-[#FAF8F5] text-[#736B63] uppercase font-semibold border-b border-[#E8DFD5]">
                  <tr>
                    <th className="p-3">Order ID</th>
                    <th className="p-3">Pelanggan</th>
                    <th className="p-3">Metode Bayar</th>
                    <th className="p-3">Total Belanja</th>
                    <th className="p-3">Status Bayar</th>
                    <th className="p-3">Status Order</th>
                    <th className="p-3">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E8DFD5]">
                  {orders.map((ord) => (
                    <tr key={ord.id} className="hover:bg-[#FAF8F5]/80">
                      <td className="p-3 font-mono font-bold">{ord.order_number}</td>
                      <td className="p-3">
                        <div className="font-semibold">{ord.customer_name}</div>
                        <div className="text-[11px] text-[#736B63]">{ord.customer_phone}</div>
                      </td>
                      <td className="p-3">
                        <span className="font-medium">{ord.payment_method_name}</span>
                      </td>
                      <td className="p-3 font-semibold">{formatRupiah(ord.grand_total)}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${ord.payment_status === 'paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                          {ord.payment_status.toUpperCase()}
                        </span>
                      </td>
                      <td className="p-3">
                        <select
                          value={ord.order_status}
                          onChange={(e) => {
                            setOrders((prev) => prev.map((o) => (o.id === ord.id ? { ...o, order_status: e.target.value as any } : o)));
                            triggerToast('Status pesanan diperbarui');
                          }}
                          className="px-2 py-1 bg-[#FAF8F5] border border-[#E8DFD5] rounded text-xs"
                        >
                          <option value="Pending">Pending</option>
                          <option value="Confirmed">Confirmed</option>
                          <option value="Processing">Processing</option>
                          <option value="Shipped">Shipped</option>
                          <option value="Completed">Completed</option>
                        </select>
                      </td>
                      <td className="p-3">
                        <button
                          onClick={() => onInspectOrderPayment(ord)}
                          className="px-2.5 py-1 bg-[#FAF8F5] border border-[#9B786F] text-[#9B786F] hover:bg-[#FAF5F0] rounded text-[11px] font-semibold"
                        >
                          Lihat Gateway
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: PRODUCTS */}
        {adminTab === 'products' && (
          <div className="bg-white p-6 rounded-2xl border border-[#E8DFD5] shadow-sm space-y-4">
            <h3 className="font-semibold text-sm">Katalog Produk Skincare</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-[#FAF8F5] text-[#736B63] uppercase font-semibold border-b border-[#E8DFD5]">
                  <tr>
                    <th className="p-3">Produk</th>
                    <th className="p-3">SKU</th>
                    <th className="p-3">Kategori</th>
                    <th className="p-3">Harga</th>
                    <th className="p-3">Sisa Stok</th>
                    <th className="p-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E8DFD5]">
                  {products.map((p) => (
                    <tr key={p.id} className="hover:bg-[#FAF8F5]/80">
                      <td className="p-3 flex items-center gap-3">
                        <img src={p.primary_image} alt="" className="w-8 h-8 rounded object-cover" />
                        <span className="font-semibold">{p.name}</span>
                      </td>
                      <td className="p-3 font-mono">{p.sku}</td>
                      <td className="p-3">{p.category_name}</td>
                      <td className="p-3 font-semibold">{formatRupiah(p.discount_price ?? p.price)}</td>
                      <td className="p-3">
                        <span className={`font-bold ${p.stock <= 30 ? 'text-rose-700' : 'text-emerald-700'}`}>{p.stock} botol</span>
                      </td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 bg-emerald-50 text-emerald-800 rounded font-semibold text-[11px]">Aktif</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 4: SETTINGS */}
        {adminTab === 'settings' && (
          <div className="bg-white p-6 rounded-2xl border border-[#E8DFD5] shadow-sm max-w-xl space-y-4 text-xs">
            <h3 className="font-semibold text-sm border-b border-[#E8DFD5] pb-2">Pengaturan Brand & Pembayaran</h3>
            <div>
              <label className="font-semibold block mb-1">Nama Brand / Toko</label>
              <input
                type="text"
                value={siteSettings.siteName}
                onChange={(e) => setSiteSettings({ ...siteSettings, siteName: e.target.value })}
                className="w-full px-3 py-2 border border-[#E8DFD5] rounded-lg"
              />
            </div>
            <div>
              <label className="font-semibold block mb-1">WhatsApp Layanan Pelanggan</label>
              <input
                type="text"
                value={siteSettings.whatsapp}
                onChange={(e) => setSiteSettings({ ...siteSettings, whatsapp: e.target.value })}
                className="w-full px-3 py-2 border border-[#E8DFD5] rounded-lg"
              />
            </div>
            <div>
              <label className="font-semibold block mb-1">Batas Minimal Belanja Gratis Ongkir (Rp)</label>
              <input
                type="number"
                value={siteSettings.freeShippingThreshold}
                onChange={(e) => setSiteSettings({ ...siteSettings, freeShippingThreshold: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-[#E8DFD5] rounded-lg"
              />
            </div>
            <button
              onClick={() => triggerToast('Pengaturan website berhasil disimpan!')}
              className="px-4 py-2 bg-[#2C2724] text-white rounded-lg font-semibold hover:bg-[#9B786F] transition"
            >
              Simpan Pengaturan
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
