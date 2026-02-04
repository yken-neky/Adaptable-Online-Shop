"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { apiClient } from "@/lib/api";
import type { Product, Category } from "@/types";

export default function AdminProductsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const categoryFilter = searchParams.get("category") || "";

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState({ name: "", price: "", stock: "", description: "", image: "", categoryId: "" });
  const [categories, setCategories] = useState<Category[]>([]);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    load();
    loadCategories();
  }, [categoryFilter]);

  const load = async () => {
    setLoading(true);
    try {
      const data = await apiClient.getProducts();
      setProducts(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const data = await apiClient.getCategories();
      setCategories(data);
    } catch (err) {
      console.error("Error loading categories:", err);
    }
  };

  const openNew = () => {
    setEditing(null);
    setForm({ name: "", price: "", stock: "", description: "", image: "", categoryId: "" });
    setError("");
    setImagePreview(null);
    setShowForm(true);
  };

  const openEdit = (p: Product) => {
    setEditing(p);
    setForm({ name: p.name, price: String(p.price), stock: String(p.stock || ""), description: p.description || "", image: p.image || "", categoryId: p.categoryId || "" });
    setError("");
    setImagePreview(p.image || null);
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    // Validaciones
    if (!form.name.trim()) return setError("El nombre es requerido");
    if (!form.categoryId) return setError("La categoría es requerida");
    
    const price = Number(form.price);
    if (Number.isNaN(price) || price < 0) return setError("Precio inválido");
    
    const stock = Number(form.stock);
    if (Number.isNaN(stock) || stock < 0 || !Number.isInteger(stock)) return setError("La cantidad de stock debe ser un número entero no negativo");

    try {
      const payload = { 
        name: form.name.trim(), 
        price, 
        stock,
        description: form.description, 
        image: form.image, 
        categoryId: form.categoryId 
      };
      if (editing) {
        await apiClient.updateProduct(editing.id, payload);
      } else {
        await apiClient.createProduct(payload);
      }
      setShowForm(false);
      load();
    } catch (err: any) {
      console.error(err);
      setError(err?.message || "Error al guardar producto");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar producto?")) return;
    try {
      await apiClient.deleteProduct(id);
      setProducts((p) => p.filter((x) => x.id !== id));
    } catch (err) {
      console.error(err);
      alert("Error al eliminar producto");
    }
  };

  // Filtrar productos por categoría si está seleccionada
  const filteredProducts = categoryFilter
    ? products.filter((p) => p.categoryId === categoryFilter)
    : products;

  const selectedCategory = categories.find((c) => c.id === categoryFilter);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-semibold">Productos</h2>
          {selectedCategory && (
            <p className="text-sm text-gray-600 mt-1">
              Filtrado por: <span className="font-medium">{selectedCategory.name}</span>
            </p>
          )}
        </div>
        <button onClick={openNew} className="bg-gradient-primary text-white px-4 py-2 rounded-lg">+ Nuevo</button>
      </div>

      {/* Filtro de Categorías */}
      <div className="mb-6 bg-white border border-gray-200 rounded-lg p-4">
        <label className="block text-sm font-medium text-gray-700 mb-3">Filtrar por categoría:</label>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => router.push("/admin/products")}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              !categoryFilter
                ? "bg-primary-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Todas las categorías
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => router.push(`/admin/products?category=${cat.id}`)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                categoryFilter === cat.id
                  ? "bg-primary-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <p className="text-gray-600">Cargando...</p>
      ) : filteredProducts.length === 0 ? (
        <p className="text-gray-600">No hay productos {categoryFilter ? "en esta categoría" : ""}.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProducts.map((p) => (
            <div key={p.id} className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="h-40 bg-gray-100 rounded-md overflow-hidden mb-3 flex items-center justify-center">
                {p.image ? <img src={p.image} alt={p.name} className="object-cover h-full w-full" /> : <span className="text-gray-400">Sin imagen</span>}
              </div>
              <h3 className="font-semibold text-lg">{p.name}</h3>
              <p className="text-sm text-gray-600 mb-2">{p.description}</p>
              <div className="flex items-center justify-between">
                <span className="font-semibold">${p.price.toFixed(2)}</span>
                <div className="flex items-center gap-2">
                  <button onClick={() => openEdit(p)} className="text-blue-600 hover:underline">Editar</button>
                  <button onClick={() => handleDelete(p.id)} className="text-red-600 hover:underline">Eliminar</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-start justify-center p-4 pt-8 z-50 overflow-y-auto">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-xl">
            {/* Header */}
            <div className="flex justify-between items-center p-4 border-b border-gray-200 sticky top-0 bg-white rounded-t-lg z-10">
              <h3 className="text-lg font-semibold text-gray-900">{editing ? "Editar Producto" : "Nuevo Producto"}</h3>
              <button
                onClick={() => setShowForm(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
              >
                ✕
              </button>
            </div>

            {/* Content */}
            <form onSubmit={handleSubmit} className="p-5 space-y-3 max-h-[calc(100vh-200px)] overflow-y-auto">
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">
                  {error}
                </div>
              )}

              {/* Nombre */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Nombre *</label>
                <input
                  type="text"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Nombre del producto"
                />
              </div>

              {/* Precio */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Precio *</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  placeholder="0.00"
                />
              </div>

              {/* Categoría */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Categoría *</label>
                <select
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                  value={form.categoryId}
                  onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
                >
                  <option value="">— Selecciona una categoría —</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              {/* Stock */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Cantidad en Stock *</label>
                <input
                  type="number"
                  min="0"
                  step="1"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                  value={form.stock}
                  onChange={(e) => setForm({ ...form, stock: e.target.value })}
                  placeholder="0"
                />
              </div>

              {/* Descripción */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Descripción</label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                  rows={2}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Descripción del producto (opcional)"
                />
              </div>

              {/* Imagen */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Imagen</label>
                <div className="space-y-2">
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                    value={form.image}
                    onChange={(e) => {
                      setForm({ ...form, image: e.target.value });
                      setImagePreview(e.target.value || null);
                    }}
                    placeholder="URL de la imagen"
                  />
                  <div className="relative">
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      id="file-input"
                      onChange={async (e) => {
                        const f = e.target.files && e.target.files[0];
                        if (!f) return;
                        const reader = new FileReader();
                        reader.onload = () => {
                          const result = reader.result as string;
                          setForm((prev) => ({ ...prev, image: result }));
                          setImagePreview(result);
                        };
                        reader.readAsDataURL(f);
                      }}
                    />
                    <label
                      htmlFor="file-input"
                      className="block w-full px-3 py-2 border border-dashed border-gray-300 rounded-lg text-center cursor-pointer hover:border-primary-500 hover:bg-primary-50 transition text-sm font-medium text-gray-600"
                    >
                      O arrastra/selecciona archivo
                    </label>
                  </div>
                  {imagePreview && (
                    <div className="mt-2">
                      <p className="text-xs text-gray-500 mb-1">Vista previa:</p>
                      <div className="h-24 w-24 rounded overflow-hidden border border-gray-200">
                        <img src={imagePreview} className="object-cover h-full w-full" alt="preview" />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </form>

            {/* Footer */}
            <div className="flex justify-end gap-2 p-4 border-t border-gray-200 bg-gray-50 rounded-b-lg">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSubmit}
                className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors"
              >
                {editing ? "Actualizar" : "Crear Producto"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
