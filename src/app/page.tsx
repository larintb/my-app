'use client';

import { useState, useEffect } from 'react';
import AOS from 'aos';
import 'aos/dist/aos.css';

export default function Home() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    // Force scroll to top on page load/refresh
    window.scrollTo(0, 0);
    
    // Prevent browser from restoring scroll position
    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual';
    }
    
    // Initialize AOS animations
    AOS.init({
      duration: 800,
      once: true,
    });
    
    // Cleanup function to restore scroll restoration when component unmounts
    return () => {
      if ('scrollRestoration' in history) {
        history.scrollRestoration = 'auto';
      }
    };
  }, []);

  const smoothScrollTo = (elementId: string) => {
    const element = document.getElementById(elementId);
    if (element) {
      const headerHeight = 80; // Height of the sticky header
      const elementPosition = element.offsetTop - headerHeight;
      const startPosition = window.pageYOffset;
      const distance = elementPosition - startPosition;
      const duration = 1000; // 1 second for smooth animation
      let start: number | null = null;

      const step = (timestamp: number) => {
        if (!start) start = timestamp;
        const progress = timestamp - start;
        const progressPercentage = Math.min(progress / duration, 1);
        
        // Easing function for smoother animation (ease-in-out)
        const easeInOutCubic = (t: number) => 
          t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
        
        window.scrollTo(0, startPosition + (distance * easeInOutCubic(progressPercentage)));
        
        if (progress < duration) {
          window.requestAnimationFrame(step);
        }
      };
      
      window.requestAnimationFrame(step);
    }
  };

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    e.preventDefault();
    smoothScrollTo(targetId);
    closeMobileMenu();
  };

  const handleHomeClick = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
    closeMobileMenu();
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="bg-black min-h-screen">
      {/* Header & Navigation */}
      <header className="bg-black/80 backdrop-blur-sm shadow-lg sticky top-0 z-50">
        <nav className="container mx-auto px-6 py-4 flex justify-between items-center">
          <button 
            onClick={handleHomeClick}
            className="flex items-center space-x-3 home-button cursor-pointer"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
            <span className="text-2xl font-bold text-white">myCard Services</span>
          </button>
          <div className="hidden md:flex items-center space-x-8">
            <a 
              href="#features" 
              onClick={(e) => handleNavClick(e, 'features')}
              className="text-gray-300 hover:text-white transition duration-300 cursor-pointer"
            >
              Características
            </a>
            <a 
              href="#how-it-works" 
              onClick={(e) => handleNavClick(e, 'how-it-works')}
              className="text-gray-300 hover:text-white transition duration-300 cursor-pointer"
            >
              Cómo Funciona
            </a>
            <a 
              href="#pricing" 
              onClick={(e) => handleNavClick(e, 'pricing')}
              className="text-gray-300 hover:text-white transition duration-300 cursor-pointer"
            >
              Precios
            </a>
          </div>
          <a 
            href="#contact" 
            onClick={(e) => handleNavClick(e, 'contact')}
            className="hidden md:block spotify-green text-black font-bold px-6 py-2 rounded-full hover:bg-green-400 transition duration-300 shadow-md cursor-pointer"
          >
            Comenzar
          </a>
          <button className="md:hidden" onClick={toggleMobileMenu}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7" />
            </svg>
          </button>
        </nav>
        {/* Mobile Menu */}
        <div className={`${isMobileMenuOpen ? 'block' : 'hidden'} md:hidden bg-black px-6 pt-2 pb-4 space-y-2`}>
          <a 
            href="#features" 
            onClick={(e) => handleNavClick(e, 'features')} 
            className="block text-gray-300 hover:text-white transition duration-300 rounded-md px-3 py-2 cursor-pointer"
          >
            Características
          </a>
          <a 
            href="#how-it-works" 
            onClick={(e) => handleNavClick(e, 'how-it-works')} 
            className="block text-gray-300 hover:text-white transition duration-300 rounded-md px-3 py-2 cursor-pointer"
          >
            Cómo Funciona
          </a>
          <a 
            href="#pricing" 
            onClick={(e) => handleNavClick(e, 'pricing')} 
            className="block text-gray-300 hover:text-white transition duration-300 rounded-md px-3 py-2 cursor-pointer"
          >
            Precios
          </a>
          <a 
            href="#contact" 
            onClick={(e) => handleNavClick(e, 'contact')} 
            className="block spotify-green text-black font-bold text-center mt-2 px-5 py-2 rounded-full hover:bg-green-400 transition duration-300 shadow-md cursor-pointer"
          >
            Comenzar
          </a>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="hero-gradient-bg text-white overflow-hidden min-h-screen flex items-center justify-center">
          <div className="container mx-auto px-6 py-20 md:py-32 text-center">
            <h1 className="text-4xl md:text-6xl font-extrabold leading-tight mb-4" data-aos="fade-down">El Futuro del Negocio está en la Cartera de tu Cliente</h1>
            <p className="text-lg md:text-xl max-w-3xl mx-auto mb-8 text-gray-300" data-aos="fade-up" data-aos-delay="200">Conecta sin esfuerzo con tus clientes. Nuestras tarjetas NFC proporcionan acceso instantáneo a tus servicios, precios y agendamiento de citas con un solo toque.</p>
            <a 
              href="#pricing" 
              onClick={(e) => handleNavClick(e, 'pricing')}
              className="spotify-green text-black font-bold px-8 py-4 rounded-full text-lg hover:bg-green-400 transition duration-300 transform hover:scale-105 shadow-xl inline-block cursor-pointer" 
              data-aos="zoom-in" 
              data-aos-delay="400"
            >
              Elige tu Plan
            </a>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-20 bg-black">
          <div className="container mx-auto px-6">
            <div className="text-center mb-16" data-aos="fade-up">
              <h2 className="text-3xl md:text-4xl font-bold text-white">Todo lo que tu Negocio Necesita</h2>
              <p className="text-gray-400 mt-4 max-w-2xl mx-auto">Un solo toque le da a tus clientes toda la información que necesitan para interactuar con tus servicios.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Feature 1 */}
              <div className="p-8 rounded-xl shadow-lg feature-card" data-aos="fade-up" data-aos-delay="100">
                <div className="bg-gray-800 spotify-green-text rounded-full h-16 w-16 flex items-center justify-center mb-6">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                </div>
                <h3 className="text-2xl font-semibold text-white mb-3">Agendamiento Fácil</h3>
                <p className="text-gray-400">Los clientes pueden agendar citas directamente desde su teléfono, sincronizándose con tu calendario automáticamente.</p>
              </div>
              {/* Feature 2 */}
              <div className="p-8 rounded-xl shadow-lg feature-card" data-aos="fade-up" data-aos-delay="200">
                <div className="bg-gray-800 spotify-green-text rounded-full h-16 w-16 flex items-center justify-center mb-6">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v.01" /></svg>
                </div>
                <h3 className="text-2xl font-semibold text-white mb-3">Listas de Precios Dinámicas</h3>
                <p className="text-gray-400">Muestra tus servicios y precios en una interfaz móvil atractiva y fácil de navegar. Actualízala cuando quieras.</p>
              </div>
              {/* Feature 3 */}
              <div className="p-8 rounded-xl shadow-lg feature-card" data-aos="fade-up" data-aos-delay="300">
                <div className="bg-gray-800 spotify-green-text rounded-full h-16 w-16 flex items-center justify-center mb-6">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                </div>
                <h3 className="text-2xl font-semibold text-white mb-3">Tu Centro de Negocios</h3>
                <p className="text-gray-400">Un lugar central para tu información de contacto, ubicación, horarios y redes sociales.</p>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className="py-20 bg-gray-900">
          <div className="container mx-auto px-6">
            <div className="text-center mb-16" data-aos="fade-up">
              <h2 className="text-3xl md:text-4xl font-bold text-white">Comienza en 3 Simples Pasos</h2>
              <p className="text-gray-400 mt-4 max-w-2xl mx-auto">Desde la configuración hasta el toque del cliente, nuestro proceso está diseñado para ser rápido e intuitivo.</p>
            </div>
            <div className="flex flex-col md:flex-row justify-center items-center gap-10 md:gap-4">
              {/* Step 1 */}
              <div className="flex-1 text-center max-w-sm" data-aos="fade-right">
                <div className="bg-gray-800 rounded-full h-24 w-24 flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <span className="text-4xl font-bold spotify-green-text">1</span>
                </div>
                <h3 className="text-2xl font-semibold text-white mb-2">Personaliza tu Tarjeta</h3>
                <p className="text-gray-400">Diseñamos y enviamos una tarjeta NFC con tu marca, única para tu negocio.</p>
              </div>
              {/* Arrow */}
              <div className="hidden md:block text-gray-600" data-aos="zoom-in" data-aos-delay="200">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
              </div>
              {/* Step 2 */}
              <div className="flex-1 text-center max-w-sm" data-aos="zoom-in" data-aos-delay="400">
                <div className="bg-gray-800 rounded-full h-24 w-24 flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <span className="text-4xl font-bold spotify-green-text">2</span>
                </div>
                <h3 className="text-2xl font-semibold text-white mb-2">El Cliente Toca la Tarjeta</h3>
                <p className="text-gray-400">Tu cliente simplemente toca la tarjeta con su smartphone—¡sin necesidad de una app!</p>
              </div>
              {/* Arrow */}
              <div className="hidden md:block text-gray-600" data-aos="zoom-in" data-aos-delay="600">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
              </div>
              {/* Step 3 */}
              <div className="flex-1 text-center max-w-sm" data-aos="fade-left" data-aos-delay="800">
                <div className="bg-gray-800 rounded-full h-24 w-24 flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <span className="text-4xl font-bold spotify-green-text">3</span>
                </div>
                <h3 className="text-2xl font-semibold text-white mb-2">Acceso Instantáneo</h3>
                <p className="text-gray-400">Acceden instantáneamente a tu centro de negocios para agendar, ver servicios y conectar.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="py-20 bg-black">
          <div className="container mx-auto px-6">
            <div className="text-center mb-16" data-aos="fade-up">
              <h2 className="text-3xl md:text-4xl font-bold text-white">Precios Simples y Transparentes</h2>
              <p className="text-gray-400 mt-4 max-w-2xl mx-auto">Elige el plan adecuado para ti. Sin tarifas ocultas.</p>
            </div>
            <div className="flex flex-col lg:flex-row justify-center items-stretch gap-8">
              {/* Basic Plan */}
              <div className="w-full max-w-md bg-gray-900 rounded-xl p-8 border border-gray-800 shadow-lg flex flex-col" data-aos="fade-up" data-aos-delay="100">
                <div className="flex-grow">
                  <h3 className="text-2xl font-semibold text-white">Inicial</h3>
                  <p className="text-gray-400 mt-2">Perfecto para individuos y pequeñas empresas.</p>
                  <div className="mt-6 flex items-baseline">
                    <span className="text-5xl font-extrabold text-white">$638</span>
                    <span className="text-xl text-gray-400 ml-2">MXN / mes</span>
                  </div>
                  <ul className="mt-8 space-y-4 text-gray-300">
                    <li className="flex items-center"><svg className="w-5 h-5 spotify-green-text mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>1 Tarjeta NFC Personalizada</li>
                    <li className="flex items-center"><svg className="w-5 h-5 spotify-green-text mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>Centro de Negocios Online</li>
                    <li className="flex items-center"><svg className="w-5 h-5 spotify-green-text mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>Agendamiento de Citas</li>
                    <li className="flex items-center"><svg className="w-5 h-5 spotify-green-text mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>Listas de Servicios y Precios</li>
                  </ul>
                </div>
                <a href="#" className="block text-center w-full bg-gray-300 text-black font-semibold py-3 mt-8 rounded-full hover:bg-white transition duration-300">Elegir Inicial</a>
              </div>
              {/* Pro Plan */}
              <div className="w-full max-w-md bg-gray-900 rounded-xl p-8 shadow-2xl transform lg:scale-105 border-2 border-green-500 flex flex-col" data-aos="fade-up" data-aos-delay="200">
                <div className="flex-grow">
                  <h3 className="text-2xl font-semibold spotify-green-text">Pro</h3>
                  <p className="text-gray-300 mt-2">Para empresas en crecimiento que necesitan más.</p>
                  <div className="mt-6 flex items-baseline">
                    <span className="text-5xl font-extrabold text-white">$1,298</span>
                    <span className="text-xl text-gray-400 ml-2">MXN / mes</span>
                  </div>
                  <ul className="mt-8 space-y-4 text-gray-300">
                    <li className="flex items-center"><svg className="w-5 h-5 spotify-green-text mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>Hasta 5 Tarjetas NFC</li>
                    <li className="flex items-center"><svg className="w-5 h-5 spotify-green-text mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>Todo en Inicial, además de:</li>
                    <li className="flex items-center"><svg className="w-5 h-5 spotify-green-text mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>Analíticas Avanzadas</li>
                    <li className="flex items-center"><svg className="w-5 h-5 spotify-green-text mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>Soporte Prioritario</li>
                  </ul>
                </div>
                <a href="#" className="block text-center w-full spotify-green text-black font-semibold py-3 mt-8 rounded-full hover:bg-green-400 transition duration-300">Elegir Pro</a>
              </div>
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section id="contact" className="py-20 bg-gray-900">
          <div className="container mx-auto px-6">
            <div className="max-w-2xl mx-auto bg-black p-8 md:p-12 rounded-xl shadow-2xl" data-aos="zoom-in-up">
              <div className="text-center mb-8">
                <h2 className="text-3xl md:text-4xl font-bold text-white">¿Listo para Elevar tu Negocio?</h2>
                <p className="text-gray-400 mt-4">Completa el formulario y nos pondremos en contacto para configurar tu sistema myCard.</p>
              </div>
              <form>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <input type="text" placeholder="Tu Nombre" className="w-full px-4 py-3 rounded-lg text-white placeholder-gray-500 form-input focus:outline-none focus:ring-2" />
                  <input type="text" placeholder="Nombre del Negocio" className="w-full px-4 py-3 rounded-lg text-white placeholder-gray-500 form-input focus:outline-none focus:ring-2" />
                </div>
                <div className="mb-6">
                  <input type="email" placeholder="Correo Electrónico" className="w-full px-4 py-3 rounded-lg text-white placeholder-gray-500 form-input focus:outline-none focus:ring-2" />
                </div>
                <div className="mb-6">
                  <textarea placeholder="Cuéntanos sobre tu negocio..." rows={4} className="w-full px-4 py-3 rounded-lg text-white placeholder-gray-500 form-input focus:outline-none focus:ring-2"></textarea>
                </div>
                <button type="submit" className="w-full spotify-green text-black font-bold py-4 rounded-full hover:bg-green-400 transition duration-300 shadow-lg">Solicitar una Demo</button>
              </form>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-black text-white">
        <div className="container mx-auto px-6 py-8 border-t border-gray-800">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-center md:text-left mb-4 md:mb-0">
              <span className="text-xl font-bold">myCard Services</span>
              <p className="text-gray-500 mt-1">© 2025 myCard Services. Todos los derechos reservados.</p>
            </div>
            <div className="flex space-x-6">
              <a href="#" className="text-gray-500 hover:text-white transition duration-300">Facebook</a>
              <a href="#" className="text-gray-500 hover:text-white transition duration-300">Twitter</a>
              <a href="#" className="text-gray-500 hover:text-white transition duration-300">LinkedIn</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
