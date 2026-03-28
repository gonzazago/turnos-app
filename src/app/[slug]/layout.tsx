import { createClient } from '@/utils/supabase/server'
import { notFound } from 'next/navigation'

// Optional: you can use CSS variables to override tailwind's primary color
export default async function PublicLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: profile } = await supabase
    .from('profiles')
    .select('brand_color, logo_url, full_name')
    .eq('slug', slug)
    .single()

  if (!profile) {
    notFound()
  }

  // We inject a style tag to define CSS variables for the user's custom color.
  // We name it --brand-color to use it in our pages.
  return (
    <div className="min-h-screen bg-slate-50 font-sans" style={{ '--brand-color': profile.brand_color || '#3b82f6' } as any}>
       <style dangerouslySetInnerHTML={{__html: `
         .brand-bg { background-color: var(--brand-color); }
         .brand-text { color: var(--brand-color); }
         .brand-border { border-color: var(--brand-color); }
         .brand-ring { --tw-ring-color: var(--brand-color); }
       `}} />
       
       <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-center shadow-sm">
         <div className="flex items-center gap-4">
           {profile.logo_url ? (
             <img src={profile.logo_url} alt={`Logo de ${profile.full_name}`} className="w-12 h-12 rounded-full object-cover border border-slate-200 shadow-sm" />
           ) : (
             <div className="w-12 h-12 rounded-full brand-bg text-white flex flex-col items-center justify-center font-bold text-xl shadow-sm">
               {profile.full_name?.charAt(0)}
             </div>
           )}
           <h1 className="text-xl font-bold text-slate-900">{profile.full_name}</h1>
         </div>
       </header>

       <main className="max-w-3xl mx-auto py-12 px-4">
         {children}
       </main>

       <footer className="py-8 text-center text-slate-400 text-sm">
          <p>Potenciado por <span className="font-semibold brand-text">Turnos</span></p>
       </footer>
    </div>
  )
}
