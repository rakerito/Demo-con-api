"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Product, ExternalOffer } from "@/types";
import {
  buildShoppingSearchRequest,
  EMPTY_SHOPPING_ANSWERS,
  getNextShoppingStep,
  getShoppingCompletionReply,
  getShoppingOptions,
  getShoppingQuestion,
  OTHER_OPTION,
  ShoppingAnswers,
} from "@/lib/assistant";

// ─── Asset paths ──────────────────────────────────────────────────────────────
const A = "/assets/";
const imgMenu = `${A}f5c89.svg`;
const imgCart = `${A}d6bf2.svg`;
const imgHeart = `${A}753a8.svg`;
const imgShoppingBag = `${A}211d0.svg`;
const imgHouse = `${A}3d36c.svg`;
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
interface ChatMessage { role: "assistant" | "user"; content: string; }
interface AssistantApiResponse { reply: string; ready: boolean; options: string[]; }
interface ExternalApiResponse {
  offers: ExternalOffer[];
  candidateCount: number;
  rawResultCount?: number;
  unparsedResultCount?: number;
  error?: string;
  upstreamStatus?: number;
  upstreamMessage?: string;
}

function getSerpApiErrorMessage(error?: string, status?: number, detail?: string): string {
  const statusText = status ? ` (HTTP ${status})` : "";
  if (error === "API_KEY_MISSING") return "Falta configurar la clave de SerpApi en el servidor.";
  if (error === "INVALID_API_KEY") return `SerpApi rechazó la clave configurada${statusText}. Revísala en el entorno del servidor.`;
  if (error === "INVALID_REQUEST") return `SerpApi rechazó los parámetros de búsqueda${statusText}.`;
  if (error === "ACCOUNT_RESTRICTED") return `SerpApi rechazó la solicitud por acceso, plan o cuota${statusText}. Revisa el estado de la cuenta.`;
  if (error === "API_ERROR_RESPONSE") {
    return `SerpApi devolvió un error${statusText}: ${detail || "sin detalle adicional"}`;
  }
  if (error === "UPSTREAM_ERROR") return `SerpApi tuvo un fallo temporal${statusText}. Inténtalo de nuevo.`;
  return `No se pudo obtener una respuesta válida de SerpApi${statusText}.`;
}

