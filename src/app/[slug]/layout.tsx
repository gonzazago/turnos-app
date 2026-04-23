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

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('slug', slug)
    .single()

  if (error) {
    console.error("Error fetching profile in layout:", error);
  }

  if (!profile) {
    notFound()
  }

  function getLuminance(hex: string) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!result) return 0;
    const r = parseInt(result[1], 16) / 255;
    const g = parseInt(result[2], 16) / 255;
    const b = parseInt(result[3], 16) / 255;
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  }

  const palette = profile.brand_palette || {};
  const primaryColor = palette.primary || profile.brand_color || '#3b82f6';
  const secondaryColor = palette.secondary || '#1e40af';
  const fontFamily = profile.font_family || 'Inter';
  
  const luma = getLuminance(primaryColor);
  const isLight = luma > 0.6; // Si es > 0.6, se considera color claro
  
  const hoverBg = isLight ? '#0f172a' : '#f1f5f9';
  const hoverText = isLight ? '#ffffff' : primaryColor;
  const contrastText = isLight ? '#0f172a' : '#ffffff';

  // Format font name for Google Fonts
  const fontUrlParam = fontFamily.replace(/ /g, '+');

  return (
    <div className="min-h-screen font-sans" style={{ 
      '--brand-color': primaryColor,
      '--brand-secondary': secondaryColor,
      '--brand-hover-bg': hoverBg,
      '--brand-hover-text': hoverText,
      '--brand-contrast-text': contrastText,
      fontFamily: `"${fontFamily}", sans-serif`
    } as any}>
       <style dangerouslySetInnerHTML={{__html: `
         @import url('https://fonts.googleapis.com/css2?family=${fontUrlParam}:wght@400;500;600;700&display=swap');
         .brand-bg { background-color: var(--brand-color); }
         .brand-text { color: var(--brand-color); }
         .brand-border { border-color: var(--brand-color); }
         .brand-ring { --tw-ring-color: var(--brand-color); }
         
         .brand-bg-contrast { 
            background-color: var(--brand-color); 
            color: var(--brand-contrast-text); 
            border-color: var(--brand-color);
         }
         
         .hover-brand-action { transition: all 0.2s ease-in-out; }
         .hover-brand-action:hover {
            background-color: var(--brand-hover-bg) !important;
            color: var(--brand-hover-text) !important;
            border-color: var(--brand-hover-bg) !important;
         }
         
         .min-h-screen { background-color: ${palette.background || '#f8fafc'}; color: ${palette.text || '#0f172a'}; }
       `}} />

       {profile.favicon_url && (
         <link rel="icon" href={profile.favicon_url} />
       )}
       
       {profile.banner_url ? (
         <div className="w-full h-32 xs:h-40 sm:h-48 md:h-64 bg-slate-200">
           <img src={profile.banner_url} alt="Cover Banner" className="w-full h-full object-cover" />
         </div>
       ) : (
         <header className="h-16 sm:h-20 bg-white border-b border-slate-200 flex items-center justify-center shadow-sm">
           <div className="flex items-center gap-3 sm:gap-4 px-4">
             {profile.logo_url ? (
               <img src={profile.logo_url} alt={`Logo de ${profile.full_name}`} className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover border border-slate-200 shadow-sm" />
             ) : (
               <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full brand-bg text-white flex flex-col items-center justify-center font-bold text-lg sm:text-xl shadow-sm">
                 {profile.full_name?.charAt(0)}
               </div>
             )}
             <h1 className="text-lg sm:text-xl font-bold text-slate-900 truncate max-w-[200px] sm:max-w-none">{profile.full_name}</h1>
           </div>
         </header>
       )}

       <main className={`max-w-3xl mx-auto px-4 ${profile.banner_url ? '-mt-10 sm:-mt-12 relative z-10' : 'py-8 sm:py-12'}`}>
         {profile.banner_url && (
           <div className="flex items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
             {profile.logo_url ? (
               <img src={profile.logo_url} alt={`Logo de ${profile.full_name}`} className="w-16 h-16 sm:w-24 sm:h-24 rounded-2xl object-cover border-4 border-white shadow-lg bg-white" />
             ) : (
               <div className="w-16 h-16 sm:w-24 sm:h-24 rounded-2xl brand-bg text-white flex flex-col items-center justify-center font-bold text-2xl sm:text-4xl shadow-lg border-4 border-white bg-white backdrop-blur-sm">
                 {profile.full_name?.charAt(0)}
               </div>
             )}
             <div className="pt-4 sm:pt-8">
                <h1 className="text-xl sm:text-2xl font-bold bg-white/90 backdrop-blur-sm px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl shadow-sm inline-block">{profile.full_name}</h1>
             </div>
           </div>
         )}
         {children}
       </main>

       <footer className="py-8 text-center text-slate-400 text-sm">
          <p>Potenciado por <span className="font-semibold brand-text">Turnos</span></p>
       </footer>
    </div>
  )
}
