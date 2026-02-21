"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { getTodayTasks, type TodayTask, type TodayTasksResult } from "@/app/dashboard/actions"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
    ClipboardList,
    Clock,
    MessageSquare,
    AlertTriangle,
    RefreshCcw,
    CheckCircle2,
    Loader2,
    Phone
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

const container = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.05
        }
    }
}

const item = {
    hidden: { y: 10, opacity: 0 },
    show: { y: 0, opacity: 1 }
}

function getWhatsAppUrl(phone: string): string {
    const cleaned = phone.replace(/\D/g, "")
    const number = cleaned.startsWith("55") ? cleaned : `55${cleaned}`
    return `https://wa.me/${number}`
}

function StatusBadge({ status }: { status: TodayTask['status'] }) {
    switch (status) {
        case 'overdue':
            return (
                <span className="inline-flex items-center gap-1 text-[10px] md:text-xs font-medium text-red-700 bg-red-50 border border-red-200 px-1.5 md:px-2 py-0.5 rounded-full">
                    <AlertTriangle className="h-2.5 w-2.5 md:h-3 md:w-3" />
                    Atrasado
                </span>
            )
        case 'in_progress':
            return (
                <span className="inline-flex items-center gap-1 text-[10px] md:text-xs font-medium text-amber-700 bg-amber-50 border border-amber-200 px-1.5 md:px-2 py-0.5 rounded-full">
                    <Loader2 className="h-2.5 w-2.5 md:h-3 md:w-3" />
                    Em andamento
                </span>
            )
        case 'pending_today':
            return (
                <span className="inline-flex items-center gap-1 text-[10px] md:text-xs font-medium text-blue-700 bg-blue-50 border border-blue-200 px-1.5 md:px-2 py-0.5 rounded-full">
                    <Clock className="h-2.5 w-2.5 md:h-3 md:w-3" />
                    Pendente
                </span>
            )
    }
}

function TaskItem({ task }: { task: TodayTask }) {
    const stripColor =
        task.status === 'overdue'
            ? 'bg-red-500'
            : task.status === 'in_progress'
                ? 'bg-amber-500'
                : 'bg-blue-500'

    const iconBgColor =
        task.status === 'overdue'
            ? 'bg-red-50 text-red-600'
            : task.status === 'in_progress'
                ? 'bg-amber-50 text-amber-600'
                : 'bg-blue-50 text-blue-600'

    const Icon =
        task.status === 'overdue'
            ? AlertTriangle
            : task.status === 'in_progress'
                ? MessageSquare
                : Clock

    return (
        <motion.div variants={item}>
            <div className="group relative flex gap-3 md:gap-4 p-3 md:p-4 rounded-lg md:rounded-xl glass-card hover:bg-white/90 border-none transition-all duration-300 overflow-hidden">
                {/* Status Indicator Strip */}
                <div className={`absolute left-0 top-0 bottom-0 w-1 ${stripColor}`} />

                <Link href={`/paciente/${task.patientId}/editar`} className="flex gap-3 md:gap-4 flex-1 min-w-0 cursor-pointer">
                    <div className="flex-shrink-0">
                        <div className={`h-8 w-8 md:h-10 md:w-10 rounded-full flex items-center justify-center ${iconBgColor}`}>
                            <Icon className="h-4 w-4 md:h-5 md:w-5" />
                        </div>
                    </div>

                    <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start gap-2 mb-1">
                            <div className="min-w-0">
                                <h4 className="font-semibold text-[#0A2647] text-xs md:text-sm group-hover:text-blue-700 transition-colors truncate">
                                    {task.patientName}
                                </h4>
                                <span className="text-[10px] md:text-xs text-muted-foreground flex items-center gap-1">
                                    <span className="truncate">{task.surgeryType}</span> &bull; D+{task.dayNumber}
                                </span>
                            </div>
                            <div className="flex flex-col items-end gap-1 shrink-0">
                                <StatusBadge status={task.status} />
                            </div>
                        </div>
                    </div>
                </Link>

                {/* WhatsApp Button */}
                <div className="flex flex-col justify-center shrink-0">
                    <a
                        href={getWhatsAppUrl(task.patientPhone)}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="h-8 w-8 md:h-9 md:w-9 rounded-full flex items-center justify-center bg-green-50 hover:bg-green-100 text-green-600 transition-colors border border-green-200"
                        title="Abrir WhatsApp"
                    >
                        <Phone className="h-3.5 w-3.5 md:h-4 md:w-4" />
                    </a>
                </div>
            </div>
        </motion.div>
    )
}

