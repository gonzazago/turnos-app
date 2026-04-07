import Link from "next/link";
import {
  Calendar,
  ArrowRight,
  CheckCircle2,
  Globe,
  Clock,
  ShieldCheck,
  Zap,
  Sparkles,
  User,
  Star,
  Check,
  X
} from "lucide-react";
import { HeroFunnel } from "./components/HeroFunnel";

export default function Home() {
  return (
    <div className="min-h-screen bg-white font-sans text-slate-900">
      {/* Sticky Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200/50">
        <nav className="flex items-center justify-between p-4 lg:px-8 max-w-7xl mx-auto" aria-label="Global">
          <div className="flex lg:flex-1">
            <Link href="/" className="-m-1.5 p-1.5 flex items-center gap-2 text-blue-600 font-bold text-xl">
              <Calendar className="h-8 w-8" />
              <span>Turnos</span>
            </Link>
          </div>
          <div className="flex flex-1 justify-end gap-x-4 items-center">
            <Link href="/login" className="hidden sm:block text-sm font-semibold leading-6 text-slate-600 hover:text-slate-900 transition-colors">
              Iniciar Sesión
            </Link>
            <Link href="/register" className="text-sm font-bold flex items-center gap-1.5 leading-6 text-white bg-blue-600 px-5 py-2.5 rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 active:scale-[0.98]">
              Empieza Gratis <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </nav>
      </header>

      <main>
        {/* 1. Hero Section */}
        <section className="relative isolate pt-24 pb-32 sm:pt-32 sm:pb-48 bg-slate-50 overflow-hidden">
          <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80" aria-hidden="true">
            <div className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-20 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]" style={{ clipPath: "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)" }}></div>
          </div>

          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mx-auto max-w-3xl text-center">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold mb-8 ring-1 ring-blue-700/10">
                <Sparkles className="w-3 h-3" />
                <span>NUEVO: Integración con Google Meet</span>
              </div>
              <h1 className="text-5xl font-extrabold tracking-tight text-slate-900 sm:text-7xl leading-tight">
                Tu agenda, <span className="text-blue-600 block sm:inline">en piloto automático.</span>
              </h1>
              <p className="mt-8 text-xl leading-relaxed text-slate-600 max-w-2xl mx-auto">
                La forma más simple de recibir reservas. Crea tu página en segundos, comparte tu enlace y deja que tus clientes agenden sin idas y vueltas.
              </p>

              <HeroFunnel />

              <div className="mt-12 flex flex-wrap items-center justify-center gap-x-10 gap-y-4 text-slate-400 font-medium">
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                  <span>Gratis para siempre</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                  <span>Sin tarjeta de crédito</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                  <span>Configuración en 2 min</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 2. Social Proof Section */}
        <section className="py-20 bg-white border-y border-slate-100">
          <div className="mx-auto max-w-7xl px-6 lg:px-8 text-center">
            <p className="text-sm font-bold text-slate-400 uppercase tracking-[0.2em] mb-12">
              Con la confianza de +2,000 profesionales
            </p>
            <div className="flex flex-wrap justify-center items-center gap-x-16 gap-y-10 grayscale opacity-40 hover:grayscale-0 hover:opacity-100 transition-all duration-700">
              <div className="flex items-center gap-2 font-black text-2xl italic tracking-tighter">
                <Globe className="w-8 h-8 text-blue-600" /> TECHCORP
              </div>
              <div className="flex items-center gap-2 font-black text-2xl italic tracking-tighter">
                <Zap className="w-8 h-8 text-blue-600" /> VELOCITY
              </div>
              <div className="flex items-center gap-2 font-black text-2xl italic tracking-tighter">
                <ShieldCheck className="w-8 h-8 text-blue-600" /> SECURELY
              </div>
              <div className="flex items-center gap-2 font-black text-2xl italic tracking-tighter">
                <Clock className="w-8 h-8 text-blue-600" /> TIMELY
              </div>
              <div className="flex items-center gap-2 font-black text-2xl italic tracking-tighter text-blue-600">
                <Sparkles className="w-8 h-8" /> SHINE.AI
              </div>
            </div>
          </div>
        </section>

        {/* 3. How It Works Section */}
        <section className="py-24 sm:py-32 bg-slate-50">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center mb-20">
              <h2 className="text-base font-semibold leading-7 text-blue-600 uppercase tracking-widest">Puesta en marcha</h2>
              <p className="mt-2 text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
                Lista en 3 simples pasos
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              {[
                {
                  step: "1",
                  title: "Crea tu página",
                  desc: "Personaliza tu perfil con tu nombre, logo y colores. Define tus servicios y horarios de atención.",
                  icon: User,
                  color: "bg-blue-600"
                },
                {
                  step: "2",
                  title: "Comparte tu enlace",
                  desc: "Envía tu URL personalizada por WhatsApp, Instagram o ponla en tu web. Tus clientes lo amarán.",
                  icon: ArrowRight,
                  color: "bg-indigo-600"
                },
                {
                  step: "3",
                  title: "Recibe reservas",
                  desc: "Tus clientes eligen el horario y agendan. Tú recibes una notificación y el evento se sincroniza solo.",
                  icon: Calendar,
                  color: "bg-violet-600"
                }
              ].map((item, i) => (
                <div key={i} className="relative bg-white p-8 rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl transition-all group">
                  <div className={`w-14 h-14 ${item.color} rounded-2xl flex items-center justify-center text-white mb-6 shadow-lg group-hover:scale-110 transition-transform`}>
                    <item.icon className="w-7 h-7" />
                  </div>
                  <div className="absolute top-8 right-8 text-5xl font-black text-slate-50 opacity-50">0{item.step}</div>
                  <h3 className="text-xl font-bold text-slate-900 mb-4">{item.title}</h3>
                  <p className="text-slate-600 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 4. Strengths Section */}
        <section className="py-24 sm:py-32 bg-white overflow-hidden">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="flex flex-col lg:flex-row items-center gap-16">
              <div className="flex-1">
                <h2 className="text-base font-semibold leading-7 text-blue-600 uppercase tracking-widest">Beneficios clave</h2>
                <p className="mt-2 text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl mb-8">
                  Diseñado para tu comodidad
                </p>
                <div className="space-y-6">
                  {[
                    {
                      title: "Sincronización Bidireccional",
                      desc: "Conecta tu Google Calendar. Tus eventos personales bloquean turnos automáticamente.",
                      icon: Globe
                    },
                    {
                      title: "Pagos por Mercado Pago",
                      desc: "Cobra señas o el total antes de confirmar. Reduce el ausentismo al 0%.",
                      icon: Zap
                    },
                    {
                      title: "Control de Disponibilidad",
                      desc: "Define duraciones, descansos y recordatorios automáticos por WhatsApp.",
                      icon: ShieldCheck
                    }
                  ].map((feat, i) => (
                    <div key={i} className="flex gap-4 p-4 rounded-2xl border border-transparent hover:border-slate-100 hover:bg-slate-50/50 transition-all">
                      <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                        <feat.icon className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="text-lg font-bold text-slate-900 mb-1">{feat.title}</h4>
                        <p className="text-slate-600 leading-relaxed">{feat.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex-1 relative">
                <div className="relative rounded-3xl overflow-hidden border border-slate-200 shadow-2xl bg-slate-900 aspect-video flex items-center justify-center text-white font-bold text-2xl">
                  <div className="p-8 w-full max-w-sm">
                    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
                      <div className="flex items-center justify-between mb-6">
                        <div className="h-4 w-24 bg-white/20 rounded-full"></div>
                        <div className="h-8 w-8 bg-blue-500 rounded-lg"></div>
                      </div>
                      <div className="space-y-4">
                        <div className="h-10 w-full bg-white/5 rounded-xl border border-white/10"></div>
                        <div className="h-10 w-full bg-white/5 rounded-xl border border-white/10"></div>
                        <div className="h-10 w-full bg-blue-600 rounded-xl"></div>
                      </div>
                    </div>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-tr from-blue-600/20 to-transparent"></div>
                </div>
                <div className="absolute -bottom-6 -right-6 bg-white p-6 rounded-2xl shadow-xl border border-slate-100 hidden sm:block">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center text-white">
                      <Check className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 font-bold uppercase tracking-tight">Nueva Reserva</p>
                      <p className="text-sm font-bold text-slate-900">10:30 AM - Confirmada</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 5. Testimonios Section */}
        <section className="py-24 bg-slate-900 text-white overflow-hidden relative">
          <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
          <div className="mx-auto max-w-7xl px-6 lg:px-8 relative z-10 text-center">
            <div className="mb-16">
              <h2 className="text-blue-400 font-bold uppercase tracking-widest text-sm mb-4">Testimonios</h2>
              <p className="text-4xl font-extrabold tracking-tight sm:text-5xl">Lo que dicen de nosotros</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 text-left">
              {[
                {
                  name: "Dra. Martina G.",
                  role: "Odontóloga",
                  content: "Desde que uso Turnos, mi secretaria tiene tiempo para otras tareas. Mis pacientes aman la facilidad de agendar por Instagram."
                },
                {
                  name: "Juan Pablo R.",
                  role: "Personal Trainer",
                  content: "La integración con Mercado Pago cambió mi negocio. Ya nadie me cancela a último momento sin haber pagado la seña."
                },
                {
                  name: "Sofía L.",
                  role: "Consultora IT",
                  content: "La sincronización con Google Calendar es perfecta. Si tengo una reunión personal, el slot se bloquea solo. Ahorro horas de chat."
                }
              ].map((testi, i) => (
                <div key={i} className="bg-white/5 backdrop-blur-sm border border-white/10 p-8 rounded-3xl">
                  <div className="flex gap-1 text-amber-400 mb-4">
                    {[1, 2, 3, 4, 5].map((s) => <Star key={s} className="w-4 h-4 fill-current" />)}
                  </div>
                  <p className="text-lg italic text-slate-300 mb-6 font-medium">"{testi.content}"</p>
                  <div className="flex items-center gap-4 border-t border-white/10 pt-6">
                    <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center font-bold text-xl">
                      {testi.name[0]}
                    </div>
                    <div>
                      <p className="font-bold">{testi.name}</p>
                      <p className="text-xs text-slate-400">{testi.role}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 6. Pricing Table Section */}
        <section className="py-24 sm:py-32 bg-white">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center mb-16">
              <h2 className="text-blue-600 font-bold uppercase tracking-widest text-sm mb-4">Precios</h2>
              <p className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">Elige el plan para tu éxito</p>
            </div>

            <div className="mx-auto grid max-w-lg grid-cols-1 items-stretch gap-y-8 lg:max-w-none lg:grid-cols-3 gap-8">
              {/* Free Plan */}
              <div className="flex flex-col rounded-3xl bg-white p-8 ring-1 ring-slate-200 xl:p-10 shadow-sm hover:shadow-md transition-all">
                <div className="flex-1">
                  <h3 className="text-lg font-bold leading-8 text-slate-900">Free</h3>
                  <p className="mt-4 text-sm leading-6 text-slate-600">Ideal para arrancar.</p>
                  <p className="mt-6 flex items-baseline gap-x-1">
                    <span className="text-4xl font-bold tracking-tight text-slate-900">$0</span>
                    <span className="text-sm font-semibold leading-6 text-slate-600">/mes</span>
                  </p>
                  <ul role="list" className="mt-8 space-y-3 text-sm leading-6 text-slate-600 border-t border-slate-100 pt-8">
                    <li className="flex gap-x-3"><Check className="h-6 w-5 text-blue-600" /> Eventos: 1</li>
                    <li className="flex gap-x-3 text-slate-400"><X className="h-6 w-5" /> Sync Calendar: No</li>
                    <li className="flex gap-x-3 text-slate-400"><X className="h-6 w-5" /> Pagos (MP): No</li>
                    <li className="flex gap-x-3 text-slate-400"><X className="h-6 w-5" /> Feriados: No</li>
                    <li className="flex gap-x-3"><Check className="h-6 w-5 text-blue-600" /> Personalización Básica</li>
                    <li className="flex gap-x-3 text-slate-400"><X className="h-6 w-5" /> WhatsApp: No</li>
                    <li className="flex gap-x-3 text-slate-400"><X className="h-6 w-5" /> Equipos: No</li>
                  </ul>
                </div>
                <Link href="/register" className="mt-8 block rounded-xl bg-blue-50 px-3 py-3 text-center text-sm font-bold leading-6 text-blue-600 hover:bg-blue-100 transition-all">
                  Empezar gratis
                </Link>
              </div>

              {/* Pro Plan */}
              <div className="relative flex flex-col rounded-3xl bg-slate-900 p-8 ring-1 ring-slate-900 xl:p-10 shadow-2xl scale-105 z-10">
                <div className="absolute top-0 right-8 -translate-y-1/2 bg-blue-600 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest">Recomendado</div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold leading-8 text-white">Pro</h3>
                  <p className="mt-4 text-sm leading-6 text-slate-400">Automatización completa.</p>
                  <p className="mt-6 flex items-baseline gap-x-1">
                    <span className="text-4xl font-bold tracking-tight text-white">$25</span>
                    <span className="text-sm font-semibold leading-6 text-slate-400">/mes</span>
                  </p>
                  <ul role="list" className="mt-8 space-y-3 text-sm leading-6 text-slate-300 border-t border-white/10 pt-8">
                    <li className="flex gap-x-3"><Check className="h-6 w-5 text-blue-400" /> Eventos: Ilimitados</li>
                    <li className="flex gap-x-3"><Check className="h-6 w-5 text-blue-400" /> Sync Calendar: 1 Cuenta</li>
                    <li className="flex gap-x-3"><Check className="h-6 w-5 text-blue-400" /> Pagos (MP): Sí</li>
                    <li className="flex gap-x-3"><Check className="h-6 w-5 text-blue-400" /> Feriados: Sí</li>
                    <li className="flex gap-x-3"><Check className="h-6 w-5 text-blue-400" /> Personalización Full + Banner</li>
                    <li className="flex gap-x-3 text-slate-500"><X className="h-6 w-5" /> WhatsApp: No</li>
                    <li className="flex gap-x-3 text-slate-500"><X className="h-6 w-5" /> Equipos: No</li>
                  </ul>
                </div>
                <Link href="/register" className="mt-8 block rounded-xl bg-blue-600 px-3 py-3 text-center text-sm font-bold leading-6 text-white hover:bg-blue-500 transition-all shadow-lg shadow-blue-600/40">
                  Prueba 14 días gratis
                </Link>
              </div>

              {/* Business Plan */}
              <div className="flex flex-col rounded-3xl bg-white p-8 ring-1 ring-slate-200 xl:p-10 shadow-sm hover:shadow-md transition-all">
                <div className="flex-1">
                  <h3 className="text-lg font-bold leading-8 text-slate-900">Business</h3>
                  <p className="mt-4 text-sm leading-6 text-slate-600">Para equipos y escala.</p>
                  <p className="mt-6 flex items-baseline gap-x-1">
                    <span className="text-4xl font-bold tracking-tight text-slate-900">$40</span>
                    <span className="text-sm font-semibold leading-6 text-slate-600">/mes</span>
                  </p>
                  <ul role="list" className="mt-8 space-y-3 text-sm leading-6 text-slate-600 border-t border-slate-100 pt-8">
                    <li className="flex gap-x-3"><Check className="h-6 w-5 text-blue-600" /> Eventos: Ilimitados</li>
                    <li className="flex gap-x-3"><Check className="h-6 w-5 text-blue-600" /> Sync Calendar: 2 Cuentas</li>
                    <li className="flex gap-x-3"><Check className="h-6 w-5 text-blue-600" /> Pagos (MP): Sí</li>
                    <li className="flex gap-x-3"><Check className="h-6 w-5 text-blue-600" /> Feriados: Sí</li>
                    <li className="flex gap-x-3"><Check className="h-6 w-5 text-blue-600" /> Personalización Full + White Label</li>
                    <li className="flex gap-x-3"><Check className="h-6 w-5 text-blue-600" /> WhatsApp: Sí (Ilimitados)</li>
                    <li className="flex gap-x-3"><Check className="h-6 w-5 text-blue-600" /> Equipos: Sí (hasta 5)</li>
                  </ul>
                </div>
                <Link href="/register" className="mt-8 block rounded-xl bg-blue-600 px-3 py-3 text-center text-sm font-bold leading-6 text-white hover:bg-blue-700 transition-all shadow-lg">
                  Contactar Ventas
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-24 bg-blue-600 relative overflow-hidden text-center text-white">
          <div className="absolute inset-0 bg-gradient-to-tr from-blue-700 to-indigo-700"></div>
          <div className="relative z-10 max-w-4xl mx-auto px-6 flex flex-col items-center">
            <h2 className="text-4xl font-black mb-8 leading-tight">¿Listo para retomar el control de tu tiempo?</h2>
            <p className="text-xl text-blue-100 mb-4 max-w-2xl mx-auto text-center">Únete a los profesionales que ya automatizaron su agenda con Turnos App.</p>

            <HeroFunnel variant="dark" />

            <div className="mt-12">
              <Link href="/login" className="text-white font-bold px-10 py-4 hover:text-blue-100 transition-all underline underline-offset-4 text-sm opacity-80">
                Ya tengo cuenta, iniciar sesión
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-white py-12 border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="flex items-center justify-center gap-2 text-blue-600 font-bold text-xl mb-6">
            <Calendar className="h-6 w-6" />
            <span>Turnos</span>
          </div>
          <p className="text-slate-400 text-sm">© 2026 Turnos App. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  );
}
