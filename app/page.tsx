'use client'

import dynamic from 'next/dynamic'
import Image from 'next/image'
import { useEffect, useMemo, useState } from 'react'
import type { LucideIcon } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import type { Variants } from 'framer-motion'
import gsap from 'gsap'
import Lenis from 'lenis'
import {
  CalendarDays,
  Clock,
  Crosshair,
  Download,
  Lock,
  LogOut,
  Mail,
  Menu,
  Phone,
  ShieldCheck,
  Sparkles,
  Target,
  Trash2,
  User,
  X,
} from 'lucide-react'

const RangeScene = dynamic(() => import('@/components/RangeScene'), { ssr: false })

type Booking = {
  id: string
  nome: string
  email: string
  telefone: string
  data: string
  hora: string
  modalidade: string
  experiencia: string
  observacoes: string
  criadoEm: string
}

type Contact = {
  id: string
  nome: string
  email: string
  telefone: string
  assunto: string
  mensagem: string
  criadoEm: string
}

const bookingKey = 'efto_bookings_v1'
const contactKey = 'efto_contacts_v1'
const adminKey = 'efto_admin_auth_v1'
const adminUser = 'admin'
const adminPass = 'tiro2026'

const modalidades = ['Pistola 10m', 'Carabina 10m', 'Precisão 25m', 'Iniciação segura', 'Treino competitivo']
const horas = ['09:00', '10:30', '12:00', '14:00', '15:30', '17:00', '18:30']

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.75, ease: 'easeOut' } },
}

function uid() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

