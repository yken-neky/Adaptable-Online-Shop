// Cliente API para conectar con el backend
// Este es un esqueleto que se conectará al backend cuando esté listo

import type { Product, Category, Sale, SaleItem, User, LandingPageData, LandingSection, SaleStatus } from "@/types";
import { mockCategories, mockProducts, mockLandingData, delay } from "./mockData";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";
const USE_MOCK_DATA = process.env.NEXT_PUBLIC_USE_MOCK_DATA === "true" || !process.env.NEXT_PUBLIC_API_URL;

// Clase de error personalizada para errores de backend no disponible
// Esta clase no se loguea automáticamente en la consola
class BackendNotAvailableError extends Error {
  constructor(message: string = "BACKEND_NOT_AVAILABLE") {
    super(message);
    this.name = "BackendNotAvailableError";
    // Prevenir que el error se muestre en la consola
    Object.setPrototypeOf(this, BackendNotAvailableError.prototype);
  }
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

    const config: RequestInit = {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        // Si es 404 o el backend no está disponible, lanzar un error específico
        if (response.status === 404) {
          throw new BackendNotAvailableError();
        }
        throw new Error(`API Error: ${response.statusText}`);
      }

      return await response.json();
    } catch (error: any) {
      // Si es un error de conexión o el backend no está disponible
      // Capturar errores de red, conexión rechazada, o fetch fallido
      if (
        error instanceof BackendNotAvailableError ||
        error.message === "NOT_FOUND" ||
        error.message?.includes("Not Found") ||
        error.code === "ECONNREFUSED" ||
        error.name === "TypeError" ||
        error.message?.includes("fetch failed") ||
        error.cause?.code === "ECONNREFUSED" ||
        error.message === "BACKEND_NOT_AVAILABLE"
      ) {
        // Lanzar error silencioso que no se loguea
        throw new BackendNotAvailableError();
      }
      // Solo loguear errores que no sean de backend no disponible
      if (!(error instanceof BackendNotAvailableError)) {
        console.error("API Request failed:", error);
      }
      throw error;
    }
  }

  // Autenticación
  async login(email: string, password: string) {
    return this.request<{ user: any; token: string }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
  }

  async register(data: { email: string; password: string; name: string }) {
    return this.request<{ user: any; token: string }>("/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async getCurrentUser() {
    return this.request<any>("/auth/me");
  }

  // Productos
  async getProducts(categoryId?: string) {
    if (USE_MOCK_DATA) {
      await delay(300); // Simular delay de red
      let products = [...mockProducts];
      if (categoryId) {
        products = products.filter(p => p.categoryId === categoryId);
      }
      // Agregar categorías a los productos
      return products.map(p => ({
        ...p,
        category: mockCategories.find(c => c.id === p.categoryId),
      }));
    }
    const endpoint = categoryId 
      ? `/products?categoryId=${categoryId}`
      : "/products";
    return this.request<Product[]>(endpoint);
  }

  async getProduct(id: string) {
    return this.request<Product>(`/products/${id}`);
  }

  async createProduct(data: Partial<Product>) {
    return this.request<Product>("/products", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateProduct(id: string, data: Partial<Product>) {
    return this.request<Product>(`/products/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async deleteProduct(id: string) {
    return this.request<void>(`/products/${id}`, {
      method: "DELETE",
    });
  }

  // Categorías
  async getCategories() {
    if (USE_MOCK_DATA) {
      await delay(300);
      return mockCategories;
    }
    return this.request<Category[]>("/categories");
  }

  async getCategory(id: string) {
    if (USE_MOCK_DATA) {
      await delay(300);
      const category = mockCategories.find(c => c.id === id);
      if (!category) {
        throw new BackendNotAvailableError();
      }
      return category;
    }
    return this.request<Category>(`/categories/${id}`);
  }

  async createCategory(data: Partial<Category>) {
    return this.request<Category>("/categories", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateCategory(id: string, data: Partial<Category>) {
    return this.request<Category>(`/categories/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async deleteCategory(id: string) {
    return this.request<void>(`/categories/${id}`, {
      method: "DELETE",
    });
  }

  // Ventas/Compras
  async getSales(userId?: string) {
    const endpoint = userId 
      ? `/sales?userId=${userId}`
      : "/sales";
    return this.request<Sale[]>(endpoint);
  }

  async getSale(id: string) {
    return this.request<Sale>(`/sales/${id}`);
  }

  async createSale(data: { items: Array<{ productId: string; quantity: number }> }) {
    return this.request<Sale>("/sales", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateSaleStatus(id: string, status: SaleStatus) {
    return this.request<Sale>(`/sales/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });
  }

  async cancelSale(id: string) {
    return this.request<Sale>(`/sales/${id}/cancel`, {
      method: "PATCH",
    });
  }

  // Landing Page
  async getLandingPage() {
    if (USE_MOCK_DATA) {
      await delay(300);
      return mockLandingData;
    }
    return this.request<LandingPageData>("/landing");
  }

  async updateLandingPage(data: Partial<LandingPageData>) {
    return this.request<LandingPageData>("/landing", {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async updateLandingSection(sectionId: string, data: Partial<LandingSection>) {
    return this.request<LandingSection>(`/landing/sections/${sectionId}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async createLandingSection(data: Partial<LandingSection>) {
    return this.request<LandingSection>("/landing/sections", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async deleteLandingSection(sectionId: string) {
    return this.request<void>(`/landing/sections/${sectionId}`, {
      method: "DELETE",
    });
  }
}

export const apiClient = new ApiClient(API_BASE_URL);
