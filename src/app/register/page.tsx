import Link from 'next/link'
import { signup } from '@/app/login/actions'

export default async function RegisterPage(props: { searchParams: Promise<{ error?: string, slug?: string }> }) {
  const searchParams = await props.searchParams;
  const initialSlug = searchParams?.slug || '';
  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 flex flex-col font-sans">
       <div className="flex-1 flex flex-col items-center justify-center p-4 relative overflow-hidden">
         <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-[120px] pointer-events-none"></div>
         <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-indigo-600/20 rounded-full blur-[120px] pointer-events-none"></div>
         
         <div className="w-full max-w-md bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-3xl p-8 shadow-2xl relative z-10 transition-all hover:border-slate-700/50">
           <div className="text-center mb-8">
             <h1 className="text-3xl font-bold tracking-tight">Crea tu cuenta</h1>
             <p className="text-slate-400 mt-2">Comienza a gestionar tus turnos hoy mismo</p>
           </div>
           
           {searchParams?.error && (
             <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm text-center font-medium">
               {searchParams.error}
             </div>
           )}

           <form className="flex flex-col gap-5">
             <input type="hidden" name="requestedSlug" defaultValue={initialSlug} />
             <div className="flex flex-col gap-2">
               <label htmlFor="fullName" className="text-sm font-medium text-slate-300">Nombre Completo</label>
               <input id="fullName" name="fullName" type="text" required className="bg-slate-950/50 border border-slate-800 rounded-xl px-4 py-3 text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all placeholder:text-slate-600" placeholder="Juan Pérez" />
             </div>

             <div className="flex flex-col gap-2">
               <label htmlFor="email" className="text-sm font-medium text-slate-300">Correo Electrónico</label>
               <input id="email" name="email" type="email" required className="bg-slate-950/50 border border-slate-800 rounded-xl px-4 py-3 text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all placeholder:text-slate-600" placeholder="tunombre@ejemplo.com" />
             </div>
             
             <div className="flex flex-col gap-2">
               <label htmlFor="password" className="text-sm font-medium text-slate-300">Contraseña</label>
               <input id="password" name="password" type="password" required className="bg-slate-950/50 border border-slate-800 rounded-xl px-4 py-3 text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all placeholder:text-slate-600" placeholder="•••••••• (mín. 6 caracteres)" minLength={6} />
             </div>
             
             <button formAction={signup} className="mt-2 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-xl px-4 py-3 transition-all hover:shadow-[0_0_20px_rgba(37,99,235,0.4)] active:scale-[0.98]">
               Registrarme y Continuar
             </button>
           </form>
           
           <p className="mt-8 text-center text-sm text-slate-400">
             ¿Ya tienes una cuenta? <Link href="/login" className="text-blue-400 font-medium hover:text-blue-300 transition-colors">Inicia sesión</Link>
           </p>
         </div>
       </div>
    </div>
  )
}