function todayISO() {
  return new Date().toISOString().slice(0, 10)
}

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [adminOpen, setAdminOpen] = useState(false)
  const [bookings, setBookings] = useState<Booking[]>([])
  const [contacts, setContacts] = useState<Contact[]>([])
  const [isAdmin, setIsAdmin] = useState(false)
  const [loginError, setLoginError] = useState('')
  const [activeTab, setActiveTab] = useState<'agendamentos' | 'contactos'>('agendamentos')
  const [toast, setToast] = useState('')

  const [bookingForm, setBookingForm] = useState({
    nome: '',
    email: '',
    telefone: '',
    data: todayISO(),
    hora: '10:30',
    modalidade: 'Pistola 10m',
    experiencia: 'Primeira vez',
    observacoes: '',
  })

  const [contactForm, setContactForm] = useState({
    nome: '',
    email: '',
    telefone: '',
    assunto: 'Informações sobre treinos',
    mensagem: '',
  })

  useEffect(() => {
    const lenis = new Lenis({ lerp: 0.08, wheelMultiplier: 0.9 })
    let rafId = 0
    const raf = (time: number) => {
      lenis.raf(time)
      rafId = requestAnimationFrame(raf)
    }
    rafId = requestAnimationFrame(raf)

    gsap.fromTo('.hero-badge', { opacity: 0, scale: 0.9 }, { opacity: 1, scale: 1, duration: 0.9, ease: 'power3.out' })
    gsap.fromTo('.nav-shell', { y: -24, opacity: 0 }, { y: 0, opacity: 1, duration: 0.85, ease: 'power3.out' })
    gsap.to('.pulse-ring', { scale: 1.08, opacity: 0.45, repeat: -1, yoyo: true, duration: 1.8, ease: 'sine.inOut' })

    return () => {
      cancelAnimationFrame(rafId)
      lenis.destroy()
    }
  }, [])

  useEffect(() => {
    const storedBookings = localStorage.getItem(bookingKey)
    const storedContacts = localStorage.getItem(contactKey)
    const storedAdmin = localStorage.getItem(adminKey)
    if (storedBookings) setBookings(JSON.parse(storedBookings))
    if (storedContacts) setContacts(JSON.parse(storedContacts))
    if (storedAdmin === 'true') setIsAdmin(true)
  }, [])

  useEffect(() => {
    localStorage.setItem(bookingKey, JSON.stringify(bookings))
  }, [bookings])

  useEffect(() => {
    localStorage.setItem(contactKey, JSON.stringify(contacts))
  }, [contacts])

  const stats = useMemo(() => {
    const upcoming = bookings.filter((item) => item.data >= todayISO()).length
    return [
      { value: '360°', label: 'Acompanhamento técnico' },
      { value: upcoming.toString().padStart(2, '0'), label: 'Treinos próximos' },
      { value: '100%', label: 'Foco em segurança' },
    ]
  }, [bookings])

  function showToast(message: string) {
    setToast(message)
    setTimeout(() => setToast(''), 3200)
  }

  function handleBookingSubmit(e: React.FormEvent) {
    e.preventDefault()
    const newBooking: Booking = { id: uid(), ...bookingForm, criadoEm: new Date().toLocaleString('pt-PT') }
    setBookings((prev) => [newBooking, ...prev])
    setBookingForm({
      nome: '',
      email: '',
      telefone: '',
      data: todayISO(),
      hora: '10:30',
      modalidade: 'Pistola 10m',
      experiencia: 'Primeira vez',
      observacoes: '',
    })
    showToast('Agendamento recebido! A equipa irá confirmar por contacto.')
  }

  function handleContactSubmit(e: React.FormEvent) {
    e.preventDefault()
    const newContact: Contact = { id: uid(), ...contactForm, criadoEm: new Date().toLocaleString('pt-PT') }
    setContacts((prev) => [newContact, ...prev])
    setContactForm({ nome: '', email: '', telefone: '', assunto: 'Informações sobre treinos', mensagem: '' })
    showToast('Mensagem enviada para o painel administrativo.')
  }

  function login(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = new FormData(e.currentTarget)
    if (form.get('user') === adminUser && form.get('password') === adminPass) {
      setIsAdmin(true)
      localStorage.setItem(adminKey, 'true')
      setLoginError('')
      showToast('Sessão de administrador iniciada.')
    } else {
      setLoginError('Credenciais inválidas. Use admin / tiro2026 para testar.')
    }
  }

  function logout() {
    setIsAdmin(false)
    localStorage.removeItem(adminKey)
  }

  function exportCSV() {
    const rows = bookings.map((b) => [b.nome, b.email, b.telefone, b.data, b.hora, b.modalidade, b.experiencia, b.observacoes, b.criadoEm])
    const csv = [['Nome', 'Email', 'Telefone', 'Data', 'Hora', 'Modalidade', 'Experiência', 'Observações', 'Criado em'], ...rows]
      .map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(','))
      .join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'agendamentos-tiro-olimpico.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <main className="relative min-h-screen overflow-hidden">
      <div className="noise" />
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed left-1/2 top-5 z-[80] w-[92%] max-w-xl -translate-x-1/2 rounded-2xl border border-gold/30 bg-ink/90 px-5 py-4 text-sm text-white shadow-glow backdrop-blur-xl"
          >
            <span className="mr-2 text-gold">●</span>{toast}
          </motion.div>
        )}
      </AnimatePresence>

      <header className="nav-shell fixed left-0 right-0 top-0 z-40 px-4 py-4 opacity-0">
        <nav className="mx-auto flex max-w-7xl items-center justify-between rounded-full border border-white/15 bg-ink/65 px-4 py-3 backdrop-blur-2xl md:px-6">
          <a href="#inicio" className="flex items-center gap-3">
            <Image src="/logo.png" alt="Logo Escola de Formação Tiro Olímpico" width={46} height={46} className="rounded-full ring-2 ring-white/15" priority />
            <div className="leading-tight">
              <p className="text-sm font-bold uppercase tracking-[.22em] text-white">Tiro Olímpico</p>
              <p className="hidden text-xs text-white/55 sm:block">Escola de Formação</p>
            </div>
          </a>

          <div className="hidden items-center gap-7 text-sm text-white/72 md:flex">
            <a className="transition hover:text-gold" href="#treinos">Treinos</a>
            <a className="transition hover:text-gold" href="#agendar">Agendar</a>
            <a className="transition hover:text-gold" href="#contactos">Contactos</a>
            <button onClick={() => setAdminOpen(true)} className="rounded-full bg-white px-5 py-2 font-semibold text-ink transition hover:bg-gold">
              Painel admin
            </button>
          </div>

          <button onClick={() => setMenuOpen((v) => !v)} className="rounded-full border border-white/15 p-2 md:hidden" aria-label="Abrir menu">
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </nav>
        <AnimatePresence>
          {menuOpen && (
            <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} className="mx-auto mt-3 grid max-w-7xl gap-2 rounded-3xl border border-white/15 bg-ink/90 p-4 backdrop-blur-xl md:hidden">
              {['treinos', 'agendar', 'contactos'].map((item) => <a key={item} onClick={() => setMenuOpen(false)} className="rounded-2xl px-4 py-3 text-white/75 hover:bg-white/10" href={`#${item}`}>{item}</a>)}
              <button onClick={() => { setAdminOpen(true); setMenuOpen(false) }} className="rounded-2xl bg-gold px-4 py-3 font-bold text-ink">Painel admin</button>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <section id="inicio" className="relative flex min-h-screen items-center px-4 pb-20 pt-32 md:pt-40">
        <RangeScene />
        <div className="absolute left-[-12rem] top-32 h-96 w-96 rounded-full bg-blue-500/20 blur-3xl" />
        <div className="absolute bottom-10 right-[-10rem] h-[30rem] w-[30rem] rounded-full bg-olympicRed/15 blur-3xl" />

        <div className="mx-auto grid w-full max-w-7xl items-center gap-12 lg:grid-cols-[1.05fr_.95fr]">
          <motion.div initial="hidden" animate="visible" variants={fadeUp}>
            <div className="hero-badge mb-6 inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/10 px-4 py-2 text-sm text-gold opacity-0">
              <Sparkles size={16} /> Agendamento digital · Treino seguro · Performance olímpica
            </div>
            <h1 className="max-w-5xl text-5xl font-black leading-[.96] tracking-[-.06em] md:text-7xl lg:text-8xl">
              Marque o seu <span className="bg-gradient-to-r from-gold via-white to-rangeGreen bg-clip-text text-transparent">treino de tiro olímpico</span> em segundos.
            </h1>
            <p className="mt-7 max-w-2xl text-lg leading-8 text-white/68 md:text-xl">
              Uma experiência moderna para atletas, iniciantes e equipas: escolha modalidade, horário e envie o pedido direto para o painel administrativo.
            </p>
            <div className="mt-9 flex flex-col gap-4 sm:flex-row">
              <a href="#agendar" className="group rounded-full bg-gold px-8 py-4 text-center font-black text-ink shadow-glow transition hover:-translate-y-1 hover:bg-white">
                Agendar treino <span className="inline-block transition group-hover:translate-x-1">→</span>
              </a>
              <button onClick={() => setAdminOpen(true)} className="rounded-full border border-white/20 px-8 py-4 font-bold text-white/85 transition hover:border-white hover:bg-white/10">
                Entrar no painel admin
              </button>
            </div>
            <div className="mt-10 grid max-w-3xl gap-4 sm:grid-cols-3">
              {stats.map((stat) => (
                <div key={stat.label} className="glass rounded-3xl p-5">
                  <p className="text-3xl font-black text-gold">{stat.value}</p>
                  <p className="mt-1 text-sm text-white/58">{stat.label}</p>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, scale: .92 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1, delay: .15 }} className="relative mx-auto aspect-square w-full max-w-[520px]">
            <div className="pulse-ring absolute inset-6 rounded-full border border-gold/30 bg-gold/5" />
            <div className="absolute inset-12 rounded-full border border-white/10 bg-white/5 blur-[1px]" />
            <div className="target-ring absolute inset-16 rounded-full p-9 shadow-glow">
              <div className="flex h-full w-full items-center justify-center rounded-full bg-ink/78 p-8 backdrop-blur-md">
                <Image src="/logo.png" alt="Logo da escola" width={245} height={245} className="rounded-full shadow-2xl" priority />
              </div>
            </div>
            <div className="absolute -right-2 top-20 rounded-3xl border border-white/15 bg-white/10 p-4 backdrop-blur-xl">
              <Crosshair className="text-gold" />
              <p className="mt-2 text-xs text-white/62">Foco e precisão</p>
            </div>
            <div className="absolute bottom-16 left-0 rounded-3xl border border-white/15 bg-white/10 p-4 backdrop-blur-xl">
              <ShieldCheck className="text-rangeGreen" />
              <p className="mt-2 text-xs text-white/62">Segurança primeiro</p>
            </div>
          </motion.div>
        </div>
      </section>

      <section id="treinos" className="px-4 py-24">
        <div className="mx-auto max-w-7xl">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: .25 }} variants={fadeUp} className="mb-12 flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div>
              <p className="mb-3 text-sm font-bold uppercase tracking-[.32em] text-gold">Programas</p>
              <h2 className="max-w-3xl text-4xl font-black tracking-[-.04em] md:text-6xl">Treinos desenhados para evolução real.</h2>
            </div>
            <p className="max-w-xl text-white/60">Da primeira sessão ao treino competitivo, cada marcação fica organizada para a administração confirmar, gerir e acompanhar.</p>
          </motion.div>

          <div className="grid gap-5 md:grid-cols-3">
            {[
              { icon: Target, title: 'Iniciação', text: 'Introdução aos fundamentos, postura, respiração, segurança e disciplina de linha de tiro.', color: 'text-gold' },
              { icon: Crosshair, title: 'Precisão', text: 'Sessões orientadas para consistência técnica, controlo de gatilho e agrupamento.', color: 'text-olympicRed' },
              { icon: ShieldCheck, title: 'Competição', text: 'Planeamento de treino, simulação de prova, rotinas mentais e avaliação de performance.', color: 'text-rangeGreen' },
            ].map((card, i) => (
              <motion.div key={card.title} initial={{ opacity: 0, y: 26 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * .08 }} className="glass group rounded-[2rem] p-8 transition duration-300 hover:-translate-y-2 hover:border-gold/40">
                <card.icon className={`${card.color} mb-8`} size={38} />
                <h3 className="text-2xl font-black">{card.title}</h3>
                <p className="mt-4 leading-7 text-white/60">{card.text}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section id="agendar" className="px-4 py-24">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[.85fr_1.15fr]">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: .25 }} variants={fadeUp} className="glass rounded-[2.5rem] p-8 md:p-10">
            <p className="mb-3 text-sm font-bold uppercase tracking-[.32em] text-gold">Agendamento</p>
            <h2 className="text-4xl font-black tracking-[-.04em] md:text-5xl">Escolha dia, hora e modalidade.</h2>
            <p className="mt-5 leading-8 text-white/62">O formulário regista o pedido no painel admin. Para produção, basta ligar este frontend a uma base de dados/API.</p>
            <div className="mt-8 space-y-4">
              {[{ icon: CalendarDays, text: 'Seleção rápida de data' }, { icon: Clock, text: 'Horários organizados' }, { icon: Lock, text: 'Painel protegido por login' }].map((item) => (
                <div key={item.text} className="flex items-center gap-3 rounded-2xl bg-white/7 p-4 text-white/72">
                  <item.icon className="text-gold" size={20} /> {item.text}
                </div>
              ))}
            </div>
          </motion.div>

          <motion.form onSubmit={handleBookingSubmit} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="glass rounded-[2.5rem] p-6 md:p-8">
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Nome completo"><input required value={bookingForm.nome} onChange={(e) => setBookingForm({ ...bookingForm, nome: e.target.value })} placeholder="Ex.: João Silva" className="input" /></Field>
              <Field label="Email"><input required type="email" value={bookingForm.email} onChange={(e) => setBookingForm({ ...bookingForm, email: e.target.value })} placeholder="email@exemplo.pt" className="input" /></Field>
              <Field label="Telefone"><input required value={bookingForm.telefone} onChange={(e) => setBookingForm({ ...bookingForm, telefone: e.target.value })} placeholder="+351 900 000 000" className="input" /></Field>
              <Field label="Data"><input required min={todayISO()} type="date" value={bookingForm.data} onChange={(e) => setBookingForm({ ...bookingForm, data: e.target.value })} className="input" /></Field>
              <Field label="Hora"><select value={bookingForm.hora} onChange={(e) => setBookingForm({ ...bookingForm, hora: e.target.value })} className="input">{horas.map((h) => <option key={h}>{h}</option>)}</select></Field>
              <Field label="Modalidade"><select value={bookingForm.modalidade} onChange={(e) => setBookingForm({ ...bookingForm, modalidade: e.target.value })} className="input">{modalidades.map((m) => <option key={m}>{m}</option>)}</select></Field>
              <Field label="Experiência"><select value={bookingForm.experiencia} onChange={(e) => setBookingForm({ ...bookingForm, experiencia: e.target.value })} className="input"><option>Primeira vez</option><option>Iniciante</option><option>Intermédio</option><option>Avançado / Competição</option></select></Field>
              <div className="md:col-span-2"><Field label="Observações"><textarea value={bookingForm.observacoes} onChange={(e) => setBookingForm({ ...bookingForm, observacoes: e.target.value })} placeholder="Objetivo do treino, restrições, equipamento, etc." rows={4} className="input resize-none" /></Field></div>
            </div>
            <button className="mt-6 w-full rounded-2xl bg-gold px-8 py-4 font-black text-ink transition hover:-translate-y-1 hover:bg-white">Enviar pedido de agendamento</button>
          </motion.form>
        </div>
      </section>

      <section id="contactos" className="px-4 py-24">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[1.05fr_.95fr]">
          <motion.form onSubmit={handleContactSubmit} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="glass rounded-[2.5rem] p-6 md:p-8">
            <p className="mb-3 text-sm font-bold uppercase tracking-[.32em] text-gold">Contactos</p>
            <h2 className="mb-6 text-4xl font-black tracking-[-.04em] md:text-5xl">Fale com a escola.</h2>
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Nome"><input required value={contactForm.nome} onChange={(e) => setContactForm({ ...contactForm, nome: e.target.value })} className="input" /></Field>
              <Field label="Email"><input required type="email" value={contactForm.email} onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })} className="input" /></Field>
              <Field label="Telefone"><input value={contactForm.telefone} onChange={(e) => setContactForm({ ...contactForm, telefone: e.target.value })} className="input" /></Field>
              <Field label="Assunto"><input value={contactForm.assunto} onChange={(e) => setContactForm({ ...contactForm, assunto: e.target.value })} className="input" /></Field>
              <div className="md:col-span-2"><Field label="Mensagem"><textarea required value={contactForm.mensagem} onChange={(e) => setContactForm({ ...contactForm, mensagem: e.target.value })} rows={5} className="input resize-none" placeholder="Escreva a sua mensagem..." /></Field></div>
            </div>
            <button className="mt-6 rounded-2xl bg-white px-8 py-4 font-black text-ink transition hover:bg-gold">Enviar contacto</button>
          </motion.form>

          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="space-y-5">
            <Info icon={Phone} title="Telefone" text="+351 900 000 000" />
            <Info icon={Mail} title="Email" text="geral@tiroolimpico.pt" />
            <Info icon={Target} title="Local" text="Carreira de tiro / instalações da escola" />
            <div className="rounded-[2rem] border border-gold/25 bg-gold/10 p-6 text-gold">
              <p className="font-black">Nota de segurança</p>
              <p className="mt-2 text-sm leading-6 text-white/65">Todos os treinos devem seguir as normas legais, de segurança e supervisão técnica adequada.</p>
            </div>
          </motion.div>
        </div>
      </section>

      <footer className="border-t border-white/10 px-4 py-10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 text-center text-sm text-white/50 md:flex-row md:text-left">
          <div className="flex items-center gap-3"><Image src="/logo.png" alt="Logo" width={38} height={38} className="rounded-full" /> Escola de Formação Tiro Olímpico</div>
          <p>Website Next.js + GSAP + Lenis + Three.js + React Three Fiber + Framer Motion + Tailwind CSS</p>
        </div>
      </footer>

      <AnimatePresence>
        {adminOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[70] flex items-center justify-center bg-black/70 p-4 backdrop-blur-lg">
            <motion.div initial={{ scale: .94, y: 24 }} animate={{ scale: 1, y: 0 }} exit={{ scale: .94, y: 24 }} className="max-h-[92vh] w-full max-w-6xl overflow-hidden rounded-[2rem] border border-white/15 bg-[#071427] shadow-panel">
              <div className="flex items-center justify-between border-b border-white/10 p-5">
                <div className="flex items-center gap-3">
                  <Image src="/logo.png" alt="Logo" width={42} height={42} className="rounded-full" />
                  <div>
                    <p className="font-black">Painel administrativo</p>
                    <p className="text-xs text-white/50">Agendamentos e contactos</p>
                  </div>
                </div>
                <button onClick={() => setAdminOpen(false)} className="rounded-full border border-white/15 p-2 hover:bg-white/10" aria-label="Fechar"><X size={20} /></button>
              </div>

              {!isAdmin ? (
                <form onSubmit={login} className="mx-auto max-w-md p-8">
                  <div className="mb-6 rounded-3xl bg-white/7 p-5 text-sm text-white/62">
                    <p className="mb-2 font-bold text-white">Acesso de teste</p>
                    Utilizador: <span className="text-gold">admin</span> · Palavra-passe: <span className="text-gold">tiro2026</span>
                  </div>
                  <Field label="Utilizador"><input name="user" className="input" placeholder="admin" /></Field>
                  <div className="mt-4"><Field label="Palavra-passe"><input name="password" type="password" className="input" placeholder="••••••••" /></Field></div>
                  {loginError && <p className="mt-4 rounded-2xl bg-olympicRed/15 p-3 text-sm text-red-200">{loginError}</p>}
                  <button className="mt-6 w-full rounded-2xl bg-gold px-6 py-4 font-black text-ink hover:bg-white">Entrar</button>
                </form>
              ) : (
                <div className="p-5 md:p-8">
                  <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-center">
                    <div className="flex rounded-2xl bg-white/7 p-1">
                      <button onClick={() => setActiveTab('agendamentos')} className={`rounded-xl px-4 py-2 text-sm font-bold ${activeTab === 'agendamentos' ? 'bg-gold text-ink' : 'text-white/62'}`}>Agendamentos ({bookings.length})</button>
                      <button onClick={() => setActiveTab('contactos')} className={`rounded-xl px-4 py-2 text-sm font-bold ${activeTab === 'contactos' ? 'bg-gold text-ink' : 'text-white/62'}`}>Contactos ({contacts.length})</button>
                    </div>
                    <div className="flex gap-2">
                      {activeTab === 'agendamentos' && <button onClick={exportCSV} className="inline-flex items-center gap-2 rounded-2xl border border-white/15 px-4 py-2 text-sm font-bold hover:bg-white/10"><Download size={16} /> CSV</button>}
                      <button onClick={logout} className="inline-flex items-center gap-2 rounded-2xl border border-white/15 px-4 py-2 text-sm font-bold hover:bg-white/10"><LogOut size={16} /> Sair</button>
                    </div>
                  </div>

                  <div className="max-h-[58vh] overflow-auto pr-1">
                    {activeTab === 'agendamentos' ? (
                      <AdminBookings bookings={bookings} onDelete={(id) => setBookings((prev) => prev.filter((b) => b.id !== id))} />
                    ) : (
                      <AdminContacts contacts={contacts} onDelete={(id) => setContacts((prev) => prev.filter((c) => c.id !== id))} />
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block text-sm font-bold text-white/70"><span className="mb-2 block">{label}</span>{children}</label>
}

function Info({ icon: Icon, title, text }: { icon: LucideIcon; title: string; text: string }) {
  return <div className="glass flex items-center gap-4 rounded-[2rem] p-6"><div className="rounded-2xl bg-gold/15 p-3 text-gold"><Icon size={24} /></div><div><p className="font-black">{title}</p><p className="text-white/55">{text}</p></div></div>
}

function AdminBookings({ bookings, onDelete }: { bookings: Booking[]; onDelete: (id: string) => void }) {
  if (!bookings.length) return <Empty text="Ainda não existem agendamentos." />
  return <div className="grid gap-4">{bookings.map((b) => <div key={b.id} className="rounded-3xl border border-white/10 bg-white/[.055] p-5"><div className="flex flex-col justify-between gap-4 md:flex-row"><div><p className="text-xl font-black">{b.nome}</p><p className="mt-1 text-sm text-white/50">Criado em {b.criadoEm}</p></div><button onClick={() => onDelete(b.id)} className="inline-flex h-10 items-center justify-center gap-2 rounded-2xl border border-red-400/25 px-4 text-sm text-red-200 hover:bg-red-500/10"><Trash2 size={16} /> Apagar</button></div><div className="mt-5 grid gap-3 text-sm text-white/68 md:grid-cols-3"><p><CalendarDays className="mr-2 inline text-gold" size={16} />{b.data} · {b.hora}</p><p><Target className="mr-2 inline text-gold" size={16} />{b.modalidade}</p><p><User className="mr-2 inline text-gold" size={16} />{b.experiencia}</p><p><Mail className="mr-2 inline text-gold" size={16} />{b.email}</p><p><Phone className="mr-2 inline text-gold" size={16} />{b.telefone}</p></div>{b.observacoes && <p className="mt-4 rounded-2xl bg-black/20 p-4 text-sm text-white/60">{b.observacoes}</p>}</div>)}</div>
}

function AdminContacts({ contacts, onDelete }: { contacts: Contact[]; onDelete: (id: string) => void }) {
  if (!contacts.length) return <Empty text="Ainda não existem mensagens de contacto." />
  return <div className="grid gap-4">{contacts.map((c) => <div key={c.id} className="rounded-3xl border border-white/10 bg-white/[.055] p-5"><div className="flex flex-col justify-between gap-4 md:flex-row"><div><p className="text-xl font-black">{c.assunto}</p><p className="mt-1 text-sm text-white/50">{c.nome} · {c.criadoEm}</p></div><button onClick={() => onDelete(c.id)} className="inline-flex h-10 items-center justify-center gap-2 rounded-2xl border border-red-400/25 px-4 text-sm text-red-200 hover:bg-red-500/10"><Trash2 size={16} /> Apagar</button></div><div className="mt-5 grid gap-3 text-sm text-white/68 md:grid-cols-2"><p><Mail className="mr-2 inline text-gold" size={16} />{c.email}</p><p><Phone className="mr-2 inline text-gold" size={16} />{c.telefone || 'Sem telefone'}</p></div><p className="mt-4 rounded-2xl bg-black/20 p-4 text-sm leading-6 text-white/60">{c.mensagem}</p></div>)}</div>
}

function Empty({ text }: { text: string }) {
  return <div className="rounded-3xl border border-dashed border-white/15 p-10 text-center text-white/45">{text}</div>
}
