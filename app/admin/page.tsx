"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { apiClient } from "@/lib/api";
import type { Product, Sale } from "@/types";

export default function AdminPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Estados para animación de toggle
  const [showStockMetric, setShowStockMetric] = useState(true);
  const [showPendingMetric, setShowPendingMetric] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("userRole");
    if (!token || role !== "admin") {
      router.push("/login");
      return;
    }

    loadData();
  }, [router]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [productsData, salesData, usersData] = await Promise.all([
        apiClient.getProducts(),
        apiClient.getSales(),
        apiClient.getUsers(),
      ]);
      setProducts(productsData);
      setSales(salesData);
      setUsers(usersData);
    } catch (error) {
      console.error("Error loading dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Cálculos de métricas
  const totalUsers = users.length || 0;
  const productsInStock = products.filter((p) => (p.stock || 0) > 0).length;
  const productsSold = products.reduce((sum, p) => sum + ((p.stock || 0) > 0 ? 0 : 1), 0);
  const pendingSales = sales.filter((s) => s.status === "pendiente").length;
  const completedSales = sales.filter((s) => s.status === "realizada").length;
  const totalSalesAmount = sales
    .filter((s) => s.status !== "cancelada")
    .reduce((sum, s) => sum + (s.total || 0), 0);

  const MetricCard = ({ 
    icon, 
    label, 
    value1, 
    label1, 
    value2, 
    label2, 
    isToggled, 
    onToggle,
    color = "from-blue-500 to-blue-600"
  }: any) => {
    const hasToggle = value2 !== undefined && value2 !== null;

    return (
      <div
        className={`relative overflow-hidden rounded-lg shadow-md p-5 ${hasToggle ? "cursor-pointer" : ""} bg-gradient-to-br ${color} text-white transition-all duration-300 transform ${hasToggle ? "hover:scale-105 hover:shadow-lg" : "hover:shadow-lg"}`}
        onClick={hasToggle ? onToggle : undefined}
      >
        <div className="absolute top-3 right-3 text-2xl opacity-20">{icon}</div>
        
        <div className="relative z-10">
          <p className="text-xs font-medium opacity-90 mb-2">{label}</p>
          
          {/* Contenedor con animación flip */}
          <div className="relative h-12 flex items-center justify-start">
            {/* Métrica principal */}
            <div
              className={`absolute transition-all duration-500 transform ${
                isToggled
                  ? "opacity-0 translate-x-4"
                  : "opacity-100 translate-x-0"
              }`}
            >
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-bold">{value1}</span>
                <span className="text-sm opacity-75">{label1}</span>
              </div>
            </div>

            {/* Métrica secundaria */}
            {hasToggle && (
              <div
                className={`absolute transition-all duration-500 transform ${
                  isToggled
                    ? "opacity-100 translate-x-0"
                    : "opacity-0 -translate-x-4"
                }`}
              >
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-bold">{value2}</span>
                  <span className="text-sm opacity-75">{label2}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Indicador de toggle solo si hay dos valores */}
        {hasToggle && (
          <div className="mt-4 text-xs opacity-75 flex items-center gap-1">
            <span>Click para alternar</span>
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
              <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
            </svg>
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando métricas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Dashboard</h1>
        <p className="text-gray-600">Resumen de métricas y actividad</p>
      </div>

      {/* Grid de métricas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Usuarios registrados */}
        <MetricCard
          icon="👥"
          label="Usuarios"
          value1={totalUsers}
          label1="usuarios"
          color="from-indigo-500 to-indigo-600"
        />

        {/* Productos en stock / vendidos */}
        <MetricCard
          icon="📦"
          label="Productos"
          value1={productsInStock}
          label1="en stock"
          value2={productsSold}
          label2="sin stock"
          isToggled={!showStockMetric}
          onToggle={() => setShowStockMetric(!showStockMetric)}
          color="from-green-500 to-green-600"
        />

        {/* Ventas pendientes / realizadas */}
        <MetricCard
          icon="📊"
          label="Ventas"
          value1={pendingSales}
          label1="pendientes"
          value2={completedSales}
          label2="realizadas"
          isToggled={!showPendingMetric}
          onToggle={() => setShowPendingMetric(!showPendingMetric)}
          color="from-amber-500 to-amber-600"
        />

        {/* Total en ventas */}
        <MetricCard
          icon="💰"
          label="Total Ventas"
          value1={`$${totalSalesAmount.toFixed(2)}`}
          label1=""
          color="from-purple-500 to-purple-600"
        />
      </div>

      {/* Sección de acceso rápido */}
      <div className="bg-white rounded-xl shadow-md p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Acceso Rápido</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <a
            href="/admin/products"
            className="flex flex-col items-center justify-center p-6 border-2 border-gray-200 rounded-lg hover:border-primary-600 hover:bg-primary-50 transition-all duration-200 group"
          >
            <span className="text-3xl mb-2">📦</span>
            <span className="font-semibold text-gray-900 group-hover:text-primary-600">Productos</span>
          </a>
          <a
            href="/admin/categories"
            className="flex flex-col items-center justify-center p-6 border-2 border-gray-200 rounded-lg hover:border-primary-600 hover:bg-primary-50 transition-all duration-200 group"
          >
            <span className="text-3xl mb-2">🏷️</span>
            <span className="font-semibold text-gray-900 group-hover:text-primary-600">Categorías</span>
          </a>
          <a
            href="/admin/sales"
            className="flex flex-col items-center justify-center p-6 border-2 border-gray-200 rounded-lg hover:border-primary-600 hover:bg-primary-50 transition-all duration-200 group"
          >
            <span className="text-3xl mb-2">📈</span>
            <span className="font-semibold text-gray-900 group-hover:text-primary-600">Ventas</span>
          </a>
          <a
            href="/admin/landing"
            className="flex flex-col items-center justify-center p-6 border-2 border-gray-200 rounded-lg hover:border-primary-600 hover:bg-primary-50 transition-all duration-200 group"
          >
            <span className="text-3xl mb-2">🎨</span>
            <span className="font-semibold text-gray-900 group-hover:text-primary-600">Landing</span>
          </a>
        </div>
      </div>
    </div>
  );
}
