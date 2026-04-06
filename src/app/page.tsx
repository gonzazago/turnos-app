import Link from "next/link";
import { Calendar, ArrowRight, CheckCircle2, Globe, Clock, ShieldCheck, Zap } from "lucide-react";
import { HeroFunnel } from "./components/HeroFunnel";

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200/50">
        <nav className="flex items-center justify-between p-4 lg:px-8 max-w-7xl mx-auto" aria-label="Global">
          <div className="flex lg:flex-1">
            <Link href="/" className="-m-1.5 p-1.5 flex items-center gap-2 text-blue-600 font-bold text-xl">
              <Calendar className="h-8 w-8" />
              <span>Turnos</span>
            </Link>
          </div>
          <div className="flex flex-1 justify-end gap-x-4">
            <Link href="/login" className="text-sm font-semibold leading-6 text-slate-900 border border-slate-200 px-4 py-2 rounded-xl hover:bg-slate-50 transition-colors">
              Iniciar Sesión
            </Link>
            <Link href="/register" className="text-sm font-semibold flex items-center gap-1.5 leading-6 text-white bg-blue-600 px-4 py-2 rounded-xl hover:bg-blue-500 transition-colors">
              Regístrate <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </nav>
      </header>

      <div className="relative isolate px-6 pt-14 lg:px-8 bg-slate-50 min-h-screen flex items-center">
        <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80" aria-hidden="true">
          <div className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-30 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]" style={{clipPath: "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)"}}></div>
        </div>
        
        <div className="mx-auto max-w-2xl py-32 sm:py-48 lg:py-56">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-7xl">
              Tu agenda, <span className="text-blue-600 font-extrabold tracking-tighter">en piloto automático.</span>
            </h1>
            <p className="mt-6 text-lg leading-8 text-slate-600 max-w-xl mx-auto">
              La forma más simple de recibir reservas. Crea tu página en segundos, comparte tu enlace y deja que tus clientes agendan sin idas y vueltas.
            </p>
            
            <HeroFunnel />

            <div className="mt-10 flex items-center justify-center gap-x-8 text-slate-400">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                <span className="text-[10px] font-bold uppercase tracking-widest">Gratis para siempre</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                <span className="text-[10px] font-bold uppercase tracking-widest">Sin tarjeta de crédito</span>
              </div>
            </div>
          </div>
        </div>

        {/* Social Proof Section */}
        <div className="mx-auto max-w-7xl px-6 lg:px-8 pb-24">
          <div className="mx-auto max-w-2xl text-center mb-12">
            <h2 className="text-sm font-semibold leading-7 text-blue-600 uppercase tracking-widest">Confianza total</h2>
            <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Usado por profesionales en todo el mundo
            </p>
          </div>
          <div className="mx-auto grid max-w-lg grid-cols-4 items-center gap-x-8 gap-y-10 sm:max-w-xl sm:grid-cols-6 sm:gap-x-10 lg:mx-0 lg:max-w-none lg:grid-cols-5 opacity-50 grayscale hover:opacity-100 hover:grayscale-0 transition-all duration-500">
            <div className="flex items-center justify-center gap-2 font-bold text-slate-400 text-xl italic">
              <Globe className="w-6 h-6" /> GLOBAL
            </div>
            <div className="flex items-center justify-center gap-2 font-bold text-slate-400 text-xl italic">
              <Zap className="w-6 h-6" /> FLASH
            </div>
            <div className="flex items-center justify-center gap-2 font-bold text-slate-400 text-xl italic">
              <ShieldCheck className="w-6 h-6" /> SECURE
            </div>
            <div className="flex items-center justify-center gap-2 font-bold text-slate-400 text-xl italic">
              <Clock className="w-6 h-6" /> TIME
            </div>
            <div className="flex items-center justify-center gap-2 font-bold text-slate-400 text-xl italic">
              <Sparkles className="w-6 h-6" /> SHINE
            </div>
          </div>
        </div>

        {/* How It Works Section */}
        <div className="bg-slate-900 py-24 sm:py-32 relative overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 pointer-events-none"></div>
          <div className="mx-auto max-w-7xl px-6 lg:px-8 relative z-10">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-base font-semibold leading-7 text-blue-400">Puesta en marcha rápida</h2>
              <p className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">
                Tu agenda lista en 3 simples pasos
              </p>
            </div>
            <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
              <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
                <div className="flex flex-col items-center text-center">
                  <dt className="flex flex-col items-center gap-y-4 text-base font-semibold leading-7 text-white">
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-600 shadow-lg shadow-blue-600/40 ring-1 ring-white/10">
                      <User className="h-8 w-8 text-white" aria-hidden="true" />
                    </div>
                    1. Crea tu página
                  </dt>
                  <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-slate-400">
                    <p className="flex-auto">Personaliza tu perfil con tu nombre, logo y colores. Define tus servicios y horarios de atención.</p>
                  </dd>
                </div>
                <div className="flex flex-col items-center text-center">
                  <dt className="flex flex-col items-center gap-y-4 text-base font-semibold leading-7 text-white">
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-600 shadow-lg shadow-indigo-600/40 ring-1 ring-white/10">
                      <ArrowRight className="h-8 w-8 text-white" aria-hidden="true" />
                    </div>
                    2. Comparte tu enlace
                  </dt>
                  <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-slate-400">
                    <p className="flex-auto">Envía tu URL personalizada por WhatsApp, Instagram o ponla en tu web. Tus clientes lo amarán.</p>
                  </dd>
                </div>
                <div className="flex flex-col items-center text-center">
                  <dt className="flex flex-col items-center gap-y-4 text-base font-semibold leading-7 text-white">
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-violet-600 shadow-lg shadow-violet-600/40 ring-1 ring-white/10">
                      <Calendar className="h-8 w-8 text-white" aria-hidden="true" />
                    </div>
                    3. Recibe reservas
                  </dt>
                  <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-slate-400">
                    <p className="flex-auto">Tus clientes eligen el horario y agendan. Tú recibes una notificación y el evento se sincroniza solo.</p>
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="py-24 sm:py-32">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mx-auto max-w-2xl lg:text-center">
              <h2 className="text-base font-semibold leading-7 text-blue-600">Todo lo que necesitas</h2>
              <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                Diseñado para simplificar tu vida profesional
              </p>
              <p className="mt-6 text-lg leading-8 text-slate-600">
                Olvídate de coordinar horarios por mensaje. Turnos App automatiza el trabajo pesado para que tú te concentres en lo que importa.
              </p>
            </div>
            <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
              <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
                <div className="flex flex-col">
                  <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-slate-900">
                    <Calendar className="h-5 w-5 flex-none text-blue-600" aria-hidden="true" />
                    Sincronización Bidireccional
                  </dt>
                  <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-slate-600">
                    <p className="flex-auto">Conecta tu Google Calendar. Tus eventos personales bloquean turnos automáticamente y tus nuevas reservas aparecen en tu calendario al instante.</p>
                  </dd>
                </div>
                <div className="flex flex-col">
                  <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-slate-900">
                    <Zap className="h-5 w-5 flex-none text-blue-600" aria-hidden="true" />
                    Pagos Integrados
                  </dt>
                  <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-slate-600">
                    <p className="flex-auto">Cobra señas o el total por Mercado Pago antes de confirmar la cita. Reduce el ausentismo y asegura tus ingresos.</p>
                  </dd>
                </div>
                <div className="flex flex-col">
                  <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-slate-900">
                    <ShieldCheck className="h-5 w-5 flex-none text-blue-600" aria-hidden="true" />
                    Control Total
                  </dt>
                  <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-slate-600">
                    <p className="flex-auto">Define duraciones, descansos entre turnos, y recordatorios automáticos. Tú decides cuándo y cómo trabajas.</p>
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
        
        <div className="absolute inset-x-0 top-[calc(100%-13rem)] -z-10 transform-gpu overflow-hidden blur-3xl sm:top-[calc(100%-30rem)]" aria-hidden="true">
          <div className="relative left-[calc(50%+3rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 bg-gradient-to-tr from-[#80b5ff] to-[#4f46e5] opacity-30 sm:left-[calc(50%+36rem)] sm:w-[72.1875rem]" style={{clipPath: "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)"}}></div>
        </div>
      </div>
    </div>
  );
}
