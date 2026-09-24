import { useState, useRef, useEffect } from "react";

const assetPathPrefix = "/assets";

const imgImageContainer = `${assetPathPrefix}/bd821.png`;
const imgImageContainer1 = `${assetPathPrefix}/eaeaf.png`;
const imgImageContainer2 = `${assetPathPrefix}/74b8e.png`;
const imgImageContainer3 = `${assetPathPrefix}/dbb02.png`;
const imgImageContainer4 = `${assetPathPrefix}/e54d7.png`;
const imgImageContainer5 = `${assetPathPrefix}/748cc.png`;
const imgMenu = `${assetPathPrefix}/f5c89.svg`;
const imgShoppingCart = `${assetPathPrefix}/d6bf2.svg`;
const imgSearch = `${assetPathPrefix}/39f74.svg`;
const imgSearch1 = `${assetPathPrefix}/9f889.svg`;
const imgSliders = `${assetPathPrefix}/9edcf.svg`;
const imgShield = `${assetPathPrefix}/7829a.svg`;
const imgCpu = `${assetPathPrefix}/68bce.svg`;
const imgCircleX = `${assetPathPrefix}/3b4ab.svg`;
const imgHeart = `${assetPathPrefix}/753a8.svg`;
const imgShoppingBag = `${assetPathPrefix}/211d0.svg`;
const imgHouse = `${assetPathPrefix}/3d36c.svg`;
const imgLayoutDashboard = `${assetPathPrefix}/5cb3a.svg`;
const imgShoppingBag1 = `${assetPathPrefix}/9b028.svg`;
const imgUser = `${assetPathPrefix}/5fa02.svg`;

type Product = {
  id: number;
  name: string;
  description: string;
  price: string;
  image: string;
};

const allProducts: Product[] = [
  { id: 1, name: "Laptop HP Victus 16", description: "AMD Ryzen 5, 16GB RAM, 512GB SSD", price: "$18,499", image: imgImageContainer },
  { id: 2, name: "iPhone 15 Pro Max", description: "256GB, Titanium, Pantalla Super Retina", price: "$26,999", image: imgImageContainer1 },
  { id: 3, name: "Teclado Mecánico RGB", description: "Switches Azules, Distribución Español", price: "$1,299", image: imgImageContainer2 },
  { id: 4, name: 'Monitor Gamer 27" Curvo', description: "144Hz, 1ms, Full HD, FreeSync", price: "$4,599", image: imgImageContainer3 },
  { id: 5, name: "Tablet Samsung S9 FE", description: "128GB, Incluye S-Pen, Color Gris", price: "$8,999", image: imgImageContainer4 },
  { id: 6, name: "Audífonos Inalámbricos Pro", description: "Cancelación Activa de Ruido, Bluetooth", price: "$2,199", image: imgImageContainer5 },
];

function ProductCard({ product }: { product: Product }) {
  return (
    <div className="bg-white border border-[#e2e8f0] flex flex-col overflow-clip rounded-[16px] shadow-[0px_4px_12px_0px_rgba(15,23,42,0.03)] flex-1 min-w-0">
      <div className="relative h-[130px] overflow-clip shrink-0 w-full">
        <img alt={product.name} className="absolute inset-0 object-cover size-full" src={product.image} />
        <button className="absolute bg-[rgba(255,255,255,0.82)] flex items-center justify-center right-[10px] rounded-[16px] size-[32px] top-[10px] cursor-pointer hover:bg-white transition-colors">
          <img alt="favorito" className="block size-[18px]" src={imgHeart} />
        </button>
      </div>
      <div className="flex flex-col gap-[8px] items-start p-[12px] w-full">
        <div className="flex flex-col gap-[2px] w-full">
          <p className="font-['Inter:Semi_Bold'] font-semibold leading-[20px] overflow-hidden text-[#1e293b] text-[14px] text-ellipsis whitespace-nowrap w-full">
            {product.name}
          </p>
          <p className="font-['Inter:Regular'] font-normal leading-[normal] overflow-hidden text-[#64748b] text-[11px] text-ellipsis whitespace-nowrap w-full">
            {product.description}
          </p>
        </div>
        <p className="font-['Inter:Bold'] font-bold text-[#1e293b] w-full">
          <span className="text-[16px] leading-[normal]">{product.price} </span>
          <span className="font-['Inter:Regular'] font-normal text-[#64748b] text-[11px] leading-[normal]">MXN</span>
        </p>
        <button className="bg-[#2aabb3] flex gap-[4px] items-center justify-center py-[8px] rounded-[10px] w-full cursor-pointer hover:bg-[#259aa2] transition-colors active:scale-95">
          <img alt="" className="block size-[14px]" src={imgShoppingBag} />
          <p className="font-['Inter:Bold'] font-bold text-[12px] text-white whitespace-nowrap">Agregar</p>
        </button>
      </div>
    </div>
  );
}

