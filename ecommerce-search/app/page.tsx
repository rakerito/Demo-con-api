"use client";

import { useState, useRef, useCallback } from "react";
import { Product, ExternalOffer } from "@/types";

// ─── Asset paths ──────────────────────────────────────────────────────────────
const A = "/assets/";
const imgMenu = `${A}f5c89.svg`;
const imgCart = `${A}d6bf2.svg`;
const imgSearch = `${A}39f74.svg`;
const imgSearchBtn = `${A}9f889.svg`;
const imgSliders = `${A}9edcf.svg`;
const imgHeart = `${A}753a8.svg`;
const imgShoppingBag = `${A}211d0.svg`;
const imgHouse = `${A}3d36c.svg`;
const imgCatalog = `${A}5cb3a.svg`;
const imgBagNav = `${A}9b028.svg`;
const imgUser = `${A}5fa02.svg`;
const imgShield = `${A}7829a.svg`;
const imgCpu = `${A}68bce.svg`;
const imgCircleX = `${A}3b4ab.svg`;

const productImages = [
  `${A}bd821.png`,
  `${A}eaeaf.png`,
  `${A}74b8e.png`,
  `${A}dbb02.png`,
  `${A}e54d7.png`,
  `${A}748cc.png`,
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatPrice(n: number): string {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    maximumFractionDigits: 0,
  }).format(n);
}

// ─── Types ────────────────────────────────────────────────────────────────────
interface SearchApiResponse { internalResults: Product[]; totalInternal: number; }
interface ExternalApiResponse { bestOffer: (ExternalOffer & { reasons?: string[] }) | null; candidateCount: number; }

// ─── Constants ────────────────────────────────────────────────────────────────
const CATEGORIES = ["", "Laptops", "Celulares", "Tablets", "Accesorios", "Monitores", "Audio", "Gaming", "Wearables", "Almacenamiento"];
const SUGGESTIONS = ["laptop gaming", "smartphone", "auriculares bluetooth", "monitor 4k", "teclado mecánico", "SSD NVMe", "smartwatch", "tablet"];
const SORT_OPTIONS = [
  { value: "relevance", label: "Relevancia" },
  { value: "price_asc", label: "Menor precio" },
  { value: "price_desc", label: "Mayor precio" },
  { value: "rating", label: "Mejor calificados" },
];
const CAT_MAP: Record<string, string> = {
  Laptops: "Electrónicos", Celulares: "Smartphones", Tablets: "Tablets",
  Accesorios: "Periféricos", Monitores: "Monitores", Audio: "Audio",
  Gaming: "Gaming", Wearables: "Wearables", Almacenamiento: "Almacenamiento",
};

// Static home products
const HOME_PRODUCTS = [
  { id: "h1", name: "Laptop UltraBook Pro 15", description: "Intel Core i7, 16GB RAM, 512GB SSD", price: 15999, originalPrice: 18999, brand: "TechPro", rating: 4.7, reviewCount: 342, stock: 15, freeShipping: true, deliveryDays: 3 },
  { id: "h2", name: "Smartphone Galaxy X12 Pro", description: "200MP, 5000mAh, AMOLED 6.8\"", price: 8499, originalPrice: 9999, brand: "Samsung", rating: 4.8, reviewCount: 1245, stock: 42, freeShipping: true, deliveryDays: 2 },
  { id: "h3", name: "Teclado Mecánico RGB TKL", description: "Cherry MX Red, aluminio, RGB", price: 1450, originalPrice: 1799, brand: "Corsair", rating: 4.5, reviewCount: 789, stock: 22, freeShipping: false, deliveryDays: 3 },
  { id: "h4", name: 'Monitor Gaming QHD 27"', description: "165Hz, 1ms, IPS, G-Sync / FreeSync", price: 5299, originalPrice: 6500, brand: "AOC", rating: 4.6, reviewCount: 567, stock: 8, freeShipping: true, deliveryDays: 5 },
  { id: "h5", name: "Auriculares Noise Cancelling", description: "30h batería, Hi-Res, mic integrado", price: 2899, originalPrice: 3499, brand: "Sony", rating: 4.9, reviewCount: 2103, stock: 30, freeShipping: true, deliveryDays: 2 },
  { id: "h6", name: "Tablet Pro 12.9 M2", description: "Chip M2, Liquid Retina XDR, 256GB", price: 18999, originalPrice: 21999, brand: "Apple", rating: 4.8, reviewCount: 892, stock: 12, freeShipping: true, deliveryDays: 1 },
  { id: "h7", name: 'Smart TV QLED 55" 4K', description: "120Hz, HDR10+, 4 HDMI 2.1, Tizen OS", price: 11999, originalPrice: 14999, brand: "Samsung", rating: 4.6, reviewCount: 456, stock: 18, freeShipping: true, deliveryDays: 7 },
  { id: "h8", name: "Consola Gaming NextGen X", description: "SSD 1TB, 8K, ray tracing, retro-compat.", price: 13499, originalPrice: 14999, brand: "Microsoft", rating: 4.8, reviewCount: 3201, stock: 7, freeShipping: true, deliveryDays: 3 },
];

