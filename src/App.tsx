import React, { useState, useMemo, useEffect } from 'react';
import {
  ShoppingBag,
  Search,
  User,
  Heart,
  ShieldCheck,
  Sparkles,
  Droplets,
  Sun,
  Layers,
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
  Filter,
  Star,
  Clock,
  Phone,
  Mail,
  MapPin,
  Check,
  AlertCircle
} from 'lucide-react';
import { Product, Category, Article, Order, CartItem, Coupon } from './types';
import {
  INITIAL_CATEGORIES,
  INITIAL_PRODUCTS,
  INITIAL_ARTICLES,
  INITIAL_ORDERS,
  INITIAL_COUPONS
} from './mockData';
import { CodeViewerModal } from './components/CodeViewerModal';

export default function App() {
  // Mode state: 'store' or 'admin'
  const [appMode, setAppMode] = useState<'store' | 'admin'>('store');
  const [currentView, setCurrentView] = useState<'home' | 'products' | 'product_detail' | 'cart' | 'checkout' | 'order_success' | 'articles' | 'article_detail' | 'about' | 'contact' | 'account'>('home');
  const [selectedProductSlug, setSelectedProductSlug] = useState<string>('niacinamide-10-zinc-glow-serum');
  const [selectedArticleSlug, setSelectedArticleSlug] = useState<string>('how-to-choose-the-right-moisturizer-for-oily-skin');
  const [lastPlacedOrder, setLastPlacedOrder] = useState<Order | null>(null);

  // Global State (persists to localStorage)
  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('aura_products');
    return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
  });

  const [categories, setCategories] = useState<Category[]>(() => {
    const saved = localStorage.getItem('aura_categories');
    return saved ? JSON.parse(saved) : INITIAL_CATEGORIES;
  });

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

  // Filter & Search states
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'newest' | 'price_asc' | 'price_desc' | 'bestseller'>('newest');

  // Code modal state
  const [isCodeModalOpen, setIsCodeModalOpen] = useState<boolean>(false);

  // Site settings
  const [siteSettings, setSiteSettings] = useState({
    siteName: 'AURA BOTANICA',
    tagline: 'Haute Botanical Skincare & Barrier Therapy',
    announcementBar: '✨ Gratis Ongkir Se-Indonesia untuk pesanan di atas Rp 250.000 | Promo: GLOWSKIN',
    freeShippingThreshold: 250000,
    shippingFee: 15000,
    whatsapp: '+62 812-3456-7890'
  });

  // Save changes to localStorage
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

  // Cart Handlers
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
        prev.map((item) => {
          if (item.product.id === productId) {
            return { ...item, quantity: Math.min(newQty, item.product.stock) };
          }
          return item;
        })
      );
    }
  };

  const applyCouponCode = (e: React.FormEvent) => {
    e.preventDefault();
    setCouponError('');
    const found = INITIAL_COUPONS.find(
      (c) => c.code.toUpperCase() === couponCodeInput.trim().toUpperCase()
    );
    if (!found) {
      setCouponError('Kode kupon tidak valid atau kedaluwarsa.');
      return;
    }
    if (cartSubtotal < found.min_spend) {
      setCouponError(`Minimal belanja untuk kupon ini adalah Rp ${found.min_spend.toLocaleString('id-ID')}`);
      return;
    }
    setAppliedCoupon(found);
    setCouponCodeInput('');
    triggerToast(`Kupon ${found.code} berhasil diterapkan!`);
  };

  // Filtered Products
  const filteredProducts = useMemo(() => {
    let result = products.filter((p) => {
      const matchCategory =
        selectedCategory === 'all' ||
        categories.find((c) => c.slug === selectedCategory)?.name.toLowerCase() ===
          p.category_name.toLowerCase();
      const matchSearch =
        !searchQuery ||
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.short_description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.ingredients.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCategory && matchSearch;
    });

    if (sortBy === 'price_asc') {
      result.sort((a, b) => (a.discount_price ?? a.price) - (b.discount_price ?? b.price));
    } else if (sortBy === 'price_desc') {
      result.sort((a, b) => (b.discount_price ?? b.price) - (a.discount_price ?? a.price));
    } else if (sortBy === 'bestseller') {
      result.sort((a, b) => (b.is_bestseller ? 1 : 0) - (a.is_bestseller ? 1 : 0));
    } else {
      result.sort((a, b) => b.id - a.id);
    }

    return result;
  }, [products, selectedCategory, searchQuery, sortBy, categories]);

  // Selected product object
  const currentProduct = useMemo(() => {
    return products.find((p) => p.slug === selectedProductSlug) || products[0];
  }, [products, selectedProductSlug]);

  // Selected article object
  const currentArticle = useMemo(() => {
    return articles.find((a) => a.slug === selectedArticleSlug) || articles[0];
  }, [articles, selectedArticleSlug]);

  // Helper format currency
  const formatRupiah = (val: number) => {
    return `Rp ${val.toLocaleString('id-ID')}`;
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F5] text-[#2C2724]">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#2C2724] text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-4">
          <CheckCircle size={18} className="text-[#C4A49C]" />
          <span className="text-sm font-medium">{toastMessage}</span>
        </div>
      )}

      {/* Code Viewer Modal */}
      <CodeViewerModal isOpen={isCodeModalOpen} onClose={() => setIsCodeModalOpen(false)} />

      {/* Top Banner Announcement */}
      <div className="bg-[#2C2724] text-[#F4EFEB] text-xs py-2 px-4 flex justify-between items-center tracking-wider">
        <div className="container mx-auto flex justify-between items-center text-center">
          <span className="hidden md:inline font-mono text-[11px] text-[#A89E94]">
            PHP Native & MySQLi Architecture &bull; 100% Prepared Statements
          </span>
          <span className="mx-auto font-medium text-xs">
            {siteSettings.announcementBar}
          </span>
          <div className="hidden lg:flex items-center gap-4 text-xs font-mono text-[#D4C7B8]">
            <span>WhatsApp CS: {siteSettings.whatsapp}</span>
          </div>
        </div>
      </div>

      {/* Navigation Bar */}
      <header className="sticky top-0 z-40 bg-[#FAF8F5]/95 backdrop-blur-md border-b border-[#E8DFD5]">
        <div className="container mx-auto px-4 lg:px-8 h-20 flex items-center justify-between">
          {/* Logo */}
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

          {/* Navigation Links for Storefront */}
          {appMode === 'store' && (
            <nav className="hidden md:flex items-center gap-8 text-[13.5px] font-medium tracking-wide">
              <button
                onClick={() => setCurrentView('home')}
                className={`transition hover:text-[#9B786F] ${currentView === 'home' ? 'text-[#9B786F] font-semibold' : 'text-[#2C2724]'}`}
              >
                Home
              </button>
              <button
                onClick={() => {
                  setSelectedCategory('all');
                  setCurrentView('products');
                }}
                className={`transition hover:text-[#9B786F] ${currentView === 'products' ? 'text-[#9B786F] font-semibold' : 'text-[#2C2724]'}`}
              >
                Koleksi Produk
              </button>
              <button
                onClick={() => {
                  setSelectedCategory('serum');
                  setCurrentView('products');
                }}
                className="transition hover:text-[#9B786F] text-[#2C2724]"
              >
                Serum Wajah
              </button>
              <button
                onClick={() => {
                  setSelectedCategory('moisturizer');
                  setCurrentView('products');
                }}
                className="transition hover:text-[#9B786F] text-[#2C2724]"
              >
                Skin Barrier
              </button>
              <button
                onClick={() => setCurrentView('articles')}
                className={`transition hover:text-[#9B786F] ${currentView === 'articles' ? 'text-[#9B786F] font-semibold' : 'text-[#2C2724]'}`}
              >
                Jurnal Kulit
              </button>
              <button
                onClick={() => setCurrentView('about')}
                className={`transition hover:text-[#9B786F] ${currentView === 'about' ? 'text-[#9B786F] font-semibold' : 'text-[#2C2724]'}`}
              >
                Tentang Kami
              </button>
              <button
                onClick={() => setCurrentView('contact')}
                className={`transition hover:text-[#9B786F] ${currentView === 'contact' ? 'text-[#9B786F] font-semibold' : 'text-[#2C2724]'}`}
              >
                Kontak
              </button>
            </nav>
          )}

          {/* Actions & Mode Switcher */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* View Mode Switcher Pill */}
            <div className="flex items-center p-1 bg-[#EAE2D8] rounded-full text-xs font-semibold">
              <button
                onClick={() => {
                  setAppMode('store');
                  setCurrentView('home');
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full transition ${
                  appMode === 'store'
                    ? 'bg-[#2C2724] text-white shadow-sm'
                    : 'text-[#5C544E] hover:text-[#1F1C1A]'
                }`}
              >
                <Store size={13} />
                <span>Store</span>
              </button>
              <button
                onClick={() => setAppMode('admin')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full transition ${
                  appMode === 'admin'
                    ? 'bg-[#2C2724] text-white shadow-sm'
                    : 'text-[#5C544E] hover:text-[#1F1C1A]'
                }`}
              >
                <LayoutDashboard size={13} />
                <span>Admin</span>
              </button>
            </div>

            {/* Inspect Source Code Modal button */}
            <button
              onClick={() => setIsCodeModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-[#9B786F]/15 hover:bg-[#9B786F]/25 text-[#7D5D55] border border-[#9B786F]/30 rounded-full transition"
              title="Lihat file PHP Native, SQL Dump, dan .htaccess"
            >
              <FileCode size={14} />
              <span className="hidden sm:inline">PHP & SQL</span>
            </button>

            {/* Storefront Cart & User Buttons */}
            {appMode === 'store' && (
              <>
                <button
                  onClick={() => setCurrentView('account')}
                  className="p-2 text-[#2C2724] hover:text-[#9B786F] transition rounded-full hover:bg-[#EAE2D8]/50"
                  title="Akun Pelanggan"
                >
                  <User size={20} />
                </button>
                <button
                  onClick={() => setCurrentView('cart')}
                  className="relative p-2 text-[#2C2724] hover:text-[#9B786F] transition rounded-full hover:bg-[#EAE2D8]/50"
                  title="Keranjang Belanja"
                >
                  <ShoppingBag size={20} />
                  {totalCartCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#9B786F] text-white text-[11px] font-bold rounded-full flex items-center justify-center shadow-md animate-in zoom-in">
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
      {/* MODE 1: ADMIN PANEL INTERFACE                            */}
      {/* ======================================================== */}
      {appMode === 'admin' ? (
        <AdminDashboard
          products={products}
          setProducts={setProducts}
          categories={categories}
          orders={orders}
          setOrders={setOrders}
          siteSettings={siteSettings}
          setSiteSettings={setSiteSettings}
          triggerToast={triggerToast}
          formatRupiah={formatRupiah}
        />
      ) : (
        /* ======================================================== */
        /* MODE 2: PUBLIC LUXURY SKINCARE STOREFRONT                */
        /* ======================================================== */
        <main className="flex-1">
          {/* HOME VIEW */}
          {currentView === 'home' && (
            <div>
              {/* Hero Section */}
              <section className="relative overflow-hidden bg-gradient-to-br from-[#F5EFEB] via-[#EFE7DE] to-[#E5DCD1] border-b border-[#E8DFD5] py-16 lg:py-24">
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
                      Niacinamide konsentrat tinggi, dan Centella Jeju tanpa paraben, SLS, atau alkohol.
                    </p>

                    <div className="flex flex-wrap items-center gap-4 pt-2">
                      <button
                        onClick={() => {
                          setSelectedCategory('all');
                          setCurrentView('products');
                        }}
                        className="px-8 py-3.5 bg-[#2C2724] hover:bg-[#9B786F] text-white rounded-lg text-sm font-medium tracking-wider uppercase transition shadow-md hover:shadow-lg flex items-center gap-2"
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

                    {/* Clinical Badges */}
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
                          <div className="text-xs uppercase tracking-wider text-[#9B786F] font-semibold">Featured Product</div>
                          <div className="text-sm font-bold text-[#1F1C1A]">Niacinamide 10% Glow Serum</div>
                          <div className="text-xs text-[#736B63]">Rp 169.000 <span className="line-through text-[11px] text-[#A3978B]">Rp 189.000</span></div>
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

              {/* Categories Shelf */}
              <section className="py-14 border-b border-[#E8DFD5]">
                <div className="container mx-auto px-4 lg:px-8">
                  <div className="text-center max-w-xl mx-auto mb-10">
                    <span className="text-xs font-semibold uppercase tracking-widest text-[#9B786F]">
                      Ritual Perawatan Wajah
                    </span>
                    <h2 className="font-serif-luxury text-3xl lg:text-4xl font-normal mt-1">
                      Kategori Pilihan
                    </h2>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                    {categories.slice(0, 10).map((cat) => (
                      <button
                        key={cat.id}
                        onClick={() => {
                          setSelectedCategory(cat.slug);
                          setCurrentView('products');
                        }}
                        className="p-5 bg-white border border-[#E8DFD5] hover:border-[#9B786F] rounded-xl text-center group transition duration-300 hover:-translate-y-1 shadow-sm hover:shadow-md"
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

              {/* Best Sellers Section */}
              <section className="py-16">
                <div className="container mx-auto px-4 lg:px-8">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-10 gap-4">
                    <div>
                      <span className="text-xs font-semibold uppercase tracking-widest text-[#9B786F]">
                        Paling Diminati
                      </span>
                      <h2 className="font-serif-luxury text-3xl lg:text-4xl font-normal mt-1">
                        Best Sellers Skincare
                      </h2>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedCategory('all');
                        setSortBy('bestseller');
                        setCurrentView('products');
                      }}
                      className="text-xs font-bold uppercase tracking-wider text-[#2C2724] hover:text-[#9B786F] underline underline-offset-4"
                    >
                      Lihat Semua Koleksi &rarr;
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {products
                      .filter((p) => p.is_bestseller)
                      .slice(0, 4)
                      .map((p) => (
                        <ProductCard
                          key={p.id}
                          product={p}
                          onSelect={() => {
                            setSelectedProductSlug(p.slug);
                            setCurrentView('product_detail');
                          }}
                          onAddToCart={() => addToCart(p)}
                          formatRupiah={formatRupiah}
                        />
                      ))}
                  </div>
                </div>
              </section>

              {/* Skincare Philosophy & Clinical Benefits */}
              <section className="py-20 bg-[#231F1C] text-[#FAF8F5]">
                <div className="container mx-auto px-4 lg:px-8">
                  <div className="max-w-2xl mx-auto text-center mb-14">
                    <span className="text-xs font-semibold uppercase tracking-widest text-[#C4A49C]">
                      Filosofi Formulasi
                    </span>
                    <h2 className="font-serif-luxury text-3xl sm:text-4xl font-light text-white mt-2 mb-4">
                      Kecantikan Abadi dari Skin Barrier yang Tangguh
                    </h2>
                    <p className="text-sm sm:text-base text-[#A89E94] leading-relaxed">
                      Kami menolak klaim instan yang mengikis pertahanan kulit. Setiap produk dirancang
                      untuk menutrisi mikrobioma, mengunci kelembapan alami, dan mencegah penuaan dini secara berkelanjutan.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="p-8 border-l border-[#484039] bg-[#2C2724]/40 rounded-r-xl">
                      <div className="text-[#C4A49C] text-2xl font-serif-luxury mb-2">01. Organik Murni</div>
                      <h3 className="text-lg font-medium text-white mb-2">Clean Botanical Extraction</h3>
                      <p className="text-xs sm:text-sm text-[#9E9285] leading-relaxed">
                        Ekstrak tanaman organik cold-pressed tanpa pestisida, bebas paraben, sulfat, alkohol denat, dan wewangian sintetis pemicu alergi.
                      </p>
                    </div>

                    <div className="p-8 border-l border-[#484039] bg-[#2C2724]/40 rounded-r-xl">
                      <div className="text-[#C4A49C] text-2xl font-serif-luxury mb-2">02. Klinis Presisi</div>
                      <h3 className="text-lg font-medium text-white mb-2">5X Ceramide Biomimetik</h3>
                      <p className="text-xs sm:text-sm text-[#9E9285] leading-relaxed">
                        Meniru lapisan lipid alami kulit untuk mengikat kelembapan hingga lapisan stratum corneum terdalam selama 24 jam.
                      </p>
                    </div>

                    <div className="p-8 border-l border-[#484039] bg-[#2C2724]/40 rounded-r-xl">
                      <div className="text-[#C4A49C] text-2xl font-serif-luxury mb-2">03. Teruji Klinis</div>
                      <h3 className="text-lg font-medium text-white mb-2">Dermatologist Approved</h3>
                      <p className="text-xs sm:text-sm text-[#9E9285] leading-relaxed">
                        Lolos uji klinis hypoallergenic non-komedogenik sehingga sangat aman untuk kulit sensitif, eczema, dan ibu hamil/menyusui.
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              {/* Testimonials */}
              <section className="py-16 border-b border-[#E8DFD5]">
                <div className="container mx-auto px-4 lg:px-8">
                  <div className="text-center max-w-xl mx-auto mb-12">
                    <span className="text-xs font-semibold uppercase tracking-widest text-[#9B786F]">
                      Ulasan Pembeli Terverifikasi
                    </span>
                    <h2 className="font-serif-luxury text-3xl lg:text-4xl font-normal mt-1">
                      Kisah Nyata Perubahan Kulit
                    </h2>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white p-6 rounded-xl border border-[#E8DFD5] flex flex-col justify-between shadow-sm">
                      <div className="flex text-amber-400 mb-3 text-sm">★★★★★</div>
                      <p className="text-sm text-[#4A433E] italic leading-relaxed mb-4">
                        &ldquo;Teksturnya seringan air tapi efeknya luar biasa! Dalam 2 minggu bekas jerawat kehitaman pudar drastis dan kulit berasa jauh lebih kenyal. Tidak ada tingling sensation sama sekali.&rdquo;
                      </p>
                      <div className="border-t border-[#EAE2D8] pt-3">
                        <div className="font-semibold text-xs text-[#1F1C1A]">Anindya Putri</div>
                        <div className="text-[11px] text-[#9B786F]">Verified Buyer &bull; Niacinamide 10% Glow Serum</div>
                      </div>
                    </div>

                    <div className="bg-white p-6 rounded-xl border border-[#E8DFD5] flex flex-col justify-between shadow-sm">
                      <div className="flex text-amber-400 mb-3 text-sm">★★★★★</div>
                      <p className="text-sm text-[#4A433E] italic leading-relaxed mb-4">
                        &ldquo;Skin barrier aku yang tadinya ngelupas perih gara-gara over-exfoliasi sembuh dalam 4 hari pakai 5X Ceramide cream ini. Wanginya sangat lembut dan formulanya sangat melembapkan.&rdquo;
                      </p>
                      <div className="border-t border-[#EAE2D8] pt-3">
                        <div className="font-semibold text-xs text-[#1F1C1A]">Nadia Kusuma</div>
                        <div className="text-[11px] text-[#9B786F]">Verified Buyer &bull; 5X Ceramide Barrier Cream</div>
                      </div>
                    </div>

                    <div className="bg-white p-6 rounded-xl border border-[#E8DFD5] flex flex-col justify-between shadow-sm">
                      <div className="flex text-amber-400 mb-3 text-sm">★★★★★</div>
                      <p className="text-sm text-[#4A433E] italic leading-relaxed mb-4">
                        &ldquo;Sunscreen terbaik tahun ini! Beneran no whitecast sama sekali di kulitku yang sawo matang, tidak perih di mata, dan tidak bikin muka berminyak walau dipakai beraktivitas outdoor.&rdquo;
                      </p>
                      <div className="border-t border-[#EAE2D8] pt-3">
                        <div className="font-semibold text-xs text-[#1F1C1A]">Gabriella Tan</div>
                        <div className="text-[11px] text-[#9B786F]">Verified Buyer &bull; Invisible Velvet Sunscreen</div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Recent Articles Section */}
              <section className="py-16 bg-[#F6F2ED]">
                <div className="container mx-auto px-4 lg:px-8">
                  <div className="flex justify-between items-end mb-10">
                    <div>
                      <span className="text-xs font-semibold uppercase tracking-widest text-[#9B786F]">
                        Jurnal Skincare & Sains
                      </span>
                      <h2 className="font-serif-luxury text-3xl font-normal mt-1">
                        Edukasi & Tips Terbaru
                      </h2>
                    </div>
                    <button
                      onClick={() => setCurrentView('articles')}
                      className="text-xs font-bold uppercase tracking-wider text-[#2C2724] hover:text-[#9B786F] underline underline-offset-4"
                    >
                      Baca Semua Artikel &rarr;
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {articles.map((art) => (
                      <div
                        key={art.id}
                        onClick={() => {
                          setSelectedArticleSlug(art.slug);
                          setCurrentView('article_detail');
                        }}
                        className="bg-white rounded-xl overflow-hidden border border-[#E8DFD5] hover:shadow-lg transition cursor-pointer flex flex-col"
                      >
                        <img src={art.featured_image} alt={art.title} className="w-full h-48 object-cover" />
                        <div className="p-6 flex flex-col flex-1">
                          <span className="text-[11px] uppercase tracking-wider font-semibold text-[#9B786F] mb-2">
                            {art.category_name} &bull; {art.published_at}
                          </span>
                          <h3 className="font-serif-luxury text-lg font-bold leading-snug mb-3 hover:text-[#9B786F] transition">
                            {art.title}
                          </h3>
                          <p className="text-xs text-[#736B63] line-clamp-2 leading-relaxed mb-4 flex-1">
                            {art.excerpt}
                          </p>
                          <span className="text-xs font-semibold text-[#2C2724] flex items-center gap-1">
                            Baca Selengkapnya <ChevronRight size={14} />
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            </div>
          )}

          {/* PRODUCTS CATALOG VIEW */}
          {currentView === 'products' && (
            <div className="py-10">
              <div className="container mx-auto px-4 lg:px-8">
                {/* Header Title */}
                <div className="mb-8">
                  <h1 className="font-serif-luxury text-4xl font-normal text-[#1F1C1A]">Koleksi Produk Skincare</h1>
                  <p className="text-sm text-[#736B63] mt-1 font-light">
                    Formula botani dermatologis yang disesuaikan khusus untuk tiap kebutuhan kulit.
                  </p>
                </div>

                {/* Filters & Search Control Bar */}
                <div className="bg-white p-4 rounded-xl border border-[#E8DFD5] shadow-sm mb-8 flex flex-col md:flex-row gap-4 items-center justify-between">
                  {/* Category Pills */}
                  <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-none">
                    <button
                      onClick={() => setSelectedCategory('all')}
                      className={`px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition ${
                        selectedCategory === 'all'
                          ? 'bg-[#2C2724] text-white shadow-sm'
                          : 'bg-[#F4EFEB] text-[#4A433E] hover:bg-[#EAE2D8]'
                      }`}
                    >
                      Semua
                    </button>
                    {categories.map((c) => (
                      <button
                        key={c.id}
                        onClick={() => setSelectedCategory(c.slug)}
                        className={`px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition ${
                          selectedCategory === c.slug
                            ? 'bg-[#2C2724] text-white shadow-sm'
                            : 'bg-[#F4EFEB] text-[#4A433E] hover:bg-[#EAE2D8]'
                        }`}
                      >
                        {c.name}
                      </button>
                    ))}
                  </div>

                  {/* Search and Sort */}
                  <div className="flex items-center gap-3 w-full md:w-auto">
                    <div className="relative flex-1 md:w-56">
                      <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9E9285]" />
                      <input
                        type="text"
                        placeholder="Cari produk / bahan aktif..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-3 py-1.5 bg-[#FAF8F5] border border-[#E8DFD5] rounded-lg text-xs focus:outline-none focus:border-[#9B786F]"
                      />
                    </div>

                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as any)}
                      className="px-3 py-1.5 bg-[#FAF8F5] border border-[#E8DFD5] rounded-lg text-xs font-medium focus:outline-none focus:border-[#9B786F]"
                    >
                      <option value="newest">Terbaru</option>
                      <option value="bestseller">Best Seller</option>
                      <option value="price_asc">Harga Terendah</option>
                      <option value="price_desc">Harga Tertinggi</option>
                    </select>
                  </div>
                </div>

                {/* Products Grid */}
                {filteredProducts.length === 0 ? (
                  <div className="py-20 text-center bg-white rounded-xl border border-[#E8DFD5]">
                    <div className="text-4xl mb-3">🌿</div>
                    <h3 className="font-serif-luxury text-xl font-bold">Produk Tidak Ditemukan</h3>
                    <p className="text-xs text-[#736B63] mt-1 max-w-sm mx-auto">
                      Coba ganti kata kunci pencarian atau pilih kategori lainnya.
                    </p>
                    <button
                      onClick={() => {
                        setSelectedCategory('all');
                        setSearchQuery('');
                      }}
                      className="mt-4 px-4 py-2 bg-[#2C2724] text-white rounded-lg text-xs"
                    >
                      Reset Filter
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {filteredProducts.map((prod) => (
                      <ProductCard
                        key={prod.id}
                        product={prod}
                        onSelect={() => {
                          setSelectedProductSlug(prod.slug);
                          setCurrentView('product_detail');
                        }}
                        onAddToCart={() => addToCart(prod)}
                        formatRupiah={formatRupiah}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* PRODUCT DETAIL VIEW */}
          {currentView === 'product_detail' && currentProduct && (
            <div className="py-10">
              <div className="container mx-auto px-4 lg:px-8 max-w-6xl">
                {/* Breadcrumbs */}
                <div className="flex items-center gap-2 text-xs text-[#736B63] mb-6">
                  <button onClick={() => setCurrentView('home')} className="hover:underline">Home</button>
                  <span>/</span>
                  <button onClick={() => setCurrentView('products')} className="hover:underline">Koleksi</button>
                  <span>/</span>
                  <span className="text-[#2C2724] font-medium">{currentProduct.name}</span>
                </div>

                {/* Detail Split */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mb-16">
                  {/* Product Gallery */}
                  <div className="lg:col-span-6 space-y-4">
                    <div className="rounded-2xl overflow-hidden border border-[#E8DFD5] bg-white shadow-sm">
                      <img
                        src={currentProduct.primary_image}
                        alt={currentProduct.name}
                        className="w-full h-[460px] object-cover"
                      />
                    </div>
                  </div>

                  {/* Purchase Box */}
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
                        <span>(4.9 / 5.0 dari 142 ulasan)</span>
                        <span>&bull;</span>
                        <span className="font-mono">SKU: {currentProduct.sku}</span>
                      </div>
                    </div>

                    {/* Price Bar */}
                    <div className="p-4 bg-white border border-[#E8DFD5] rounded-xl flex items-baseline gap-3">
                      <span className="text-2xl font-bold text-[#1F1C1A]">
                        {formatRupiah(currentProduct.discount_price ?? currentProduct.price)}
                      </span>
                      {currentProduct.discount_price && (
                        <>
                          <span className="text-sm line-through text-[#9E9285]">
                            {formatRupiah(currentProduct.price)}
                          </span>
                          <span className="px-2 py-0.5 bg-rose-100 text-rose-700 text-[11px] font-bold rounded">
                            Diskon {Math.round(((currentProduct.price - currentProduct.discount_price) / currentProduct.price) * 100)}%
                          </span>
                        </>
                      )}
                    </div>

                    <p className="text-sm text-[#4A433E] leading-relaxed">
                      {currentProduct.short_description}
                    </p>

                    {/* Stock Alert */}
                    <div className="text-xs font-semibold">
                      {currentProduct.stock > 10 ? (
                        <span className="text-emerald-700">✓ Stok Tersedia ({currentProduct.stock} unit)</span>
                      ) : currentProduct.stock > 0 ? (
                        <span className="text-amber-700">⚠️ Stok Terbatas! Sisa {currentProduct.stock} unit</span>
                      ) : (
                        <span className="text-rose-700">✕ Stok Habis</span>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-4 pt-2">
                      <button
                        onClick={() => addToCart(currentProduct, 1)}
                        className="flex-1 py-3.5 bg-[#2C2724] hover:bg-[#9B786F] text-white rounded-lg text-sm font-semibold tracking-wider uppercase transition shadow-md"
                      >
                        + Tambahkan ke Keranjang
                      </button>
                      <button
                        onClick={() => {
                          addToCart(currentProduct, 1);
                          setCurrentView('cart');
                        }}
                        className="px-6 py-3.5 bg-[#FAF8F5] border border-[#2C2724] text-[#2C2724] hover:bg-[#2C2724] hover:text-white rounded-lg text-sm font-semibold tracking-wider uppercase transition"
                      >
                        Beli Langsung
                      </button>
                    </div>

                    {/* Value Props */}
                    <div className="p-4 bg-[#F4EFEB] rounded-xl text-xs space-y-2 text-[#4A433E]">
                      <div className="flex items-center gap-2">
                        <Check size={14} className="text-emerald-700" />
                        <span>Gratis ongkir otomatis untuk pesanan di atas Rp 250.000</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Check size={14} className="text-emerald-700" />
                        <span>Formulasi pH 5.5 ramah skin barrier, bebas paraben dan sulfat</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Check size={14} className="text-emerald-700" />
                        <span>100% Produk Asli terdaftar BPOM dan bersertifikat Halal</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Extended Information */}
                <div className="bg-white p-8 rounded-2xl border border-[#E8DFD5] shadow-sm space-y-8">
                  <div>
                    <h3 className="font-serif-luxury text-2xl font-normal mb-3">Deskripsi Lengkap</h3>
                    <p className="text-sm text-[#4A433E] leading-relaxed">
                      {currentProduct.full_description}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 border-t border-[#E8DFD5]">
                    <div>
                      <h4 className="font-semibold text-sm mb-2 text-[#1F1C1A]">Manfaat Utama (Benefits)</h4>
                      <p className="text-xs text-[#5C544E] leading-relaxed">{currentProduct.benefits}</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm mb-2 text-[#1F1C1A]">Cara Penggunaan (How to Use)</h4>
                      <p className="text-xs text-[#5C544E] leading-relaxed">{currentProduct.how_to_use}</p>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-[#E8DFD5]">
                    <h4 className="font-semibold text-sm mb-2 text-[#1F1C1A]">Komposisi Lengkap (Ingredients)</h4>
                    <div className="p-4 bg-[#FAF8F5] rounded-lg border border-[#E8DFD5] text-xs font-mono text-[#736B63] leading-relaxed">
                      {currentProduct.ingredients}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SHOPPING CART VIEW */}
          {currentView === 'cart' && (
            <div className="py-10">
              <div className="container mx-auto px-4 lg:px-8 max-w-5xl">
                <h1 className="font-serif-luxury text-3xl font-normal text-[#1F1C1A] mb-8">
                  Keranjang Belanja ({totalCartCount} item)
                </h1>

                {cart.length === 0 ? (
                  <div className="bg-white p-12 rounded-2xl border border-[#E8DFD5] text-center shadow-sm">
                    <div className="text-5xl mb-4">🛍️</div>
                    <h2 className="font-serif-luxury text-2xl font-medium mb-2">Keranjang Anda Masih Kosong</h2>
                    <p className="text-sm text-[#736B63] mb-6">
                      Mulai jelajahi pilihan skincare botani kami untuk menemukan produk yang pas dengan kulit Anda.
                    </p>
                    <button
                      onClick={() => setCurrentView('products')}
                      className="px-6 py-3 bg-[#2C2724] text-white text-xs font-semibold rounded-lg uppercase tracking-wider hover:bg-[#9B786F] transition"
                    >
                      Mulai Belanja
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    {/* Item list */}
                    <div className="lg:col-span-8 bg-white p-6 rounded-2xl border border-[#E8DFD5] shadow-sm divide-y divide-[#E8DFD5]">
                      {cart.map((item) => {
                        const price = item.product.discount_price ?? item.product.price;
                        return (
                          <div key={item.product.id} className="py-5 first:pt-0 last:pb-0 flex gap-4 items-center">
                            <img
                              src={item.product.primary_image}
                              alt={item.product.name}
                              className="w-20 h-20 rounded-xl object-cover border border-[#E8DFD5]"
                            />
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-sm text-[#1F1C1A] truncate">
                                {item.product.name}
                              </h3>
                              <div className="text-xs text-[#736B63] mt-0.5">
                                {formatRupiah(price)} &bull; {item.product.volume_weight}
                              </div>

                              {/* Qty controls */}
                              <div className="flex items-center gap-3 mt-3">
                                <div className="flex items-center border border-[#E8DFD5] rounded-md overflow-hidden bg-[#FAF8F5]">
                                  <button
                                    onClick={() => updateCartQty(item.product.id, item.quantity - 1)}
                                    className="p-1.5 hover:bg-[#EAE2D8] transition"
                                  >
                                    <Minus size={13} />
                                  </button>
                                  <span className="px-3 text-xs font-semibold">{item.quantity}</span>
                                  <button
                                    onClick={() => updateCartQty(item.product.id, item.quantity + 1)}
                                    className="p-1.5 hover:bg-[#EAE2D8] transition"
                                    disabled={item.quantity >= item.product.stock}
                                  >
                                    <Plus size={13} />
                                  </button>
                                </div>

                                <button
                                  onClick={() => updateCartQty(item.product.id, 0)}
                                  className="text-rose-600 hover:text-rose-800 text-xs flex items-center gap-1"
                                >
                                  <Trash2 size={13} /> Hapus
                                </button>
                              </div>
                            </div>

                            <div className="text-right">
                              <div className="font-bold text-sm text-[#1F1C1A]">
                                {formatRupiah(price * item.quantity)}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Summary box */}
                    <div className="lg:col-span-4 bg-white p-6 rounded-2xl border border-[#E8DFD5] shadow-sm space-y-5">
                      <h3 className="font-serif-luxury text-xl font-normal border-b border-[#E8DFD5] pb-3">
                        Ringkasan Belanja
                      </h3>

                      {/* Promo Code Input */}
                      <form onSubmit={applyCouponCode} className="space-y-2">
                        <label className="text-xs font-semibold uppercase tracking-wider text-[#736B63]">
                          Kupon Diskon (Promo Code)
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            placeholder="Misal: GLOWSKIN"
                            value={couponCodeInput}
                            onChange={(e) => setCouponCodeInput(e.target.value)}
                            className="flex-1 px-3 py-2 text-xs border border-[#E8DFD5] rounded-lg uppercase font-mono focus:outline-none focus:border-[#9B786F]"
                          />
                          <button
                            type="submit"
                            className="px-3 py-2 bg-[#2C2724] text-white text-xs font-semibold rounded-lg hover:bg-[#9B786F] transition"
                          >
                            Terapkan
                          </button>
                        </div>
                        {couponError && <p className="text-xs text-rose-600">{couponError}</p>}
                        {appliedCoupon && (
                          <div className="p-2 bg-emerald-50 text-emerald-800 rounded-lg text-xs flex justify-between items-center border border-emerald-200">
                            <span>Kupon aktif: <strong>{appliedCoupon.code}</strong></span>
                            <button
                              type="button"
                              onClick={() => setAppliedCoupon(null)}
                              className="text-rose-600 hover:underline"
                            >
                              Batal
                            </button>
                          </div>
                        )}
                      </form>

                      {/* Line totals */}
                      <div className="space-y-2.5 text-xs text-[#5C544E] border-t border-[#E8DFD5] pt-4">
                        <div className="flex justify-between">
                          <span>Subtotal Belanja</span>
                          <span className="font-semibold text-[#1F1C1A]">{formatRupiah(cartSubtotal)}</span>
                        </div>
                        {discountAmount > 0 && (
                          <div className="flex justify-between text-emerald-700">
                            <span>Potongan Diskon Kupon</span>
                            <span className="font-semibold">- {formatRupiah(discountAmount)}</span>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <span>Ongkos Kirim Standar</span>
                          <span className="font-semibold text-[#1F1C1A]">
                            {shippingCost === 0 ? <span className="text-emerald-700 font-bold">Gratis</span> : formatRupiah(shippingCost)}
                          </span>
                        </div>
                      </div>

                      {/* Grand total */}
                      <div className="flex justify-between items-baseline border-t border-[#E8DFD5] pt-4">
                        <span className="font-bold text-sm text-[#1F1C1A]">Total Pembayaran</span>
                        <span className="font-bold text-xl text-[#1F1C1A]">{formatRupiah(grandTotal)}</span>
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

          {/* CHECKOUT VIEW */}
          {currentView === 'checkout' && (
            <CheckoutView
              cart={cart}
              cartSubtotal={cartSubtotal}
              discountAmount={discountAmount}
              shippingCost={shippingCost}
              grandTotal={grandTotal}
              formatRupiah={formatRupiah}
              onOrderSuccess={(newOrder) => {
                setOrders((prev) => [newOrder, ...prev]);
                setCart([]);
                setAppliedCoupon(null);
                setLastPlacedOrder(newOrder);
                setCurrentView('order_success');
                triggerToast('Pesanan berhasil dibuat!');
              }}
            />
          )}

          {/* ORDER SUCCESS VIEW */}
          {currentView === 'order_success' && lastPlacedOrder && (
            <div className="py-12">
              <div className="container mx-auto px-4 max-w-2xl bg-white p-8 sm:p-10 rounded-2xl border border-[#E8DFD5] shadow-lg text-center space-y-6">
                <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 mx-auto flex items-center justify-center text-3xl">
                  ✓
                </div>
                <div>
                  <h1 className="font-serif-luxury text-3xl font-medium text-[#1F1C1A]">
                    Pesanan Anda Berhasil Diproses!
                  </h1>
                  <p className="text-xs text-[#736B63] mt-1 font-mono">
                    Nomor Pesanan: <strong className="text-base text-[#1F1C1A]">{lastPlacedOrder.order_number}</strong>
                  </p>
                  <p className="text-xs text-[#736B63] mt-1">
                    Invoice pesanan telah dikirimkan ke <strong>{lastPlacedOrder.customer_email}</strong>.
                  </p>
                </div>

                {/* Transfer Info */}
                <div className="p-5 bg-[#FAF8F5] rounded-xl border border-[#E8DFD5] text-left text-xs space-y-2">
                  <div className="font-bold text-[#1F1C1A] uppercase tracking-wider text-[11px]">
                    Instruksi Pembayaran: {lastPlacedOrder.payment_method}
                  </div>
                  {lastPlacedOrder.payment_method.includes('BCA') ? (
                    <div>
                      <div className="text-[#736B63]">No. Rekening BCA:</div>
                      <div className="font-mono text-xl font-bold text-[#1F1C1A] my-1">8820-192-384</div>
                      <div className="text-[#736B63]">a/n PT AURA BOTANICA INDONESIA</div>
                      <div className="mt-2 text-sm font-semibold text-[#1F1C1A]">
                        Nominal Transfer: {formatRupiah(lastPlacedOrder.grand_total)}
                      </div>
                    </div>
                  ) : (
                    <div className="text-[#5C544E]">
                      Pesanan Anda akan segera disiapkan oleh tim gudang Aura Botanica. Siapkan pembayaran saat paket tiba.
                    </div>
                  )}
                </div>

                {/* Item List */}
                <div className="border border-[#E8DFD5] rounded-xl p-4 text-left divide-y divide-[#E8DFD5] text-xs">
                  {lastPlacedOrder.items.map((it, idx) => (
                    <div key={idx} className="py-2.5 flex justify-between items-center first:pt-0 last:pb-0">
                      <div>
                        <div className="font-semibold text-[#1F1C1A]">{it.product_name}</div>
                        <div className="text-[#736B63]">{it.quantity} x {formatRupiah(it.price)}</div>
                      </div>
                      <span className="font-semibold">{formatRupiah(it.total)}</span>
                    </div>
                  ))}
                </div>

                <div className="flex gap-4 justify-center pt-2">
                  <button
                    onClick={() => {
                      setCurrentView('home');
                    }}
                    className="px-6 py-2.5 bg-[#FAF8F5] border border-[#2C2724] text-[#2C2724] rounded-lg text-xs font-semibold hover:bg-[#2C2724] hover:text-white transition"
                  >
                    Kembali ke Beranda
                  </button>
                  <button
                    onClick={() => window.print()}
                    className="px-6 py-2.5 bg-[#2C2724] text-white rounded-lg text-xs font-semibold hover:bg-[#9B786F] transition flex items-center gap-1.5"
                  >
                    <Printer size={14} /> Cetak Invoice
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ARTICLES JOURNAL VIEW */}
          {currentView === 'articles' && (
            <div className="py-10">
              <div className="container mx-auto px-4 lg:px-8 max-w-5xl">
                <div className="mb-10 text-center max-w-xl mx-auto">
                  <span className="text-xs font-semibold uppercase tracking-widest text-[#9B786F]">
                    Aura Journal
                  </span>
                  <h1 className="font-serif-luxury text-4xl font-normal mt-1 mb-2">
                    Jurnal & Edukasi Kulit
                  </h1>
                  <p className="text-xs sm:text-sm text-[#736B63]">
                    Panduan ilmiah seputar bahan aktif dermatologis, perbaikan skin barrier, dan ritual perawatan alami.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {articles.map((art) => (
                    <div
                      key={art.id}
                      onClick={() => {
                        setSelectedArticleSlug(art.slug);
                        setCurrentView('article_detail');
                      }}
                      className="bg-white rounded-2xl overflow-hidden border border-[#E8DFD5] shadow-sm hover:shadow-xl transition cursor-pointer flex flex-col group"
                    >
                      <img
                        src={art.featured_image}
                        alt={art.title}
                        className="w-full h-52 object-cover group-hover:scale-105 transition duration-500"
                      />
                      <div className="p-6 flex flex-col flex-1">
                        <span className="text-[11px] uppercase tracking-wider font-semibold text-[#9B786F] mb-2">
                          {art.category_name} &bull; {art.published_at}
                        </span>
                        <h2 className="font-serif-luxury text-xl font-bold leading-snug mb-3 group-hover:text-[#9B786F] transition">
                          {art.title}
                        </h2>
                        <p className="text-xs text-[#736B63] line-clamp-3 leading-relaxed mb-4 flex-1">
                          {art.excerpt}
                        </p>
                        <div className="flex justify-between items-center text-xs text-[#2C2724] border-t border-[#E8DFD5] pt-3">
                          <span className="text-[#9E9285]">Oleh: {art.author_name}</span>
                          <span className="font-semibold flex items-center gap-1 text-[#9B786F]">
                            Baca &rarr;
                          </span>
                        </div>
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
                <button
                  onClick={() => setCurrentView('articles')}
                  className="text-xs text-[#736B63] hover:text-[#1F1C1A] flex items-center gap-1 font-semibold"
                >
                  &larr; Kembali ke Jurnal
                </button>

                <div>
                  <span className="text-xs uppercase tracking-widest text-[#9B786F] font-semibold">
                    {currentArticle.category_name} &bull; {currentArticle.published_at}
                  </span>
                  <h1 className="font-serif-luxury text-3xl sm:text-4xl lg:text-5xl font-normal text-[#1F1C1A] mt-2 mb-4 leading-tight">
                    {currentArticle.title}
                  </h1>
                  <div className="flex items-center gap-3 text-xs text-[#736B63] border-b border-[#E8DFD5] pb-4">
                    <span>Penulis: <strong>{currentArticle.author_name}</strong></span>
                    <span>&bull;</span>
                    <span>Dibaca {currentArticle.views.toLocaleString('id-ID')} kali</span>
                  </div>
                </div>

                <div className="rounded-2xl overflow-hidden border border-[#E8DFD5] shadow-md">
                  <img
                    src={currentArticle.featured_image}
                    alt={currentArticle.title}
                    className="w-full h-80 object-cover"
                  />
                </div>

                <div className="bg-white p-8 sm:p-10 rounded-2xl border border-[#E8DFD5] text-sm text-[#3A342F] leading-relaxed space-y-4">
                  <p className="text-base font-serif-luxury italic text-[#5C544E] border-l-4 border-[#9B786F] pl-4">
                    {currentArticle.excerpt}
                  </p>
                  <p>{currentArticle.content}</p>
                </div>
              </div>
            </div>
          )}

          {/* ABOUT US VIEW */}
          {currentView === 'about' && (
            <div className="py-14">
              <div className="container mx-auto px-4 lg:px-8 max-w-3xl bg-white p-8 sm:p-12 rounded-2xl border border-[#E8DFD5] shadow-sm space-y-6">
                <span className="text-xs uppercase tracking-widest text-[#9B786F] font-semibold">
                  Tentang Aura Botanica
                </span>
                <h1 className="font-serif-luxury text-4xl font-normal text-[#1F1C1A]">
                  Kemurnian Botani Bertemu Sains Modern
                </h1>
                <p className="text-sm text-[#4A433E] leading-relaxed font-light">
                  Didirikan dengan filosofi bahwa kulit manusia layak mendapatkan nutrisi paling murni dan teruji secara klinis, <strong>AURA BOTANICA</strong> mendedikasikan setiap formulasinya untuk mengembalikan keseimbangan skin barrier alami Anda.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-[#E8DFD5]">
                  <div className="p-4 bg-[#FAF8F5] rounded-xl border border-[#E8DFD5]">
                    <h3 className="font-semibold text-sm text-[#1F1C1A] mb-1">🌿 100% Cruelty Free</h3>
                    <p className="text-xs text-[#736B63]">Tidak pernah diuji pada hewan dan berbahan dasar botani organik terbarukan.</p>
                  </div>
                  <div className="p-4 bg-[#FAF8F5] rounded-xl border border-[#E8DFD5]">
                    <h3 className="font-semibold text-sm text-[#1F1C1A] mb-1">🛡️ Formula pH 5.5</h3>
                    <p className="text-xs text-[#736B63]">Menjaga mantel asam pelindung alami kulit dari polusi dan bakteri.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* CONTACT US VIEW */}
          {currentView === 'contact' && (
            <div className="py-14">
              <div className="container mx-auto px-4 lg:px-8 max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                <div className="bg-white p-8 rounded-2xl border border-[#E8DFD5] shadow-sm space-y-5">
                  <h2 className="font-serif-luxury text-2xl font-normal">Hubungi Kami</h2>
                  <p className="text-xs text-[#736B63] leading-relaxed">
                    Konsultasikan kebutuhan tipe kulit Anda dengan tim beauty advisor profesional kami.
                  </p>
                  <div className="space-y-3 text-xs text-[#4A433E]">
                    <div className="flex items-center gap-3">
                      <MapPin size={16} className="text-[#9B786F]" />
                      <span>Jl. Senopati No. 88, Kebayoran Baru, Jakarta Selatan</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Phone size={16} className="text-[#9B786F]" />
                      <span>{siteSettings.whatsapp}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Mail size={16} className="text-[#9B786F]" />
                      <span>care@aurabotanica.com</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-8 rounded-2xl border border-[#E8DFD5] shadow-sm">
                  <h3 className="font-semibold text-sm mb-4">Kirim Pesan Langsung</h3>
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      triggerToast('Pesan Anda berhasil terkirim!');
                    }}
                    className="space-y-3 text-xs"
                  >
                    <div>
                      <label className="font-semibold block mb-1">Nama Lengkap</label>
                      <input type="text" required className="w-full px-3 py-2 border border-[#E8DFD5] rounded-lg" />
                    </div>
                    <div>
                      <label className="font-semibold block mb-1">Email</label>
                      <input type="email" required className="w-full px-3 py-2 border border-[#E8DFD5] rounded-lg" />
                    </div>
                    <div>
                      <label className="font-semibold block mb-1">Pesan Anda</label>
                      <textarea rows={3} required className="w-full px-3 py-2 border border-[#E8DFD5] rounded-lg"></textarea>
                    </div>
                    <button type="submit" className="w-full py-2.5 bg-[#2C2724] text-white font-semibold rounded-lg hover:bg-[#9B786F] transition">
                      Kirim Pesan
                    </button>
                  </form>
                </div>
              </div>
            </div>
          )}

          {/* CUSTOMER ACCOUNT VIEW */}
          {currentView === 'account' && (
            <div className="py-12">
              <div className="container mx-auto px-4 lg:px-8 max-w-4xl space-y-8">
                <div className="flex justify-between items-baseline border-b border-[#E8DFD5] pb-4">
                  <div>
                    <h1 className="font-serif-luxury text-3xl font-normal text-[#1F1C1A]">Akun Pelanggan</h1>
                    <p className="text-xs text-[#736B63] mt-0.5">Anindya Putri &bull; anindya@gmail.com</p>
                  </div>
                  <span className="px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold rounded-full">
                    Member Gold
                  </span>
                </div>

                {/* Orders History */}
                <div className="bg-white p-6 rounded-2xl border border-[#E8DFD5] shadow-sm space-y-4">
                  <h3 className="font-serif-luxury text-xl font-normal">Riwayat Pesanan Anda</h3>
                  <div className="divide-y divide-[#E8DFD5]">
                    {orders.map((ord) => (
                      <div key={ord.id} className="py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                        <div>
                          <div className="font-mono font-bold text-xs text-[#1F1C1A]">{ord.order_number}</div>
                          <div className="text-[11px] text-[#736B63]">{ord.created_at} &bull; {ord.payment_method}</div>
                          <div className="text-xs font-semibold mt-1">{formatRupiah(ord.grand_total)}</div>
                        </div>
                        <span className={`px-2.5 py-1 text-[11px] font-semibold rounded-full ${
                          ord.order_status === 'Completed' ? 'bg-emerald-100 text-emerald-800' :
                          ord.order_status === 'Shipped' ? 'bg-blue-100 text-blue-800' :
                          'bg-amber-100 text-amber-800'
                        }`}>
                          {ord.order_status}
                        </span>
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
                {siteSettings.tagline}. Dibuat menggunakan arsitektur PHP Native murni, MySQLi prepared statements, dan standar keamanan tinggi.
              </p>
            </div>

            <div>
              <h4 className="text-white font-semibold text-xs uppercase tracking-wider mb-3">Kategori</h4>
              <ul className="text-xs space-y-2 text-[#9E9285]">
                <li><button onClick={() => { setSelectedCategory('serum'); setCurrentView('products'); }}>Serum Wajah</button></li>
                <li><button onClick={() => { setSelectedCategory('toner'); setCurrentView('products'); }}>Hydrating Toner</button></li>
                <li><button onClick={() => { setSelectedCategory('moisturizer'); setCurrentView('products'); }}>Barrier Cream</button></li>
                <li><button onClick={() => { setSelectedCategory('sunscreen'); setCurrentView('products'); }}>UV Sunscreen</button></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-semibold text-xs uppercase tracking-wider mb-3">Bantuan & Info</h4>
              <ul className="text-xs space-y-2 text-[#9E9285]">
                <li><button onClick={() => setCurrentView('about')}>Kisah Kami</button></li>
                <li><button onClick={() => setCurrentView('contact')}>Hubungi Kami</button></li>
                <li><button onClick={() => setCurrentView('articles')}>Jurnal Skincare</button></li>
                <li><button onClick={() => setIsCodeModalOpen(true)}>Dokumentasi PHP</button></li>
              </ul>
            </div>

            <div className="space-y-3">
              <h4 className="text-white font-semibold text-xs uppercase tracking-wider">Arsitektur Siap Pakai</h4>
              <p className="text-xs text-[#9E9285]">
                Seluruh kode PHP Native, SQL Dump <code>database.sql</code>, dan konfigurasi Apache <code>.htaccess</code> siap di-copy ke XAMPP/cPanel.
              </p>
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
// Component: Product Card
// -------------------------------------------------------------
function ProductCard({
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
        <img
          src={product.primary_image}
          alt={product.name}
          className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition duration-500"
          loading="lazy"
        />
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
        <h3
          onClick={onSelect}
          className="font-serif-luxury font-bold text-base text-[#1F1C1A] group-hover:text-[#9B786F] transition cursor-pointer line-clamp-1 mb-1"
        >
          {product.name}
        </h3>
        <p className="text-xs text-[#736B63] line-clamp-2 leading-relaxed mb-4 flex-1">
          {product.short_description}
        </p>

        <div className="flex items-baseline gap-2 mb-4">
          <span className="font-bold text-base text-[#1F1C1A]">
            {formatRupiah(product.discount_price ?? product.price)}
          </span>
          {product.discount_price && (
            <span className="text-xs text-[#9E9285] line-through">
              {formatRupiah(product.price)}
            </span>
          )}
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
// Component: Checkout View
// -------------------------------------------------------------
function CheckoutView({
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
  const [paymentMethod, setPaymentMethod] = useState('Bank Transfer (BCA)');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const orderNumber = `ORD-20261002-${Math.floor(1000 + Math.random() * 9000)}`;
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
      grand_total: grandTotal,
      payment_method: paymentMethod,
      payment_status: paymentMethod.includes('BCA') ? 'paid' : 'unpaid',
      order_status: 'Pending',
      items: cart.map((it) => ({
        product_name: it.product.name,
        price: it.product.discount_price ?? it.product.price,
        quantity: it.quantity,
        total: (it.product.discount_price ?? it.product.price) * it.quantity
      })),
      created_at: new Date().toLocaleString('id-ID')
    };
    onOrderSuccess(newOrder);
  };

  return (
    <div className="py-10">
      <div className="container mx-auto px-4 lg:px-8 max-w-5xl">
        <h1 className="font-serif-luxury text-3xl font-normal text-[#1F1C1A] mb-8">
          Pengiriman & Pembayaran
        </h1>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Shipping Form */}
          <div className="lg:col-span-8 bg-white p-6 sm:p-8 rounded-2xl border border-[#E8DFD5] shadow-sm space-y-6 text-xs">
            <h2 className="font-serif-luxury text-xl font-normal text-[#1F1C1A] border-b border-[#E8DFD5] pb-3">
              1. Informasi Pengiriman
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="font-semibold block mb-1">Nama Lengkap *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 border border-[#E8DFD5] rounded-lg"
                />
              </div>
              <div>
                <label className="font-semibold block mb-1">No. WhatsApp / HP *</label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2 border border-[#E8DFD5] rounded-lg"
                />
              </div>
            </div>

            <div>
              <label className="font-semibold block mb-1">Email (Untuk Notifikasi & Invoice) *</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-[#E8DFD5] rounded-lg"
              />
            </div>

            <div>
              <label className="font-semibold block mb-1">Alamat Lengkap *</label>
              <textarea
                rows={2}
                required
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-3 py-2 border border-[#E8DFD5] rounded-lg"
              />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="font-semibold block mb-1">Provinsi</label>
                <input
                  type="text"
                  required
                  value={province}
                  onChange={(e) => setProvince(e.target.value)}
                  className="w-full px-3 py-2 border border-[#E8DFD5] rounded-lg"
                />
              </div>
              <div>
                <label className="font-semibold block mb-1">Kota / Kab</label>
                <input
                  type="text"
                  required
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-3 py-2 border border-[#E8DFD5] rounded-lg"
                />
              </div>
              <div>
                <label className="font-semibold block mb-1">Kecamatan</label>
                <input
                  type="text"
                  required
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  className="w-full px-3 py-2 border border-[#E8DFD5] rounded-lg"
                />
              </div>
              <div>
                <label className="font-semibold block mb-1">Kode Pos</label>
                <input
                  type="text"
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value)}
                  className="w-full px-3 py-2 border border-[#E8DFD5] rounded-lg"
                />
              </div>
            </div>

            <h2 className="font-serif-luxury text-xl font-normal text-[#1F1C1A] border-t border-[#E8DFD5] pt-6">
              2. Metode Pembayaran
            </h2>

            <div className="space-y-3">
              <label className="flex items-center gap-3 p-3.5 border border-[#E8DFD5] rounded-xl cursor-pointer hover:bg-[#FAF8F5]">
                <input
                  type="radio"
                  name="payment"
                  value="Bank Transfer (BCA)"
                  checked={paymentMethod === 'Bank Transfer (BCA)'}
                  onChange={() => setPaymentMethod('Bank Transfer (BCA)')}
                />
                <div>
                  <div className="font-semibold text-[#1F1C1A]">Transfer Bank BCA (Otomatis)</div>
                  <div className="text-[#736B63] text-[11px]">No. Rekening 8820-192-384 a/n PT Aura Botanica</div>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3.5 border border-[#E8DFD5] rounded-xl cursor-pointer hover:bg-[#FAF8F5]">
                <input
                  type="radio"
                  name="payment"
                  value="QRIS Instan"
                  checked={paymentMethod === 'QRIS Instan'}
                  onChange={() => setPaymentMethod('QRIS Instan')}
                />
                <div>
                  <div className="font-semibold text-[#1F1C1A]">QRIS Instan (GoPay, OVO, ShopeePay, DANA)</div>
                  <div className="text-[#736B63] text-[11px]">Konfirmasi pembayaran otomatis tanpa upload bukti</div>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3.5 border border-[#E8DFD5] rounded-xl cursor-pointer hover:bg-[#FAF8F5]">
                <input
                  type="radio"
                  name="payment"
                  value="Cash on Delivery (COD)"
                  checked={paymentMethod === 'Cash on Delivery (COD)'}
                  onChange={() => setPaymentMethod('Cash on Delivery (COD)')}
                />
                <div>
                  <div className="font-semibold text-[#1F1C1A]">Bayar di Tempat (COD)</div>
                  <div className="text-[#736B63] text-[11px]">Bayar tunai ke kurir saat barang sampai</div>
                </div>
              </label>
            </div>
          </div>

          {/* Right Summary */}
          <div className="lg:col-span-4 bg-white p-6 rounded-2xl border border-[#E8DFD5] shadow-sm space-y-4">
            <h3 className="font-serif-luxury text-lg font-normal border-b border-[#E8DFD5] pb-3">
              Rincian Pesanan
            </h3>

            <div className="max-h-60 overflow-y-auto space-y-2 text-xs divide-y divide-[#E8DFD5]">
              {cart.map((it) => (
                <div key={it.product.id} className="pt-2 first:pt-0 flex justify-between">
                  <span className="truncate max-w-[180px]">{it.product.name} (x{it.quantity})</span>
                  <span className="font-semibold">
                    {formatRupiah((it.product.discount_price ?? it.product.price) * it.quantity)}
                  </span>
                </div>
              ))}
            </div>

            <div className="border-t border-[#E8DFD5] pt-3 space-y-1.5 text-xs text-[#5C544E]">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>{formatRupiah(cartSubtotal)}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-700">
                  <span>Diskon Kupon</span>
                  <span>- {formatRupiah(discountAmount)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Ongkos Kirim</span>
                <span>{shippingCost === 0 ? 'Gratis' : formatRupiah(shippingCost)}</span>
              </div>
              <div className="flex justify-between font-bold text-sm text-[#1F1C1A] border-t border-[#E8DFD5] pt-2">
                <span>Total</span>
                <span>{formatRupiah(grandTotal)}</span>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 bg-[#2C2724] hover:bg-[#9B786F] text-white text-xs font-semibold rounded-xl uppercase tracking-wider transition shadow-md"
            >
              Konfirmasi & Pesan Sekarang
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// Component: Admin Dashboard
// -------------------------------------------------------------
function AdminDashboard({
  products,
  setProducts,
  categories,
  orders,
  setOrders,
  siteSettings,
  setSiteSettings,
  triggerToast,
  formatRupiah
}: {
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  categories: Category[];
  orders: Order[];
  setOrders: React.Dispatch<React.SetStateAction<Order[]>>;
  siteSettings: any;
  setSiteSettings: any;
  triggerToast: (msg: string) => void;
  formatRupiah: (val: number) => string;
}) {
  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'orders' | 'settings'>('overview');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form states for adding/editing product
  const [formName, setFormName] = useState('');
  const [formSku, setFormSku] = useState('');
  const [formCategory, setFormCategory] = useState(categories[0]?.name || 'Serum');
  const [formPrice, setFormPrice] = useState(150000);
  const [formStock, setFormStock] = useState(50);
  const [isFormOpen, setIsFormOpen] = useState(false);

  // KPI calculations
  const totalRevenue = useMemo(() => {
    return orders
      .filter((o) => o.payment_status === 'paid')
      .reduce((sum, o) => sum + o.grand_total, 0);
  }, [orders]);

  const pendingCount = useMemo(() => {
    return orders.filter((o) => o.order_status === 'Pending').length;
  }, [orders]);

  const lowStockCount = useMemo(() => {
    return products.filter((p) => p.stock <= 30).length;
  }, [products]);

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingProduct) {
      setProducts((prev) =>
        prev.map((p) =>
          p.id === editingProduct.id
            ? {
                ...p,
                name: formName,
                sku: formSku,
                category_name: formCategory,
                price: formPrice,
                stock: formStock
              }
            : p
        )
      );
      triggerToast('Produk berhasil diperbarui!');
    } else {
      const newP: Product = {
        id: Date.now(),
        sku: formSku || `AB-NEW-${Math.floor(100 + Math.random() * 900)}`,
        name: formName,
        slug: formName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        category_id: 1,
        category_name: formCategory,
        brand_id: 1,
        brand_name: 'AURA BOTANICA',
        short_description: 'Formula skincare botanical alami berkualitas tinggi.',
        full_description: 'Diformulasikan secara dermatologis untuk menutrisi kulit secara optimal.',
        ingredients: 'Aqua, Niacinamide, Glycerin, Centella Asiatica.',
        benefits: 'Mencerahkan dan memperbaiki skin barrier.',
        how_to_use: 'Gunakan secara teratur pada pagi dan malam hari.',
        volume_weight: '30 ml',
        price: formPrice,
        discount_price: null,
        stock: formStock,
        is_featured: false,
        is_bestseller: false,
        is_new_arrival: true,
        primary_image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=800&q=80',
        gallery_images: []
      };
      setProducts((prev) => [newP, ...prev]);
      triggerToast('Produk baru berhasil ditambahkan!');
    }
    setIsFormOpen(false);
    setEditingProduct(null);
  };

  const handleUpdateOrderStatus = (orderId: number, newStatus: any) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, order_status: newStatus } : o))
    );
    triggerToast(`Status pesanan diperbarui menjadi ${newStatus}`);
  };

  return (
    <div className="flex-1 bg-[#F5F2ED] p-6 lg:p-8">
      <div className="container mx-auto max-w-6xl space-y-6">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-[#E8DFD5] shadow-sm">
          <div>
            <div className="text-xs uppercase tracking-wider text-[#9B786F] font-bold">Admin Management Portal</div>
            <h1 className="font-serif-luxury text-2xl font-bold text-[#1F1C1A]">Aura Botanica Operations</h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setEditingProduct(null);
                setFormName('');
                setFormSku(`AB-${Math.floor(100 + Math.random() * 900)}`);
                setFormPrice(175000);
                setFormStock(50);
                setIsFormOpen(true);
              }}
              className="px-4 py-2 bg-[#9B786F] hover:bg-[#83635B] text-white text-xs font-semibold rounded-lg shadow-sm transition"
            >
              + Tambah Produk
            </button>
          </div>
        </div>

        {/* Tab switcher */}
        <div className="flex gap-2 border-b border-[#E8DFD5] pb-2 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 rounded-lg transition ${activeTab === 'overview' ? 'bg-[#2C2724] text-white' : 'text-[#736B63] hover:bg-white'}`}
          >
            📊 Ikhtisar KPI
          </button>
          <button
            onClick={() => setActiveTab('products')}
            className={`px-4 py-2 rounded-lg transition ${activeTab === 'products' ? 'bg-[#2C2724] text-white' : 'text-[#736B63] hover:bg-white'}`}
          >
            🧴 Katalog Produk ({products.length})
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-4 py-2 rounded-lg transition ${activeTab === 'orders' ? 'bg-[#2C2724] text-white' : 'text-[#736B63] hover:bg-white'}`}
          >
            📦 Pesanan Masuk ({orders.length})
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`px-4 py-2 rounded-lg transition ${activeTab === 'settings' ? 'bg-[#2C2724] text-white' : 'text-[#736B63] hover:bg-white'}`}
          >
            ⚙️ Konfigurasi Toko
          </button>
        </div>

        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-xl border border-[#E8DFD5] shadow-sm">
                <div className="text-[11px] uppercase tracking-wider text-[#736B63] font-semibold">Total Omset Penjualan</div>
                <div className="text-xl font-bold text-emerald-800 mt-1">{formatRupiah(totalRevenue)}</div>
              </div>
              <div className="bg-white p-5 rounded-xl border border-[#E8DFD5] shadow-sm">
                <div className="text-[11px] uppercase tracking-wider text-[#736B63] font-semibold">Total Pesanan</div>
                <div className="text-xl font-bold text-[#1F1C1A] mt-1">{orders.length}</div>
              </div>
              <div className="bg-white p-5 rounded-xl border border-[#E8DFD5] shadow-sm">
                <div className="text-[11px] uppercase tracking-wider text-[#736B63] font-semibold">Pesanan Pending</div>
                <div className="text-xl font-bold text-amber-700 mt-1">{pendingCount}</div>
              </div>
              <div className="bg-white p-5 rounded-xl border border-[#E8DFD5] shadow-sm">
                <div className="text-[11px] uppercase tracking-wider text-[#736B63] font-semibold">Peringatan Stok Rendah</div>
                <div className="text-xl font-bold text-rose-700 mt-1">{lowStockCount} item</div>
              </div>
            </div>

            {/* Recent Orders Overview */}
            <div className="bg-white p-6 rounded-2xl border border-[#E8DFD5] shadow-sm space-y-4">
              <h3 className="font-semibold text-sm">Pesanan Terbaru Masuk</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-[#FAF8F5] text-[#736B63] uppercase font-semibold border-b border-[#E8DFD5]">
                    <tr>
                      <th className="p-3">Order ID</th>
                      <th className="p-3">Pelanggan</th>
                      <th className="p-3">Total Belanja</th>
                      <th className="p-3">Metode Bayar</th>
                      <th className="p-3">Status</th>
                      <th className="p-3">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E8DFD5]">
                    {orders.slice(0, 5).map((o) => (
                      <tr key={o.id} className="hover:bg-[#FAF8F5]/80">
                        <td className="p-3 font-mono font-bold">{o.order_number}</td>
                        <td className="p-3">{o.customer_name}</td>
                        <td className="p-3 font-semibold">{formatRupiah(o.grand_total)}</td>
                        <td className="p-3">{o.payment_method}</td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-100 text-amber-800">
                            {o.order_status}
                          </span>
                        </td>
                        <td className="p-3">
                          <button
                            onClick={() => handleUpdateOrderStatus(o.id, 'Completed')}
                            className="px-2 py-1 bg-emerald-700 text-white rounded text-[11px]"
                          >
                            Tandai Selesai
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: PRODUCTS CRUD */}
        {activeTab === 'products' && (
          <div className="bg-white p-6 rounded-2xl border border-[#E8DFD5] shadow-sm space-y-4">
            <h3 className="font-semibold text-sm">Daftar Produk Skincare</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-[#FAF8F5] text-[#736B63] uppercase font-semibold border-b border-[#E8DFD5]">
                  <tr>
                    <th className="p-3">Produk</th>
                    <th className="p-3">SKU</th>
                    <th className="p-3">Kategori</th>
                    <th className="p-3">Harga</th>
                    <th className="p-3">Sisa Stok</th>
                    <th className="p-3">Aksi</th>
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
                        <span className={`font-bold ${p.stock <= 30 ? 'text-rose-700' : 'text-emerald-700'}`}>
                          {p.stock} unit
                        </span>
                      </td>
                      <td className="p-3 flex gap-2">
                        <button
                          onClick={() => {
                            setEditingProduct(p);
                            setFormName(p.name);
                            setFormSku(p.sku);
                            setFormCategory(p.category_name);
                            setFormPrice(p.price);
                            setFormStock(p.stock);
                            setIsFormOpen(true);
                          }}
                          className="px-2 py-1 bg-neutral-200 text-neutral-800 rounded hover:bg-neutral-300"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Hapus produk "${p.name}"?`)) {
                              setProducts((prev) => prev.filter((item) => item.id !== p.id));
                              triggerToast('Produk berhasil dihapus!');
                            }
                          }}
                          className="px-2 py-1 bg-rose-100 text-rose-700 rounded hover:bg-rose-200"
                        >
                          Hapus
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: ORDERS MANAGEMENT */}
        {activeTab === 'orders' && (
          <div className="bg-white p-6 rounded-2xl border border-[#E8DFD5] shadow-sm space-y-4">
            <h3 className="font-semibold text-sm">Semua Pesanan Masuk</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-[#FAF8F5] text-[#736B63] uppercase font-semibold border-b border-[#E8DFD5]">
                  <tr>
                    <th className="p-3">No. Order</th>
                    <th className="p-3">Pelanggan</th>
                    <th className="p-3">Alamat</th>
                    <th className="p-3">Total Belanja</th>
                    <th className="p-3">Status Pesanan</th>
                    <th className="p-3">Ubah Status</th>
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
                      <td className="p-3 text-[11px] max-w-xs">{ord.city}, {ord.province}</td>
                      <td className="p-3 font-semibold">{formatRupiah(ord.grand_total)}</td>
                      <td className="p-3">
                        <span className="px-2.5 py-1 text-[11px] font-semibold rounded-full bg-amber-100 text-amber-800">
                          {ord.order_status}
                        </span>
                      </td>
                      <td className="p-3">
                        <select
                          value={ord.order_status}
                          onChange={(e) => handleUpdateOrderStatus(ord.id, e.target.value)}
                          className="px-2 py-1 bg-[#FAF8F5] border border-[#E8DFD5] rounded text-xs"
                        >
                          <option value="Pending">Pending</option>
                          <option value="Confirmed">Confirmed</option>
                          <option value="Processing">Processing</option>
                          <option value="Shipped">Shipped</option>
                          <option value="Completed">Completed</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 4: SETTINGS */}
        {activeTab === 'settings' && (
          <div className="bg-white p-6 rounded-2xl border border-[#E8DFD5] shadow-sm max-w-xl space-y-4 text-xs">
            <h3 className="font-semibold text-sm border-b border-[#E8DFD5] pb-2">Pengaturan Toko</h3>
            <div>
              <label className="font-semibold block mb-1">Nama Toko / Brand</label>
              <input
                type="text"
                value={siteSettings.siteName}
                onChange={(e) => setSiteSettings({ ...siteSettings, siteName: e.target.value })}
                className="w-full px-3 py-2 border border-[#E8DFD5] rounded-lg"
              />
            </div>
            <div>
              <label className="font-semibold block mb-1">Teks Announcement Bar</label>
              <input
                type="text"
                value={siteSettings.announcementBar}
                onChange={(e) => setSiteSettings({ ...siteSettings, announcementBar: e.target.value })}
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

        {/* Add/Edit Product Modal */}
        {isFormOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
            <div className="bg-white p-6 rounded-2xl border border-[#E8DFD5] w-full max-w-md shadow-2xl text-xs space-y-4">
              <h3 className="font-bold text-sm text-[#1F1C1A]">
                {editingProduct ? 'Edit Produk' : 'Tambah Produk Skincare Baru'}
              </h3>
              <form onSubmit={handleSaveProduct} className="space-y-3">
                <div>
                  <label className="font-semibold block mb-1">Nama Produk</label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="w-full px-3 py-2 border border-[#E8DFD5] rounded-lg"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-semibold block mb-1">SKU</label>
                    <input
                      type="text"
                      required
                      value={formSku}
                      onChange={(e) => setFormSku(e.target.value)}
                      className="w-full px-3 py-2 border border-[#E8DFD5] rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="font-semibold block mb-1">Kategori</label>
                    <select
                      value={formCategory}
                      onChange={(e) => setFormCategory(e.target.value)}
                      className="w-full px-3 py-2 border border-[#E8DFD5] rounded-lg"
                    >
                      {categories.map((c) => (
                        <option key={c.id} value={c.name}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-semibold block mb-1">Harga (Rp)</label>
                    <input
                      type="number"
                      required
                      value={formPrice}
                      onChange={(e) => setFormPrice(Number(e.target.value))}
                      className="w-full px-3 py-2 border border-[#E8DFD5] rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="font-semibold block mb-1">Stok Unit</label>
                    <input
                      type="number"
                      required
                      value={formStock}
                      onChange={(e) => setFormStock(Number(e.target.value))}
                      className="w-full px-3 py-2 border border-[#E8DFD5] rounded-lg"
                    />
                  </div>
                </div>
                <div className="flex gap-2 justify-end pt-2">
                  <button
                    type="button"
                    onClick={() => setIsFormOpen(false)}
                    className="px-4 py-2 bg-neutral-100 rounded-lg hover:bg-neutral-200"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#2C2724] text-white rounded-lg font-semibold hover:bg-[#9B786F]"
                  >
                    Simpan
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
