"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { apiClient } from "@/lib/api";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/landing";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const validateEmail = (value: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (!email.trim() || !password.trim()) {
      setError("Por favor, completa todos los campos");
      return;
    }

    if (email && !validateEmail(email.trim())) {
      setEmailError("Por favor, ingresa un correo electrónico válido.");
      return;
    }

    if (password && password.length < 6) {
      setPasswordError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    setLoading(true);

    try {
      const response = await apiClient.login(email.trim().toLowerCase(), password);
      if ('error' in response) {
        setError(response.error);
      } else {
        apiClient.setToken(response.token);
        localStorage.setItem("userRole", response.user.role);
        // Si es admin, llevar directo al panel admin
        const target = response.user?.role === "admin" ? "/admin" : redirect;
        router.push(target);
      }
    } catch (err: any) {
      // Para errores no esperados (5xx, conexión, etc.)
      const errorMessage = err.message || "Error al iniciar sesión. Verifica tus credenciales.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-md">
          <h1 className="text-3xl font-bold text-gray-900 mb-6 text-center">
            Iniciar Sesión
          </h1>
          <form onSubmit={handleSubmit} className="bg-white shadow-xl rounded-2xl p-8 border border-gray-100">
            {error && (
              <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                {error}
              </div>
            )}
            <div className="mb-4">
              <label htmlFor="email" className="block text-gray-700 font-medium mb-2">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => {
                  const v = e.target.value;
                  setEmail(v);
                  if (!v.trim()) {
                    setEmailError("El email es requerido");
                  } else if (!validateEmail(v.trim())) {
                    setEmailError("Por favor, ingresa un correo electrónico válido.");
                  } else {
                    setEmailError("");
                  }
                }}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
              />
              {emailError && <p className="text-sm text-red-600 mt-1">{emailError}</p>}
            </div>
            <div className="mb-6">
              <label htmlFor="password" className="block text-gray-700 font-medium mb-2">
                Contraseña
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => {
                  const v = e.target.value;
                  setPassword(v);
                  if (!v) {
                    setPasswordError("La contraseña es requerida");
                  } else if (v.length < 6) {
                    setPasswordError("La contraseña debe tener al menos 6 caracteres.");
                  } else {
                    setPasswordError("");
                  }
                }}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
              />
              {passwordError && <p className="text-sm text-red-600 mt-1">{passwordError}</p>}
            </div>
            <button
              type="submit"
              disabled={loading || !!emailError || !!passwordError}
              className="w-full bg-gradient-primary text-white py-3 px-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:bg-gray-400 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none transition-all duration-200"
            >
              {loading ? "Iniciando sesión..." : "Iniciar Sesión"}
            </button>
            <p className="mt-4 text-center text-gray-600">
              ¿No tienes una cuenta?{" "}
              <Link href="/register" className="text-primary-600 hover:text-primary-700 font-semibold transition-colors">
                Regístrate
              </Link>
            </p>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow flex items-center justify-center">
          <p className="text-gray-600">Cargando...</p>
        </main>
        <Footer />
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
