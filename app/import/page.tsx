"use client"

import { SetStateAction, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/components/ui/use-toast"

export default function ImportPage() {
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const { toast } = useToast()

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0] || null
    setFile(selectedFile)
  }

  const handleUpload = async () => {
    if (!file) {
      toast({
        title: "No file selected",
        description: "Please select a file to upload.",
        variant: "destructive",
      })
      return
    }

    setUploading(true)
    setProgress(0)

    // Simulating file upload progress
    const interval = setInterval(() => {
      setProgress((prevProgress) => {
        if (prevProgress >= 100) {
          clearInterval(interval)
          setUploading(false)
          toast({
            title: "Upload complete",
            description: "Your file has been successfully uploaded and processed.",
          })
          return 100
        }
        return prevProgress + 10
      })
    }, 500)
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-4">Data Import Hub</h1>
      <div className="grid w-full max-w-sm items-center gap-1.5">
        <Label htmlFor="file">Upload CSV or Excel file</Label>
        <Input id="file" type="file" onChange={handleFileChange} accept=".csv,.xlsx,.xls" />
      </div>
      <Button className="mt-4" onClick={handleUpload} disabled={!file || uploading}>
        {uploading ? "Uploading..." : "Upload and Process"}
      </Button>
      {uploading && (
        <Progress value={progress} className="w-full max-w-sm mt-4" />
      )}
    </div>
  )
}

