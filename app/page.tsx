'use client'

import Link from 'next/link'
import { useState } from 'react'
import { ChevronDown, ChevronUp, MapPin, MessageCircle } from 'lucide-react'

const faqs = [
  {
    q: '¿Qué nivel de inglés necesito?',
    a: 'Aceptamos todos los niveles: beginner, intermediate y advanced. Las mesas se organizan por nivel para que la conversación sea productiva y cómoda para todos.',
  },
  {
    q: '¿Dónde son las reuniones?',
    a: 'En cafeterías de Miraflores, Lima. El lugar exacto se confirma cada semana. Siempre son lugares cómodos, bien iluminados y con buen café.',
  },
  {
    q: '¿Cómo pago?',
    a: 'Aceptamos Yape y Plin. Al registrarte seleccionas tu plan, envías el pago y nuestro equipo verifica manualmente. Simple y rápido.',
  },
  {
    q: '¿Puedo ir solo una vez para probar?',
    a: 'Sí. El plan "1 Sesión" por S/30 es perfecto para probar. Sin compromiso.',
  },
  {
    q: '¿Las sesiones son reembolsables o postergables?',
    a: 'No. Los pagos no son reembolsables ni postergables. Al unirte aceptas esta política. Esto nos ayuda a garantizar la organización y comprometer a los participantes.',
  },
]

