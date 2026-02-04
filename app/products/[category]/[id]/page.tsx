"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { apiClient } from "@/lib/api";
import type { Product } from "@/types";

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const categoryId = params.category as string;
  const productId = params.id as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    async function loadProduct() {
      try {
        const data = await apiClient.getProduct(productId);
        // Validar que el producto sea válido
        if (data && data.id) {
          setProduct(data);
        } else {
          setProduct(null);
        }
      } catch (error: any) {
        console.error("Error loading product:", error);
        setProduct(null);
      } finally {
        setLoading(false);
      }
    }
    loadProduct();
    const role = typeof window !== "undefined" ? localStorage.getItem("userRole") : null;
    setIsAdmin(role === "admin");
  }, [productId]);

  const handleAddToCart = async () => {
    if (!product) return;

    setAddingToCart(true);
    try {
      // Obtener carrito del localStorage
      const cartJson = localStorage.getItem("cart");
      const cart = cartJson ? JSON.parse(cartJson) : [];

      // Verificar si el producto ya está en el carrito
      const existingItemIndex = cart.findIndex(
        (item: any) => item.productId === product.id
      );

      if (existingItemIndex >= 0) {
        cart[existingItemIndex].quantity += quantity;
      } else {
        cart.push({
          productId: product.id,
          product: product,
          quantity: quantity,
        });
      }

      localStorage.setItem("cart", JSON.stringify(cart));
      alert("Producto agregado al carrito");
      router.push("/cart");
    } catch (error) {
      console.error("Error adding to cart:", error);
      alert("Error al agregar el producto al carrito");
    } finally {
      setAddingToCart(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow flex items-center justify-center">
          <p className="text-gray-600">Cargando producto...</p>
        </main>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <p className="text-gray-600 text-lg mb-4">Producto no encontrado</p>
            <button
              onClick={() => router.push("/products")}
              className="text-primary-600 hover:text-primary-700 font-medium transition-colors"
            >
              Volver a Productos
            </button>
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
          <nav className="mb-6">
            <button
              onClick={() => router.push(`/products/${categoryId}`)}
              className="text-primary-600 hover:text-primary-700 font-medium transition-colors duration-200 inline-flex items-center gap-2"
            >
              <span>←</span> Volver a la categoría
            </button>
          </nav>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <img
                src={product.image || "/placeholder-product.jpg"}
                alt={product.name}
                className="w-full rounded-lg shadow-lg"
              />
            </div>
            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                {product.name}
              </h1>
              <p className="text-5xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-8">
                ${product.price.toFixed(2)}
              </p>
              <div className="mb-6 pb-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900 mb-3">
                  Descripción
                </h2>
                <p className="text-gray-700 leading-relaxed">{product.description}</p>
              </div>
              {product.stock !== undefined && (
                <div className="mb-6">
                  <span className="inline-block bg-success-100 text-success-700 px-4 py-2 rounded-lg font-semibold">
                    Stock disponible: {product.stock}
                  </span>
                </div>
              )}

              {/* Si es admin no mostramos la UI de compra */}
              {!isAdmin && (
                <>
                  <div className="flex items-center gap-4 mb-6">
                    <label htmlFor="quantity" className="text-gray-700 font-medium">
                      Cantidad:
                    </label>
                    <input
                      id="quantity"
                      type="number"
                      min="1"
                      max={product.stock || 999}
                      value={quantity}
                      onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                      className="w-20 px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                  <button
                    onClick={handleAddToCart}
                    disabled={addingToCart || (product.stock !== undefined && quantity > product.stock)}
                    className="w-full bg-gradient-primary text-white py-4 px-6 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:bg-gray-400 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none transition-all duration-200"
                  >
                    {addingToCart ? "Agregando..." : "🛒 Agregar al Carrito"}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
