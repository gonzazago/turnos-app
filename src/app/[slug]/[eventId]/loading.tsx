import { Skeleton } from "@/components/ui/Skeleton"

export default function PublicBookingLoading() {
  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden max-w-5xl mx-auto flex flex-col md:flex-row min-h-[600px]">
      <div className="bg-slate-50 border-b md:border-b-0 md:border-r border-slate-200 p-8 w-full md:w-1/3 space-y-8">
        <Skeleton className="h-10 w-10 rounded-full" />
        <div className="space-y-4">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-8 w-full" />
        </div>
        <div className="space-y-4">
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-6 w-3/4" />
        </div>
      </div>
      <div className="p-8 w-full md:w-2/3 space-y-8">
        <Skeleton className="h-8 w-64" />
        <div className="flex gap-4 overflow-hidden">
          <Skeleton className="h-24 min-w-[80px] rounded-2xl" />
          <Skeleton className="h-24 min-w-[80px] rounded-2xl" />
          <Skeleton className="h-24 min-w-[80px] rounded-2xl" />
          <Skeleton className="h-24 min-w-[80px] rounded-2xl" />
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-4">
          <Skeleton className="h-12 w-full rounded-xl" />
          <Skeleton className="h-12 w-full rounded-xl" />
          <Skeleton className="h-12 w-full rounded-xl" />
          <Skeleton className="h-12 w-full rounded-xl" />
          <Skeleton className="h-12 w-full rounded-xl" />
          <Skeleton className="h-12 w-full rounded-xl" />
          <Skeleton className="h-12 w-full rounded-xl" />
          <Skeleton className="h-12 w-full rounded-xl" />
        </div>
      </div>
    </div>
  )
}
