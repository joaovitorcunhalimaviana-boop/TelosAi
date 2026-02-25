"use client"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export function DashboardSkeleton() {
  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #0B0E14, #111520, #0B0E14)' }}>
      <div className="container mx-auto px-4 py-8">
        {/* Header Skeleton */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
          <div className="flex items-center gap-3">
            <div>
              <Skeleton className="h-10 w-64 mb-2" style={{ backgroundColor: '#2A3147' }} />
              <Skeleton className="h-5 w-48" style={{ backgroundColor: '#1E2535' }} />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-32" style={{ backgroundColor: '#2A3147' }} />
            <Skeleton className="h-10 w-10" style={{ backgroundColor: '#2A3147' }} />
            <Skeleton className="h-12 w-40" style={{ backgroundColor: '#2A3147' }} />
          </div>
        </div>

        {/* Stats Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="border-2" style={{ borderColor: '#14BDAE', backgroundColor: '#161B27' }}>
              <CardHeader className="pb-3" style={{ backgroundColor: '#0B0E14' }}>
                <div className="flex items-center justify-between">
                  <Skeleton className="h-4 w-24" style={{ backgroundColor: '#2A3147' }} />
                  <Skeleton className="h-5 w-5 rounded" style={{ backgroundColor: '#2A3147' }} />
                </div>
              </CardHeader>
              <CardContent>
                <Skeleton className="h-9 w-16" style={{ backgroundColor: '#2A3147' }} />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Red Flags Skeleton */}
        <Card className="mb-6 border-2" style={{ borderColor: 'rgba(192, 57, 43, 0.4)', backgroundColor: '#161B27' }}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Skeleton className="h-6 w-6 rounded-full" style={{ backgroundColor: '#2A3147' }} />
                <Skeleton className="h-6 w-40" style={{ backgroundColor: '#2A3147' }} />
              </div>
              <Skeleton className="h-6 w-20" style={{ backgroundColor: '#2A3147' }} />
            </div>
          </CardHeader>
          <CardContent>
            <Skeleton className="h-20 w-full" style={{ backgroundColor: '#1E2535' }} />
          </CardContent>
        </Card>

        {/* Search and Filters Skeleton */}
        <div className="rounded-xl shadow-sm p-4 mb-6" style={{ backgroundColor: '#161B27', border: '1px solid #1E2535' }}>
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 flex-1" style={{ backgroundColor: '#2A3147' }} />
            <Skeleton className="h-10 w-24" style={{ backgroundColor: '#2A3147' }} />
          </div>
        </div>

        {/* Section Title Skeleton */}
        <div className="flex items-center gap-2 mb-4">
          <Skeleton className="h-6 w-6" style={{ backgroundColor: '#2A3147' }} />
          <Skeleton className="h-8 w-64" style={{ backgroundColor: '#2A3147' }} />
          <Skeleton className="h-6 w-20 rounded-full" style={{ backgroundColor: '#2A3147' }} />
        </div>

        {/* Patient Cards Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="border-2" style={{ borderColor: '#1E2535', backgroundColor: '#161B27' }}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <Skeleton className="h-6 w-40 mb-2" style={{ backgroundColor: '#2A3147' }} />
                    <div className="flex flex-wrap gap-2">
                      <Skeleton className="h-5 w-24 rounded-full" style={{ backgroundColor: '#2A3147' }} />
                      <Skeleton className="h-5 w-16 rounded-full" style={{ backgroundColor: '#2A3147' }} />
                      <Skeleton className="h-5 w-14 rounded-full" style={{ backgroundColor: '#2A3147' }} />
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {/* Date */}
                <div className="flex items-center gap-2">
                  <Skeleton className="h-4 w-4" style={{ backgroundColor: '#2A3147' }} />
                  <Skeleton className="h-4 w-36" style={{ backgroundColor: '#2A3147' }} />
                </div>

                {/* Completeness */}
                <div className="p-3 rounded-lg" style={{ backgroundColor: '#0B0E14', border: '1px solid #1E2535' }}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-5 w-5" style={{ backgroundColor: '#2A3147' }} />
                      <Skeleton className="h-4 w-32" style={{ backgroundColor: '#2A3147' }} />
                    </div>
                    <Skeleton className="h-5 w-12 rounded-full" style={{ backgroundColor: '#2A3147' }} />
                  </div>
                  <Skeleton className="h-3 w-full rounded-full" style={{ backgroundColor: '#2A3147' }} />
                  <Skeleton className="h-3 w-24 mt-1" style={{ backgroundColor: '#2A3147' }} />
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 pt-2" style={{ borderTop: '1px solid #1E2535' }}>
                  <Skeleton className="h-9 flex-1" style={{ backgroundColor: '#2A3147' }} />
                  <Skeleton className="h-9 flex-1" style={{ backgroundColor: '#2A3147' }} />
                </div>
                <div className="flex gap-2">
                  <Skeleton className="h-9 flex-1" style={{ backgroundColor: '#2A3147' }} />
                  <Skeleton className="h-9 flex-1" style={{ backgroundColor: '#2A3147' }} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
