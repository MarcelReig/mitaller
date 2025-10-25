'use client';

import Link from 'next/link';
import { Palette, Mail } from 'lucide-react';

/**
 * Footer para páginas públicas
 * 
 * Features:
 * - Logo y descripción del proyecto
 * - Links útiles (Sobre nosotros, Artesanos, Contacto)
 * - Redes sociales
 * - Copyright
 * - Fondo oscuro con buen contraste
 */
export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t bg-slate-900 text-slate-200">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo y Descripción */}
          <div className="md:col-span-2">
            <Link href="/" className="flex items-center space-x-2 mb-4 hover:opacity-80 transition-opacity">
              <Palette className="h-6 w-6 text-primary" />
              <span className="text-xl font-bold text-white">MiTaller.art</span>
            </Link>
            <p className="text-sm text-slate-400 max-w-md mb-4">
              Marketplace de artesanos de Menorca. Conectamos creadores locales con 
              amantes del arte y la artesanía tradicional.
            </p>
            <p className="text-xs text-slate-500">
              Apoyando el talento local desde 2025
            </p>
          </div>

          {/* Links Útiles */}
          <div>
            <h3 className="font-semibold text-white mb-4">Enlaces</h3>
            <ul className="space-y-3">
              <li>
                <Link 
                  href="/"
                  className="text-sm text-slate-400 hover:text-white transition-colors"
                >
                  Inicio
                </Link>
              </li>
              <li>
                <Link 
                  href="/artesanos"
                  className="text-sm text-slate-400 hover:text-white transition-colors"
                >
                  Artesanos
                </Link>
              </li>
              <li>
                <Link 
                  href="/sobre-nosotros"
                  className="text-sm text-slate-400 hover:text-white transition-colors"
                >
                  Sobre Nosotros
                </Link>
              </li>
              <li>
                <Link 
                  href="/contacto"
                  className="text-sm text-slate-400 hover:text-white transition-colors"
                >
                  Contacto
                </Link>
              </li>
            </ul>
          </div>

          {/* Redes Sociales y Contacto */}
          <div>
            <h3 className="font-semibold text-white mb-4">Conecta</h3>
            <ul className="space-y-3">
              <li>
                <a
                  href="https://instagram.com/mitaller.art"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-slate-400 hover:text-white transition-colors"
                >
                  Instagram
                </a>
              </li>
              <li>
                <a
                  href="mailto:hola@mitaller.art"
                  className="flex items-center text-sm text-slate-400 hover:text-white transition-colors"
                >
                  <Mail className="h-4 w-4 mr-2" />
                  hola@mitaller.art
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-slate-800 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            {/* Copyright */}
            <p className="text-sm text-slate-500">
              © {currentYear} MiTaller.art. Todos los derechos reservados.
            </p>

            {/* Legal Links */}
            <div className="flex items-center space-x-6">
              <Link 
                href="/privacidad"
                className="text-sm text-slate-500 hover:text-slate-300 transition-colors"
              >
                Privacidad
              </Link>
              <Link 
                href="/terminos"
                className="text-sm text-slate-500 hover:text-slate-300 transition-colors"
              >
                Términos
              </Link>
              <Link 
                href="/cookies"
                className="text-sm text-slate-500 hover:text-slate-300 transition-colors"
              >
                Cookies
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