// ─── ProductCard ─────────────────────────────────────────────────────────────
function ProductCard({ product, idx, onClick }: { product: any; idx: number; onClick: () => void }) {
  const defaultImg = productImages[idx % productImages.length];
  const img = product.thumbnailUrl || (product.images && product.images[0]) || defaultImg;

  // Normalize fields between Product, ExternalOffer, and HOME_PRODUCTS
  const name = product.name || product.title;
  const brand = product.brand || (product.isExternal ? "Búsqueda Externa" : "MXcomp");
  const price = product.price;
  const original = product.originalPrice;
  const discount = original ? Math.round(((original - price) / original) * 100) : 0;
  const rating = product.rating || 4.5;
  const revCount = product.reviewCount || Math.floor(Math.random() * 500) + 10;
  const stars = "★".repeat(Math.floor(rating)) + "☆".repeat(5 - Math.floor(rating));
  const desc = product.description || (product.isExternal ? "Producto de proveedor externo asociado." : "");
  const stock = product.stock !== undefined ? product.stock : (product.availability === "limited" ? 5 : 50);

  return (
    <div className="product-card" onClick={onClick}>
      {/* Image */}
      <div className="product-img-wrap">
        <img alt={name} src={img} className="product-img" />
        {discount > 0 && <span className="badge-disc">-{discount}%</span>}
        {stock <= 10 && <span className="badge-stock">⚡ {stock} left</span>}
        {product.isExternal && <span className="badge-ext" style={{ backgroundColor: "#2aabb3" }}>🌐 PROVEEDOR WEB</span>}
        <button className="btn-heart" aria-label="Favorito" onClick={(e) => e.stopPropagation()}>
          <img alt="" src={imgHeart} style={{ width: 16, height: 16 }} />
        </button>
      </div>

      {/* Body */}
      <div className="product-body">
        <span className="product-brand">{brand}</span>
        <p className="product-name">{name}</p>
        <p className="product-desc">{desc.substring(0, 55)}…</p>

        <div className="product-rating">
          <span className="stars">{stars}</span>
          <span className="review-ct">({revCount.toLocaleString("es-MX")})</span>
        </div>

        <div className="product-price-row">
          <div>
            {original && <span className="price-old">{formatPrice(original)}</span>}
            <span className="price-cur">{formatPrice(price)}</span>
            <span className="price-mxn"> MXN</span>
          </div>
          <span className="delivery-tag">
            {product.freeShipping ? "🚚 Gratis" : `📦 ${product.deliveryDays}d`}
          </span>
        </div>

        <button className="btn-add" onClick={(e) => { e.stopPropagation(); onClick(); }}>
          <img alt="" src={imgShoppingBag} style={{ width: 14, height: 14 }} />
          Agregar al carrito
        </button>
      </div>
    </div>
  );
}

