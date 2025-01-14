"use client"

import { useState } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Search, SortAsc, SortDesc, Calendar } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

interface HistorialItem {
  id_uuid: string
  fecha_hora: string
  estado: string
  notas: string
  servicios: {
    id_uuid: string
    nombre: string
  }
}

export default function ClienteHistorial({ historial }: { historial: HistorialItem[] }) {
  const [filtroEstado, setFiltroEstado] = useState<string>("todos")
  const [filtroBusqueda, setFiltroBusqueda] = useState("")
  const [ordenFecha, setOrdenFecha] = useState<"asc" | "desc">("desc")

  // Función para filtrar y ordenar el historial
  const historialFiltrado = historial
    .filter(cita => {
      const cumpleFiltroEstado = filtroEstado === "todos" || cita.estado === filtroEstado
      const cumpleBusqueda = 
        cita.servicios?.nombre?.toLowerCase().includes(filtroBusqueda.toLowerCase()) ||
        cita.notas?.toLowerCase().includes(filtroBusqueda.toLowerCase())
      return cumpleFiltroEstado && cumpleBusqueda
    })
    .sort((a, b) => {
      const dateA = new Date(a.fecha_hora).getTime()
      const dateB = new Date(b.fecha_hora).getTime()
      return ordenFecha === "asc" ? dateA - dateB : dateB - dateA
    })

  const getEstadoBadgeColor = (estado: string) => {
    switch (estado) {
      case 'completada': return 'bg-green-100 text-green-800'
      case 'cancelada': return 'bg-red-100 text-red-800'
      case 'pendiente': return 'bg-yellow-100 text-yellow-800'
      case 'confirmada': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Historial de Servicios</CardTitle>
        <div className="flex flex-col sm:flex-row gap-4 mt-4">
          <div className="flex-1 relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar en el historial..."
              value={filtroBusqueda}
              onChange={(e) => setFiltroBusqueda(e.target.value)}
              className="pl-8"
            />
          </div>
          <Select value={filtroEstado} onValueChange={setFiltroEstado}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filtrar por estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos los estados</SelectItem>
              <SelectItem value="pendiente">Pendientes</SelectItem>
              <SelectItem value="confirmada">Confirmadas</SelectItem>
              <SelectItem value="completada">Completadas</SelectItem>
              <SelectItem value="cancelada">Canceladas</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            onClick={() => setOrdenFecha(prev => prev === "asc" ? "desc" : "asc")}
            className="w-[180px]"
          >
            {ordenFecha === "asc" ? (
              <><SortAsc className="mr-2 h-4 w-4" /> Más antiguos primero</>
            ) : (
              <><SortDesc className="mr-2 h-4 w-4" /> Más recientes primero</>
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="divide-y divide-gray-200">
          {historialFiltrado.map((cita) => (
            <div key={cita.id_uuid} className="py-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-lg">
                      {cita.servicios?.nombre || 'Servicio no especificado'}
                    </p>
                    <Badge variant="outline" className={getEstadoBadgeColor(cita.estado)}>
                      {cita.estado}
                    </Badge>
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Calendar className="mr-2 h-4 w-4" />
                    {format(new Date(cita.fecha_hora), "PPP 'a las' p", { locale: es })}
                  </div>
                  {cita.notas && (
                    <p className="text-sm text-muted-foreground mt-2">
                      {cita.notas}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
          {historialFiltrado.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              {historial.length === 0 ? (
                "No hay historial disponible"
              ) : (
                "No se encontraron resultados con los filtros actuales"
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
} 