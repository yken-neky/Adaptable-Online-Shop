"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";
import { apiClient } from "@/lib/api";
import type { CartItem } from "@/types";

export default function CartPage() {
  const router = useRouter();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const cartJson = localStorage.getItem("cart");
    if (cartJson) {
      try {
        setCart(JSON.parse(cartJson));
      } catch (error) {
        console.error("Error loading cart:", error);
      }
    }
  }, []);

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    const updatedCart = cart.map((item) =>
      item.productId === productId ? { ...item, quantity } : item
    );
    setCart(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart));
  };

  const removeFromCart = (productId: string) => {
    const updatedCart = cart.filter((item) => item.productId !== productId);
    setCart(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart));
  };

  const getTotal = () => {
    return cart.reduce(
      (total, item) => total + item.product.price * item.quantity,
      0
    );
  };

  const handleCheckout = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login?redirect=/cart");
      return;
    }

    setIsProcessing(true);
    try {
      const saleData = {
        items: cart.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
      };

      await apiClient.createSale(saleData);
      localStorage.removeItem("cart");
      setCart([]);
      alert("Compra realizada exitosamente. El administrador se pondrá en contacto contigo.");
      router.push("/profile");
    } catch (error) {
      console.error("Error creating sale:", error);
      alert("Error al procesar la compra. Por favor, intenta nuevamente.");
    } finally {
      setIsProcessing(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow flex items-center justify-center py-12">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Tu carrito está vacío
            </h1>
            <Link
              href="/products"
              className="text-primary-600 hover:text-primary-700 font-semibold transition-colors inline-flex items-center gap-2"
            >
              Ver Productos <span>→</span>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold text-gray-900 mb-2 bg-gradient-primary bg-clip-text text-transparent">
            Carrito de Compras
          </h1>
          <p className="text-gray-600 mb-8">Revisa tus productos antes de finalizar la compra</p>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="divide-y divide-gray-100">
                  {cart.map((item) => (
                    <div key={item.productId} className="p-6 flex items-center gap-4 hover:bg-gray-50 transition-colors">
                      <img
                        src={item.product.image || "/placeholder-product.jpg"}
                        alt={item.product.name}
                        className="w-24 h-24 object-cover rounded-lg shadow-md"
                      />
                      <div className="flex-grow">
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">
                          {item.product.name}
                        </h3>
                        <p className="text-primary-600 font-semibold">${item.product.price.toFixed(2)}</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                            className="w-8 h-8 rounded border border-gray-300 hover:bg-gray-100"
                          >
                            -
                          </button>
                          <span className="w-12 text-center">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                            className="w-8 h-8 rounded border border-gray-300 hover:bg-gray-100"
                          >
                            +
                          </button>
                        </div>
                        <p className="text-lg font-semibold text-gray-900 w-24 text-right">
                          ${(item.product.price * item.quantity).toFixed(2)}
                        </p>
                        <button
                          onClick={() => removeFromCart(item.productId)}
                          className="text-red-600 hover:text-red-800"
                        >
                          Eliminar
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="lg:col-span-1">
              <div className="bg-gradient-to-br from-primary-50 to-accent-50 rounded-xl shadow-lg p-6 sticky top-4 border border-primary-100">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Resumen de Compra
                </h2>
                <div className="space-y-2 mb-6">
                  <div className="flex justify-between text-gray-700 mb-2">
                    <span className="font-medium">Subtotal:</span>
                    <span className="font-semibold">${getTotal().toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between pt-4 border-t border-primary-200">
                    <span className="text-lg font-bold text-gray-900">Total:</span>
                    <span className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                      ${getTotal().toFixed(2)}
                    </span>
                  </div>
                </div>
              <button
                onClick={handleCheckout}
                disabled={isProcessing}
                className="w-full bg-gradient-primary text-white py-4 px-6 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:bg-gray-400 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none transition-all duration-200"
              >
                {isProcessing ? "Procesando..." : "✨ Finalizar Compra"}
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
