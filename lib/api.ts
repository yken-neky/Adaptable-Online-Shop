// Cliente API para conectar con el backend
// Este es un esqueleto que se conectará al backend cuando esté listo

import type { Product, Category, Sale, SaleItem, User, LandingPageData, LandingSection, SaleStatus } from "@/types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

// Tipo para respuestas de API que pueden incluir errores
type ApiResponse<T> = T | { error: string; status: number };

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

// Funciones de transformación para convertir snake_case a camelCase
function transformCategory(category: any): Category {
  return {
    id: category.id || category.ID,
    name: category.name || category.Name,
    description: category.description || category.Description,
    image: category.image || category.Image,
    createdAt: category.createdAt || category.created_at || category.CreatedAt,
    updatedAt: category.updatedAt || category.updated_at || category.UpdatedAt,
  };
}

function transformProduct(product: any): Product {
  return {
    id: product.id || product.ID,
    name: product.name || product.Name,
    description: product.description || product.Description,
    price: product.price || product.Price,
    image: product.image || product.Image,
    categoryId: product.categoryId || product.category_id || product.CategoryID,
    stock: product.stock !== undefined ? product.stock : product.Stock,
    createdAt: product.createdAt || product.created_at || product.CreatedAt,
    updatedAt: product.updatedAt || product.updated_at || product.UpdatedAt,
    category: product.category ? transformCategory(product.category) : undefined,
  };
}

function transformSaleItem(item: any): SaleItem {
  return {
    id: item.id || item.ID,
    saleId: item.saleId || item.sale_id || item.SaleID,
    productId: item.productId || item.product_id || item.ProductID,
    quantity: item.quantity || item.Quantity,
    price: item.price || item.Price,
    product: item.product ? transformProduct(item.product) : undefined,
  };
}

function transformSale(sale: any): Sale {
  return {
    id: sale.id || sale.ID,
    userId: sale.userId || sale.user_id || sale.UserID,
    status: sale.status || sale.Status,
    total: sale.total || sale.Total,
    items: Array.isArray(sale.items) ? sale.items.map(transformSaleItem) : [],
    createdAt: sale.createdAt || sale.created_at || sale.CreatedAt,
    updatedAt: sale.updatedAt || sale.updated_at || sale.UpdatedAt,
    user: sale.user ? {
      id: sale.user.id || sale.user.ID,
      email: sale.user.email || sale.user.Email,
      name: sale.user.name || sale.user.Name,
      role: sale.user.role || sale.user.Role,
      createdAt: sale.user.createdAt || sale.user.created_at || sale.user.CreatedAt,
    } : undefined,
  };
}

function transformLandingSection(section: any): LandingSection {
  return {
    id: section.id || section.ID,
    type: section.type || section.Type,
    title: section.title || section.Title,
    content: section.content || section.Content,
    image: section.image || section.Image,
    order: section.order !== undefined ? section.order : (section.Order !== undefined ? section.Order : section["order"]),
    visible: section.visible !== undefined ? section.visible : (section.Visible !== undefined ? section.Visible : true),
  };
}

class ApiClient {
  private baseUrl: string;
  private cachedToken: string | null = null;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  // Permite establecer el token manualmente (útil al iniciar sesión o logout)
  setToken(token: string | null) {
    this.cachedToken = token;
    if (typeof window !== "undefined") {
      if (token) {
        localStorage.setItem("token", token);
      } else {
        localStorage.removeItem("token");
      }
    }
  }

