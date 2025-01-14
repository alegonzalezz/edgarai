"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/components/ui/use-toast"

export default function ImportarPage() {
  const [archivo, setArchivo] = useState<File | null>(null)
  const [subiendo, setSubiendo] = useState(false)
  const [progreso, setProgreso] = useState(0)
  const { toast } = useToast()

  const manejarCambioArchivo = (evento: React.ChangeEvent<HTMLInputElement>) => {
    const archivoSeleccionado = evento.target.files?.[0] || null
    setArchivo(archivoSeleccionado)
  }

  const manejarSubida = async () => {
    if (!archivo) {
      toast({
        title: "No se ha seleccionado ningún archivo",
        description: "Por favor, seleccione un archivo para subir.",
        variant: "destructive",
      })
      return
    }

    setSubiendo(true)
    setProgreso(0)

    // Simulando el progreso de subida del archivo
    const intervalo = setInterval(() => {
      setProgreso((progresoAnterior) => {
        if (progresoAnterior >= 100) {
          clearInterval(intervalo)
          setSubiendo(false)
          toast({
            title: "Subida completada",
            description: "Su archivo ha sido subido y procesado con éxito.",
          })
          return 100
        }
        return progresoAnterior + 10
      })
    }, 500)
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-4">Centro de Importación de Datos</h1>
      <div className="grid w-full max-w-sm items-center gap-1.5">
        <Label htmlFor="archivo">Subir archivo CSV o Excel</Label>
        <Input id="archivo" type="file" onChange={manejarCambioArchivo} accept=".csv,.xlsx,.xls" />
      </div>
      <Button className="mt-4" onClick={manejarSubida} disabled={!archivo || subiendo}>
        {subiendo ? "Subiendo..." : "Subir y Procesar"}
      </Button>
      {subiendo && (
        <Progress value={progreso} className="w-full max-w-sm mt-4" />
      )}
    </div>
  )
}

