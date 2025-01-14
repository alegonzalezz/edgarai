"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { supabase } from "@/lib/supabase"
import { useToast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Calendar, dateFnsLocalizer } from 'react-big-calendar'
import { format, parse, startOfWeek, getDay } from 'date-fns'
import { es } from 'date-fns/locale'
import "react-big-calendar/lib/css/react-big-calendar.css"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { 
  MoreHorizontal, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  Calendar as CalendarIcon,
} from "lucide-react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

// Interfaces simplificadas
interface Cliente {
  id_uuid: string
  nombre: string
}

interface Servicio {
  id_uuid: string
  nombre: string
  duracion_estimada: number
}

interface CitaDB {
  id_uuid: string
  cliente_id_uuid: string
  servicio_id_uuid: string
  vehiculo_id_uuid: string
  fecha_hora: string
  estado: 'pendiente' | 'confirmada' | 'completada' | 'cancelada'
  notas: string
  created_at: string
}

interface Cita {
  id_uuid: string
  cliente_id_uuid: string
  servicio_id_uuid: string
  vehiculo_id_uuid: string
  fecha_hora: string
  estado: 'pendiente' | 'confirmada' | 'completada' | 'cancelada'
  notas: string
  created_at: string
  clientes: {
    id_uuid: string
    nombre: string
  }
  servicios: {
    id_uuid: string
    nombre: string
    duracion_estimada: number
  }
  vehiculos: {
    id_uuid: string
    marca: string
    modelo: string
    placa: string | null
  }
}

// Estado inicial de nueva cita
interface NuevaCita {
  cliente_id_uuid: string
  servicio_id_uuid: string
  fecha_hora: string
  estado: CitaDB['estado']
  notas: string
}

// Configuración del calendario
const locales = {
  'es': es,
}

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
})

interface DatosResult {
  clientes: Cliente[]
  servicios: Servicio[]
  citas: Cita[]
}

