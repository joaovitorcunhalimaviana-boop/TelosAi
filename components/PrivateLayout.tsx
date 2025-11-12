"use client"

import { DashboardHeader } from "@/components/DashboardHeader"
import { BottomNav } from "@/components/BottomNav"

interface PrivateLayoutProps {
  children: React.ReactNode
}

export function PrivateLayout({ children }: PrivateLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader />
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>
      <BottomNav />
    </div>
  )
}
