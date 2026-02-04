import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { apiClient } from "@/lib/api";
import type { LandingPageData } from "@/types";
import Link from "next/link";
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
                <div className="max-w-7xl mx-auto">
                  <div className={`grid grid-cols-1 md:grid-cols-2 gap-8 items-center`}>
                    <div>
                      <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
                        {section.title || landingData.companyName}
                      </h1>
                      <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                        {section.content || landingData.companyDescription}
                      </p>
                      <Link
                        href="/products"
                        className="inline-block bg-gradient-primary text-white px-8 py-3 rounded-lg font-semibold hover:shadow-lg transition-all transform hover:-translate-y-0.5"
                      >
                        Comenzar Ahora →
                      </Link>
                    </div>
                    {section.image && (
                      <div className="rounded-2xl overflow-hidden shadow-2xl">
                        <img
                          src={section.image}
                          alt={section.title}
                          className="w-full h-auto object-cover aspect-square md:aspect-auto"
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}
            {section.type === "about" && (
                <div className="max-w-4xl mx-auto">
                  <div className={`grid grid-cols-1 md:grid-cols-2 gap-8 items-center`}>
                    {section.image && (
                      <div className="rounded-2xl overflow-hidden shadow-lg order-2 md:order-1">
                        <img
                          src={section.image}
                          alt={section.title}
                          className="w-full h-auto object-cover"
                        />
                      </div>
                    )}
                    <div className={section.image ? "order-1 md:order-2" : ""}>
                      <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                        {section.title}
                      </h2>
                      <p className="text-gray-700 text-lg leading-relaxed whitespace-pre-line">
                        {section.content}
                      </p>
                    </div>
                  </div>
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
