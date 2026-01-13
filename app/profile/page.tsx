"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { apiClient } from "@/lib/api";
import type { Sale } from "@/types";

export default function ProfilePage() {
  const router = useRouter();
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    async function loadData() {
      try {
        const userData = await apiClient.getCurrentUser();
        setUser(userData);
        const salesData = await apiClient.getSales(userData.id);
        setSales(salesData);
      } catch (error) {
        console.error("Error loading profile:", error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [router]);

  const handleCancelSale = async (saleId: string) => {
    if (!confirm("¿Estás seguro de que deseas cancelar esta compra?")) {
      return;
    }

    try {
      await apiClient.cancelSale(saleId);
      setSales((prev) =>
        prev.map((sale) =>
          sale.id === saleId ? { ...sale, status: "cancelada" } : sale
        )
      );
      alert("Compra cancelada exitosamente");
    } catch (error) {
      console.error("Error canceling sale:", error);
      alert("Error al cancelar la compra");
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

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow flex items-center justify-center">
          <p className="text-gray-600">Cargando...</p>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Mi Perfil</h1>

          {user && (
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Información Personal
              </h2>
              <div className="space-y-2">
                <p>
                  <span className="font-medium">Nombre:</span> {user.name}
                </p>
                <p>
                  <span className="font-medium">Email:</span> {user.email}
                </p>
                <p>
                  <span className="font-medium">Rol:</span> {user.role}
                </p>
              </div>
            </div>
          )}

          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Mis Compras</h2>
            {sales.length === 0 ? (
              <p className="text-gray-600">No tienes compras registradas.</p>
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
                          Compra #{sale.id.slice(0, 8)}
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
                        {sale.status === "pendiente" && (
                          <button
                            onClick={() => handleCancelSale(sale.id)}
                            className="text-red-600 hover:text-red-800 text-sm font-medium"
                          >
                            Cancelar
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="mt-2">
                      <p className="text-gray-600">
                        Total: <span className="font-semibold">${sale.total.toFixed(2)}</span>
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        {sale.items.length} producto(s)
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
