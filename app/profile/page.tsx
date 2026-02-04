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
  const [editMode, setEditMode] = useState(false);
  const [editForm, setEditForm] = useState({ name: "", email: "" });
  const [editError, setEditError] = useState("");
  const [editSuccess, setEditSuccess] = useState("");
  const [saving, setSaving] = useState(false);
  const [expandedSale, setExpandedSale] = useState<string | null>(null);

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
        setEditForm({ name: userData.name, email: userData.email });
        const salesData = await apiClient.getSales(userData.id);
        // Asegurar que salesData sea un array
        setSales(Array.isArray(salesData) ? salesData : []);
      } catch (error: any) {
        console.error("Error loading profile:", error);
        // En caso de error, asegurar que sales sea un array vacío
        setSales([]);
        // Si el error es de autenticación, redirigir al login
        if (error.status === 401 || error.message?.includes("401")) {
          localStorage.removeItem("token");
          localStorage.removeItem("userRole");
          router.push("/login");
        }
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [router]);

  const handleEditProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setEditError("");
    setEditSuccess("");

    if (!editForm.name.trim()) {
      return setEditError("El nombre es requerido");
    }
    if (!editForm.email.trim()) {
      return setEditError("El email es requerido");
    }

    setSaving(true);
    try {
      // Aquí iría la llamada a la API para actualizar el perfil
      // await apiClient.updateUser(user.id, editForm);
      setUser({ ...user, ...editForm });
      setEditSuccess("Perfil actualizado correctamente");
      setEditMode(false);
    } catch (error: any) {
      setEditError(error?.message || "Error al actualizar el perfil");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!confirm("⚠️ Esta acción es irreversible. ¿Deseas eliminar tu cuenta permanentemente?")) {
      return;
    }
    if (!confirm("Confirma nuevamente que deseas eliminar tu cuenta y todos tus datos.")) {
      return;
    }

    try {
      // Aquí iría la llamada a la API para eliminar la cuenta
      // await apiClient.deleteAccount(user.id);
      localStorage.removeItem("token");
      localStorage.removeItem("userRole");
      router.push("/login");
    } catch (error) {
      console.error("Error deleting account:", error);
      alert("Error al eliminar la cuenta");
    }
  };

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

  const isAdmin = user?.role === "admin";

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando perfil...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <main className="flex-grow py-4 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-1">Mi Perfil</h1>
            <p className="text-sm text-gray-600">Gestiona tu información personal y cuenta</p>
          </div>

          {/* Sección de Información Personal */}
          {user && (
            <div className="bg-white rounded-lg shadow p-5 mb-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-lg font-bold text-gray-900 mb-0.5">Información Personal</h2>
                  <p className="text-xs text-gray-600">Actualiza tus datos de perfil</p>
                </div>
                {!editMode && (
                  <button
                    onClick={() => setEditMode(true)}
                    className="bg-primary-600 hover:bg-primary-700 text-white px-3 py-1.5 rounded text-sm font-medium transition-colors"
                  >
                    ✏️ Editar
                  </button>
                )}
              </div>

              {editSuccess && (
                <div className="mb-3 p-3 bg-green-50 border border-green-200 text-green-700 rounded text-xs">
                  ✓ {editSuccess}
                </div>
              )}

              {editError && (
                <div className="mb-3 p-3 bg-red-50 border border-red-200 text-red-700 rounded text-xs">
                  ✗ {editError}
                </div>
              )}

              {editMode ? (
                <form onSubmit={handleEditProfile} className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1.5">
                      Nombre *
                    </label>
                    <input
                      type="text"
                      value={editForm.name}
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                      className="w-full px-3 py-1.5 border border-gray-300 rounded focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                      placeholder="Tu nombre"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1.5">
                      Email *
                    </label>
                    <input
                      type="email"
                      value={editForm.email}
                      onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                      className="w-full px-3 py-1.5 border border-gray-300 rounded focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                      placeholder="tu@email.com"
                    />
                  </div>
                  <div className="flex gap-2 pt-1">
                    <button
                      type="submit"
                      disabled={saving}
                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-1.5 rounded text-sm font-medium transition-colors disabled:opacity-50"
                    >
                      {saving ? "Guardando..." : "Guardar"}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setEditMode(false);
                        setEditForm({ name: user.name, email: user.email });
                        setEditError("");
                      }}
                      className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-4 py-1.5 rounded text-sm font-medium transition-colors"
                    >
                      Cancelar
                    </button>
                  </div>
                </form>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="bg-gray-50 p-3 rounded">
                    <p className="text-xs text-gray-600 mb-0.5">Nombre</p>
                    <p className="text-sm font-semibold text-gray-900">{user.name}</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded">
                    <p className="text-xs text-gray-600 mb-0.5">Email</p>
                    <p className="text-sm font-semibold text-gray-900">{user.email}</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded">
                    <p className="text-xs text-gray-600 mb-0.5">Rol</p>
                    <p className="text-sm font-semibold text-gray-900 capitalize">{user.role}</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded">
                    <p className="text-xs text-gray-600 mb-0.5">Miembro desde</p>
                    <p className="text-sm font-semibold text-gray-900">{formatDate(user.createdAt)}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Sección de Compras (solo para clientes) */}
          {!isAdmin && (
            <div className="bg-white rounded-lg shadow p-5 mb-6">
              <h2 className="text-lg font-bold text-gray-900 mb-0.5">Mis Compras</h2>
              <p className="text-xs text-gray-600 mb-4">Historial de tus compras</p>

              {!sales || sales.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-600 text-sm">📦 No tienes compras registradas</p>
                  <a href="/products" className="text-primary-600 hover:text-primary-700 font-medium mt-3 inline-block text-sm">
                    Explorar productos →
                  </a>
                </div>
              ) : (
                <div className="space-y-2">
                  {sales.map((sale) => (
                    <div key={sale.id} className="border border-gray-200 rounded shadow-sm hover:shadow transition-shadow">
                      <button
                        onClick={() => setExpandedSale(expandedSale === sale.id ? null : sale.id)}
                        className="w-full p-3 text-left hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex justify-between items-start gap-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold text-sm text-gray-900">Compra #{sale.id.slice(0, 8).toUpperCase()}</h3>
                              <span className={`inline-block px-2 py-0.5 text-xs font-medium rounded border ${getStatusColor(sale.status)}`}>
                                {sale.status}
                              </span>
                            </div>
                            <p className="text-xs text-gray-500">📅 {formatDate(sale.createdAt)}</p>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <p className="text-lg font-bold text-primary-600">${sale.total.toFixed(2)}</p>
                            <p className="text-xs text-gray-600">{sale.items?.length || 0} producto(s)</p>
                            <div className={`inline-block text-gray-400 transition-transform text-xs ${expandedSale === sale.id ? "rotate-180" : ""}`}>
                              ▼
                            </div>
                          </div>
                        </div>
                      </button>

                      {expandedSale === sale.id && (
                        <div className="border-t border-gray-200 bg-gray-50 p-3 space-y-3">
                          <div>
                            <h4 className="font-semibold text-sm text-gray-900 mb-2">Productos:</h4>
                            <div className="space-y-1 bg-white rounded p-3 border border-gray-200">
                              {sale.items && sale.items.length > 0 ? (
                                sale.items.map((item, idx) => (
                                  <div key={item.id || idx} className="flex justify-between items-start py-1.5 border-b border-gray-100 last:border-b-0">
                                    <div className="flex-1">
                                      <p className="font-medium text-sm text-gray-900">{item.product?.name || "Producto desconocido"}</p>
                                      <p className="text-xs text-gray-500">Cantidad: <span className="font-semibold">{item.quantity}</span></p>
                                    </div>
                                    <div className="text-right flex-shrink-0">
                                      <p className="font-semibold text-sm text-gray-900">${(item.price * item.quantity).toFixed(2)}</p>
                                      <p className="text-xs text-gray-500">${item.price.toFixed(2)} c/u</p>
                                    </div>
                                  </div>
                                ))
                              ) : (
                                <p className="text-xs text-gray-600">No hay productos en esta compra.</p>
                              )}
                            </div>
                          </div>

                          {sale.status === "pendiente" && (
                            <button
                              onClick={() => handleCancelSale(sale.id)}
                              className="w-full bg-red-50 hover:bg-red-100 text-red-600 font-medium py-1.5 rounded text-sm transition-colors border border-red-200"
                            >
                              Cancelar Compra
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Sección de Peligro */}
          <div className="bg-red-50 border-2 border-red-200 rounded-lg p-5">
            <div className="flex items-start gap-3">
              <div className="text-2xl flex-shrink-0">⚠️</div>
              <div className="flex-1">
                <h3 className="font-bold text-red-900 mb-1 text-sm">Zona de Peligro</h3>
                <p className="text-red-800 mb-3 text-xs">
                  Esta acción es irreversible. Eliminar tu cuenta eliminará permanentemente todos tus datos, historial de compras y acceso a tu cuenta.
                </p>
                <button
                  onClick={handleDeleteAccount}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-1.5 rounded text-sm font-medium transition-colors"
                >
                  🗑️ Eliminar Mi Cuenta
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