function SectionHeader({ title, count, color }: { title: string; count: number; color: string }) {
    if (count === 0) return null
    return (
        <div className="flex items-center gap-2 mt-3 first:mt-0 mb-2">
            <span className={`text-xs md:text-sm font-semibold ${color}`}>{title}</span>
            <Badge variant="secondary" className="text-[10px] md:text-xs px-1.5 py-0">
                {count}
            </Badge>
        </div>
    )
}

export function SmartInbox() {
    const [tasks, setTasks] = useState<TodayTasksResult>({ overdue: [], inProgress: [], pendingToday: [] })
    const [loading, setLoading] = useState(true)

    const fetchTasks = async () => {
        setLoading(true)
        try {
            const data = await getTodayTasks()
            setTasks(data)
        } catch (error) {
            console.error("Failed to fetch today tasks", error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchTasks()
    }, [])

    const totalTasks = tasks.overdue.length + tasks.inProgress.length + tasks.pendingToday.length

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-100 p-1.5 md:p-2 rounded-lg shrink-0">
                        <ClipboardList className="h-4 w-4 md:h-5 md:w-5" />
                    </Badge>
                    <div className="min-w-0">
                        <CardTitle className="text-base md:text-xl text-[#0A2647] font-bold flex items-center gap-2">
                            <span className="truncate">Tarefas de Hoje</span>
                            {totalTasks > 0 && (
                                <span className="text-[10px] md:text-xs font-medium text-white bg-[#0A2647] px-1.5 md:px-2 py-0.5 rounded-full shrink-0">
                                    {totalTasks}
                                </span>
                            )}
                        </CardTitle>
                        <p className="text-[10px] md:text-xs text-muted-foreground mt-0.5 md:mt-1 hidden sm:block">
                            Follow-ups pendentes e atrasados
                        </p>
                    </div>
                </div>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={fetchTasks}
                    className={`shrink-0 ${loading ? "animate-spin" : ""}`}
                >
                    <RefreshCcw className="h-4 w-4" />
                </Button>
            </CardHeader>

            <CardContent>
                {loading && totalTasks === 0 ? (
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
                ) : totalTasks === 0 ? (
                    <div className="text-center py-10 text-muted-foreground">
                        <CheckCircle2 className="h-10 w-10 mx-auto mb-3 text-green-400 opacity-60" />
                        <p className="text-sm font-medium">Nenhuma tarefa pendente hoje!</p>
                        <p className="text-xs mt-1 opacity-70">Todos os follow-ups foram respondidos</p>
                    </div>
                ) : (
                    <motion.div
                        variants={container}
                        initial="hidden"
                        animate="show"
                        className="space-y-1"
                    >
                        {/* Overdue Section */}
                        {tasks.overdue.length > 0 && (
                            <>
                                <SectionHeader title="Atrasados" count={tasks.overdue.length} color="text-red-600" />
                                {tasks.overdue.map((task) => (
                                    <TaskItem key={task.id} task={task} />
                                ))}
                            </>
                        )}

                        {/* In Progress Section */}
                        {tasks.inProgress.length > 0 && (
                            <>
                                <SectionHeader title="Em andamento" count={tasks.inProgress.length} color="text-amber-600" />
                                {tasks.inProgress.map((task) => (
                                    <TaskItem key={task.id} task={task} />
                                ))}
                            </>
                        )}

                        {/* Pending Today Section */}
                        {tasks.pendingToday.length > 0 && (
                            <>
                                <SectionHeader title="Pendentes hoje" count={tasks.pendingToday.length} color="text-blue-600" />
                                {tasks.pendingToday.map((task) => (
                                    <TaskItem key={task.id} task={task} />
                                ))}
                            </>
                        )}
                    </motion.div>
                )}
            </CardContent>
        </Card>
    )
}