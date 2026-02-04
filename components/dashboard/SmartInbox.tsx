"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale"
import { getRecentPatientActivity, type RecentActivity } from "@/app/dashboard/actions"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
    Inbox,
    Clock,
    MessageSquare,
    AlertTriangle,
    ChevronRight,
    RefreshCcw
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

const container = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1
        }
    }
}

const item = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 }
}

export function SmartInbox() {
    const [activities, setActivities] = useState<RecentActivity[]>([])
    const [loading, setLoading] = useState(true)

    const fetchActivities = async () => {
        setLoading(true)
        try {
            const data = await getRecentPatientActivity(10)
            setActivities(data)
        } catch (error) {
            console.error("Failed to fetch recent activity", error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchActivities()

        // Refresh every minute
        const interval = setInterval(fetchActivities, 60000)
        return () => clearInterval(interval)
    }, [])

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-100 p-1.5 md:p-2 rounded-lg shrink-0">
                        <Inbox className="h-4 w-4 md:h-5 md:w-5" />
                    </Badge>
                    <div className="min-w-0">
                        <CardTitle className="text-base md:text-xl text-[#0A2647] font-bold flex items-center gap-2">
                            <span className="truncate">Smart Inbox</span>
                            {activities.length > 0 && (
                                <span className="text-[10px] md:text-xs font-medium text-white bg-[#0A2647] px-1.5 md:px-2 py-0.5 rounded-full shrink-0">
                                    {activities.length}
                                </span>
                            )}
                        </CardTitle>
                        <p className="text-[10px] md:text-xs text-muted-foreground mt-0.5 md:mt-1 hidden sm:block">
                            Atualizações em tempo real
                        </p>
                    </div>
                </div>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={fetchActivities}
                    className={`shrink-0 ${loading ? "animate-spin" : ""}`}
                >
                    <RefreshCcw className="h-4 w-4" />
                </Button>
            </CardHeader>

            <CardContent>
                {loading && activities.length === 0 ? (
                    <div className="space-y-4">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="flex gap-4 p-4 rounded-xl bg-white/50 shadow-sm border border-gray-100 animate-pulse">
                                <div className="h-10 w-10 rounded-full bg-gray-200" />
                                <div className="flex-1 space-y-2">
                                    <div className="h-4 w-1/3 bg-gray-200 rounded" />
                                    <div className="h-3 w-3/4 bg-gray-100 rounded" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : activities.length === 0 ? (
                    <div className="text-center py-10 text-muted-foreground">
                        <Inbox className="h-10 w-10 mx-auto mb-3 opacity-20" />
                        <p>Nenhuma atividade recente encontrada</p>
                    </div>
                ) : (
                    <motion.div
                        variants={container}
                        initial="hidden"
                        animate="show"
                        className="space-y-3"
                    >
                        {activities.map((activity) => (
                            <motion.div
                                key={activity.id}
                                variants={item}
                            >
                                <Link href={`/paciente/${activity.patientId}/editar`}>
                                    <div className="group relative flex gap-3 md:gap-4 p-3 md:p-4 rounded-lg md:rounded-xl glass-card hover:bg-white/90 border-none transition-all duration-300 cursor-pointer overflow-hidden">
                                        {/* Status Indicator Strip */}
                                        <div className={`absolute left-0 top-0 bottom-0 w-1 ${activity.riskLevel === 'high' || activity.riskLevel === 'critical'
                                            ? 'bg-red-500'
                                            : activity.riskLevel === 'medium'
                                                ? 'bg-yellow-500'
                                                : 'bg-green-500'
                                            }`} />

                                        <div className="flex-shrink-0">
                                            <div className={`h-8 w-8 md:h-10 md:w-10 rounded-full flex items-center justify-center ${activity.riskLevel === 'high' || activity.riskLevel === 'critical'
                                                ? 'bg-red-50 text-red-600'
                                                : 'bg-blue-50 text-blue-600'
                                                }`}>
                                                {activity.riskLevel === 'high' || activity.riskLevel === 'critical' ? (
                                                    <AlertTriangle className="h-4 w-4 md:h-5 md:w-5" />
                                                ) : (
                                                    <MessageSquare className="h-4 w-4 md:h-5 md:w-5" />
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-start gap-2 mb-1">
                                                <div className="min-w-0">
                                                    <h4 className="font-semibold text-[#0A2647] text-xs md:text-sm group-hover:text-blue-700 transition-colors truncate">
                                                        {activity.patientName}
                                                    </h4>
                                                    <span className="text-[10px] md:text-xs text-muted-foreground flex items-center gap-1">
                                                        <span className="truncate">{activity.surgeryType}</span> • D+{activity.dayNumber}
                                                    </span>
                                                </div>
                                                <div className="flex flex-col items-end shrink-0">
                                                    <span className="text-[9px] md:text-[10px] text-muted-foreground font-medium flex items-center gap-1 bg-gray-50 px-1.5 md:px-2 py-0.5 md:py-1 rounded-full">
                                                        <Clock className="h-2.5 w-2.5 md:h-3 md:w-3" />
                                                        <span className="hidden sm:inline">{formatDistanceToNow(new Date(activity.timestamp), {
                                                            addSuffix: true,
                                                            locale: ptBR
                                                        })}</span>
                                                        <span className="sm:hidden">{formatDistanceToNow(new Date(activity.timestamp), {
                                                            addSuffix: false,
                                                            locale: ptBR
                                                        })}</span>
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="bg-gray-50/50 p-2 md:p-2.5 rounded-lg group-hover:bg-blue-50/30 transition-colors">
                                                <p className="text-xs md:text-sm text-gray-600 line-clamp-2 leading-relaxed">
                                                    {activity.summary}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="hidden md:flex flex-col justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                            <ChevronRight className="h-5 w-5 text-gray-400" />
                                        </div>
                                    </div>
                                </Link>
                            </motion.div>
                        ))}
                    </motion.div>
                )}
            </CardContent>
        </Card>
    )
}
