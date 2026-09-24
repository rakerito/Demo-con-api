import { Product } from "@/types";

// ─── Mock product database ────────────────────────────────────────────────────
// Simulates a real e-commerce database with varied categories

export const mockDatabase: Product[] = [
  // ── Electronics ─────────────────────────────────────────────────────────────
  {
    id: "PRD-001",
    name: "Laptop UltraBook Pro 15",
    description:
      "Laptop de alto rendimiento con procesador Intel Core i7, 16GB RAM, SSD NVMe de 512GB y pantalla IPS 4K. Ideal para profesionales y creadores de contenido.",
    price: 15999,
    originalPrice: 18999,
    category: "Electrónicos",
    brand: "TechPro",
    rating: 4.7,
    reviewCount: 342,
    stock: 15,
    images: ["/products/laptop.jpg"],
    tags: ["laptop", "computadora", "notebook", "ultrabook", "i7", "16gb"],
    sku: "TP-LPT-001",
    deliveryDays: 3,
    freeShipping: true,
  },
  {
    id: "PRD-002",
    name: "Smartphone Galaxy X12 Pro",
    description:
      "Teléfono inteligente de última generación con cámara triple de 200MP, batería de 5000mAh, carga rápida 65W y pantalla AMOLED de 6.8 pulgadas.",
    price: 8499,
    originalPrice: 9999,
    category: "Smartphones",
    brand: "Samsung",
    rating: 4.8,
    reviewCount: 1245,
    stock: 42,
    images: ["/products/phone.jpg"],
    tags: ["celular", "smartphone", "galaxy", "telefono", "android", "samsung"],
    sku: "SS-X12-PRO",
    deliveryDays: 2,
    freeShipping: true,
  },
  {
    id: "PRD-003",
    name: 'Monitor Gaming QHD 27"',
    description:
      "Monitor gaming de 27 pulgadas con resolución 2K, 165Hz de tasa de refresco, 1ms de respuesta, panel IPS y compatibilidad G-Sync / FreeSync.",
    price: 5299,
    originalPrice: 6500,
    category: "Monitores",
    brand: "AOC",
    rating: 4.6,
    reviewCount: 567,
    stock: 8,
    images: ["/products/monitor.jpg"],
    tags: ["monitor", "gaming", "27 pulgadas", "qhd", "165hz", "pantalla"],
    sku: "AOC-MNT-27Q",
    deliveryDays: 5,
    freeShipping: true,
  },
  {
    id: "PRD-004",
    name: "Auriculares Noise Cancelling BT600",
    description:
      "Auriculares inalámbricos premium con cancelación activa de ruido, 30 horas de batería, audio Hi-Res y micrófono integrado de alta calidad.",
    price: 2899,
    originalPrice: 3499,
    category: "Audio",
    brand: "Sony",
    rating: 4.9,
    reviewCount: 2103,
    stock: 30,
    images: ["/products/headphones.jpg"],
    tags: ["auriculares", "headphones", "bluetooth", "noise cancelling", "sony", "inalambrico"],
    sku: "SNY-AUR-600",
    deliveryDays: 2,
    freeShipping: true,
  },
  {
    id: "PRD-005",
    name: "Teclado Mecánico RGB TKL",
    description:
      "Teclado mecánico tenkeyless con switches Cherry MX Red, retroiluminación RGB por tecla, construcción aluminio y software de personalización.",
    price: 1450,
    originalPrice: 1799,
    category: "Periféricos",
    brand: "Corsair",
    rating: 4.5,
    reviewCount: 789,
    stock: 22,
    images: ["/products/keyboard.jpg"],
    tags: ["teclado", "mecanico", "rgb", "gaming", "corsair", "cherry mx"],
    sku: "CRS-KBD-TKL",
    deliveryDays: 3,
    freeShipping: false,
  },
  {
    id: "PRD-006",
    name: "Mouse Gaming Pro 25000 DPI",
    description:
      "Mouse gaming inalámbrico con sensor de 25000 DPI, 90 horas de batería, 7 botones programables y peso ajustable de 56g.",
    price: 1299,
    originalPrice: 1599,
    category: "Periféricos",
    brand: "Logitech",
    rating: 4.7,
    reviewCount: 1562,
    stock: 35,
    images: ["/products/mouse.jpg"],
    tags: ["mouse", "raton", "gaming", "logitech", "inalambrico", "wireless"],
    sku: "LGT-MSE-PRO",
    deliveryDays: 2,
    freeShipping: false,
  },
  {
    id: "PRD-007",
    name: "Tablet Pro 12.9 M2",
    description:
      "Tablet profesional con chip M2, pantalla Liquid Retina XDR de 12.9 pulgadas, compatible con Apple Pencil y Magic Keyboard. 256GB de almacenamiento.",
    price: 18999,
    originalPrice: 21999,
    category: "Tablets",
    brand: "Apple",
    rating: 4.8,
    reviewCount: 892,
    stock: 12,
    images: ["/products/tablet.jpg"],
    tags: ["tablet", "ipad", "apple", "m2", "pro", "12.9"],
    sku: "APL-TAB-129M2",
    deliveryDays: 1,
    freeShipping: true,
  },
  {
    id: "PRD-008",
    name: "Cámara Mirrorless Alpha 7 IV",
    description:
      "Cámara mirrorless full-frame de 33MP con grabación 4K 60fps, estabilización en 5 ejes, modo profesional y conectividad WiFi + Bluetooth.",
    price: 32499,
    originalPrice: 36999,
    category: "Fotografía",
    brand: "Sony",
    rating: 4.9,
    reviewCount: 234,
    stock: 5,
    images: ["/products/camera.jpg"],
    tags: ["camara", "mirrorless", "sony", "full frame", "4k", "fotografia"],
    sku: "SNY-CAM-A7IV",
    deliveryDays: 4,
    freeShipping: true,
  },
  {
    id: "PRD-009",
    name: 'Smart TV QLED 55" 4K',
    description:
      "Televisor QLED de 55 pulgadas con resolución 4K, 120Hz, HDR10+, sistema operativo Tizen, y control de voz integrado. 4 puertos HDMI 2.1.",
    price: 11999,
    originalPrice: 14999,
    category: "Televisores",
    brand: "Samsung",
    rating: 4.6,
    reviewCount: 456,
    stock: 18,
    images: ["/products/tv.jpg"],
    tags: ["tv", "television", "qled", "4k", "55 pulgadas", "smart tv", "samsung"],
    sku: "SS-TV-55QLED",
    deliveryDays: 7,
    freeShipping: true,
  },
  {
    id: "PRD-010",
    name: "Consola Gaming NextGen X",
    description:
      "Consola de videojuegos de última generación con SSD ultrarrápido de 1TB, gráficos 8K, ray tracing y retrocompatibilidad total.",
    price: 13499,
    originalPrice: 14999,
    category: "Gaming",
    brand: "Microsoft",
    rating: 4.8,
    reviewCount: 3201,
    stock: 7,
    images: ["/products/console.jpg"],
    tags: ["consola", "gaming", "xbox", "videojuegos", "nextgen"],
    sku: "MS-CON-NGX",
    deliveryDays: 3,
    freeShipping: true,
  },
  {
    id: "PRD-011",
    name: "Smartwatch Series 9 GPS",
    description:
      "Reloj inteligente con GPS, monitor cardíaco avanzado, oxímetro, pantalla Always-On de 45mm y 18 horas de batería con carga rápida.",
    price: 6999,
    originalPrice: 8499,
    category: "Wearables",
    brand: "Apple",
    rating: 4.7,
    reviewCount: 987,
    stock: 25,
    images: ["/products/watch.jpg"],
    tags: ["smartwatch", "reloj", "apple watch", "gps", "wearable"],
    sku: "APL-WCH-S9",
    deliveryDays: 2,
    freeShipping: true,
  },
  {
    id: "PRD-012",
    name: "Disco SSD NVMe 2TB Gen4",
    description:
      "Unidad de estado sólido NVMe PCIe Gen4 con velocidades de lectura de 7000 MB/s y escritura de 6500 MB/s. Ideal para gaming y edición de video.",
    price: 2299,
    originalPrice: 2899,
    category: "Almacenamiento",
    brand: "Samsung",
    rating: 4.8,
    reviewCount: 1834,
    stock: 50,
    images: ["/products/ssd.jpg"],
    tags: ["ssd", "disco", "nvme", "almacenamiento", "2tb", "samsung"],
    sku: "SS-SSD-2TG4",
    deliveryDays: 2,
    freeShipping: false,
  },
];

