"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

const conversacionesIniciales = [
  { 
    id: 1, 
    cliente: "Juan Pérez", 
    telefono: "+34 123 456 789",
    fecha: "2023-07-01", 
    tipo: "Consulta", 
    estado: "Cerrado",
    intencion: "Agendar servicio" 
  },
  { 
    id: 2, 
    cliente: "María García", 
    telefono: "+34 987 654 321",
    fecha: "2023-07-02", 
    tipo: "Queja", 
    estado: "En proceso",
    intencion: "Problema técnico" 
  },
  { 
    id: 3, 
    cliente: "Carlos Rodríguez", 
    telefono: "+34 456 789 123",
    fecha: "2023-07-03", 
    tipo: "Solicitud", 
    estado: "Abierto",
    intencion: "Consulta status actual" 
  },
]

const intenciones = [
  "Agendar servicio",
  "Consulta status actual",
  "Problema técnico",
  "Información general"
]

export default function ConversacionesPage() {
  const [conversaciones, setConversaciones] = useState(conversacionesIniciales)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [nuevaConversacion, setNuevaConversacion] = useState({
    cliente: "",
    telefono: "",
    tipo: "",
    estado: "Abierto",
    intencion: ""
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNuevaConversacion({
      ...nuevaConversacion,
      [e.target.name]: e.target.value
    })
  }

  const handleSelectChange = (name: string, value: string) => {
    setNuevaConversacion({
      ...nuevaConversacion,
      [name]: value
    })
  }

  const abrirWhatsApp = (telefono: string) => {
    const numeroLimpio = telefono.replace(/\s+/g, '')
    window.open(`https://wa.me/${numeroLimpio}`, '_blank')
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Conversaciones con Clientes</h1>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>Nueva Conversación</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Añadir Nueva Conversación</DialogTitle>
              <DialogDescription>
                Ingrese los detalles de la nueva conversación con el cliente.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={(e) => {
              e.preventDefault()
              const nuevaConversacionCompleta = {
                ...nuevaConversacion,
                id: conversaciones.length + 1,
                fecha: new Date().toISOString().split('T')[0]
              }
              setConversaciones([...conversaciones, nuevaConversacionCompleta])
              setDialogOpen(false)
              setNuevaConversacion({ cliente: "", telefono: "", tipo: "", estado: "Abierto", intencion: "" })
            }}>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="cliente" className="text-right">
                    Cliente
                  </Label>
                  <Input
                    id="cliente"
                    name="cliente"
                    value={nuevaConversacion.cliente}
                    onChange={handleInputChange}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="telefono" className="text-right">
                    Teléfono
                  </Label>
                  <Input
                    id="telefono"
                    name="telefono"
                    value={nuevaConversacion.telefono}
                    onChange={handleInputChange}
                    className="col-span-3"
                    placeholder="+34 123 456 789"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="tipo" className="text-right">
                    Tipo
                  </Label>
                  <Select
                    onValueChange={(value) => handleSelectChange("tipo", value)}
                    defaultValue={nuevaConversacion.tipo}
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Seleccione el tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Consulta">Consulta</SelectItem>
                      <SelectItem value="Queja">Queja</SelectItem>
                      <SelectItem value="Solicitud">Solicitud</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="intencion" className="text-right">
                    Intención
                  </Label>
                  <Select
                    onValueChange={(value) => handleSelectChange("intencion", value)}
                    defaultValue={nuevaConversacion.intencion}
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Seleccione la intención" />
                    </SelectTrigger>
                    <SelectContent>
                      {intenciones.map((intencion) => (
                        <SelectItem key={intencion} value={intencion}>
                          {intencion}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button type="submit">Guardar Conversación</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Registro de Conversaciones</CardTitle>
          <CardDescription>Historial de contactos con clientes</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cliente</TableHead>
                <TableHead>Teléfono</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Intención</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Acción</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {conversaciones.map((conversacion) => (
                <TableRow key={conversacion.id}>
                  <TableCell>{conversacion.cliente}</TableCell>
                  <TableCell>{conversacion.telefono}</TableCell>
                  <TableCell>{conversacion.fecha}</TableCell>
                  <TableCell>{conversacion.tipo}</TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {conversacion.intencion}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        conversacion.estado === "Cerrado"
                          ? "secondary"
                          : conversacion.estado === "En proceso"
                          ? "default"
                          : "destructive"
                      }
                    >
                      {conversacion.estado}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => abrirWhatsApp(conversacion.telefono)}
                    >
                      WhatsApp
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