// ─── Constants ────────────────────────────────────────────────────────────────
const INITIAL_MESSAGES: ChatMessage[] = [
  {
    role: "assistant",
    content: "Hola, soy tu asesor de compra. Primero elige la categoría; después guardaremos el producto, tu presupuesto y lo que más te importa.",
  },
];

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
                    <p className="dev-raw-title">Datos de búsqueda Google Shopping (SerpApi):</p>
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
  const [assistantOpen, setAssistantOpen] = useState(false);
  const [activeNav, setActiveNav] = useState("Inicio");
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [shoppingAnswers, setShoppingAnswers] = useState<ShoppingAnswers>(EMPTY_SHOPPING_ANSWERS);
  const [messageInput, setMessageInput] = useState("");
  const [assistantBusy, setAssistantBusy] = useState(false);
  const [assistantReady, setAssistantReady] = useState(false);
  const [assistantError, setAssistantError] = useState("");
  const [searchResultMessage, setSearchResultMessage] = useState("");
  const [replyOptions, setReplyOptions] = useState<string[]>(getShoppingOptions("category", EMPTY_SHOPPING_ANSWERS));
  const [otherSelected, setOtherSelected] = useState(false);
  const [assistantOffers, setAssistantOffers] = useState<ExternalOffer[]>([]);
  const [searchingOffers, setSearchingOffers] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const transcriptEndRef = useRef<HTMLDivElement>(null);
  const messageInputRef = useRef<HTMLInputElement>(null);
  const currentStep = getNextShoppingStep(shoppingAnswers);
  const userTurnCount = Object.values(shoppingAnswers).filter(Boolean).length;

  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, assistantBusy]);

  useEffect(() => {
    if (otherSelected) messageInputRef.current?.focus();
  }, [otherSelected]);

  async function sendAnswer(content: string) {
    const trimmed = content.trim();
    if (!trimmed || assistantBusy || currentStep === "complete") return;

    const nextAnswers = { ...shoppingAnswers, [currentStep]: trimmed };
    const nextStep = getNextShoppingStep(nextAnswers);
    const nextMessages = [...messages, { role: "user" as const, content: trimmed }];
    setShoppingAnswers(nextAnswers);
    setMessages(nextMessages);
    setMessageInput("");
    setReplyOptions([]);
    setOtherSelected(false);
    setAssistantBusy(true);
    setAssistantError("");

    try {
      const response = await fetch("/api/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers: nextAnswers }),
      });
      if (!response.ok) throw new Error("Assistant request failed");

      const data = await response.json() as AssistantApiResponse;
      setMessages([...nextMessages, { role: "assistant", content: data.reply }]);
      setAssistantReady(data.ready);
      setReplyOptions(data.options);
    } catch {
      const ready = nextStep === "complete";
      setMessages([
        ...nextMessages,
        {
          role: "assistant",
          content: ready ? getShoppingCompletionReply(nextAnswers) : getShoppingQuestion(nextStep, nextAnswers),
        },
      ]);
      setAssistantReady(ready);
      setReplyOptions(ready ? [] : getShoppingOptions(nextStep, nextAnswers));
      setAssistantError("");
    } finally {
      setAssistantBusy(false);
      messageInputRef.current?.focus();
    }
  }

  async function searchOffers() {
    const searchRequest = buildShoppingSearchRequest(shoppingAnswers);
    const query = searchRequest.query;
    if (!query || searchingOffers) return;

    setSearchingOffers(true);
    setAssistantError("");
    setSearchResultMessage("");
    setAssistantOffers([]);
    setHasSearched(true);
    try {
      const params = new URLSearchParams({ q: query });
      if (searchRequest.minPrice !== undefined) params.set("min_price", String(searchRequest.minPrice));
      if (searchRequest.maxPrice !== undefined) params.set("max_price", String(searchRequest.maxPrice));
      const response = await fetch(`/api/external?${params.toString()}`);
      const data = await response.json() as ExternalApiResponse;
      if (!response.ok) {
        setSearchResultMessage(getSerpApiErrorMessage(data.error, data.upstreamStatus, data.upstreamMessage));
        return;
      }

      setAssistantOffers(data.offers);
      if (data.offers.length === 0) {
        setSearchResultMessage(data.rawResultCount === 0
          ? "Google Shopping no devolvió resultados para esta búsqueda. No hay filtros de tiendas configurados; prueba con el modelo o tipo de producto exacto."
          : `Google Shopping devolvió ${data.rawResultCount} resultados, pero ${data.unparsedResultCount ?? data.rawResultCount} no tenían un precio válido para comparar.`);
      }
    } catch {
      setSearchResultMessage("No pudimos conectar con SerpApi. Revisa la conexión e inténtalo de nuevo.");
    } finally {
      setSearchingOffers(false);
    }
  }

  function resetAssistant() {
    setMessages(INITIAL_MESSAGES);
    setShoppingAnswers(EMPTY_SHOPPING_ANSWERS);
    setMessageInput("");
    setAssistantBusy(false);
    setAssistantReady(false);
    setAssistantError("");
    setSearchResultMessage("");
    setReplyOptions(getShoppingOptions("category", EMPTY_SHOPPING_ANSWERS));
    setOtherSelected(false);
    setAssistantOffers([]);
    setSearchingOffers(false);
    setHasSearched(false);
    setAssistantOpen(true);
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
            <Link href="/" className="logo-link" onClick={() => { setAssistantOpen(false); setActiveNav("Inicio"); }}>
              <span className="logo-mx">MX</span>
              <span className="logo-comp">comp</span>
            </Link>
          </div>

          <button
            className="assistant-entry"
            onClick={() => { setAssistantOpen(true); setActiveNav("Asesor"); }}
          >
            <span className="assistant-entry-icon"><img alt="" src={imgCpu} /></span>
            <span className="assistant-entry-copy">
              <strong>Asesor de compra</strong>
              <small>Cuéntanos qué necesitas</small>
            </span>
            <span className="assistant-entry-arrow" aria-hidden="true">&#8594;</span>
          </button>

          <div className="header-actions">
            <button className="icon-btn cart-btn" aria-label="Carrito">
              <img alt="" src={imgCart} style={{ width: 24, height: 24, filter: "brightness(0) invert(1)" }} />
              <span className="cart-badge">3</span>
            </button>
          </div>
        </div>

      </header>

      {/* ════ MAIN CONTENT ══════════════════════════════════════════════════ */}
      <main className="main-content">
        {assistantOpen ? (
          <section className="assistant-workspace" aria-label="Asesor de compra">
            <div className="assistant-heading">
              <button className="assistant-back" onClick={() => { setAssistantOpen(false); setActiveNav("Inicio"); }}>
                <span aria-hidden="true">&#8592;</span> Tienda
              </button>
              <div className="assistant-heading-copy">
                <span className="assistant-eyebrow">ASESOR DE COMPRA · MXCOMP</span>
                <h1>Vamos a encontrarlo contigo.</h1>
                <p>Unas preguntas, tus prioridades y después opciones reales de Google Shopping.</p>
              </div>
              <button className="assistant-reset" onClick={resetAssistant} title="Empezar de nuevo" aria-label="Empezar de nuevo">
                <span aria-hidden="true">&#8635;</span>
              </button>
            </div>

            <div className="assistant-progress" aria-label={`Paso ${Math.min(userTurnCount + 1, 4)} de 4`}>
              {["Categoría", "Producto", "Presupuesto", "Prioridad"].map((step, index) => (
                <div className={`assistant-progress-step ${index <= Math.min(userTurnCount, 3) ? "is-active" : ""}`} key={step}>
                  <span>{index + 1}</span>{step}
                </div>
              ))}
            </div>

            <div className="assistant-layout">
              <div className="assistant-conversation">
                <div className="assistant-chat-topline">
                  <span className="assistant-online-dot" />
                  <span>Asesor conectado</span>
                  <span className="assistant-powered">Perfil guiado</span>
                </div>
                <div className="assistant-transcript" role="log" aria-live="polite" aria-label="Conversación">
                  {messages.map((message, index) => (
                    <div className={`chat-message chat-${message.role}`} key={`${message.role}-${index}`}>
                      {message.role === "assistant" && <span className="chat-avatar" aria-hidden="true">M</span>}
                      <p>{message.content}</p>
                    </div>
                  ))}
                  {assistantBusy && (
                    <div className="chat-message chat-assistant">
                      <span className="chat-avatar" aria-hidden="true">M</span>
                      <p className="chat-typing"><i /><i /><i /><span>Preparando la siguiente pregunta</span></p>
                    </div>
                  )}
                  <div ref={transcriptEndRef} />
                </div>

                {replyOptions.length > 0 && !assistantBusy && !assistantReady && (
                  <div className={`assistant-suggestions ${currentStep === "category" ? "assistant-category-options" : ""}`} aria-label="Opciones de respuesta">
                    {replyOptions.map((option, index) => (
                      <button
                        className={option === OTHER_OPTION ? "assistant-option-other" : ""}
                        key={`${option}-${index}`}
                        onClick={() => option === OTHER_OPTION ? setOtherSelected(true) : void sendAnswer(option)}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                )}

                {assistantError && <p className="assistant-error" role="alert">{assistantError}</p>}

                {otherSelected && replyOptions.length > 0 && (
                  <button className="assistant-options-back" onClick={() => setOtherSelected(false)}>Volver a las opciones</button>
                )}

                {assistantReady && !hasSearched && (
                  <div className="assistant-ready-panel">
                    <div>
                      <strong>Ya tenemos una buena idea de lo que buscas.</strong>
                      <span>La búsqueda incluirá tus respuestas y preferencias.</span>
                    </div>
                    <button onClick={() => void searchOffers()} disabled={searchingOffers}>
                      {searchingOffers ? <span className="spinner" /> : <img src={imgCpu} alt="" />}
                      Buscar opciones
                    </button>
                  </div>
                )}

                {!assistantReady && (otherSelected || replyOptions.length === 0) && (
                  <>
                    <form className="assistant-composer" onSubmit={event => { event.preventDefault(); void sendAnswer(messageInput); }}>
                      <input
                        ref={messageInputRef}
                        value={messageInput}
                        onChange={event => setMessageInput(event.target.value)}
                        placeholder="Escribe tu respuesta..."
                        aria-label="Tu respuesta"
                        maxLength={300}
                        disabled={assistantBusy}
                      />
                      <button type="submit" disabled={!messageInput.trim() || assistantBusy} aria-label="Enviar respuesta">
                        <span aria-hidden="true">&#8593;</span>
                      </button>
                    </form>
                    <p className="assistant-privacy-note">Tus respuestas se enviarán directamente en la búsqueda de productos.</p>
                  </>
                )}
              </div>

              <aside className="assistant-aside">
                <div className="assistant-aside-mark" aria-hidden="true"><img src={imgCpu} alt="" /></div>
                <h2>Una búsqueda a tu medida</h2>
                <p>Cada respuesta, incluida la que escribas en “Otro”, se conserva para buscar productos en Google Shopping.</p>
                <div className="assistant-aside-flow">
                  <span><i>01</i> Elegimos una categoría</span>
                  <span><i>02</i> Guardamos tus respuestas</span>
                  <span><i>03</i> SerpApi busca opciones</span>
                </div>
              </aside>
            </div>

            {hasSearched && (
              <section className="assistant-results" aria-live="polite">
                <div className="assistant-results-heading">
                  <div>
                    <span className="assistant-eyebrow">RESULTADOS DE GOOGLE SHOPPING</span>
                    <h2>{searchingOffers ? "Buscando opciones para ti" : "Opciones que encontramos"}</h2>
                  </div>
                  <span>{assistantOffers.length} ofertas</span>
                </div>
                {searchingOffers ? (
                  <div className="products-grid">
                    {[1, 2, 3, 4].map(index => <div key={index} className="skeleton" style={{ height: 300 }} />)}
                  </div>
                ) : assistantOffers.length ? (
                  <div className="products-grid">
                    {assistantOffers.map((offer, index) => (
                      <ProductCard key={offer.id || index} product={offer} idx={index} onClick={() => setSelectedProduct(offer)} />
                    ))}
                  </div>
                ) : (
                  <div className="assistant-no-results">
                    <p>{searchResultMessage || "No encontramos ofertas con esos criterios."}</p>
                    <button onClick={() => void searchOffers()} disabled={searchingOffers}>Reintentar búsqueda</button>
                    <button onClick={resetAssistant}>Ajustar lo que busco</button>
                  </div>
                )}
              </section>
            )}
          </section>
        ) : (
          <div className="home-wrapper">
            <div className="hero-banner">
              <div className="hero-text">
                <span className="hero-badge">MXCOMP · ASESOR PERSONAL</span>
                <h1 className="hero-title">Encuentra justo lo que necesitas.</h1>
                <p className="hero-sub">Cuéntanos qué tienes en mente. Te ayudamos a definirlo y comparamos opciones reales.</p>
                <button className="btn-hero" onClick={() => { setAssistantOpen(true); setActiveNav("Asesor"); }}>
                  <img src={imgCpu} alt="" /> Hablar con un asesor <span aria-hidden="true">&#8594;</span>
                </button>
              </div>
              <div className="hero-decoration" aria-hidden="true">
                <span className="hero-deco-icon">✦</span>
              </div>
            </div>

            <div className="brands-section">
              <h2 className="section-title">Marcas destacadas</h2>
              <div className="brands-row">
                {[imgShield, imgCpu, imgCircleX, imgCircleX, imgCircleX].map((icon, i) => (
                  <div key={i} className="brand-card">
                    <img alt="marca" src={icon} style={{ width: 36, height: 24, objectFit: "contain" }} />
                  </div>
                ))}
              </div>
            </div>

            <div className="new-products-section">
              <div className="section-header-row">
                <h2 className="section-title" style={{ marginBottom: 0 }}>Productos nuevos</h2>
                <button className="btn-see-all" onClick={() => { setAssistantOpen(true); setActiveNav("Asesor"); }}>Pedir recomendación <span aria-hidden="true">&#8594;</span></button>
              </div>
              <div className="products-grid">
                {HOME_PRODUCTS.map((product, index) => (
                  <ProductCard
                    key={product.id}
                    product={product as unknown as Product}
                    idx={index}
                    onClick={() => setSelectedProduct(product)}
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
          { icon: imgCpu, label: "Asesor" },
          { icon: imgBagNav, label: "Carrito" },
          { icon: imgUser, label: "Perfil" },
        ].map(({ icon, label }) => {
          const active = activeNav === label;
          return (
            <button
              key={label}
              id={`nav-${label.toLowerCase()}`}
              onClick={() => {
                setActiveNav(label);
                if (label === "Inicio") setAssistantOpen(false);
                if (label === "Asesor") setAssistantOpen(true);
              }}
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
        Búsqueda de productos con <span style={{ color: "#10b981" }}>SerpApi</span>
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
