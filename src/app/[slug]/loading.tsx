import { Skeleton } from "@/components/ui/Skeleton"

export default function PublicProfileLoading() {
  return (
    <div className="max-w-3xl mx-auto flex flex-col gap-8 mt-12">
      <div className="flex flex-col items-center gap-4">
        <Skeleton className="h-24 w-24 rounded-full" />
        <Skeleton className="h-8 w-48" />
      </div>

      <div className="bg-white border border-slate-200 rounded-3xl p-8 space-y-6">
        <Skeleton className="h-8 w-64 mx-auto" />
        <div className="space-y-4">
          <Skeleton className="h-24 w-full rounded-2xl" />
          <Skeleton className="h-24 w-full rounded-2xl" />
        </div>
      </div>
    </div>
  )
}
