import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4 bg-gradient-primary bg-clip-text text-transparent">Tienda Online</h3>
            <p className="text-gray-300 text-sm leading-relaxed">
              Tu tienda personalizable para todo tipo de negocio. Calidad y servicio excepcional.
            </p>
          </div>
          <div>
            <h4 className="text-md font-semibold mb-4 text-white">Enlaces</h4>
            <ul className="space-y-3">
              <li>
                <Link href="/landing" className="text-gray-300 hover:text-primary-400 text-sm transition-colors duration-200">
                  Inicio
                </Link>
              </li>
              <li>
                <Link href="/products" className="text-gray-300 hover:text-primary-400 text-sm transition-colors duration-200">
                  Productos
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-md font-semibold mb-4 text-white">Soporte</h4>
            <ul className="space-y-3">
              <li>
                <Link href="/contact" className="text-gray-300 hover:text-primary-400 text-sm transition-colors duration-200">
                  Contacto
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-gray-300 hover:text-primary-400 text-sm transition-colors duration-200">
                  Acerca de
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-md font-semibold mb-4 text-white">Legal</h4>
            <ul className="space-y-3">
              <li>
                <Link href="/privacy" className="text-gray-300 hover:text-primary-400 text-sm transition-colors duration-200">
                  Privacidad
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-gray-300 hover:text-primary-400 text-sm transition-colors duration-200">
                  Términos
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-12 pt-8 border-t border-gray-700/50 text-center">
          <p className="text-gray-400 text-sm">
            &copy; {new Date().getFullYear()} Tienda Online. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}
