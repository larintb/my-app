'use client'

import QRCode from 'react-qr-code'

interface QRCodeGeneratorProps {
  data: string
  size?: number
  className?: string
}

export function QRCodeGenerator({ data, size = 200, className = '' }: QRCodeGeneratorProps) {
  return (
    <div className={`inline-block p-2 bg-white rounded ${className}`}>
      <QRCode
        value={data}
        size={size}
        style={{ height: "auto", maxWidth: "100%", width: "100%" }}
        viewBox={`0 0 ${size} ${size}`}
      />
    </div>
  )
}