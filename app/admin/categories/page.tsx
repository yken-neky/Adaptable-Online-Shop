"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { apiClient } from "@/lib/api";
import type { Category } from "@/types";

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ name: "", description: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    setLoading(true);
    try {
      const data = await apiClient.getCategories();
      setCategories(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert("El nombre de la categoría es requerido");
      return;
    }

    setSaving(true);
    try {
      await apiClient.createCategory({
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
      });
      setFormData({ name: "", description: "" });
      setShowForm(false);
      alert("Categoría creada exitosamente");
      load();
    } catch (error) {
      console.error("Error creating category:", error);
      alert("Error al crear la categoría");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">Categorías</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-gradient-primary text-white px-5 py-2.5 rounded-lg font-semibold shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200"
        >
          {showForm ? "Cancelar" : "+ Nueva Categoría"}
        </button>
      </div>

      {showForm && (
        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4">Crear Nueva Categoría</h3>
          <form onSubmit={handleCreateCategory} className="space-y-4">
            <div>
              <label className="block text-gray-700 font-medium mb-2">Nombre *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Ej: Electrónica"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-2">Descripción</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Descripción opcional"
                rows={3}
              />
            </div>
            <button
              type="submit"
              disabled={saving}
              className="bg-green-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-green-700 disabled:bg-gray-400 transition-colors"
            >
              {saving ? "Guardando..." : "Guardar Categoría"}
            </button>
          </form>
        </div>
      )}

      {loading ? (
        <p className="text-gray-600">Cargando...</p>
      ) : categories.length === 0 ? (
        <p className="text-gray-600">No hay categorías.</p>
      ) : (
        <div className="space-y-3">
          {categories.map((c) => (
            <div key={c.id} className="bg-white border border-gray-200 rounded-lg p-4 flex justify-between items-center">
              <div>
                <h3 className="font-semibold">{c.name}</h3>
                {c.description && <p className="text-sm text-gray-600">{c.description}</p>}
              </div>
              <div className="flex gap-2 items-center">
                <Link
                  href={`/admin/products?category=${c.id}`}
                  className="text-sm bg-blue-50 text-blue-600 hover:bg-blue-100 px-3 py-2 rounded-lg font-medium transition-colors"
                >
                  Ver productos
                </Link>
                <button className="text-sm text-blue-600 cursor-pointer hover:text-blue-800 px-3 py-2 font-medium">Editar</button>
                <button className="text-sm text-red-600 cursor-pointer hover:text-red-800 px-3 py-2 font-medium">Borrar</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