// ─── Search function ──────────────────────────────────────────────────────────
export function searchProducts(
  query: string,
  category?: string,
  minPrice?: number,
  maxPrice?: number,
  sortBy: string = "relevance"
): Product[] {
  const lowerQuery = query.toLowerCase().trim();

  let results = mockDatabase.filter((product) => {
    // Text match against name, description, tags, brand, category
    const searchableText = [
      product.name,
      product.description,
      product.brand,
      product.category,
      ...product.tags,
    ]
      .join(" ")
      .toLowerCase();

    const matchesQuery =
      lowerQuery === "" || searchableText.includes(lowerQuery);

    const matchesCategory =
      !category ||
      category === "Todos" ||
      product.category.toLowerCase() === category.toLowerCase();

    const matchesMinPrice = !minPrice || product.price >= minPrice;
    const matchesMaxPrice = !maxPrice || product.price <= maxPrice;

    return matchesQuery && matchesCategory && matchesMinPrice && matchesMaxPrice;
  });

  // Sort results
  switch (sortBy) {
    case "price_asc":
      results.sort((a, b) => a.price - b.price);
      break;
    case "price_desc":
      results.sort((a, b) => b.price - a.price);
      break;
    case "rating":
      results.sort((a, b) => b.rating - a.rating);
      break;
    default:
      // Relevance: score by how many query terms match title vs tags
      results.sort((a, b) => {
        const scoreA = a.name.toLowerCase().includes(lowerQuery) ? 2 : 1;
        const scoreB = b.name.toLowerCase().includes(lowerQuery) ? 2 : 1;
        return scoreB - scoreA;
      });
  }

  return results;
}

// ─── All categories for filter ────────────────────────────────────────────────
export const allCategories = [
  "Todos",
  ...Array.from(new Set(mockDatabase.map((p) => p.category))),
];
