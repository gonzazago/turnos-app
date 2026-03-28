import Link from 'next/link'
import { login } from './actions'

export default async function LoginPage(props: { searchParams: Promise<{ error?: string }> }) {
  const searchParams = await props.searchParams;
  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 flex flex-col font-sans">
       <div className="flex-1 flex flex-col items-center justify-center p-4 relative overflow-hidden">
         {/* Background decorative elements */}
         <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-[120px] pointer-events-none"></div>
         <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-[120px] pointer-events-none"></div>
         
         <div className="w-full max-w-md bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-3xl p-8 shadow-2xl relative z-10 transition-all hover:border-slate-700/50">
           <div className="text-center mb-8">
             <div className="w-12 h-12 bg-blue-600 rounded-xl mx-auto mb-4 flex items-center justify-center shadow-lg shadow-blue-600/20">
               <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
             </div>
             <h1 className="text-3xl font-bold tracking-tight">Bienvenido de nuevo</h1>
             <p className="text-slate-400 mt-2">Inicia sesión en tu cuenta de Turnos</p>
           </div>
           
           {searchParams?.error && (
             <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm text-center font-medium">
               {searchParams.error}
             </div>
           )}

           <form className="flex flex-col gap-5">
             <div className="flex flex-col gap-2">
               <label htmlFor="email" className="text-sm font-medium text-slate-300">Correo Electrónico</label>
               <input id="email" name="email" type="email" required className="bg-slate-950/50 border border-slate-800 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all placeholder:text-slate-600" placeholder="tunombre@ejemplo.com" />
             </div>
             
             <div className="flex flex-col gap-2">
               <div className="flex items-center justify-between">
                 <label htmlFor="password" className="text-sm font-medium text-slate-300">Contraseña</label>
               </div>
               <input id="password" name="password" type="password" required className="bg-slate-950/50 border border-slate-800 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all placeholder:text-slate-600" placeholder="••••••••" />
             </div>
             
             <button formAction={login} className="mt-2 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-xl px-4 py-3 transition-all hover:shadow-[0_0_20px_rgba(37,99,235,0.4)] active:scale-[0.98]">
               Entrar al Panel
             </button>
           </form>
           
           <p className="mt-8 text-center text-sm text-slate-400">
             ¿No tienes cuenta? <Link href="/register" className="text-blue-400 font-medium hover:text-blue-300 transition-colors">Regístrate gratis</Link>
           </p>
         </div>
       </div>
    </div>
  )
}
