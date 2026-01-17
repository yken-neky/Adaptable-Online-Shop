import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { apiClient } from "@/lib/api";
import type { LandingPageData } from "@/types";

export const dynamic = 'force-dynamic';

export default async function LandingPage() {
  let landingData: LandingPageData | null = null;
  try {
    landingData = await apiClient.getLandingPage();
  } catch (error: any) {
    // Si el backend no está disponible, mostrar error
    console.error("Error loading landing page:", error);
    // Re-lanzar el error para que se muestre apropiadamente
    throw error;
  }

  // Validar que landingData y sections existan
  if (!landingData) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow flex items-center justify-center">
          <p className="text-gray-600">Error al cargar la página. Por favor, intenta más tarde.</p>
        </main>
        <Footer />
      </div>
    );
  }

  // Validar que sections exista y sea un array
  const sections = landingData.sections || [];
  const visibleSections = sections
    .filter((section) => section && section.visible)
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
