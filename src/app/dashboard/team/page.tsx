import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { createTeam, addTeamMember, removeTeamMember } from './actions'
import { Users, Plus, Trash2, Shield, Settings, Info } from 'lucide-react'

export default async function TeamPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Verificar plan
  const { data: profile } = await supabase
    .from('profiles')
    .select('plan_type, full_name, slug, logo_url')
    .eq('id', user.id)
    .single()

  if (profile?.plan_type !== 'ultra') {
    return (
      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm flex flex-col max-w-2xl mx-auto mt-12">
        <div className="h-32 bg-slate-900 border-b border-slate-200 flex items-center justify-center">
            <Users className="w-12 h-12 text-slate-100" />
        </div>
        <div className="p-8 text-center text-slate-600">
           <h2 className="text-2xl font-bold text-slate-900 mb-4">Múltiples Profesionales, Un Solo Lugar</h2>
           <p className="mb-6 leading-relaxed">
             La funcionalidad de Equipos te permite centralizar hasta 5 calendarios y tipos de eventos de distintos profesionales (colegas, empleados, contratistas) bajo la misma página madre.
           </p>
           <div className="p-4 bg-orange-50 border border-orange-100 rounded-xl mb-8 flex gap-3 text-left">
             <Info className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
             <p className="text-sm text-orange-800 font-medium">Esta función avanzada es exclusiva para usuarios con suscripción Ultra.</p>
           </div>
           <button disabled className="bg-slate-200 text-slate-400 font-bold px-8 py-3 rounded-xl cursor-not-allowed w-full">Mejorar al plan Ultra</button>
        </div>
      </div>
    )
  }

  // Traer el equipo (si tiene)
  const { data: team } = await supabase
    .from('teams')
    .select('*')
    .eq('owner_id', user.id)
    .single()

  // Buscar miembros si hay equipo
  let members: any[] = []
  if (team) {
    const { data: membersData } = await supabase
      .from('team_members')
      .select(`
        user_id,
        role,
        profiles (
          id,
          full_name,
          slug,
          logo_url
        )
      `)
      .eq('team_id', team.id)
    
    if (membersData) {
      members = membersData
    }
  }

  return (
    <div className="max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2 mt-4 md:mt-0 flex items-center gap-3">
          <Users className="w-8 h-8 text-slate-400" />
          Mi Organización
        </h1>
        <p className="text-slate-500">
          Gestiona el equipo de profesionales, las invitaciones y los roles centralizados. (Límite: 5 miembros)
        </p>
      </div>

      {!team ? (
        <form action={createTeam as any} className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm flex flex-col max-w-xl">
           <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-6">
             <Shield className="w-8 h-8 text-blue-600" />
           </div>
           <h2 className="text-2xl font-bold text-slate-900 mb-2">Crear Equipo</h2>
           <p className="text-slate-500 mb-6">Empieza asignándole un nombre público a tu organización.</p>
           
           <label className="text-sm font-bold text-slate-700 mb-2 block">Nombre del Equipo</label>
           <input 
             type="text" 
             name="teamName" 
             required 
             placeholder="Ej: Clínica Dental Zago, Estudio de Diseño..."
             className="w-full border border-slate-300 rounded-xl px-4 py-3 mb-6 focus:ring-2 focus:ring-blue-600 outline-none text-slate-900 placeholder:text-slate-400" 
           />
           <button type="submit" className="bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 px-6 rounded-xl transition-colors">
             Crear Organización
           </button>
        </form>
      ) : (
        <div className="flex flex-col gap-8">
           {/* Vista de Miembros */}
           <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
             <div className="flex justify-between items-center p-6 border-b border-slate-100 bg-slate-50/50">
               <div>
                 <h2 className="text-xl font-bold text-slate-900">Equipo de {team.name}</h2>
                 <p className="text-slate-500 text-sm">{members.length} / 5 miembros permitidos</p>
               </div>
               <Settings className="w-5 h-5 text-slate-400 cursor-pointer hover:text-slate-900" />
             </div>

             <div className="p-6">
               <ul className="flex flex-col gap-4 mb-8">
                 {/* Owner */}
                 <li className="flex justify-between items-center p-4 border border-slate-200 bg-slate-50 rounded-2xl">
                   <div className="flex items-center gap-4">
                     {profile.logo_url ? (
                       <img src={profile.logo_url} className="w-10 h-10 rounded-full" />
                     ) : (
                       <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold">{profile.full_name?.charAt(0) || '*'}</div>
                     )}
                     <div>
                       <p className="font-bold text-slate-900">{profile.full_name} (Tú)</p>
                       <p className="text-sm text-slate-500">/{profile.slug}</p>
                     </div>
                   </div>
                   <span className="bg-blue-100 text-blue-700 font-bold text-xs px-3 py-1 rounded-full uppercase tracking-widest">Dueño</span>
                 </li>

                 {/* Resto de miembros */}
                 {members.map((m: any) => {
                   const memberProfile = m.profiles
                   return (
                     <li key={m.user_id} className="flex justify-between items-center p-4 border border-slate-100 bg-white rounded-2xl hover:border-slate-200 transition-colors">
                       <div className="flex items-center gap-4">
                         {memberProfile?.logo_url ? (
                           <img src={memberProfile.logo_url} className="w-10 h-10 rounded-full" />
                         ) : (
                           <div className="w-10 h-10 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center font-bold">{memberProfile?.full_name?.charAt(0) || '*'}</div>
                         )}
                         <div>
                           <p className="font-bold text-slate-900">{memberProfile?.full_name || 'Usuario'}</p>
                           <p className="text-sm text-slate-500">/{memberProfile?.slug || 'sin-slug'}</p>
                         </div>
                       </div>
                       
                       <form action={removeTeamMember as any}>
                         <input type="hidden" name="memberId" value={m.user_id} />
                         <button type="submit" className="p-2 text-red-500 hover:bg-red-50 rounded-lg group" title="Remover del equipo">
                           <Trash2 className="w-5 h-5 group-hover:scale-110 transition-transform" />
                         </button>
                       </form>
                     </li>
                   )
                 })}
               </ul>

               {/* Añadir miembro logic */}
               {members.length < 5 ? (
                 <div className="bg-slate-50 p-6 rounded-2xl border border-dashed border-slate-300">
                    <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                      <Plus className="w-5 h-5 text-blue-600" />
                      Añadir a un profesional
                    </h3>
                    <form action={addTeamMember as any} className="flex flex-col md:flex-row gap-4">
                      <div className="flex-1">
                        <label className="sr-only">Identificador (Slug)</label>
                        <input 
                          type="text" 
                          name="slug"
                          placeholder="Ingresa el slug de usuario (Ej: ana-gomez)" 
                          required
                          className="w-full border border-slate-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-600 outline-none text-slate-900 placeholder:text-slate-400" 
                        />
                      </div>
                      <button type="submit" className="bg-slate-900 hover:bg-slate-800 text-white px-8 py-3 rounded-xl font-bold transition-colors whitespace-nowrap">
                        Asignar al equipo
                      </button>
                    </form>
                    <p className="text-xs text-slate-500 mt-4">
                       Debes ingresar el identificador público ("slug") de un usuario que ya esté registrado en Turnos.
                    </p>
                 </div>
               ) : (
                 <div className="bg-red-50 text-red-700 p-4 rounded-xl border border-red-100 flex items-center justify-center font-medium">
                    Has alcanzado el límite de 5 profesionales para este equipo (Plan Ultra).
                 </div>
               )}
             </div>
           </div>
        </div>
      )}
    </div>
  )
}