export default function App() {
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const filtered = query.trim()
    ? allProducts.filter(
        (p) =>
          p.name.toLowerCase().includes(query.toLowerCase()) ||
          p.description.toLowerCase().includes(query.toLowerCase())
      )
    : allProducts;

  const showResults = query.trim().length > 0;

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setQuery("");
        inputRef.current?.blur();
      }
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  return (
    <div className="bg-[#f8fafc] min-h-screen w-full flex flex-col">
      {/* Top bar */}
      <div className="bg-[#1c727a] flex items-center justify-between px-5 py-4 shrink-0 w-full">
        <button className="flex flex-col items-center justify-center rounded-[20px] size-[40px] hover:bg-[rgba(255,255,255,0.1)] transition-colors cursor-pointer">
          <img alt="menú" className="block size-[24px]" src={imgMenu} />
        </button>
        <div className="flex gap-[2px] items-center">
          <span className="font-['Inter:Black'] font-black text-[#ff4d4d] text-[28px] leading-none">MX</span>
          <span className="font-['Inter:Bold'] font-bold text-[24px] text-white leading-none">comp</span>
        </div>
        <button className="relative flex flex-col items-center justify-center rounded-[20px] size-[40px] hover:bg-[rgba(255,255,255,0.1)] transition-colors cursor-pointer">
          <img alt="carrito" className="block size-[24px]" src={imgShoppingCart} />
          <span className="absolute bg-[#e22d2d] flex items-center justify-center right-[2px] rounded-[9px] size-[18px] top-[2px]">
            <span className="font-['Inter:Bold'] font-bold text-[10px] text-white leading-none">3</span>
          </span>
        </button>
      </div>

      {/* Search section */}
      <div className="bg-[#1c727a] flex gap-[10px] items-center px-4 py-[14px] shrink-0 w-full">
        <div className={`bg-white flex flex-1 gap-[8px] h-[46px] items-center pl-4 rounded-[24px] transition-shadow ${focused ? "shadow-[0_0_0_2px_rgba(42,171,179,0.5)]" : ""}`}>
          <img alt="" className="block shrink-0 size-[18px]" src={imgSearch} />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            placeholder="¿Qué estás buscando?"
            className="flex-1 font-['Inter:Regular'] font-normal text-[14px] text-[#1e293b] placeholder-[#64748b] bg-transparent outline-none min-w-0 pr-3"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="shrink-0 mr-3 text-[#64748b] hover:text-[#1e293b] transition-colors text-[18px] leading-none cursor-pointer"
              aria-label="Limpiar"
            >
              ×
            </button>
          )}
        </div>
        <button
          onClick={() => inputRef.current?.focus()}
          className="bg-[#2aabb3] flex flex-col items-center justify-center rounded-[23px] shrink-0 size-[46px] hover:bg-[#259aa2] transition-colors cursor-pointer active:scale-95"
        >
          <img alt="buscar" className="block size-[20px]" src={imgSearch1} />
        </button>
        <button className="bg-[#2aabb3] flex flex-col items-center justify-center rounded-[23px] shrink-0 size-[46px] hover:bg-[#259aa2] transition-colors cursor-pointer">
          <img alt="filtros" className="block size-[20px]" src={imgSliders} />
        </button>
      </div>

      {/* Categories */}
      <div className="flex gap-[8px] items-start overflow-x-auto pl-4 py-4 shrink-0 w-full scrollbar-hide">
        {["Laptops", "Celulares", "Tablets", "Accesorios", "Monitores", "Teclados"].map((cat, i) => (
          <button
            key={cat}
            className={`flex items-start px-4 py-2 rounded-[20px] shrink-0 cursor-pointer transition-colors ${
              i === 0
                ? "bg-[#2aabb3] text-white"
                : "bg-white border border-[#e2e8f0] text-[#1e293b] hover:border-[#2aabb3]"
            }`}
          >
            <span className="font-['Inter:Semi_Bold'] font-semibold text-[14px] whitespace-nowrap">
              {cat}
            </span>
          </button>
        ))}
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-y-auto scrollbar-auto">
        {showResults ? (
          /* Search results */
          <div className="flex flex-col gap-[16px] p-4 max-w-4xl mx-auto w-full">
            <div className="flex items-center justify-between">
              <p className="font-['Inter:Bold'] font-bold text-[18px] text-[#1e293b] leading-[24px]">
                Resultados para "{query}"
              </p>
              <span className="font-['Inter:Semi_Bold'] font-semibold text-[12px] text-[#64748b]">
                {filtered.length} {filtered.length === 1 ? "producto" : "productos"}
              </span>
            </div>
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center gap-4 py-16">
                <img alt="" className="block size-[48px] opacity-30" src={imgSearch} />
                <p className="font-['Inter:Semi_Bold'] font-semibold text-[16px] text-[#64748b] text-center">
                  Sin resultados para "{query}"
                </p>
                <p className="font-['Inter:Regular'] font-normal text-[13px] text-[#94a3b8] text-center">
                  Intenta con otro término de búsqueda.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-[14px]">
                {filtered.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </div>
        ) : (
          /* Default home content */
          <>
            {/* Hero banner */}
            <div className="p-4 max-w-4xl mx-auto w-full">
              <div
                className="flex flex-col gap-[16px] items-start p-6 rounded-[16px] w-full"
                style={{ background: "linear-gradient(to right, #2aabb3, #1c727a)" }}
              >
                <div className="flex flex-col gap-[6px] items-start w-full">
                  <div className="bg-[#e22d2d] flex items-start px-[10px] py-[4px] rounded-[6px]">
                    <p className="font-['Inter:Extra_Bold'] font-extrabold text-[10px] text-white uppercase whitespace-nowrap">
                      OFERTA DEL MES
                    </p>
                  </div>
                  <p className="font-['Inter:Extra_Bold'] font-extrabold text-[24px] text-white leading-tight">
                    Consigue las mejores ofertas
                  </p>
                  <p className="font-['Inter:Regular'] font-normal text-[14px] text-white opacity-90 leading-snug">
                    Hasta 40% de descuento en productos seleccionados.
                  </p>
                </div>
                <button className="bg-white flex items-center px-5 py-3 rounded-[24px] cursor-pointer hover:bg-[#f0fdfe] transition-colors active:scale-95">
                  <span className="font-['Inter:Semi_Bold'] font-semibold text-[14px] text-[#1c727a] leading-[20px]">
                    Ver ofertas
                  </span>
                </button>
              </div>
            </div>

            {/* Featured brands */}
            <div className="flex flex-col gap-[12px] items-start px-4 py-3 max-w-4xl mx-auto w-full">
              <p className="font-['Inter:Semi_Bold'] font-semibold text-[14px] text-[#1e293b] leading-[20px]">
                Marcas Destacadas
              </p>
              <div className="flex items-center justify-between w-full gap-2">
                {[imgShield, imgCpu, imgCircleX, imgCircleX, imgCircleX].map((icon, i) => (
                  <div
                    key={i}
                    className="bg-white border border-[#e2e8f0] flex flex-col h-[44px] items-center justify-center rounded-[8px] flex-1"
                  >
                    <img alt="marca" className="block h-[24px] w-[36px] object-contain" src={icon} />
                  </div>
                ))}
              </div>
            </div>

            {/* Products grid */}
            <div className="flex flex-col gap-[16px] items-start p-4 max-w-4xl mx-auto w-full pb-24">
              <div className="flex items-center justify-between w-full">
                <p className="font-['Inter:Bold'] font-bold text-[18px] text-[#1e293b] leading-[24px]">
                  Productos Nuevos
                </p>
                <button className="font-['Inter:Semi_Bold'] font-semibold text-[12px] text-[#2aabb3] leading-[16px] cursor-pointer hover:text-[#1c727a] transition-colors">
                  Ver todo
                </button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-[14px] w-full">
                {allProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Bottom nav */}
      <div className="bg-white border-t border-[#e2e8f0] flex items-center justify-around pb-3 pt-[10px] px-4 shrink-0 w-full fixed bottom-0 left-0 right-0 z-10">
        {[
          { icon: imgHouse, label: "Inicio", active: true },
          { icon: imgLayoutDashboard, label: "Catálogo", active: false },
          { icon: imgShoppingBag1, label: "Carrito", active: false },
          { icon: imgUser, label: "Perfil", active: false },
        ].map(({ icon, label, active }) => (
          <button
            key={label}
            className="flex flex-col gap-[2px] items-center w-[70px] cursor-pointer"
          >
            <img alt={label} className="block size-[22px]" src={icon} />
            <span
              className={`font-semibold text-[10px] whitespace-nowrap ${
                active
                  ? "font-['Inter:Bold'] text-[#2aabb3]"
                  : "font-['Inter:Medium'] text-[#64748b]"
              }`}
            >
              {label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