function FAQ() {
  const [open, setOpen] = useState<number | null>(null)
  return (
    <div className="space-y-3">
      {faqs.map((faq, i) => (
        <div key={i} className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <button
            onClick={() => setOpen(open === i ? null : i)}
            className="w-full flex items-center justify-between px-5 py-4 text-left text-gray-900 font-medium min-h-[56px]"
          >
            <span>{faq.q}</span>
            {open === i ? <ChevronUp size={18} className="text-primary flex-shrink-0 ml-2" /> : <ChevronDown size={18} className="text-gray-400 flex-shrink-0 ml-2" />}
          </button>
          {open === i && (
            <div className="px-5 pb-4 text-gray-600 text-sm leading-relaxed border-t border-gray-50 pt-3">
              {faq.a}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <span className="font-display text-xl font-bold text-primary">Talkerys</span>
          <div className="flex items-center gap-2">
            <Link
              href="/login"
              className="hidden sm:inline-flex items-center px-4 py-2 rounded-xl border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors min-h-[44px]"
            >
              Iniciar sesión
            </Link>
            <Link
              href="/register"
              className="inline-flex items-center px-4 py-2 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary-dark transition-colors min-h-[44px]"
            >
              Únete
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="bg-gradient-to-br from-navy to-navy-dark relative overflow-hidden py-20 md:py-28">
        {/* Decorative circle */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative max-w-5xl mx-auto px-4 text-center">
          <p className="text-primary text-xs font-bold uppercase tracking-widest mb-6">
            English Conversation Club · Miraflores, Lima
          </p>
          <h1 className="font-display text-4xl md:text-6xl font-bold text-white leading-tight mb-6">
            Speak English.<br />
            Meet <span className="text-primary">People.</span><br />
            Have Fun.
          </h1>
          <p className="text-white/70 text-lg max-w-xl mx-auto mb-10 leading-relaxed">
            Reuniones semanales en las mejores cafeterías de Miraflores. Mesas pequeñas, temas interesantes, y mucha práctica real.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/register"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-primary hover:bg-primary-dark text-white font-semibold text-lg transition-colors min-h-[56px]"
            >
              Únete Ahora →
            </Link>
            <a
              href="#planes"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl border border-white/30 text-white font-semibold text-lg hover:bg-white/10 transition-colors min-h-[56px]"
            >
              Ver Planes
            </a>
          </div>
        </div>
      </section>

      {/* Cómo funciona */}
      <section className="bg-white py-16">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="font-display text-3xl font-bold text-center text-gray-900 mb-12">
            ¿Cómo funciona?
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { emoji: '📝', title: 'Regístrate', desc: 'Nombre, nivel y WhatsApp. 60 segundos.' },
              { emoji: '💳', title: 'Paga', desc: 'Desde S/30 por Yape o Plin.' },
              { emoji: '☕', title: 'Recibe tu mesa', desc: 'Te asignamos compañeros de tu nivel.' },
              { emoji: '🗣️', title: '¡Practica!', desc: 'Llega al café, habla en inglés, mejora.' },
            ].map((step, i) => (
              <div key={i} className="bg-gray-50 rounded-2xl p-6 text-center">
                <div className="text-4xl mb-4">{step.emoji}</div>
                <h3 className="font-semibold text-gray-900 mb-2">{step.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Planes */}
      <section id="planes" className="bg-gray-50 py-16">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl font-bold text-gray-900 mb-3">Planes</h2>
            <p className="text-gray-500">Elige el que mejor se adapte a ti</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* 1 sesión */}
            <div className="bg-white rounded-2xl border border-gray-100 p-7 flex flex-col shadow-sm">
              <div className="mb-1">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Pruébalo</span>
              </div>
              <div className="text-5xl font-extrabold text-gray-900 mb-1">S/30</div>
              <div className="text-gray-600 font-medium mb-6">1 Sesión</div>
              <ul className="space-y-2 text-sm text-gray-600 mb-8 flex-1">
                <li className="flex items-center gap-2">✓ 1 sesión grupal</li>
                <li className="flex items-center gap-2">✓ Mesa por nivel</li>
                <li className="flex items-center gap-2">✓ Acceso al grupo</li>
              </ul>
              <Link href="/register" className="block text-center py-3 rounded-xl border border-primary text-primary font-semibold hover:bg-primary hover:text-white transition-colors">
                Empezar
              </Link>
            </div>

            {/* 2 sesiones */}
            <div className="bg-white rounded-2xl border border-gray-100 p-7 flex flex-col shadow-sm">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Popular</span>
                <span className="text-xs bg-emerald-50 text-emerald-700 font-semibold px-2 py-0.5 rounded-full">Ahorra 17%</span>
              </div>
              <div className="text-5xl font-extrabold text-gray-900 mb-1">S/50</div>
              <div className="text-gray-600 font-medium mb-6">2 Sesiones</div>
              <ul className="space-y-2 text-sm text-gray-600 mb-8 flex-1">
                <li className="flex items-center gap-2">✓ 2 sesiones grupales</li>
                <li className="flex items-center gap-2">✓ Mesa por nivel</li>
                <li className="flex items-center gap-2">✓ Acceso al grupo</li>
              </ul>
              <Link href="/register" className="block text-center py-3 rounded-xl border border-primary text-primary font-semibold hover:bg-primary hover:text-white transition-colors">
                Elegir
              </Link>
            </div>

            {/* Mensual — destacado */}
            <div className="bg-navy rounded-2xl p-7 flex flex-col shadow-xl md:scale-105">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-bold text-white/60 uppercase tracking-wider">Mejor valor</span>
                <span className="text-xs bg-primary/20 text-primary-light font-semibold px-2 py-0.5 rounded-full">Ahorra 17%</span>
              </div>
              <div className="text-5xl font-extrabold text-white mb-1">S/100</div>
              <div className="text-white/70 font-medium mb-6">4 Sesiones / mes</div>
              <ul className="space-y-2 text-sm text-white/80 mb-8 flex-1">
                <li className="flex items-center gap-2">✓ 4 sesiones grupales</li>
                <li className="flex items-center gap-2">✓ Mesa por nivel</li>
                <li className="flex items-center gap-2">✓ Acceso prioritario</li>
                <li className="flex items-center gap-2">✓ Acceso al grupo</li>
              </ul>
              <Link href="/register" className="block text-center py-3 rounded-xl bg-primary hover:bg-primary-dark text-white font-semibold transition-colors">
                ¡Quiero este!
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-white py-16">
        <div className="max-w-2xl mx-auto px-4">
          <h2 className="font-display text-3xl font-bold text-center text-gray-900 mb-10">
            Preguntas frecuentes
          </h2>
          <FAQ />
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-navy py-10">
        <div className="max-w-5xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <p className="font-display text-xl font-bold text-white mb-1">Talkerys</p>
            <p className="text-white/50 text-sm">English Conversation Club · Miraflores, Lima · © 2026</p>
          </div>
          <div className="flex items-center gap-4">
            <a
              href="https://wa.me/51999999999"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 text-white/70 hover:text-white text-sm transition-colors"
            >
              <MessageCircle size={16} />
              WhatsApp
            </a>
            <span className="flex items-center gap-1 text-white/50 text-sm">
              <MapPin size={14} />
              Miraflores, Lima
            </span>
          </div>
        </div>
      </footer>
    </div>
  )
}
