import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { apiClient } from "@/lib/api";

export const dynamic = 'force-dynamic';

export default async function LandingPage() {
  // En producción, esto obtendrá los datos del backend
  // Por ahora, usamos datos de ejemplo
  let landingData;
  try {
    landingData = await apiClient.getLandingPage();
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
      const { mockLandingData } = await import("@/lib/mockData");
      landingData = mockLandingData;
    } else {
      // Re-lanzar otros errores
      throw error;
    }
  }

  const visibleSections = landingData.sections
    .filter((section) => section.visible)
    .sort((a, b) => a.order - b.order);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        {visibleSections.map((section) => (
          <section key={section.id} className="py-16 px-4">
            {section.type === "hero" && (
              <div className="max-w-7xl mx-auto text-center">
                <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-primary bg-clip-text text-transparent">
                  {section.title || landingData.companyName}
                </h1>
                <p className="text-xl md:text-2xl text-gray-600 mb-10 max-w-3xl mx-auto leading-relaxed">
                  {section.content || landingData.companyDescription}
                </p>
                {section.image && (
                  <div className="rounded-2xl overflow-hidden shadow-2xl">
                    <img
                      src={section.image}
                      alt={section.title}
                      className="max-w-5xl mx-auto w-full h-auto"
                    />
                  </div>
                )}
              </div>
            )}
            {section.type === "about" && (
              <div className="max-w-4xl mx-auto bg-white/50 backdrop-blur-sm rounded-2xl p-8 shadow-lg">
                <h2 className="text-4xl font-bold text-gray-900 mb-6">
                  {section.title}
                </h2>
                <p className="text-lg text-gray-700 leading-relaxed">{section.content}</p>
              </div>
            )}
            {section.type === "features" && (
              <div className="max-w-7xl mx-auto">
                <h2 className="text-4xl font-bold text-gray-900 mb-12 text-center">
                  {section.title}
                </h2>
                <div className="text-gray-700 text-center text-lg leading-relaxed whitespace-pre-line bg-white/50 backdrop-blur-sm rounded-2xl p-8 shadow-lg">
                  {section.content}
                </div>
              </div>
            )}
            {section.type === "testimonials" && (
              <div className="max-w-7xl mx-auto">
                <h2 className="text-4xl font-bold text-gray-900 mb-12 text-center">
                  {section.title}
                </h2>
                <div className="text-gray-700 text-center text-lg leading-relaxed whitespace-pre-line bg-white/50 backdrop-blur-sm rounded-2xl p-8 shadow-lg">
                  {section.content}
                </div>
              </div>
            )}
            {section.type === "contact" && (
              <div className="max-w-4xl mx-auto bg-white/50 backdrop-blur-sm rounded-2xl p-8 shadow-lg">
                <h2 className="text-4xl font-bold text-gray-900 mb-6">
                  {section.title}
                </h2>
                <div className="text-gray-700 text-lg leading-relaxed whitespace-pre-line">{section.content}</div>
              </div>
            )}
          </section>
        ))}
      </main>
      <Footer />
    </div>
  );
}
