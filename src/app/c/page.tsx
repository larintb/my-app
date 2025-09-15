// Client routes will be handled here
// This will handle final client token registration and access

export default function ClientPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md mx-auto text-center">
          {/* Icon */}
          <div className="mb-8">
            <div className="w-20 h-20 mx-auto bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center shadow-lg">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
          </div>

          {/* Content */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-white/20">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Acceso de Cliente
            </h1>
            <p className="text-gray-600 mb-6 text-lg leading-relaxed">
              Para acceder a tu perfil de cliente, por favor usa tu tarjeta NFC o el enlace específico proporcionado por el negocio.
            </p>
            
            {/* Instructions */}
            <div className="space-y-4 text-left">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-green-700 text-sm font-semibold">1</span>
                </div>
                <p className="text-gray-700">Escanea tu tarjeta NFC</p>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-emerald-700 text-sm font-semibold">2</span>
                </div>
                <p className="text-gray-700">O usa el enlace personalizado del negocio</p>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-teal-700 text-sm font-semibold">3</span>
                </div>
                <p className="text-gray-700">Gestiona tus citas y servicios</p>
              </div>
            </div>

            {/* Footer note */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-500">
                ¿No tienes acceso? Contacta al negocio para obtener tu tarjeta o enlace personalizado.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}