  clearToken() {
    this.setToken(null);
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;
    // Prefer cached token, fall back to localStorage (helps tests and SSR-safe access)
    let token: string | null = this.cachedToken ?? null;
    if (!token && typeof window !== "undefined") {
      token = localStorage.getItem("token");
      this.cachedToken = token;
    }

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
        
        // Intentar obtener el mensaje de error del backend
        let errorMessage = response.statusText;
        try {
          const errorData = await response.json();
          if (errorData.error) {
            errorMessage = errorData.error;
          } else if (errorData.message) {
            errorMessage = errorData.message;
          }
        } catch {
          // Si no se puede parsear el JSON, usar statusText
        }
        
        // Sanitizar mensajes de error para mostrar mensajes amigables al usuario
        if (errorMessage.includes("Field validation for 'Email' failed")) {
          errorMessage = "Por favor, ingresa un correo electrónico válido.";
        } else if (errorMessage.includes("Field validation")) {
          errorMessage = "Los datos ingresados no son válidos. Verifica e intenta nuevamente.";
        }
        
        // Para errores del cliente (4xx), devolver objeto error en lugar de lanzar
        if (response.status >= 400 && response.status < 500) {
          return { error: errorMessage, status: response.status };
        }
        
        // No loguear errores del cliente ya que se manejan arriba
        console.error("API Request failed:", errorMessage);
        
        const error = new Error(errorMessage);
        (error as any).status = response.status;
        throw error;
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
  async login(email: string, password: string): Promise<ApiResponse<{ user: any; token: string }>> {
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

  // Usuarios
  async getUsers() {
    try {
      const result = await this.request<any[]>("/users");
      // Asegurar que siempre retorne un array
      if (!Array.isArray(result)) {
        return [];
      }
      return result;
    } catch (error) {
      // Si el endpoint no está disponible, retornar array vacío
      console.warn("getUsers endpoint not available yet:", error);
      return [];
    }
  }

  // Productos
  async getProducts(categoryId?: string) {
    const endpoint = categoryId 
      ? `/products?categoryId=${categoryId}`
      : "/products";
    const result = await this.request<any[]>(endpoint);
    // Asegurar que siempre retorne un array y transformar campos
    if (!Array.isArray(result)) {
      return [];
    }
    return result.map(transformProduct);
  }

  async getProduct(id: string) {
    const result = await this.request<any>(`/products/${id}`);
    return transformProduct(result);
  }

  async createProduct(data: Partial<Product>) {
    const result = await this.request<any>("/products", {
      method: "POST",
      body: JSON.stringify(data),
    });
    return transformProduct(result);
  }

  async updateProduct(id: string, data: Partial<Product>) {
    const result = await this.request<any>(`/products/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
    return transformProduct(result);
  }

  async deleteProduct(id: string) {
    return this.request<void>(`/products/${id}`, {
      method: "DELETE",
    });
  }

  // Categorías
  async getCategories() {
    const result = await this.request<any[]>("/categories");
    // Asegurar que siempre retorne un array y transformar campos
    if (!Array.isArray(result)) {
      return [];
    }
    return result.map(transformCategory);
  }

  async getCategory(id: string) {
    const result = await this.request<any>(`/categories/${id}`);
    return transformCategory(result);
  }

  async createCategory(data: Partial<Category>) {
    const result = await this.request<any>("/categories", {
      method: "POST",
      body: JSON.stringify(data),
    });
    return transformCategory(result);
  }

  async updateCategory(id: string, data: Partial<Category>) {
    const result = await this.request<any>(`/categories/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
    return transformCategory(result);
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
    const result = await this.request<any[]>(endpoint);
    // Asegurar que siempre retorne un array y transformar campos
    if (!Array.isArray(result)) {
      return [];
    }
    return result.map(transformSale);
  }

  async getSale(id: string) {
    const result = await this.request<any>(`/sales/${id}`);
    return transformSale(result);
  }

  async createSale(data: { items: Array<{ productId: string; quantity: number }> }) {
    const result = await this.request<any>("/sales", {
      method: "POST",
      body: JSON.stringify(data),
    });
    return transformSale(result);
  }

  async updateSaleStatus(id: string, status: SaleStatus) {
    const result = await this.request<any>(`/sales/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });
    return transformSale(result);
  }

  async cancelSale(id: string) {
    const result = await this.request<any>(`/sales/${id}/cancel`, {
      method: "PATCH",
    });
    return transformSale(result);
  }

  // Landing Page
  async getLandingPage() {
    const result = await this.request<any>("/landing");
    // Transformar los datos de la landing page
    const landingData: LandingPageData = {
      companyName: result.companyName || result.company_name || result.CompanyName || "",
      companyDescription: result.companyDescription || result.company_description || result.CompanyDescription,
      logo: result.logo || result.Logo,
      sections: Array.isArray(result.sections) 
        ? result.sections.map(transformLandingSection)
        : [],
    };
    return landingData;
  }

  async updateLandingPage(data: Partial<LandingPageData>) {
    const result = await this.request<any>("/landing", {
      method: "PUT",
      body: JSON.stringify(data),
    });
    return {
      companyName: result.companyName || result.company_name || result.CompanyName || "",
      companyDescription: result.companyDescription || result.company_description || result.CompanyDescription,
      logo: result.logo || result.Logo,
      sections: Array.isArray(result.sections) 
        ? result.sections.map(transformLandingSection)
        : [],
    };
  }

  async updateLandingSection(sectionId: string, data: Partial<LandingSection>) {
    const result = await this.request<any>(`/landing/sections/${sectionId}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
    return transformLandingSection(result);
  }

  async createLandingSection(data: Partial<LandingSection>) {
    const result = await this.request<any>("/landing/sections", {
      method: "POST",
      body: JSON.stringify(data),
    });
    return transformLandingSection(result);
  }

  async deleteLandingSection(sectionId: string) {
    return this.request<void>(`/landing/sections/${sectionId}`, {
      method: "DELETE",
    });
  }
}

export const apiClient = new ApiClient(API_BASE_URL);
