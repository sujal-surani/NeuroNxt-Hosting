"use client"

import React, { useState, useCallback } from 'react'
import Cropper from 'react-easy-crop'
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Loader2 } from "lucide-react"

interface ImageCropperProps {
    imageSrc: string | null
    isOpen: boolean
    onClose: () => void
    onCropComplete: (croppedImageBlob: Blob) => void
}

export function ImageCropper({ imageSrc, isOpen, onClose, onCropComplete }: ImageCropperProps) {
    const [crop, setCrop] = useState({ x: 0, y: 0 })
    const [zoom, setZoom] = useState(1)
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null)
    const [isLoading, setIsLoading] = useState(false)

    const onCropChange = (crop: { x: number; y: number }) => {
        setCrop(crop)
    }

    const onZoomChange = (zoom: number) => {
        setZoom(zoom)
    }

    const onCropCompleteCallback = useCallback((croppedArea: any, croppedAreaPixels: any) => {
        setCroppedAreaPixels(croppedAreaPixels)
    }, [])

    const createImage = (url: string): Promise<HTMLImageElement> =>
        new Promise((resolve, reject) => {
            const image = new Image()
            image.addEventListener('load', () => resolve(image))
            image.addEventListener('error', (error) => reject(error))
            image.setAttribute('crossOrigin', 'anonymous') // needed to avoid cross-origin issues on CodeSandbox
            image.src = url
        })

    const getCroppedImg = async (
        imageSrc: string,
        pixelCrop: any,
        rotation = 0
    ): Promise<Blob | null> => {
        const image = await createImage(imageSrc)
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')

        if (!ctx) {
            return null
        }

        const maxSize = Math.max(image.width, image.height)
        const safeArea = 2 * ((maxSize / 2) * Math.sqrt(2))

        // set each dimensions to double largest dimension to allow for a safe area for the
        // image to rotate in without being clipped by canvas context
        canvas.width = safeArea
        canvas.height = safeArea

        // translate canvas context to a central location on image to allow rotating around the center.
        ctx.translate(safeArea / 2, safeArea / 2)
        ctx.rotate((rotation * Math.PI) / 180)
        ctx.translate(-safeArea / 2, -safeArea / 2)

        // draw rotated image and store data.
        ctx.drawImage(
            image,
            safeArea / 2 - image.width * 0.5,
            safeArea / 2 - image.height * 0.5
        )

        const data = ctx.getImageData(0, 0, safeArea, safeArea)

        // set canvas width to final desired crop size - this will clear existing context
        // canvas.width = pixelCrop.width
        // canvas.height = pixelCrop.height

        // 2024-05-20 Fix: Use a new canvas for the output to avoid clearing the source context
        const outputCanvas = document.createElement('canvas')
        const MAX_SIZE = 512
        const scale = Math.min(1, MAX_SIZE / pixelCrop.width)

        outputCanvas.width = pixelCrop.width * scale
        outputCanvas.height = pixelCrop.height * scale

        const outputCtx = outputCanvas.getContext('2d')
        if (!outputCtx) return null

        // Calculate the position of the crop area on the source canvas (which has the rotated image centered)
        // The image is drawn at centered location: safeArea/2 - image.width/2
        const sourceX = safeArea / 2 - image.width * 0.5 + pixelCrop.x
        const sourceY = safeArea / 2 - image.height * 0.5 + pixelCrop.y

        // Draw the cropped area from the source canvas to the output canvas
        outputCtx.drawImage(
            canvas,          // Source is the canvas with the rotated image
            sourceX,         // Start x on source
            sourceY,         // Start y on source
            pixelCrop.width, // Width to grab from source
            pixelCrop.height,// Height to grab from source
            0,               // Place at x=0 on output
            0,               // Place at y=0 on output
            outputCanvas.width, // Scale to output width
            outputCanvas.height // Scale to output height
        )

        return new Promise((resolve) => {
            outputCanvas.toBlob((file) => {
                resolve(file)
            }, 'image/webp', 0.8)
        })
    }

    const handleSave = async () => {
        if (!imageSrc || !croppedAreaPixels) return

        try {
            setIsLoading(true)
            const croppedImage = await getCroppedImg(imageSrc, croppedAreaPixels)
            if (croppedImage) {
                onCropComplete(croppedImage)
                onClose()
            }
        } catch (e) {
            console.error(e)
        } finally {
            setIsLoading(false)
        }
    }

    if (!imageSrc) return null

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>Crop Profile Picture</DialogTitle>
                </DialogHeader>

                <div className="relative w-full h-[400px] bg-black/5 rounded-md overflow-hidden">
                    <Cropper
                        image={imageSrc}
                        crop={crop}
                        zoom={zoom}
                        aspect={1}
                        onCropChange={onCropChange}
                        onCropComplete={onCropCompleteCallback}
                        onZoomChange={onZoomChange}
                        showGrid={false}
                        cropShape="round"
                    />
                </div>

                <div className="py-4">
                    <div className="flex items-center gap-4">
                        <span className="text-sm font-medium w-12">Zoom</span>
                        <Slider
                            value={[zoom]}
                            min={1}
                            max={3}
                            step={0.1}
                            onValueChange={(value) => setZoom(value[0])}
                            className="flex-1"
                        />
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose} disabled={isLoading}>
                        Cancel
                    </Button>
                    <Button onClick={handleSave} disabled={isLoading}>
                        {isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Processing
                            </>
                        ) : (
                            "Save"
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
