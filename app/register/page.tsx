"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { apiClient } from "@/lib/api";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const validateEmail = (value: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setConfirmPasswordError("Las contraseñas no coinciden");
      return;
    }

    if (formData.password.length < 6) {
      setPasswordError("La contraseña debe tener al menos 6 caracteres");
      return;
    }

    if (!formData.name.trim()) {
      setError("El nombre es requerido");
      return;
    }

    if (!formData.email.trim() || !validateEmail(formData.email.trim())) {
      setEmailError("El email no es válido");
      return;
    }

    setLoading(true);

    try {
      const response = await apiClient.register({
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
      });
      if ('error' in response) {
        setError(response.error);
        return;
      }
      apiClient.setToken(response.token);
      localStorage.setItem("userRole", response.user.role);
      router.push("/landing");
    } catch (err: any) {
      // Mostrar el mensaje de error del backend o un mensaje genérico
      const errorMessage = err.message || "Error al registrarse. Por favor, verifica tus datos.";
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
            Crear Cuenta
          </h1>
          <form onSubmit={handleSubmit} className="bg-white shadow-xl rounded-2xl p-8 border border-gray-100">
            {error && (
              <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                {error}
              </div>
            )}
            <div className="mb-4">
              <label htmlFor="name" className="block text-gray-700 font-medium mb-2">
                Nombre
              </label>
              <input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
              />
            </div>
            <div className="mb-4">
              <label htmlFor="email" className="block text-gray-700 font-medium mb-2">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => {
                  const v = e.target.value;
                  setFormData({ ...formData, email: v });
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
            <div className="mb-4">
              <label htmlFor="password" className="block text-gray-700 font-medium mb-2">
                Contraseña
              </label>
              <input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => {
                  const v = e.target.value;
                  setFormData({ ...formData, password: v });
                  if (!v) {
                    setPasswordError("La contraseña es requerida");
                  } else if (v.length < 6) {
                    setPasswordError("La contraseña debe tener al menos 6 caracteres");
                  } else {
                    setPasswordError("");
                  }
                }}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
              />
              {passwordError && <p className="text-sm text-red-600 mt-1">{passwordError}</p>}
            </div>
            <div className="mb-6">
              <label htmlFor="confirmPassword" className="block text-gray-700 font-medium mb-2">
                Confirmar Contraseña
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => {
                  const v = e.target.value;
                  setFormData({ ...formData, confirmPassword: v });
                  if (v !== formData.password) {
                    setConfirmPasswordError("Las contraseñas no coinciden");
                  } else {
                    setConfirmPasswordError("");
                  }
                }}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
              />
              {confirmPasswordError && <p className="text-sm text-red-600 mt-1">{confirmPasswordError}</p>}
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-primary text-white py-3 px-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:bg-gray-400 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none transition-all duration-200"
            >
              {loading ? "Registrando..." : "Registrarse"}
            </button>
            <p className="mt-4 text-center text-gray-600">
              ¿Ya tienes una cuenta?{" "}
              <Link href="/login" className="text-primary-600 hover:text-primary-700 font-semibold transition-colors">
                Inicia Sesión
              </Link>
            </p>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
}
