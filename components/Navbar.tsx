"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";

export default function Navbar() {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState<"admin" | "cliente" | null>(null);

  useEffect(() => {
    // Verificar si hay un token en localStorage
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("userRole") as "admin" | "cliente" | null;
    setIsLoggedIn(!!token);
    setUserRole(role);
  }, []);

  const navLinks = [{ href: "/landing", label: "Inicio" }];
  if (userRole !== "admin") {
    navLinks.push({ href: "/products", label: "Productos" });
  }

  return (
    <nav className="bg-white/95 backdrop-blur-sm shadow-md border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/landing" className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                Tienda Online
              </Link>
            </div>
            <div className="hidden sm:ml-8 sm:flex sm:space-x-6">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`inline-flex items-center px-3 py-2 text-sm font-medium transition-colors duration-200 ${
                    pathname === link.href
                      ? "text-primary-600 border-b-2 border-primary-600"
                      : "text-gray-700 hover:text-primary-600"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
          <div className="hidden sm:ml-6 sm:flex sm:items-center space-x-3">
            {isLoggedIn ? (
              <>
                {userRole === "admin" && (
                  <Link
                    href="/admin"
                    className={`px-5 py-2.5 rounded-lg text-sm font-semibold shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 ${
                      pathname?.startsWith("/admin")
                        ? "bg-gradient-primary text-white"
                        : "text-gray-700 hover:text-primary-600"
                    }`}
                  >
                    Panel Admin
                  </Link>
                )}
                <Link
                  href="/profile"
                  className="text-gray-700 hover:text-primary-600 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  Mi Perfil
                </Link>
                {userRole !== "admin" && (
                  <Link
                    href="/cart"
                    className="bg-gradient-primary text-white px-5 py-2.5 rounded-lg text-sm font-semibold shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200"
                  >
                    🛒 Carrito
                  </Link>
                )}
                <button
                  onClick={() => {
                    localStorage.removeItem("token");
                    localStorage.removeItem("userRole");
                    setIsLoggedIn(false);
                    setUserRole(null);
                    window.location.href = "/landing";
                  }}
                  className="text-gray-700 hover:text-red-600 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  Cerrar Sesión
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-gray-700 hover:text-primary-600 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  Iniciar Sesión
                </Link>
                <Link
                  href="/register"
                  className="bg-gradient-primary text-white px-5 py-2.5 rounded-lg text-sm font-semibold shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200"
                >
                  Registrarse
                </Link>
              </>
            )}
          </div>
          <div className="sm:hidden flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-lg text-gray-700 hover:text-primary-600 hover:bg-primary-50 transition-colors"
            >
              <svg
                className="h-6 w-6"
                stroke="currentColor"
                fill="none"
                viewBox="0 0 24 24"
              >
                {isMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>
      {isMenuOpen && (
        <div className="sm:hidden">
          <div className="pt-2 pb-3 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium transition-colors ${
                  pathname === link.href
                    ? "bg-primary-50 border-primary-600 text-primary-700"
                    : "border-transparent text-gray-700 hover:bg-primary-50 hover:border-primary-300 hover:text-primary-600"
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}