export default function CitasPage() {
  const { toast } = useToast()
  const [citas, setCitas] = useState<Cita[]>([])
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [servicios, setServicios] = useState<Servicio[]>([])
  const [mostrarFormulario, setMostrarFormulario] = useState(false)
  const [loading, setLoading] = useState(false)
  const [nuevaCita, setNuevaCita] = useState<NuevaCita>({
    cliente_id_uuid: "",
    servicio_id_uuid: "",
    fecha_hora: "",
    estado: "pendiente",
    notas: ""
  })
  const [vista, setVista] = useState<"lista" | "calendario">("lista")
  const [filtroFecha, setFiltroFecha] = useState<string>("")
  const [filtroEstado, setFiltroEstado] = useState<string>("todos")
  const supabase = createClientComponentClient()

  const cargarDatos = async () => {
    try {
      const { data: clientesData, error: clientesError } = await supabase
        .from('clientes')
        .select('id_uuid, nombre')

      if (clientesError) throw clientesError

      const { data: serviciosData, error: serviciosError } = await supabase
        .from('servicios')
        .select('id_uuid, nombre, duracion_estimada')

      if (serviciosError) throw serviciosError

      const { data: citasData, error: citasError } = await supabase
        .from('citas')
        .select(`
          id_uuid,
          cliente_id_uuid,
          servicio_id_uuid,
          vehiculo_id_uuid,
          fecha_hora,
          estado,
          notas,
          created_at,
          clientes!citas_cliente_id_uuid_fkey (
            id_uuid,
            nombre
          ),
          servicios!citas_servicio_id_uuid_fkey (
            id_uuid,
            nombre,
            duracion_estimada
          ),
          vehiculos!citas_vehiculo_id_uuid_fkey (
            id_uuid,
            marca,
            modelo,
            placa
          )
        `)
        .order('fecha_hora', { ascending: true })

      if (citasError) throw citasError

      setClientes(clientesData || [])
      setServicios(serviciosData || [])
      setCitas((citasData || []) as unknown as Cita[])
    } catch (error) {
      console.error('Error al cargar datos:', error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudieron cargar los datos"
      })
    }
  }

  useEffect(() => {
    cargarDatos()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const servicio = servicios.find(s => s.id_uuid === nuevaCita.servicio_id_uuid)
    if (!servicio) return
    
    const disponible = await verificarDisponibilidad(
      nuevaCita.fecha_hora, 
      servicio.duracion_estimada
    )
    
    if (!disponible) {
      toast({
        variant: "destructive",
        title: "Horario no disponible",
        description: "Ya existe una cita programada en este horario"
      })
      return
    }
    
    setLoading(true)

    try {
      const citaParaInsertar = {
        cliente_id_uuid: nuevaCita.cliente_id_uuid,
        servicio_id_uuid: nuevaCita.servicio_id_uuid,
        fecha_hora: nuevaCita.fecha_hora,
        estado: nuevaCita.estado,
        notas: nuevaCita.notas
      }

      const { error } = await supabase
        .from('citas')
        .insert([citaParaInsertar])

      if (error) throw error

      await cargarDatos()
      
      toast({
        title: "Cita agendada",
        description: "La cita se ha registrado correctamente",
      })
      
      setMostrarFormulario(false)
      setNuevaCita({
        cliente_id_uuid: "",
        servicio_id_uuid: "",
        fecha_hora: "",
        estado: "pendiente",
        notas: ""
      })
    } catch (error) {
      console.error('Error:', error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Hubo un problema al agendar la cita"
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    console.log('Estado actualizado - clientes:', clientes)
    console.log('Estado actualizado - servicios:', servicios)
  }, [clientes, servicios])

  const esDateTimeValido = (dateTime: string): boolean => {
    const fechaSeleccionada = new Date(dateTime);
    const ahora = new Date();
    return fechaSeleccionada > ahora;
  }

  const verificarDisponibilidad = async (fecha: string, duracion: number): Promise<boolean> => {
    const fechaInicio = new Date(fecha);
    const fechaFin = new Date(fechaInicio.getTime() + duracion * 60000);
    
    const { data: citasExistentes } = await supabase
      .from('citas')
      .select('fecha_hora, servicios!inner(duracion_estimada)')
      .neq('estado', 'cancelada')
      .gte('fecha_hora', fechaInicio.toISOString())
      .lte('fecha_hora', fechaFin.toISOString());

    return !citasExistentes || citasExistentes.length === 0;
  }

  const citasFiltradas = citas.filter(cita => {
    const cumpleFiltroEstado = filtroEstado === "todos" || cita.estado === filtroEstado;
    const cumpleFiltroFecha = !filtroFecha || cita.fecha_hora.startsWith(filtroFecha);
    return cumpleFiltroEstado && cumpleFiltroFecha;
  });

  const handleUpdateEstado = async (citaId: string, nuevoEstado: Cita['estado']) => {
    const confirmar = await new Promise((resolve) => {
      const mensaje = `¿Estás seguro de que deseas cambiar el estado de la cita a ${nuevoEstado}?`;
      resolve(window.confirm(mensaje));
    });

    if (!confirmar) return;

    try {
      const { data, error } = await supabase
        .from('citas')
        .update({ estado: nuevoEstado })
        .eq('uuid id', citaId)
        .select();

      if (error) throw error;

      setCitas(citas.map(cita => 
        cita.id_uuid === citaId ? { ...cita, estado: nuevoEstado } : cita
      ));

      toast({
        title: "Estado actualizado",
        description: `La cita ha sido marcada como ${nuevoEstado}`
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo actualizar el estado"
      });
    }
  }

  const getEventStyle = (estado: Cita['estado']) => {
    switch (estado) {
      case 'pendiente':
        return 'bg-yellow-200 border-yellow-400'
      case 'confirmada':
        return 'bg-blue-200 border-blue-400'
      case 'completada':
        return 'bg-green-200 border-green-400'
      case 'cancelada':
        return 'bg-red-200 border-red-400'
      default:
        return 'bg-gray-200 border-gray-400'
    }
  }

  const verificarCita = async (citaId: string) => {
    try {
      const { data, error } = await supabase
        .from('citas')
        .select(`
          "uuid id",
          "cliente_id uuid",
          "servicio_id uuid",
          fecha_hora,
          estado,
          notas,
          created_at,
          cliente:clientes!cliente_id uuid (
            "id uuid",
            nombre
          ),
          servicio:servicios!servicio_id uuid (
            "id uuid",
            nombre,
            duracion_estimada
          )
        `)
        .eq('uuid id', citaId)
        .single()

      console.log('Verificación de cita:', data)
      return !error && data
    } catch (error) {
      console.error('Error en verificación:', error)
      return false
    }
  }

  const handleReschedule = async (citaId: string, newDateTime: string) => {
    try {
      const { data, error } = await supabase
        .from('citas')
        .update({ fecha_hora: newDateTime })
        .eq('uuid id', citaId)
        .select()

      if (error) throw error

      toast({
        title: "Cita reprogramada",
        description: "La cita se ha reprogramado correctamente"
      })

      // Recargar datos
      await cargarDatos()
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo reprogramar la cita"
      })
    }
  }

  const getStatusBadgeClass = (estado: Cita['estado']) => {
    const baseClasses = 'px-3 py-1 rounded-full text-sm font-medium border';
    switch (estado) {
      case 'pendiente':
        return `${baseClasses} bg-yellow-50 text-yellow-700 border-yellow-300`;
      case 'confirmada':
        return `${baseClasses} bg-blue-50 text-blue-700 border-blue-300`;
      case 'completada':
        return `${baseClasses} bg-green-50 text-green-700 border-green-300`;
      case 'cancelada':
        return `${baseClasses} bg-red-50 text-red-700 border-red-300`;
      default:
        return `${baseClasses} bg-gray-50 text-gray-700 border-gray-300`;
    }
  }

  const getKPIs = () => {
    const total = citas.length
    const pendiente = citas.filter(cita => cita.estado === 'pendiente').length
    const confirmada = citas.filter(cita => cita.estado === 'confirmada').length
    const completada = citas.filter(cita => cita.estado === 'completada').length
    const cancelada = citas.filter(cita => cita.estado === 'cancelada').length

    return {
      total,
      pendiente,
      confirmada,
      completada,
      cancelada
    }
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-4">Agenda de Citas</h1>
      <div className="flex justify-between items-center mb-4">
        <div className="flex gap-4">
          <Input
            type="date"
            value={filtroFecha}
            onChange={(e) => setFiltroFecha(e.target.value)}
            className="w-auto"
          />
          <Select value={filtroEstado} onValueChange={setFiltroEstado}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos</SelectItem>
              <SelectItem value="pendiente">Pendiente</SelectItem>
              <SelectItem value="confirmada">Confirmada</SelectItem>
              <SelectItem value="completada">Completada</SelectItem>
              <SelectItem value="cancelada">Cancelada</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button onClick={() => setMostrarFormulario(true)}>Agendar Nueva Cita</Button>
      </div>

      <div className="grid grid-cols-5 gap-4 mb-6">
        <Card>
          <Tooltip>
            <TooltipTrigger asChild>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 cursor-help">
                <CardTitle className="text-sm font-medium">Total Citas</CardTitle>
                <CalendarIcon className="h-4 w-4 text-gray-600" />
              </CardHeader>
            </TooltipTrigger>
            <TooltipContent>
              <p>Total de citas registradas en el sistema</p>
            </TooltipContent>
          </Tooltip>
          <CardContent>
            <div className="text-2xl font-bold">{getKPIs().total}</div>
            <p className="text-xs text-muted-foreground">
              100% del total
            </p>
          </CardContent>
        </Card>

        <Card>
          <Tooltip>
            <TooltipTrigger asChild>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 cursor-help">
                <CardTitle className="text-sm font-medium">Pendientes</CardTitle>
                <Clock className="mr-2 h-4 w-4" />
              </CardHeader>
            </TooltipTrigger>
            <TooltipContent>
              <p>Citas que aún no han sido confirmadas</p>
              <p className="text-xs text-muted-foreground mt-1">
                Último mes: {getKPIs().pendiente || 0} citas
              </p>
            </TooltipContent>
          </Tooltip>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {getKPIs().pendiente || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {((getKPIs().pendiente || 0) / getKPIs().total * 100).toFixed(1)}% del total
            </p>
          </CardContent>
        </Card>

        <Card>
          <Tooltip>
            <TooltipTrigger asChild>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 cursor-help">
                <CardTitle className="text-sm font-medium">Confirmadas</CardTitle>
                <CheckCircle2 className="mr-2 h-4 w-4" />
              </CardHeader>
            </TooltipTrigger>
            <TooltipContent>
              <p>Citas confirmadas pendientes de realizar</p>
              <p className="text-xs text-muted-foreground mt-1">
                Último mes: {getKPIs().confirmada || 0} citas
              </p>
            </TooltipContent>
          </Tooltip>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {getKPIs().confirmada || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {((getKPIs().confirmada || 0) / getKPIs().total * 100).toFixed(1)}% del total
            </p>
          </CardContent>
        </Card>

        <Card>
          <Tooltip>
            <TooltipTrigger asChild>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 cursor-help">
                <CardTitle className="text-sm font-medium">Completadas</CardTitle>
                <CheckCircle2 className="mr-2 h-4 w-4" />
              </CardHeader>
            </TooltipTrigger>
            <TooltipContent>
              <p>Citas realizadas exitosamente</p>
              <p className="text-xs text-muted-foreground mt-1">
                Último mes: {getKPIs().completada || 0} citas
              </p>
            </TooltipContent>
          </Tooltip>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {getKPIs().completada || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {((getKPIs().completada || 0) / getKPIs().total * 100).toFixed(1)}% del total
            </p>
          </CardContent>
        </Card>

        <Card>
          <Tooltip>
            <TooltipTrigger asChild>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 cursor-help">
                <CardTitle className="text-sm font-medium">Canceladas</CardTitle>
                <XCircle className="mr-2 h-4 w-4" />
              </CardHeader>
            </TooltipTrigger>
            <TooltipContent>
              <p>Citas canceladas</p>
              <p className="text-xs text-muted-foreground mt-1">
                Último mes: {getKPIs().cancelada || 0} citas
              </p>
            </TooltipContent>
          </Tooltip>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {getKPIs().cancelada || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {((getKPIs().cancelada || 0) / getKPIs().total * 100).toFixed(1)}% del total
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={vista} onValueChange={(v) => setVista(v as "lista" | "calendario")}>
        <TabsList>
          <TabsTrigger value="lista">Vista Lista</TabsTrigger>
          <TabsTrigger value="calendario">Vista Calendario</TabsTrigger>
        </TabsList>
        
        <TabsContent value="lista">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cliente</TableHead>
                <TableHead>Servicio</TableHead>
                <TableHead>Vehículo</TableHead>
                <TableHead>Fecha y Hora</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Notas</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {citasFiltradas.map((cita) => (
                <TableRow key={cita.id_uuid}>
                  <TableCell>{cita.clientes?.nombre}</TableCell>
                  <TableCell>{cita.servicios?.nombre}</TableCell>
                  <TableCell>
                    <Link 
                      href={`/vehiculos?id=${cita.vehiculo_id_uuid}`} 
                      className="text-blue-600 hover:underline"
                    >
                      {cita.vehiculos?.marca} {cita.vehiculos?.modelo}
                      {cita.vehiculos?.placa && ` (${cita.vehiculos.placa})`}
                    </Link>
                  </TableCell>
                  <TableCell>
                    {format(new Date(cita.fecha_hora), "PPP 'a las' p", { locale: es })}
                  </TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      cita.estado === 'completada' ? 'bg-green-100 text-green-800' :
                      cita.estado === 'cancelada' ? 'bg-red-100 text-red-800' :
                      cita.estado === 'confirmada' ? 'bg-blue-100 text-blue-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {cita.estado}
                    </span>
                  </TableCell>
                  <TableCell>{cita.notas}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleUpdateEstado(cita.id_uuid, 'confirmada')}>
                          Confirmar
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleUpdateEstado(cita.id_uuid, 'completada')}>
                          Completar
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleUpdateEstado(cita.id_uuid, 'cancelada')}>
                          Cancelar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
              {citasFiltradas.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-4">
                    No hay citas que mostrar
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TabsContent>
        
        <TabsContent value="calendario">
          <div className="h-[600px]">
            <Calendar
              localizer={localizer}
              events={citasFiltradas.map(cita => ({
                title: `${cita.clientes?.nombre} - ${cita.servicios?.nombre}`,
                start: new Date(cita.fecha_hora),
                end: new Date(new Date(cita.fecha_hora).getTime() + 
                  (cita.servicios?.duracion_estimada || 60) * 60000),
                resource: cita
              }))}
              startAccessor="start"
              endAccessor="end"
              culture="es"
              messages={{
                next: "Siguiente",
                previous: "Anterior",
                today: "Hoy",
                month: "Mes",
                week: "Semana",
                day: "Día",
                agenda: "Agenda",
                date: "Fecha",
                time: "Hora",
                event: "Evento",
              }}
            />
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={mostrarFormulario} onOpenChange={setMostrarFormulario}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Agendar Nueva Cita</DialogTitle>
            <DialogDescription>
              Complete los datos de la cita. Todos los campos son obligatorios.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="cliente" className="text-right">Cliente</Label>
                <Select
                  value={nuevaCita.cliente_id_uuid}
                  onValueChange={(value) => setNuevaCita({...nuevaCita, cliente_id_uuid: value})}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Seleccione un cliente" />
                  </SelectTrigger>
                  <SelectContent>
                    {clientes.map((cliente) => (
                      <SelectItem key={cliente.id_uuid} value={cliente.id_uuid}>
                        {cliente.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="servicio" className="text-right">Servicio</Label>
                <Select
                  value={nuevaCita.servicio_id_uuid}
                  onValueChange={(value) => setNuevaCita({...nuevaCita, servicio_id_uuid: value})}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Seleccione un servicio" />
                  </SelectTrigger>
                  <SelectContent>
                    {servicios.map((servicio) => (
                      <SelectItem key={servicio.id_uuid} value={servicio.id_uuid}>
                        {servicio.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="fecha_hora" className="text-right">Fecha y Hora</Label>
                <Input
                  id="fecha_hora"
                  type="datetime-local"
                  className="col-span-3"
                  value={nuevaCita.fecha_hora}
                  onChange={(e) => setNuevaCita({...nuevaCita, fecha_hora: e.target.value})}
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="estado" className="text-right">Estado</Label>
                <Select
                  value={nuevaCita.estado}
                  onValueChange={(value) => setNuevaCita({...nuevaCita, estado: value as CitaDB['estado']})}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Seleccione un estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pendiente">Pendiente</SelectItem>
                    <SelectItem value="confirmada">Confirmada</SelectItem>
                    <SelectItem value="completada">Completada</SelectItem>
                    <SelectItem value="cancelada">Cancelada</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="notas" className="text-right">Notas</Label>
                <Input
                  id="notas"
                  className="col-span-3"
                  value={nuevaCita.notas}
                  onChange={(e) => setNuevaCita({...nuevaCita, notas: e.target.value})}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" disabled={loading}>
                {loading ? "Guardando..." : "Agendar Cita"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      <Toaster />
    </div>
  )
}

