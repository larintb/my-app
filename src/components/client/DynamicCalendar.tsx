'use client'

import { useState, useEffect } from 'react'

interface TimeSlot {
  time: string
  available: boolean
}

interface DynamicCalendarProps {
  businessId: string
  onTimeSlotSelected: (date: string, time: string) => void
  onBack: () => void
}

export function DynamicCalendar({ businessId, onTimeSlotSelected }: DynamicCalendarProps) {
  const [selectedDate, setSelectedDate] = useState<string>('')
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([])
  const [loadingSlots, setLoadingSlots] = useState(false)
  const [currentMonth, setCurrentMonth] = useState(new Date())

  const generateDefaultTimeSlots = (): TimeSlot[] => {
    const slots: TimeSlot[] = []
    for (let hour = 9; hour <= 18; hour++) {
      slots.push({
        time: `${hour.toString().padStart(2, '0')}:00`,
        available: true
      })
      if (hour < 18) {
        slots.push({
          time: `${hour.toString().padStart(2, '0')}:30`,
          available: true
        })
      }
    }
    return slots
  }

  const loadAvailableSlots = async (date: string) => {
    setLoadingSlots(true)
    try {
      const response = await fetch(`/api/businesses/${businessId}/available-slots?date=${date}`)
      const data = await response.json()
      
      if (data.success) {
        setAvailableSlots(data.slots.map((slot: any) => ({
          time: slot.time,
          available: slot.available
        })))
      } else {
        setAvailableSlots(generateDefaultTimeSlots())
      }
    } catch (error) {
      setAvailableSlots(generateDefaultTimeSlots())
    } finally {
      setLoadingSlots(false)
    }
  }

  useEffect(() => {
    if (selectedDate) {
      loadAvailableSlots(selectedDate)
    }
  }, [selectedDate, businessId])

  const formatDate = (date: Date) => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  const formatDisplayDate = (dateString: string) => {
    // Parse the date string manually to avoid timezone issues
    const [year, month, day] = dateString.split('-').map(num => parseInt(num))
    const date = new Date(year, month - 1, day) // month is 0-indexed
    return date.toLocaleDateString('es-MX', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const isDateAvailable = (date: Date) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return date >= today
  }

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    const days = []
    
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null)
    }
    
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day))
    }
    
    return days
  }

  const selectTimeSlot = (time: string) => {
    if (selectedDate) {
      onTimeSlotSelected(selectedDate, time)
    }
  }

  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))
  }

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))
  }

  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ]

  const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']

  return (
    <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-100">
      {/* Month navigation */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={prevMonth}
          className="w-10 h-10 hover:bg-gray-100 rounded-xl transition-all duration-200 active:scale-95 flex items-center justify-center"
        >
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        
        <h3 className="text-xl font-bold text-gray-900">
          {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
        </h3>
        
        <button
          onClick={nextMonth}
          className="w-10 h-10 hover:bg-gray-100 rounded-xl transition-all duration-200 active:scale-95 flex items-center justify-center"
        >
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-2">
        {dayNames.map((day) => (
          <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-2 mb-6">
        {getDaysInMonth(currentMonth).map((date, index) => (
          <button
            key={index}
            onClick={() => date && isDateAvailable(date) && setSelectedDate(formatDate(date))}
            disabled={!date || !isDateAvailable(date)}
            className={`
              h-12 text-sm font-medium rounded-xl transition-all duration-200 transform active:scale-95
              ${!date ? 'invisible' : ''}
              ${date && !isDateAvailable(date) ? 'text-gray-400 cursor-not-allowed bg-gray-50' : ''}
              ${date && isDateAvailable(date) && selectedDate !== formatDate(date) ? 'hover:bg-green-100 hover:text-green-800 hover:shadow-sm hover:-translate-y-0.5 bg-gray-50 text-gray-700 border-2 border-transparent hover:border-green-200' : ''}
              ${selectedDate === formatDate(date || new Date()) ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-md border-2 border-green-400' : ''}
            `}
          >
            {date?.getDate()}
          </button>
        ))}
      </div>

      {selectedDate && (
        <div className="mb-6 p-4 bg-gradient-to-r from-green-100 to-emerald-100 rounded-xl border border-green-200">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-green-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-green-800 font-bold text-lg">
              {formatDisplayDate(selectedDate)}
            </p>
          </div>
        </div>
      )}

      {selectedDate && (
        <div>
          <h4 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
            <svg className="w-6 h-6 text-purple-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Horarios Disponibles
          </h4>
          
          {loadingSlots ? (
            <div className="text-center py-12">
              <div className="inline-flex items-center bg-gray-50 px-6 py-4 rounded-xl">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-500 mr-3"></div>
                <span className="text-gray-600 font-medium">Cargando horarios disponibles...</span>
              </div>
            </div>
          ) : availableSlots.length > 0 ? (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
              {availableSlots.map((slot) => (
                <button
                  key={slot.time}
                  onClick={() => slot.available && selectTimeSlot(slot.time)}
                  disabled={!slot.available}
                  className={`
                    py-3 px-4 rounded-xl text-sm font-bold transition-all duration-200 transform active:scale-95
                    ${slot.available 
                      ? 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 hover:from-green-200 hover:to-emerald-200 hover:text-green-900 hover:shadow-md hover:-translate-y-0.5 border-2 border-green-200 hover:border-green-300' 
                      : 'bg-gray-100 text-gray-400 cursor-not-allowed border-2 border-gray-200 opacity-60'
                    }
                  `}
                >
                  {slot.time}
                </button>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="text-gray-500">
                <svg className="w-12 h-12 mx-auto mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="font-medium">No hay horarios disponibles</p>
                <p className="text-sm">Intenta con otra fecha</p>
              </div>
            </div>
          )}
        </div>
      )}

      {!selectedDate && (
        <div className="text-center py-8">
          <div className="text-gray-500">
            <svg className="w-12 h-12 mx-auto mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="font-medium">Selecciona una fecha</p>
            <p className="text-sm">Elige un día del calendario para ver los horarios disponibles</p>
          </div>
        </div>
      )}
    </div>
  )
}