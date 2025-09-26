'use client';

import React, { useState, useEffect } from 'react';
import AOS from 'aos';
import 'aos/dist/aos.css';
import { ClientThemeToggle } from '@/components/ui/ClientThemeToggle';
import ElectricBorder from '@/components/ElectricBorder';
import GlareHover from '@/components/GlareHover';

export default function Home() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    business_name: '',
    email: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');
  const [submitError, setSubmitError] = useState('');

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

      // Use requestAnimationFrame for immediate response
      requestAnimationFrame(() => {
        window.scrollTo({
          top: elementPosition,
          behavior: 'smooth'
        });
      });
    }
  };

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    e.preventDefault();
    smoothScrollTo(targetId);
    closeMobileMenu();
  };

  const handleHomeClick = () => {
    // Instant smooth scroll to top with requestAnimationFrame
    requestAnimationFrame(() => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
    closeMobileMenu();
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear errors when user starts typing
    if (submitError) setSubmitError('');
    if (submitMessage) setSubmitMessage('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError('');
    setSubmitMessage('');

    try {
      const response = await fetch('/api/demo-requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (result.success) {
        setSubmitMessage(result.message);
        setFormData({ name: '', business_name: '', email: '', message: '' }); // Reset form
      } else {
        setSubmitError(result.error || 'Error al enviar la solicitud');
      }
    } catch (error) {
      console.error('Form submission error:', error);
      setSubmitError('Error de conexión. Inténtalo de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
      {/* Header & Navigation */}
      <header className="backdrop-blur-sm shadow-lg sticky top-0 z-50" style={{ backgroundColor: 'var(--header-bg)' }}>
        <nav className="container mx-auto px-6 py-4 flex justify-between items-center">
          <button 
            onClick={handleHomeClick}
            className="flex items-center space-x-3 home-button cursor-pointer"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
            <span className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>myCard Services</span>
          </button>
          
          <div className="hidden md:flex items-center space-x-8">
            <a 
              href="#features" 
              onClick={(e) => handleNavClick(e, 'features')}
              className="transition duration-300 cursor-pointer hover:text-green-500"
              style={{ color: 'var(--text-secondary)' }}
            >
              Características
            </a>
            <a 
              href="#how-it-works" 
              onClick={(e) => handleNavClick(e, 'how-it-works')}
              className="transition duration-300 cursor-pointer hover:text-green-500"
              style={{ color: 'var(--text-secondary)' }}
            >
              Cómo Funciona
            </a>
            <a 
              href="#pricing" 
              onClick={(e) => handleNavClick(e, 'pricing')}
              className="transition duration-300 cursor-pointer hover:text-green-500"
              style={{ color: 'var(--text-secondary)' }}
            >
              Precios
            </a>
            <ClientThemeToggle />
          </div>
          
          <a 
            href="#contact" 
            onClick={(e) => handleNavClick(e, 'contact')}
            className="hidden md:block spotify-green text-black font-bold px-6 py-2 rounded-full hover:bg-green-400 transition duration-300 shadow-md cursor-pointer"
          >
            Comenzar
          </a>
          
          <button className="md:hidden" onClick={toggleMobileMenu}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ color: 'var(--text-secondary)' }}>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7" />
            </svg>
          </button>
        </nav>
        
        {/* Mobile Menu */}
        <div className={`${isMobileMenuOpen ? 'block' : 'hidden'} md:hidden px-6 pt-2 pb-4 space-y-2`} style={{ backgroundColor: 'var(--bg-primary)' }}>
          <a 
            href="#features" 
            onClick={(e) => handleNavClick(e, 'features')} 
            className="block transition duration-300 rounded-md px-3 py-2 cursor-pointer hover:text-green-500"
            style={{ color: 'var(--text-secondary)' }}
          >
            Características
          </a>
          <a 
            href="#how-it-works" 
            onClick={(e) => handleNavClick(e, 'how-it-works')} 
            className="block transition duration-300 rounded-md px-3 py-2 cursor-pointer hover:text-green-500"
            style={{ color: 'var(--text-secondary)' }}
          >
            Cómo Funciona
          </a>
          <a 
            href="#pricing" 
            onClick={(e) => handleNavClick(e, 'pricing')} 
            className="block transition duration-300 rounded-md px-3 py-2 cursor-pointer hover:text-green-500"
            style={{ color: 'var(--text-secondary)' }}
          >
            Precios
          </a>
          <div className="flex justify-center py-2">
            <ClientThemeToggle />
          </div>
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
        <section className="hero-gradient-bg overflow-hidden min-h-screen flex items-center justify-center" style={{ color: 'var(--text-primary)' }}>
          <div className="container mx-auto px-6 py-20 md:py-32 text-center">
            <h1 className="text-4xl md:text-6xl font-extrabold leading-tight mb-4" data-aos="fade-down">El Futuro del Negocio está en la Cartera de tu Cliente</h1>
            <p className="text-lg md:text-xl max-w-3xl mx-auto mb-8" style={{ color: 'var(--text-secondary)' }} data-aos="fade-up" data-aos-delay="200">Conecta sin esfuerzo con tus clientes. Nuestras tarjetas NFC proporcionan acceso instantáneo a tus servicios, precios y agendamiento de citas con un solo toque.</p>
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
        <section id="features" className="py-20" style={{ backgroundColor: 'var(--bg-primary)' }}>
          <div className="container mx-auto px-6">
            <div className="text-center mb-16" data-aos="fade-up">
              <h2 className="text-3xl md:text-4xl font-bold" style={{ color: 'var(--text-primary)' }}>Todo lo que tu Negocio Necesita</h2>
              <p className="mt-4 max-w-2xl mx-auto" style={{ color: 'var(--text-secondary)' }}>Un solo toque le da a tus clientes toda la información que necesitan para interactuar con tus servicios.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Feature 1 */}
              <div className="p-8 rounded-xl shadow-lg feature-card" data-aos="fade-up" data-aos-delay="100">
                <div className="rounded-full h-16 w-16 flex items-center justify-center mb-6" style={{ backgroundColor: 'var(--bg-secondary)' }}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 spotify-green-text" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                </div>
                <h3 className="text-2xl font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>Agendamiento Fácil</h3>
                <p style={{ color: 'var(--text-secondary)' }}>Los clientes pueden agendar citas directamente desde su teléfono, sincronizándose con tu calendario automáticamente.</p>
              </div>
              {/* Feature 2 */}
              <div className="p-8 rounded-xl shadow-lg feature-card" data-aos="fade-up" data-aos-delay="200">
                <div className="rounded-full h-16 w-16 flex items-center justify-center mb-6" style={{ backgroundColor: 'var(--bg-secondary)' }}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 spotify-green-text" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v.01" /></svg>
                </div>
                <h3 className="text-2xl font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>Listas de Precios Dinámicas</h3>
                <p style={{ color: 'var(--text-secondary)' }}>Muestra tus servicios y precios en una interfaz móvil atractiva y fácil de navegar. Actualízala cuando quieras.</p>
              </div>
              {/* Feature 3 */}
              <div className="p-8 rounded-xl shadow-lg feature-card" data-aos="fade-up" data-aos-delay="300">
                <div className="rounded-full h-16 w-16 flex items-center justify-center mb-6" style={{ backgroundColor: 'var(--bg-secondary)' }}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 spotify-green-text" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                </div>
                <h3 className="text-2xl font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>Tu Centro de Negocios</h3>
                <p style={{ color: 'var(--text-secondary)' }}>Un lugar central para tu información de contacto, ubicación, horarios y redes sociales.</p>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className="py-20" style={{ backgroundColor: 'var(--bg-secondary)' }}>
          <div className="container mx-auto px-6">
            <div className="text-center mb-16" data-aos="fade-up">
              <h2 className="text-3xl md:text-4xl font-bold" style={{ color: 'var(--text-primary)' }}>Comienza en 3 Simples Pasos</h2>
              <p className="mt-4 max-w-2xl mx-auto" style={{ color: 'var(--text-secondary)' }}>Desde la configuración hasta el toque del cliente, nuestro proceso está diseñado para ser rápido e intuitivo.</p>
            </div>
            <div className="flex flex-col md:flex-row justify-center items-center gap-10 md:gap-4">
              {/* Step 1 */}
              <div className="flex-1 text-center max-w-sm" data-aos="fade-right">
                <div className="rounded-full h-24 w-24 flex items-center justify-center mx-auto mb-4 shadow-lg" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
                  <span className="text-4xl font-bold spotify-green-text">1</span>
                </div>
                <h3 className="text-2xl font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>Personaliza tu Tarjeta</h3>
                <p style={{ color: 'var(--text-secondary)' }}>Diseñamos y enviamos una tarjeta NFC con tu marca, única para tu negocio.</p>
              </div>
              {/* Arrow */}
              <div className="hidden md:block" style={{ color: 'var(--text-muted)' }} data-aos="zoom-in" data-aos-delay="200">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
              </div>
              {/* Step 2 */}
              <div className="flex-1 text-center max-w-sm" data-aos="zoom-in" data-aos-delay="400">
                <div className="rounded-full h-24 w-24 flex items-center justify-center mx-auto mb-4 shadow-lg" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
                  <span className="text-4xl font-bold spotify-green-text">2</span>
                </div>
                <h3 className="text-2xl font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>El Cliente Toca la Tarjeta</h3>
                <p style={{ color: 'var(--text-secondary)' }}>Tu cliente simplemente toca la tarjeta con su smartphone—¡sin necesidad de una app!</p>
              </div>
              {/* Arrow */}
              <div className="hidden md:block" style={{ color: 'var(--text-muted)' }} data-aos="zoom-in" data-aos-delay="600">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
              </div>
              {/* Step 3 */}
              <div className="flex-1 text-center max-w-sm" data-aos="fade-left" data-aos-delay="800">
                <div className="rounded-full h-24 w-24 flex items-center justify-center mx-auto mb-4 shadow-lg" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
                  <span className="text-4xl font-bold spotify-green-text">3</span>
                </div>
                <h3 className="text-2xl font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>Acceso Instantáneo</h3>
                <p style={{ color: 'var(--text-secondary)' }}>Acceden instantáneamente a tu centro de negocios para agendar, ver servicios y conectar.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="py-20" style={{ backgroundColor: 'var(--bg-primary)' }}>
          <div className="container mx-auto px-6">
            <div className="text-center mb-16" data-aos="fade-up">
              <h2 className="text-3xl md:text-4xl font-bold" style={{ color: 'var(--text-primary)' }}>Precios Simples y Transparentes</h2>
              <p className="mt-4 max-w-2xl mx-auto" style={{ color: 'var(--text-secondary)' }}>Elige el plan adecuado para ti. Sin tarifas ocultas.</p>
            </div>
            <div className="flex flex-col lg:flex-row justify-center items-stretch gap-8">
              {/* Basic Plan */}
              <div className="w-full max-w-md rounded-xl p-8 shadow-lg flex flex-col feature-card" data-aos="fade-up" data-aos-delay="100">
                <div className="flex-grow">
                  <h3 className="text-2xl font-semibold" style={{ color: 'var(--text-primary)' }}>Inicial</h3>
                  <p className="mt-2" style={{ color: 'var(--text-secondary)' }}>Perfecto para individuos y pequeñas empresas.</p>
                  <div className="mt-6 flex items-baseline">
                    <span className="text-5xl font-extrabold" style={{ color: 'var(--text-primary)' }}>$1,200</span>
                    <span className="text-xl ml-2" style={{ color: 'var(--text-secondary)' }}>MXN / mes</span>
                  </div>
                  <ul className="mt-8 space-y-4" style={{ color: 'var(--text-secondary)' }}>
                    <li className="flex items-center"><svg className="w-5 h-5 spotify-green-text mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>5 Tarjeta NFC para clientes</li>
                    <li className="flex items-center"><svg className="w-5 h-5 spotify-green-text mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>Centro de Negocios Online</li>
                    <li className="flex items-center"><svg className="w-5 h-5 spotify-green-text mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>Agendamiento de Citas</li>
                    <li className="flex items-center"><svg className="w-5 h-5 spotify-green-text mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>Listas de Servicios y Precios</li>
                  </ul>
                </div>
                <a
                  href="#contact"
                  onClick={(e) => handleNavClick(e, 'contact')}
                  className="block text-center w-full text-black font-semibold py-3 mt-8 rounded-full transition duration-300 cursor-pointer hover:opacity-80"
                  style={{ backgroundColor: 'var(--text-muted)' }}
                >
                  Elegir Inicial
                </a>
              </div>
              {/* Pro Plan */}
              <ElectricBorder
                color="#22c55e"
                speed={1}
                chaos={0.3}
                thickness={2}
                style={{ borderRadius: 12 }}
              >
                <GlareHover
                  glareColor="#ffffff"
                  glareOpacity={0.3}
                  glareAngle={-30}
                  glareSize={300}
                  transitionDuration={800}
                  playOnce={false}
                >
                <div className="w-full max-w-md p-8 shadow-2xl transform lg:scale-105 flex flex-col feature-card" data-aos="fade-up" data-aos-delay="200">
                <div className="flex-grow">
                  <h3 className="text-2xl font-semibold spotify-green-text">Pro</h3>
                  <p className="mt-2" style={{ color: 'var(--text-primary)' }}>Para empresas en crecimiento que necesitan más.</p>
                  <div className="mt-6 flex items-baseline">
                    <span className="text-5xl font-extrabold" style={{ color: 'var(--text-primary)' }}>$2,000</span>
                    <span className="text-xl ml-2" style={{ color: 'var(--text-secondary)' }}>MXN / mes</span>
                  </div>
                  <ul className="mt-8 space-y-4" style={{ color: 'var(--text-secondary)' }}>
                    <li className="flex items-center"><svg className="w-5 h-5 spotify-green-text mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>Hasta 5 Tarjetas NFC</li>
                    <li className="flex items-center"><svg className="w-5 h-5 spotify-green-text mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>Todo en Inicial, además de:</li>
                    <li className="flex items-center"><svg className="w-5 h-5 spotify-green-text mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>Analíticas Avanzadas</li>
                    <li className="flex items-center"><svg className="w-5 h-5 spotify-green-text mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>Soporte Prioritario</li>
                  </ul>
                </div>
                
                <a
                  href="#contact"
                  onClick={(e) => handleNavClick(e, 'contact')}
                  className="block text-center w-full spotify-green text-black font-semibold py-3 mt-8 rounded-full hover:bg-green-400 transition duration-300 cursor-pointer"
                >
                  Elegir Pro
                </a>
                
                </div>
                </GlareHover>
              </ElectricBorder>
            </div>
            
          </div>
        </section>

        {/* Contact Section */}
        <section id="contact" className="py-20" style={{ backgroundColor: 'var(--bg-secondary)' }}>
          <div className="container mx-auto px-6">
            <div className="max-w-2xl mx-auto p-8 md:p-12 rounded-xl shadow-2xl feature-card" data-aos="zoom-in-up">
              <div className="text-center mb-8">
                <h2 className="text-3xl md:text-4xl font-bold" style={{ color: 'var(--text-primary)' }}>¿Listo para Elevar tu Negocio?</h2>
                <p className="mt-4" style={{ color: 'var(--text-secondary)' }}>Completa el formulario y nos pondremos en contacto para configurar tu sistema myCard.</p>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <input
                    type="text"
                    name="name"
                    placeholder="Tu Nombre"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 rounded-lg form-input focus:outline-none focus:ring-2"
                    style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-primary)' }}
                  />
                  <input
                    type="text"
                    name="business_name"
                    placeholder="Nombre del Negocio"
                    value={formData.business_name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 rounded-lg form-input focus:outline-none focus:ring-2"
                    style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-primary)' }}
                  />
                </div>
                <div className="mb-6">
                  <input
                    type="email"
                    name="email"
                    placeholder="Correo Electrónico"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 rounded-lg form-input focus:outline-none focus:ring-2"
                    style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-primary)' }}
                  />
                </div>
                <div className="mb-6">
                  <textarea
                    name="message"
                    placeholder="Cuéntanos sobre tu negocio..."
                    value={formData.message}
                    onChange={handleInputChange}
                    rows={4}
                    className="w-full px-4 py-3 rounded-lg form-input focus:outline-none focus:ring-2"
                    style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-primary)' }}
                  ></textarea>
                </div>

                {/* Success message */}
                {submitMessage && (
                  <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
                    {submitMessage}
                  </div>
                )}

                {/* Error message */}
                {submitError && (
                  <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                    {submitError}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full text-black font-bold py-4 rounded-full transition duration-300 shadow-lg ${
                    isSubmitting
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'spotify-green hover:bg-green-400'
                  }`}
                >
                  {isSubmitting ? 'Enviando...' : 'Solicitar una Demo'}
                </button>
              </form>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
        <div className="container mx-auto px-6 py-8" style={{ borderTop: '1px solid var(--border-color)' }}>
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-center md:text-left mb-4 md:mb-0">
              <span className="text-xl font-bold">myCard Services</span>
              <p className="mt-1" style={{ color: 'var(--text-muted)' }}>© 2025 myCard Services. Todos los derechos reservados.</p>
            </div>
            <div className="flex space-x-6">
              <a
                href="https://facebook.com/mycardservices"
                target="_blank"
                rel="noopener noreferrer"
                className="transition duration-300 hover:text-green-500"
                style={{ color: 'var(--text-muted)' }}
              >
                Facebook
              </a>
              <a
                href="https://twitter.com/mycardservices"
                target="_blank"
                rel="noopener noreferrer"
                className="transition duration-300 hover:text-green-500"
                style={{ color: 'var(--text-muted)' }}
              >
                Twitter
              </a>
              <a
                href="https://linkedin.com/company/mycardservices"
                target="_blank"
                rel="noopener noreferrer"
                className="transition duration-300 hover:text-green-500"
                style={{ color: 'var(--text-muted)' }}
              >
                LinkedIn
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
