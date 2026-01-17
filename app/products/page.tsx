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
    const categoriesData = await apiClient.getCategories();
    const productsData = await apiClient.getProducts();

    // Asegurar que sean arrays
    categories = Array.isArray(categoriesData) ? categoriesData : [];
    const allProducts = Array.isArray(productsData) ? productsData : [];

    // Agrupar productos por categoría
    if (categories.length > 0 && allProducts.length > 0) {
      categories.forEach((category) => {
        if (category && category.id) {
          productsByCategory[category.id] = allProducts.filter(
            (product) => product && product.categoryId === category.id
          );
        }
      });
    }
  } catch (error: any) {
    // Si hay error, mostrar mensaje apropiado
    console.error("Error loading products:", error);
    categories = [];
    productsByCategory = {};
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
