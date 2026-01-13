import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";
import { apiClient } from "@/lib/api";
import type { Category, Product } from "@/types";

export const dynamic = 'force-dynamic';

export default async function ProductsPage() {
  let categories: Category[] = [];
  let productsByCategory: Record<string, Product[]> = {};

  try {
    categories = await apiClient.getCategories();
    const allProducts = await apiClient.getProducts();

    // Agrupar productos por categoría
    categories.forEach((category) => {
      productsByCategory[category.id] = allProducts.filter(
        (product) => product.categoryId === category.id
      );
    });
  } catch (error: any) {
    // Si el backend no está disponible, usar datos mock
    if (
      error.message === "BACKEND_NOT_AVAILABLE" ||
      error.name === "BackendNotAvailable" ||
      error.name === "BackendNotAvailableError" ||
      error.message?.includes("fetch failed") ||
      error.message?.includes("Not Found")
    ) {
      // Importar datos mock dinámicamente
      const { mockCategories, mockProducts } = await import("@/lib/mockData");
      categories = mockCategories;
      mockCategories.forEach((category) => {
        productsByCategory[category.id] = mockProducts.filter(
          (product) => product.categoryId === category.id
        );
      });
    } else {
      console.error("Error loading products:", error);
      categories = [];
      productsByCategory = {};
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 bg-gradient-primary bg-clip-text text-transparent">
            Nuestros Productos
          </h1>
          <p className="text-gray-600 mb-8 text-lg">Descubre nuestra amplia selección de productos de calidad</p>

          {categories.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600 text-lg">
                No hay categorías disponibles en este momento.
              </p>
            </div>
          ) : (
            <div className="space-y-12">
              {categories.map((category) => {
                const products = productsByCategory[category.id] || [];
                return (
                  <div key={category.id} className="mb-12">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h2 className="text-2xl font-semibold text-gray-900">
                          {category.name}
                        </h2>
                        {category.description && (
                          <p className="text-gray-600 mt-1">{category.description}</p>
                        )}
                      </div>
                      <Link
                        href={`/products/${category.id}`}
                        className="text-primary-600 hover:text-primary-700 font-semibold transition-colors duration-200 flex items-center gap-1"
                      >
                        Ver todos <span>→</span>
                      </Link>
                    </div>

                    {products.length === 0 ? (
                      <p className="text-gray-500">No hay productos en esta categoría.</p>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {products.slice(0, 4).map((product) => (
                          <Link
                            key={product.id}
                            href={`/products/${category.id}/${product.id}`}
                            className="bg-white rounded-xl shadow-md overflow-hidden card-hover group"
                          >
                            <div className="aspect-w-1 aspect-h-1 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
                              <img
                                src={product.image || "/placeholder-product.jpg"}
                                alt={product.name}
                                className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500"
                              />
                            </div>
                            <div className="p-5">
                              <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors">
                                {product.name}
                              </h3>
                              <p className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                                ${product.price.toFixed(2)}
                              </p>
                            </div>
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
