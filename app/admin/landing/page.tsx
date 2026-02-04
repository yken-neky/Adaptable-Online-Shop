"use client";

import { useState, useEffect } from "react";
import { apiClient } from "@/lib/api";
import type { LandingPageData, LandingSection } from "@/types";

export default function LandingAdminPage() {
  const [landingData, setLandingData] = useState<LandingPageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    // El layout de /admin ya protege la ruta; aquí solo cargamos datos
    loadLandingData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadLandingData = async () => {
    try {
      const data = await apiClient.getLandingPage();
      setLandingData(data);
    } catch (error) {
      console.error("Error loading landing data:", error);
      setLandingData({ companyName: "Tienda Online", companyDescription: "", sections: [] });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!landingData) return;
    setSaving(true);
    try {
      await apiClient.updateLandingPage(landingData);
      alert("Landing page actualizada exitosamente");
    } catch (error) {
      console.error("Error saving landing data:", error);
      alert("Error al guardar los cambios");
    } finally {
      setSaving(false);
    }
  };

  const addSection = () => {
    if (!landingData) return;
    const newSection: LandingSection = {
      id: Date.now().toString(),
      type: "hero",
      title: "",
      content: "",
      order: landingData.sections.length + 1,
      visible: true,
    };
    setLandingData({ ...landingData, sections: [...landingData.sections, newSection] });
  };

  const updateSection = (sectionId: string, updates: Partial<LandingSection>) => {
    if (!landingData) return;
    setLandingData({
      ...landingData,
      sections: landingData.sections.map((section) =>
        section.id === sectionId ? { ...section, ...updates } : section
      ),
    });
  };

  const deleteSection = (sectionId: string) => {
    if (!landingData) return;
    setLandingData({
      ...landingData,
      sections: landingData.sections.filter((section) => section.id !== sectionId),
    });
  };

  if (loading) {
    return <div className="py-8 px-4 text-center">Cargando...</div>;
  }

  if (!landingData) return null;

  return (
    <div className="py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Personalizar Landing Page</h1>
          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-blue-600 text-white px-6 py-2 rounded-md font-semibold hover:bg-blue-700 disabled:bg-gray-400"
          >
            {saving ? "Guardando..." : "Guardar Cambios"}
          </button>
        </div>

        <div className="bg-white shadow-md rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Información de la Empresa</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-gray-700 font-medium mb-2">Nombre de la Empresa</label>
              <input
                type="text"
                value={landingData.companyName}
                onChange={(e) => setLandingData({ ...landingData, companyName: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-2">Descripción de la Empresa</label>
              <textarea
                value={landingData.companyDescription || ""}
                onChange={(e) => setLandingData({ ...landingData, companyDescription: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
          </div>
        </div>

        <div className="bg-white shadow-md rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Secciones</h2>
            <button
              onClick={addSection}
              className="bg-green-600 text-white px-4 py-2 rounded-md font-semibold hover:bg-green-700"
            >
              + Agregar Sección
            </button>
          </div>

          <div className="space-y-4">
            {landingData.sections
              .sort((a, b) => a.order - b.order)
              .map((section) => (
                <div key={section.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <select
                        value={section.type}
                        onChange={(e) =>
                          updateSection(section.id, { type: e.target.value as LandingSection["type"] })
                        }
                        className="mb-2 px-3 py-2 border border-gray-300 rounded-md"
                      >
                        <option value="hero">Hero</option>
                        <option value="about">Acerca de</option>
                        <option value="features">Características</option>
                        <option value="testimonials">Testimonios</option>
                        <option value="contact">Contacto</option>
                      </select>
                      <input
                        type="text"
                        placeholder="Título"
                        value={section.title || ""}
                        onChange={(e) => updateSection(section.id, { title: e.target.value })}
                        className="w-full mb-2 px-3 py-2 border border-gray-300 rounded-md"
                      />
                      <textarea
                        placeholder="Contenido"
                        value={section.content || ""}
                        onChange={(e) => updateSection(section.id, { content: e.target.value })}
                        rows={3}
                        className="w-full mb-2 px-3 py-2 border border-gray-300 rounded-md"
                      />
                      <input
                        type="url"
                        placeholder="URL de Imagen (opcional)"
                        value={section.image || ""}
                        onChange={(e) => updateSection(section.id, { image: e.target.value })}
                        className="w-full mb-2 px-3 py-2 border border-gray-300 rounded-md"
                      />
                      <div className="flex items-center gap-4">
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={section.visible}
                            onChange={(e) => updateSection(section.id, { visible: e.target.checked })}
                            className="mr-2"
                          />
                          Visible
                        </label>
                        <input
                          type="number"
                          placeholder="Orden"
                          value={section.order}
                          onChange={(e) => updateSection(section.id, { order: parseInt(e.target.value) || 0 })}
                          className="w-20 px-2 py-1 border border-gray-300 rounded-md"
                        />
                      </div>
                    </div>
                    <button onClick={() => deleteSection(section.id)} className="ml-4 text-red-600 hover:text-red-800">
                      Eliminar
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}
