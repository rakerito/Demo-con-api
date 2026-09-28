export type ShoppingStep = "category" | "product" | "budget" | "priority";
export type ShoppingAnswers = Record<ShoppingStep, string>;

export const OTHER_OPTION = "Otro";
export const EMPTY_SHOPPING_ANSWERS: ShoppingAnswers = {
  category: "",
  product: "",
  budget: "",
  priority: "",
};

export const SHOPPING_CATEGORIES = [
  "Accesorios",
  "Almacenamiento",
  "Audio",
  "Backpacks y maletines",
  "Cableado estructurado",
  "Cables",
  "Ciberseguridad",
  "Componentes",
  "Cómputo",
  "Consolas y videojuegos",
  "Consumibles",
  "Drones",
  "Energía",
  "Electrodomésticos",
  "Gabinetes y enfriamiento",
  "Impresión",
  "Mobiliario",
  "Monitores",
  "Movilidad eléctrica",
  "Papelería",
  "Proyectores",
  "Punto de venta",
  "Redes",
  "Seguridad",
  "Señalización digital",
  "Smart home",
  "Software",
  "Streaming",
  "Teclados y mouses",
  "Telefonía",
  "Televisiones",
  "Video",
  "Wearables",
];

const PRODUCT_OPTIONS: Record<string, string[]> = {
  "Accesorios": ["Cargador", "Adaptador", "Hub USB", "Funda o protección"],
  "Almacenamiento": ["SSD NVMe", "Disco duro externo", "Memoria USB", "NAS"],
  "Audio": ["Audífonos", "Bocina", "Micrófono", "Barra de sonido"],
  "Backpacks y maletines": ["Mochila para laptop", "Maletín", "Maleta de viaje", "Funda para equipo"],
  "Cableado estructurado": ["Cable Ethernet", "Patch panel", "Jack o conector", "Rack de red"],
  "Cables": ["Cable USB-C", "Cable HDMI", "Cable Ethernet", "Cable de corriente"],
  "Ciberseguridad": ["Antivirus", "Firewall", "Protección de endpoint", "Licencia de seguridad"],
  "Componentes": ["Tarjeta gráfica", "Procesador", "Memoria RAM", "Tarjeta madre"],
  "Cómputo": ["Laptop", "PC de escritorio", "Mini PC", "All-in-one"],
  "Consolas y videojuegos": ["PlayStation", "Xbox", "Nintendo Switch", "Videojuego"],
  "Consumibles": ["Tóner", "Cartucho de tinta", "Papel", "Etiqueta"],
  "Drones": ["Drone con cámara", "Drone FPV", "Drone profesional", "Batería para drone"],
  "Energía": ["No-break / UPS", "Regulador", "Batería", "Panel solar"],
  "Electrodomésticos": ["Lavadora", "Refrigerador", "Microondas", "Aspiradora"],
  "Gabinetes y enfriamiento": ["Gabinete para PC", "Disipador", "Ventilador", "Refrigeración líquida"],
  "Impresión": ["Impresora láser", "Impresora de tinta", "Impresora térmica", "Escáner"],
  "Mobiliario": ["Escritorio", "Silla ergonómica", "Mesa de trabajo", "Soporte para monitor"],
  "Monitores": ["Monitor gaming", "Monitor 4K", "Monitor ultrawide", "Monitor profesional"],
  "Movilidad eléctrica": ["Bicicleta eléctrica", "Scooter eléctrico", "Patín eléctrico", "Batería para bici"],
  "Papelería": ["Cuaderno", "Papel", "Etiqueta", "Material de oficina"],
  "Proyectores": ["Proyector portátil", "Proyector 4K", "Proyector para oficina", "Pantalla para proyector"],
  "Punto de venta": ["Terminal de pago", "Lector de código", "Impresora de tickets", "Cajón de dinero"],
  "Redes": ["Router", "Switch", "Access point", "Sistema mesh"],
  "Seguridad": ["Cámara de seguridad", "Kit de videovigilancia", "Alarma", "Control de acceso"],
  "Señalización digital": ["Pantalla comercial", "Tótem digital", "Pantalla LED", "Reproductor multimedia"],
  "Smart home": ["Cámara inteligente", "Foco inteligente", "Enchufe inteligente", "Asistente de voz"],
  "Software": ["Sistema operativo", "Licencia de oficina", "Software de diseño", "Suscripción empresarial"],
  "Streaming": ["Webcam", "Capturadora de video", "Micrófono para streaming", "Iluminación"],
  "Teclados y mouses": ["Teclado mecánico", "Mouse inalámbrico", "Combo teclado y mouse", "Mouse gaming"],
  "Telefonía": ["Celular", "Teléfono inalámbrico", "Teléfono IP", "Accesorio para celular"],
  "Televisiones": ["Smart TV 4K", "Televisión OLED", "Televisión QLED", "Soporte para TV"],
  "Video": ["Cámara de video", "Webcam", "Capturadora", "Cámara de acción"],
  "Wearables": ["Smartwatch", "Pulsera inteligente", "Reloj deportivo", "Accesorio wearable"],
};

