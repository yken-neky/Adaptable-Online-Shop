"use client";

import React, { useEffect, useState } from "react";
import { apiClient } from "@/lib/api";
import type { Sale, SaleStatus } from "@/types";

export default function AdminSalesPage() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedSale, setExpandedSale] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    try {
      const data = await apiClient.getSales();
      setSales(data);
    } catch (err) {
      console.error(err);
    } finally { setLoading(false); }
  };

  const updateStatus = async (id: string, status: SaleStatus) => {
    try {
      await apiClient.updateSaleStatus(id, status);
      setSales((s) => s.map((x) => x.id === id ? { ...x, status } : x));
    } catch (err) {
      console.error(err);
      alert("Error actualizando estado");
    }
  };

  const getStatusColor = (status: SaleStatus) => {
    switch (status) {
      case "pendiente":
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case "planificada":
        return "bg-blue-100 text-blue-800 border-blue-300";
      case "realizada":
        return "bg-green-100 text-green-800 border-green-300";
      case "cancelada":
        return "bg-red-100 text-red-800 border-red-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusLabel = (status: SaleStatus) => {
    const labels: Record<SaleStatus, string> = {
      pendiente: "Pendiente",
      planificada: "Planificada",
      realizada: "Realizada",
      cancelada: "Cancelada",
    };
    return labels[status];
  };

  // Filtrar ventas según búsqueda
  const filteredSales = sales.filter((sale) => {
    const searchLower = searchTerm.toLowerCase();
    const clientName = (sale.user?.name || "").toLowerCase();
    const clientEmail = (sale.user?.email || "").toLowerCase();
    const saleId = sale.id.toLowerCase();
    const status = getStatusLabel(sale.status).toLowerCase();

    return (
      clientName.includes(searchLower) ||
      clientEmail.includes(searchLower) ||
      saleId.includes(searchLower) ||
      status.includes(searchLower) ||
      sale.total.toString().includes(searchTerm)
    );
  });

  return (
    <div className="bg-gray-50 -m-6 p-6 min-h-screen">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Gestión de Ventas</h1>
        <p className="text-gray-600 mt-1">Total de ventas: {sales.length}</p>
      </div>

      {/* Buscador */}
      <div className="mb-6">
        <div className="relative">
          <input
            type="text"
            placeholder="Buscar por nombre, email, ID de venta, estado o monto..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm transition-all"
          />
          <svg
            className="absolute left-3 top-3.5 h-5 w-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          )}
        </div>
        {searchTerm && (
          <p className="text-sm text-gray-600 mt-2">
            Mostrando {filteredSales.length} de {sales.length} ventas
          </p>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center p-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando ventas...</p>
          </div>
        </div>
      ) : sales.length === 0 ? (
        <div className="text-center py-12 bg-white border border-gray-200 rounded-lg">
          <p className="text-gray-600 text-lg">No hay ventas registradas.</p>
        </div>
      ) : filteredSales.length === 0 ? (
        <div className="text-center py-12 bg-white border border-gray-200 rounded-lg">
          <p className="text-gray-600 text-lg">No se encontraron ventas que coincidan con "{searchTerm}"</p>
          <button
            onClick={() => setSearchTerm("")}
            className="mt-4 text-primary-600 hover:text-primary-700 font-medium"
          >
            Limpiar búsqueda
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredSales.map((sale) => (
            <div key={sale.id} className="bg-white border border-gray-200 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-200">
              {/* Header de la venta */}
              <button
                onClick={() => setExpandedSale(expandedSale === sale.id ? null : sale.id)}
                className="w-full p-5 text-left hover:bg-gray-50 transition-colors"
              >
                <div className="flex justify-between items-start gap-4">
                  {/* Información izquierda */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-gray-900">Compra #{sale.id.slice(0, 8).toUpperCase()}</h3>
                      <span
                        className={`inline-block px-3 py-1 text-xs font-medium rounded-full border ${getStatusColor(
                          sale.status
                        )}`}
                      >
                        {getStatusLabel(sale.status)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-1">
                      <span className="font-medium">Cliente:</span> {sale.user?.name || sale.userId}
                    </p>
                    <p className="text-xs text-gray-500">
                      📅 {formatDate(sale.createdAt)}
                    </p>
                  </div>

                  {/* Información derecha */}
                  <div className="text-right flex-shrink-0">
                    <p className="text-2xl font-bold text-primary-600 mb-2">${sale.total.toFixed(2)}</p>
                    <p className="text-xs text-gray-600 mb-3">{sale.items?.length || 0} producto(s)</p>
                    <div
                      className={`inline-block text-gray-400 transition-transform ${
                        expandedSale === sale.id ? "rotate-180" : ""
                      }`}
                    >
                      ▼
                    </div>
                  </div>
                </div>
              </button>

              {/* Contenido expandido */}
              {expandedSale === sale.id && (
                <div className="border-t border-gray-200 bg-gray-50 p-5 space-y-4">
                  {/* Lista de productos */}
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Productos comprados:</h4>
                    <div className="space-y-2 bg-white rounded-lg p-4 border border-gray-200">
                      {sale.items && sale.items.length > 0 ? (
                        sale.items.map((item, idx) => (
                          <div
                            key={item.id || idx}
                            className="flex justify-between items-start py-2 border-b border-gray-100 last:border-b-0"
                          >
                            <div className="flex-1">
                              <p className="font-medium text-gray-900">
                                {item.product?.name || "Producto desconocido"}
                              </p>
                              <p className="text-xs text-gray-500">
                                Cantidad: <span className="font-semibold">{item.quantity}</span>
                              </p>
                            </div>
                            <div className="text-right flex-shrink-0">
                              <p className="font-semibold text-gray-900">
                                ${(item.price * item.quantity).toFixed(2)}
                              </p>
                              <p className="text-xs text-gray-500">${item.price.toFixed(2)} c/u</p>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-gray-600">No hay productos en esta venta.</p>
                      )}
                    </div>
                  </div>

                  {/* Cambiar estado */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Cambiar estado de la venta:
                    </label>
                    <select
                      value={sale.status}
                      onChange={(e) => updateStatus(sale.id, e.target.value as SaleStatus)}
                      disabled={sale.status === "cancelada"}
                      className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm ${
                        sale.status === "cancelada"
                          ? "bg-gray-100 text-gray-500 cursor-not-allowed opacity-60"
                          : ""
                      }`}
                    >
                      <option value="pendiente">Pendiente</option>
                      <option value="planificada">Planificada</option>
                      <option value="realizada">Realizada</option>
                      <option value="cancelada">Cancelada</option>
                    </select>
                    {sale.status === "cancelada" && (
                      <p className="text-xs text-red-600 mt-2">⚠️ Las ventas canceladas no pueden ser modificadas.</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

