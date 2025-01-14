"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { supabase } from "@/lib/supabase"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from "recharts"
import type { Database } from '@/types/database.types'

type Cita = Database['public']['Tables']['citas']['Row']

interface CitasStats {
  total: number
  pendientes: number
  confirmadas: number
  completadas: number
  canceladas: number
  porMes: { [key: string]: number }
}

export function CitasStats() {
  const [stats, setStats] = useState<CitasStats>({
    total: 0,
    pendientes: 0,
    confirmadas: 0,
    completadas: 0,
    canceladas: 0,
    porMes: {}
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    try {
      setLoading(true)
      const { data: citasData, error } = await supabase
        .from('citas')
        .select()

      if (error) throw error

      if (citasData) {
        const initialStats = {
          total: 0,
          pendientes: 0,
          confirmadas: 0,
          completadas: 0,
          canceladas: 0,
          porMes: {} as { [key: string]: number }
        }

        const stats = (citasData as Cita[]).reduce((acc, cita) => {
          // Incrementar total
          acc.total++

          // Incrementar contador por estado
          switch (cita.estado) {
            case 'pendiente':
              acc.pendientes++
              break
            case 'confirmada':
              acc.confirmadas++
              break
            case 'completada':
              acc.completadas++
              break
            case 'cancelada':
              acc.canceladas++
              break
          }
          
          // Agrupar por mes
          const mes = new Date(cita.fecha_hora).toLocaleString('es', { month: 'short' })
          acc.porMes[mes] = (acc.porMes[mes] || 0) + 1
          
          return acc
        }, initialStats)

        setStats(stats)
      }
    } catch (error) {
      console.error('Error cargando estadísticas:', error)
    } finally {
      setLoading(false)
    }
  }

  const chartData = Object.entries(stats.porMes)
    .map(([mes, total]) => ({ mes, total }))
    .sort((a, b) => {
      const meses = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']
      return meses.indexOf(a.mes.toLowerCase()) - meses.indexOf(b.mes.toLowerCase())
    })

  return (
    <div className="grid gap-4">
      <div className="grid grid-cols-5 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Total Citas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">
              Todas las citas registradas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pendientes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.pendientes}</div>
            <p className="text-xs text-muted-foreground">
              {((stats.pendientes / stats.total) * 100).toFixed(1)}% del total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Confirmadas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.confirmadas}</div>
            <p className="text-xs text-muted-foreground">
              {((stats.confirmadas / stats.total) * 100).toFixed(1)}% del total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Completadas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.completadas}</div>
            <p className="text-xs text-muted-foreground">
              {((stats.completadas / stats.total) * 100).toFixed(1)}% del total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Canceladas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.canceladas}</div>
            <p className="text-xs text-muted-foreground">
              {((stats.canceladas / stats.total) * 100).toFixed(1)}% del total
            </p>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Citas por Mes</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={chartData}>
              <XAxis dataKey="mes" />
              <YAxis />
              <Bar dataKey="total" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
} 