const BUDGET_OPTIONS = [
  "Hasta $5,000",
  "$5,000–$15,000",
  "$15,000–$40,000",
  "Más de $40,000",
  "Sin límite fijo",
  OTHER_OPTION,
];
const BUDGET_PRICE_FILTERS: Record<string, { minPrice?: number; maxPrice?: number }> = {
  "Hasta $5,000": { maxPrice: 5000 },
  "$5,000–$15,000": { minPrice: 5000, maxPrice: 15000 },
  "$15,000–$40,000": { minPrice: 15000, maxPrice: 40000 },
  "Más de $40,000": { minPrice: 40000 },
};

const PRIORITY_GROUPS: { matches: string[]; options: string[]; question: string }[] = [
  {
    matches: ["movilidad eléctrica"],
    options: ["Autonomía", "Potencia", "Terreno de uso", "Peso y capacidad de carga"],
    question: "¿Qué priorizas en tu equipo de movilidad eléctrica?",
  },
  {
    matches: ["electrodomésticos", "energía", "smart home"],
    options: ["Capacidad", "Ahorro de energía", "Tamaño e instalación", "Facilidad de uso"],
    question: "¿Qué característica es más importante para este producto?",
  },
  {
    matches: ["cable", "redes", "telefonía"],
    options: ["Compatibilidad", "Velocidad o ancho de banda", "Longitud o alcance", "Durabilidad"],
    question: "¿Qué necesitas priorizar en la conexión o el cableado?",
  },
  {
    matches: ["cómputo", "componentes", "gabinetes", "monitores", "teclados"],
    options: ["Compatibilidad", "Rendimiento", "Memoria o almacenamiento", "Tamaño y espacio"],
    question: "¿Qué característica quieres priorizar en tu equipo?",
  },
  {
    matches: ["audio", "streaming", "video", "televisiones", "proyectores"],
    options: ["Calidad de imagen o sonido", "Resolución", "Conectividad", "Portabilidad"],
    question: "¿Qué es lo más importante para tu experiencia de audio o video?",
  },
  {
    matches: ["drones"],
    options: ["Tiempo de vuelo", "Calidad de cámara", "Alcance", "Facilidad de uso"],
    question: "¿Qué característica te importa más en el dron?",
  },
  {
    matches: ["ciberseguridad", "software", "punto de venta", "seguridad"],
    options: ["Compatibilidad", "Funciones", "Facilidad de uso", "Escalabilidad"],
    question: "¿Qué aspecto es más importante para tu solución?",
  },
  {
    matches: ["consumibles", "papelería", "impresión"],
    options: ["Compatibilidad", "Rendimiento o cantidad", "Calidad", "Precio por unidad"],
    question: "¿Qué quieres priorizar al elegir este producto?",
  },
];

const DEFAULT_PRIORITY = {
  options: ["Compatibilidad", "Rendimiento", "Tamaño o capacidad", "Calidad-precio"],
  question: "¿Qué característica es más importante para ti?",
};

export function getNextShoppingStep(answers: ShoppingAnswers): ShoppingStep | "complete" {
  if (!answers.category.trim()) return "category";
  if (!answers.product.trim()) return "product";
  if (!answers.budget.trim()) return "budget";
  if (!answers.priority.trim()) return "priority";
  return "complete";
}

export function getShoppingQuestion(step: ShoppingStep, answers: ShoppingAnswers): string {
  if (step === "category") return "¿En qué categoría encontramos lo que buscas?";
  if (step === "product") return `¿Qué producto específico buscas en ${answers.category}?`;
  if (step === "budget") return "¿Qué presupuesto aproximado quieres considerar?";
  return getPriorityGroup(answers.category).question;
}

export function getShoppingOptions(step: ShoppingStep, answers: ShoppingAnswers): string[] {
  if (step === "category") return [...SHOPPING_CATEGORIES, OTHER_OPTION];
  if (step === "product") return [...(PRODUCT_OPTIONS[answers.category] || ["Equipo", "Accesorio", "Consumible"]), OTHER_OPTION];
  if (step === "budget") return BUDGET_OPTIONS;
  return [...getPriorityGroup(answers.category).options, "Sin preferencia", OTHER_OPTION];
}

export function buildShoppingQuery(answers: ShoppingAnswers): string {
  return [answers.product, answers.category, answers.budget, answers.priority]
    .map(answer => answer.trim())
    .filter(Boolean)
    .join(" ");
}

export function buildShoppingSearchRequest(answers: ShoppingAnswers): {
  query: string;
  minPrice?: number;
  maxPrice?: number;
} {
  const budgetFilter = BUDGET_PRICE_FILTERS[answers.budget];
  const queryParts = [answers.product, answers.category, answers.priority];
  if (!budgetFilter && answers.budget && answers.budget !== "Sin límite fijo") {
    queryParts.push(answers.budget);
  }

  return {
    query: queryParts.map(value => value.trim()).filter(Boolean).join(" "),
    ...budgetFilter,
  };
}

export function getShoppingCompletionReply(answers: ShoppingAnswers): string {
  return `. Usaré tus respuestas tal cual para buscar: ${buildShoppingQuery(answers)}.`;
}

function getPriorityGroup(category: string) {
  const normalizedCategory = category.toLocaleLowerCase("es-MX");
  return PRIORITY_GROUPS.find(group =>
    group.matches.some(match => normalizedCategory.includes(match))
  ) || DEFAULT_PRIORITY;
}