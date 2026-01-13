"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { apiClient } from "@/lib/api";
import type { Product, Category, Sale, SaleStatus } from "@/types";
import Link from "next/link";

export default function AdminPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<
    "products" | "categories" | "sales" | "landing"
  >("products");
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("userRole");
    if (!token || role !== "admin") {
      router.push("/login");
      return;
    }

    loadData();
  }, [router, activeTab]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (activeTab === "products") {
        const data = await apiClient.getProducts();
        setProducts(data);
      } else if (activeTab === "categories") {
        const data = await apiClient.getCategories();
        setCategories(data);
      } else if (activeTab === "sales") {
        const data = await apiClient.getSales();
        setSales(data);
      }
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateSaleStatus = async (saleId: string, status: SaleStatus) => {
    try {
      await apiClient.updateSaleStatus(saleId, status);
      setSales((prev) =>
        prev.map((sale) => (sale.id === saleId ? { ...sale, status } : sale))
      );
      alert("Estado actualizado exitosamente");
    } catch (error) {
      console.error("Error updating sale status:", error);
      alert("Error al actualizar el estado");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pendiente":
        return "bg-yellow-100 text-yellow-800";
      case "planificada":
        return "bg-blue-100 text-blue-800";
      case "realizada":
        return "bg-green-100 text-green-800";
      case "cancelada":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Panel de Administración</h1>

          <div className="bg-white rounded-lg shadow-md">
            <div className="border-b border-gray-200">
              <nav className="flex -mb-px">
                {[
                  { id: "products", label: "Productos" },
                  { id: "categories", label: "Categorías" },
                  { id: "sales", label: "Ventas" },
                  { id: "landing", label: "Landing Page" },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                      activeTab === tab.id
                        ? "border-primary-600 text-primary-600"
                        : "border-transparent text-gray-500 hover:text-primary-600 hover:border-primary-300"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>

            <div className="p-6">
              {loading ? (
                <p className="text-gray-600">Cargando...</p>
              ) : (
                <>
                  {activeTab === "products" && (
                    <div>
                      <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-semibold">Productos</h2>
                        <Link
                          href="/admin/products/new"
                          className="bg-gradient-primary text-white px-5 py-2.5 rounded-lg font-semibold shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200"
                        >
                          + Nuevo Producto
                        </Link>
                      </div>
                      {products.length === 0 ? (
                        <p className="text-gray-600">No hay productos.</p>
                      ) : (
                        <div className="space-y-4">
                          {products.map((product) => (
                            <div
                              key={product.id}
                              className="border border-gray-200 rounded-lg p-4 flex justify-between items-center"
                            >
                              <div>
                                <h3 className="font-semibold text-gray-900">{product.name}</h3>
                                <p className="text-gray-600">${product.price.toFixed(2)}</p>
                              </div>
                              <Link
                                href={`/admin/products/${product.id}`}
                                className="text-blue-600 hover:text-blue-800"
                              >
                                Editar
                              </Link>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {activeTab === "categories" && (
                    <div>
                      <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-semibold">Categorías</h2>
                        <Link
                          href="/admin/categories/new"
                          className="bg-gradient-primary text-white px-5 py-2.5 rounded-lg font-semibold shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200"
                        >
                          + Nueva Categoría
                        </Link>
                      </div>
                      {categories.length === 0 ? (
                        <p className="text-gray-600">No hay categorías.</p>
                      ) : (
                        <div className="space-y-4">
                          {categories.map((category) => (
                            <div
                              key={category.id}
                              className="border border-gray-200 rounded-lg p-4 flex justify-between items-center"
                            >
                              <div>
                                <h3 className="font-semibold text-gray-900">{category.name}</h3>
                                {category.description && (
                                  <p className="text-gray-600">{category.description}</p>
                                )}
                              </div>
                              <Link
                                href={`/admin/categories/${category.id}`}
                                className="text-blue-600 hover:text-blue-800"
                              >
                                Editar
                              </Link>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {activeTab === "sales" && (
                    <div>
                      <h2 className="text-xl font-semibold mb-4">Ventas</h2>
                      {sales.length === 0 ? (
                        <p className="text-gray-600">No hay ventas.</p>
                      ) : (
                        <div className="space-y-4">
                          {sales.map((sale) => (
                            <div
                              key={sale.id}
                              className="border border-gray-200 rounded-lg p-4"
                            >
                              <div className="flex justify-between items-start mb-2">
                                <div>
                                  <p className="font-semibold text-gray-900">
                                    Venta #{sale.id.slice(0, 8)}
                                  </p>
                                  <p className="text-sm text-gray-600">
                                    Cliente: {sale.user?.name || sale.userId}
                                  </p>
                                  <p className="text-sm text-gray-600">
                                    {new Date(sale.createdAt).toLocaleDateString()}
                                  </p>
                                </div>
                                <div className="flex items-center gap-4">
                                  <span
                                    className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                                      sale.status
                                    )}`}
                                  >
                                    {sale.status}
                                  </span>
                                  <select
                                    value={sale.status}
                                    onChange={(e) =>
                                      handleUpdateSaleStatus(sale.id, e.target.value as SaleStatus)
                                    }
                                    className="border border-gray-300 rounded-md px-2 py-1 text-sm"
                                  >
                                    <option value="pendiente">Pendiente</option>
                                    <option value="planificada">Planificada</option>
                                    <option value="realizada">Realizada</option>
                                    <option value="cancelada">Cancelada</option>
                                  </select>
                                </div>
                              </div>
                              <p className="text-gray-600">
                                Total: <span className="font-semibold">${sale.total.toFixed(2)}</span>
                              </p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {activeTab === "landing" && (
                    <div>
                      <h2 className="text-xl font-semibold mb-4">Personalizar Landing Page</h2>
                      <Link
                        href="/admin/landing"
                        className="bg-gradient-primary text-white px-5 py-2.5 rounded-lg font-semibold shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 inline-block"
                      >
                        ✏️ Editar Landing Page
                      </Link>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
