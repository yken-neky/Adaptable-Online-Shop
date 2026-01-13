// Tipos principales de la aplicación

export type UserRole = "admin" | "cliente";

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  image?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  categoryId: string;
  category?: Category;
  stock?: number;
  createdAt: string;
  updatedAt: string;
}

export type SaleStatus = "pendiente" | "planificada" | "realizada" | "cancelada";

export interface Sale {
  id: string;
  userId: string;
  user?: User;
  status: SaleStatus;
  total: number;
  items: SaleItem[];
  createdAt: string;
  updatedAt: string;
}

export interface SaleItem {
  id: string;
  saleId: string;
  productId: string;
  product?: Product;
  quantity: number;
  price: number;
}

export interface CartItem {
  productId: string;
  product: Product;
  quantity: number;
}

export interface LandingSection {
  id: string;
  type: "hero" | "about" | "features" | "testimonials" | "contact";
  title?: string;
  content?: string;
  image?: string;
  order: number;
  visible: boolean;
}

export interface LandingPageData {
  sections: LandingSection[];
  companyName: string;
  companyDescription?: string;
  logo?: string;
}