// ─── ModalProductDetail ───────────────────────────────────────────────────────
function ModalProductDetail({ product, onClose }: { product: any; onClose: () => void }) {
  const [showRawInfo, setShowRawInfo] = useState(false);

  const defaultImg = productImages[0];
  const img = product.thumbnailUrl || (product.images && product.images[0]) || defaultImg;

  const name = product.name || product.title;
  const brand = product.brand || (product.isExternal ? "Búsqueda Externa" : "MXcomp");
  const desc = product.description || (product.isExternal ? "Este producto se envía desde los almacenes de nuestro proveedor asociado. Cumple con todos los estándares de calidad y garantía de MXcomp." : "Sin descripción adicional.");
  const rating = product.rating || 4.5;
  const stars = "★".repeat(Math.floor(rating)) + "☆".repeat(5 - Math.floor(rating));

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content fade-in" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>×</button>

        <div className="modal-body">
          <div className="modal-img-wrap">
            <img alt={name} src={img} className="modal-img" />
          </div>

          <div className="modal-info">
            <span className="modal-brand">{brand}</span>
            <h2 className="modal-title">{name}</h2>
            <div className="modal-rating">
              <span className="stars">{stars}</span>
              <span>{rating.toFixed(1)} / 5.0</span>
            </div>

            <p className="modal-desc">{desc}</p>

            <div className="modal-price-box">
              <div className="modal-price">{formatPrice(product.price)} <span className="modal-mxn">MXN</span></div>
              <div className="modal-delivery">
                {product.freeShipping ? "Envío Gratis 🚚" : `Llega en ${product.deliveryDays} días 📦`}
              </div>
            </div>

            <button className="modal-btn-buy">Comprar ahora</button>

            {product.isExternal && product.raw && (
              <div className="modal-dev-info">
                {!showRawInfo ? (
                  <button className="btn-dev-reveal" onClick={() => setShowRawInfo(true)}>
                    🔍 Info del Proveedor (API Demo)
                  </button>
                ) : (
                  <div className="dev-raw-box fade-in">
                    <p className="dev-raw-title">Datos crudos de la API (Tavily/Serper):</p>
                    <ul>
                      <li><strong>Proveedor original:</strong> {product.raw.source}</li>
                      <li><strong>Precio original:</strong> {formatPrice(product.raw.originalPrice)} <em>(Mostrando un {(((product.price / product.raw.originalPrice) - 1) * 100).toFixed(0)}% de margen en UI)</em></li>
                      {product.raw.url && (
                        <li><strong>URL de origen:</strong> <a href={product.raw.url} target="_blank" rel="noreferrer" style={{ color: "#3b82f6", textDecoration: "underline" }}>Ver enlace</a></li>
                      )}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function Home() {
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);
  const [activeCategory, setActiveCategory] = useState("Todos");
  const [sortBy, setSortBy] = useState("relevance");
  const [showSort, setShowSort] = useState(false);
  const [activeNav, setActiveNav] = useState("Inicio");

  const [internalResults, setInternalResults] = useState<Product[]>([]);
  const [externalOffer, setExternalOffer] = useState<(ExternalOffer & { reasons?: string[] }) | null>(null);
  const [loadingInt, setLoadingInt] = useState(false);
  const [loadingExt, setLoadingExt] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const [selectedProduct, setSelectedProduct] = useState<any>(null);

  const inputRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const isLoading = loadingInt || loadingExt;
  const showResults = hasSearched && query.trim().length > 0;

  const doSearch = useCallback(async (q: string, cat: string, sort: string) => {
    const trimmed = q.trim();
    if (!trimmed) return;
    if (abortRef.current) abortRef.current.abort();
    abortRef.current = new AbortController();
    setHasSearched(true); setLoadingInt(true); setLoadingExt(true);
    setInternalResults([]); setExternalOffer(null);

    const dbCat = CAT_MAP[cat] || "";
    const params = new URLSearchParams({ q: trimmed, sort });
    if (dbCat) params.set("category", dbCat);

    fetch(`/api/search?${params}`, { signal: abortRef.current.signal })
      .then(r => r.json() as Promise<SearchApiResponse>)
      .then(d => setInternalResults(d.internalResults))
      .catch(() => { }).finally(() => setLoadingInt(false));

    fetch(`/api/external?q=${encodeURIComponent(trimmed)}`, { signal: abortRef.current.signal })
      .then(r => r.json() as Promise<ExternalApiResponse>)
      .then(d => { setExternalOffer(d.bestOffer); })
      .catch(() => { }).finally(() => setLoadingExt(false));
  }, []);

  const handleSearch = () => doSearch(query, activeCategory, sortBy);
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSearch();
    if (e.key === "Escape") { setQuery(""); setHasSearched(false); }
  };
  const handleCategory = (cat: string) => {
    setActiveCategory(cat);
    if (hasSearched) doSearch(query, cat, sortBy);
  };
  const handleSort = (s: string) => { setSortBy(s); setShowSort(false); if (hasSearched) doSearch(query, activeCategory, s); };

  // Combine results
  const allResults = [...internalResults];
  if (externalOffer && !loadingExt) {
    // Insert external offer into the main grid
    allResults.unshift(externalOffer as any);
  }

  return (
    <div className="app-shell">

      {/* ════ HEADER ════════════════════════════════════════════════════════ */}
      <header className="app-header">
        <div className="header-inner">
          {/* Logo */}
          <div className="logo-group">
            <button className="icon-btn" aria-label="Menú">
              <img alt="" src={imgMenu} style={{ width: 24, height: 24, filter: "brightness(0) invert(1)" }} />
            </button>
            <a href="/" className="logo-link">
              <span className="logo-mx">MX</span>
              <span className="logo-comp">comp</span>
            </a>
          </div>

          {/* Desktop search (visible md+) */}
          <div className={`search-box-desktop ${focused ? "search-focused" : ""}`}>
            <img alt="" src={imgSearch} style={{ width: 18, height: 18, opacity: 0.5 }} />
            <input
              ref={inputRef}
              id="search-input"
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              onKeyDown={handleKeyDown}
              placeholder="¿Qué estás buscando?"
              className="search-input-desktop"
            />
            {query && (
              <button onClick={() => { setQuery(""); setHasSearched(false); }} className="clear-btn" aria-label="Limpiar">×</button>
            )}
          </div>

          {/* Right actions */}
          <div className="header-actions">
            <div className="sort-wrap">
              <button onClick={() => setShowSort(v => !v)} className="icon-btn" aria-label="Ordenar">
                <img alt="" src={imgSliders} style={{ width: 22, height: 22, filter: "brightness(0) invert(1)" }} />
              </button>
              {showSort && (
                <div className="sort-dropdown">
                  {SORT_OPTIONS.map(o => (
                    <button key={o.value} onClick={() => handleSort(o.value)}
                      className={`sort-item ${sortBy === o.value ? "sort-item-active" : ""}`}>
                      {o.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <button
              id="search-btn-desktop"
              onClick={handleSearch}
              disabled={isLoading || !query.trim()}
              className="btn-search-header"
            >
              {isLoading ? <span className="spinner" /> : <img alt="" src={imgSearchBtn} style={{ width: 18, height: 18, filter: "brightness(0) invert(1)" }} />}
              <span>Buscar</span>
            </button>
            <button className="icon-btn cart-btn" aria-label="Carrito">
              <img alt="" src={imgCart} style={{ width: 24, height: 24, filter: "brightness(0) invert(1)" }} />
              <span className="cart-badge">3</span>
            </button>
          </div>
        </div>

        {/* Mobile search bar */}
        <div className="mobile-search-row">
          <div className={`search-box-mobile ${focused ? "search-focused" : ""}`}>
            <img alt="" src={imgSearch} style={{ width: 16, height: 16, opacity: 0.5, flexShrink: 0 }} />
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              onKeyDown={handleKeyDown}
              placeholder="¿Qué estás buscando?"
              className="search-input-mobile"
            />
            {query && <button onClick={() => { setQuery(""); setHasSearched(false); }} className="clear-btn">×</button>}
          </div>
          <button onClick={handleSearch} disabled={isLoading || !query.trim()} className="btn-icon-teal">
            {isLoading ? <span className="spinner" /> : <img alt="" src={imgSearchBtn} style={{ width: 18, height: 18, filter: "brightness(0) invert(1)" }} />}
          </button>
          <div className="sort-wrap">
            <button onClick={() => setShowSort(v => !v)} className="btn-icon-teal">
              <img alt="" src={imgSliders} style={{ width: 18, height: 18, filter: "brightness(0) invert(1)" }} />
            </button>
            {showSort && (
              <div className="sort-dropdown sort-dropdown-mobile">
                {SORT_OPTIONS.map(o => (
                  <button key={o.value} onClick={() => handleSort(o.value)}
                    className={`sort-item ${sortBy === o.value ? "sort-item-active" : ""}`}>
                    {o.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
        {/* ─── QUICK FILTERS OVERLAY ────────────────────────────────────────── */}
        {focused && (
          <div className="quick-filters-overlay fade-in">
            <div className="qf-container">
              <div className="qf-section">
                <span className="qf-title">¿Qué dispositivo buscas?</span>
                <div className="qf-chips">
                  {["Celular", "Laptop", "Tablet", "Smartwatch", "Audífonos"].map(f => (
                    <button key={f} className="qf-chip" onMouseDown={(e) => {
                      e.preventDefault();
                      const newQ = query ? `${query} ${f}` : f;
                      setQuery(newQ);
                      inputRef.current?.focus();
                    }}>{f}</button>
                  ))}
                </div>
              </div>

              <div className="qf-section">
                <span className="qf-title">Marcas</span>
                <div className="qf-chips">
                  {["Apple", "Samsung", "Motorola", "Xiaomi", "Asus", "HP"].map(f => (
                    <button key={f} className="qf-chip" onMouseDown={(e) => {
                      e.preventDefault();
                      const newQ = query ? `${query} ${f}` : f;
                      setQuery(newQ);
                      inputRef.current?.focus();
                    }}>{f}</button>
                  ))}
                </div>
              </div>

              <div className="qf-section">
                <span className="qf-title">Características</span>
                <div className="qf-chips">
                  {["128GB", "256GB", "512GB", "8GB RAM", "16GB RAM", "OLED"].map(f => (
                    <button key={f} className="qf-chip" onMouseDown={(e) => {
                      e.preventDefault();
                      const newQ = query ? `${query} ${f}` : f;
                      setQuery(newQ);
                      inputRef.current?.focus();
                    }}>{f}</button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* ════ CATEGORIES BAR ════════════════════════════════════════════════ */}
      <nav className="cat-bar" aria-label="Categorías">
        <div className="cat-inner">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              id={`cat-${cat.toLowerCase().replace(/\s+/g, "-")}`}
              onClick={() => handleCategory(cat)}
              className={`cat-chip ${activeCategory === cat ? "cat-chip-active" : ""}`}
            >
              {cat}
            </button>
          ))}
        </div>
      </nav>

      {/* ════ MAIN CONTENT ══════════════════════════════════════════════════ */}
      <main className="main-content">

        {/* ── Suggestions strip ─────────────────────────────────────────── */}
        {!showResults && (
          <div className="suggestions-row">
            <span className="suggestions-label">Búsquedas populares:</span>
            {SUGGESTIONS.map(s => (
              <button key={s} id={`sug-${s.replace(/\s+/g, "-")}`}
                onClick={() => { setQuery(s); doSearch(s, activeCategory, sortBy); }}
                className="sug-chip">
                {s}
              </button>
            ))}
          </div>
        )}

        {showResults ? (
          /* ══ RESULTS VIEW ═══════════════════════════════════════════════ */
          <div className="results-wrapper">

            {/* Stats */}
            {!loadingInt && (
              <div className="results-stats">
                <p className="results-title">Resultados para &ldquo;<em>{query}</em>&rdquo;</p>
                <span className="results-count">{allResults.length} producto{allResults.length !== 1 ? "s" : ""}</span>
              </div>
            )}

            {/* ── Internal & External catalog ───────────────────────────── */}
            <section>
              {loadingInt ? (
                <div className="products-grid">
                  {[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="skeleton" style={{ height: 300 }} />)}
                </div>
              ) : allResults.length > 0 ? (
                <div className="products-grid">
                  {allResults.map((p, i) => (
                    <ProductCard
                      key={p.id || i}
                      product={p}
                      idx={i}
                      onClick={() => setSelectedProduct(p)}
                    />
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <img alt="" src={imgSearch} style={{ width: 48, height: 48, opacity: 0.25 }} />
                  <p className="empty-title">Sin resultados para &ldquo;{query}&rdquo;</p>
                  <p className="empty-sub">Intenta con otro término o cambia los filtros</p>
                </div>
              )}
            </section>
          </div>

        ) : (
          /* ══ HOME VIEW ══════════════════════════════════════════════════ */
          <div className="home-wrapper">

            {/* Hero banner */}
            <div className="hero-banner">
              <div className="hero-text">
                <span className="hero-badge">OFERTA DEL MES</span>
                <h1 className="hero-title">Consigue las mejores ofertas</h1>
                <p className="hero-sub">Hasta 40% de descuento en productos seleccionados.</p>
                <button className="btn-hero">Ver ofertas</button>
              </div>
              <div className="hero-decoration" aria-hidden="true">
                <span className="hero-deco-icon">🛍️</span>
              </div>
            </div>

            {/* Featured brands */}
            <div className="brands-section">
              <h2 className="section-title">Marcas Destacadas</h2>
              <div className="brands-row">
                {[imgShield, imgCpu, imgCircleX, imgCircleX, imgCircleX].map((icon, i) => (
                  <div key={i} className="brand-card">
                    <img alt="marca" src={icon} style={{ width: 36, height: 24, objectFit: "contain" }} />
                  </div>
                ))}
              </div>
            </div>

            {/* Products */}
            <div className="new-products-section">
              <div className="section-header-row">
                <h2 className="section-title" style={{ marginBottom: 0 }}>Productos Nuevos</h2>
                <button className="btn-see-all">Ver todo →</button>
              </div>
              <div className="products-grid">
                {HOME_PRODUCTS.map((p, i) => (
                  <ProductCard
                    key={p.id}
                    product={p as unknown as Product}
                    idx={i}
                    onClick={() => setSelectedProduct(p)}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ════ BOTTOM NAV (mobile only) ══════════════════════════════════════ */}
      <nav className="bottom-nav" aria-label="Navegación principal">
        {[
          { icon: imgHouse, label: "Inicio" },
          { icon: imgCatalog, label: "Catálogo" },
          { icon: imgBagNav, label: "Carrito" },
          { icon: imgUser, label: "Perfil" },
        ].map(({ icon, label }) => {
          const active = activeNav === label;
          return (
            <button
              key={label}
              id={`nav-${label.toLowerCase()}`}
              onClick={() => setActiveNav(label)}
              className={`bottom-nav-item ${active ? "bottom-nav-active" : ""}`}
            >
              <img
                alt={label}
                src={icon}
                style={{
                  width: 22, height: 22,
                  filter: active ? "invert(52%) sepia(80%) saturate(350%) hue-rotate(152deg)" : "none"
                }}
              />
              <span>{label}</span>
            </button>
          );
        })}
      </nav>

      {/* ════ FOOTER (desktop only) ═════════════════════════════════════════ */}
      <footer className="app-footer">
        MXcomp © {new Date().getFullYear()} &nbsp;·&nbsp; Demo E-commerce &nbsp;·&nbsp;
        Impulsado por <span style={{ color: "#2aabb3" }}>Tavily</span> &amp; <span style={{ color: "#10b981" }}>Serper.dev</span>
      </footer>

      {/* ════ MODAL ═════════════════════════════════════════════════════════ */}
      {selectedProduct && (
        <ModalProductDetail
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      )}

    </div>
  );
}
