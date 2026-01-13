import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";
import { apiClient } from "@/lib/api";
import type { Product, Category } from "@/types";
import { notFound } from "next/navigation";

interface PageProps {
  params: Promise<{ category: string }>;
}

export const dynamic = 'force-dynamic';

export default async function CategoryPage({ params }: PageProps) {
  const { category: categoryId } = await params;
  let category: Category | null = null;
  let products: Product[] = [];

  try {
    category = await apiClient.getCategory(categoryId);
    products = await apiClient.getProducts(categoryId);
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
      category = mockCategories.find(c => c.id === categoryId) || null;
      if (category) {
        products = mockProducts.filter(p => p.categoryId === categoryId);
      } else {
        notFound();
      }
    } else {
      console.error("Error loading category:", error);
      notFound();
    }
  }

  if (!category) {
    notFound();
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <nav className="mb-6">
            <Link
              href="/products"
              className="text-primary-600 hover:text-primary-700 font-medium transition-colors duration-200 inline-flex items-center gap-2"
            >
              <span>←</span> Volver a Productos
            </Link>
          </nav>

          <div className="mb-8 bg-gradient-to-r from-primary-50 to-accent-50 rounded-2xl p-6">
            <h1 className="text-4xl font-bold text-gray-900 mb-3">
              {category.name}
            </h1>
            {category.description && (
              <p className="text-gray-700 text-lg">{category.description}</p>
            )}
          </div>

          {products.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600 text-lg">
                No hay productos disponibles en esta categoría.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {products.map((product) => (
                <Link
                  key={product.id}
                  href={`/products/${categoryId}/${product.id}`}
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
      </main>
      <Footer />
    </div>
  );
}
