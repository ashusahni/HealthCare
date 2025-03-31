'use client'

import React, { useRef, useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Camera, Upload, X } from 'lucide-react'
import Image from 'next/image'
import { toast } from 'sonner'

interface VerificationDialogProps {
  isOpen: boolean
  onClose: () => void
  onVerify: (file: File) => Promise<void>
  medicationName: string
}

export function VerificationDialog({ isOpen, onClose, onVerify, medicationName }: VerificationDialogProps) {
  const [image, setImage] = useState<string | null>(null)
  const [file, setFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImage(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleVerify = async () => {
    if (!file) {
      toast.error('Please upload an image first')
      return
    }

    try {
      setIsLoading(true)
      await onVerify(file)
      toast.success('Medication verified successfully')
      handleClose()
    } catch (error) {
      console.error('Error verifying medication:', error)
      toast.error('Failed to verify medication')
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    setImage(null)
    setFile(null)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Verify Medication</DialogTitle>
          <DialogDescription>
            Please upload a photo of {medicationName} to verify you've taken it
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex justify-center">
            {image ? (
              <div className="relative">
                <Image
                  src={image}
                  alt="Medication verification"
                  width={300}
                  height={300}
                  className="rounded-lg object-cover"
                />
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2"
                  onClick={() => {
                    setImage(null)
                    setFile(null)
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-4">
                <div
                  className="border-2 border-dashed rounded-lg p-8 cursor-pointer hover:border-primary"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="h-12 w-12 text-muted-foreground" />
                  <p className="mt-2 text-sm text-muted-foreground">Click to upload or drag and drop</p>
                </div>
                <Button
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Camera className="h-4 w-4 mr-2" />
                  Take Photo
                </Button>
              </div>
            )}
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/*"
              capture="environment"
              onChange={handleFileChange}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>Cancel</Button>
          <Button onClick={handleVerify} disabled={!file || isLoading}>
            {isLoading ? 'Verifying...' : 'Verify Medication'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 