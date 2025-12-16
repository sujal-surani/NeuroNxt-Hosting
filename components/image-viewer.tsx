"use client"

import { Dialog, DialogContent, DialogClose } from "@/components/ui/dialog"
import { X, Download } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ImageViewerProps {
    isOpen: boolean
    onClose: () => void
    src: string
    alt?: string
}

export function ImageViewer({ isOpen, onClose, src, alt }: ImageViewerProps) {
    const handleDownload = async () => {
        try {
            const response = await fetch(src);
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `image-${Date.now()}.webp`; // Default name
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Download failed:', error);
            window.open(src, '_blank'); // Fallback
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="w-[95vw] h-[95vh] max-w-[95vw] sm:max-w-[95vw] p-0 bg-black/90 border-none shadow-none flex flex-col items-center justify-center">
                <div className="relative w-full h-full flex items-center justify-center group">
                    {/* Controls */}
                    <div className="absolute top-4 right-4 flex gap-2 z-50">
                        <Button size="icon" variant="secondary" className="rounded-full bg-black/50 text-white hover:bg-black/70" onClick={handleDownload}>
                            <Download className="w-5 h-5" />
                        </Button>
                        <Button size="icon" variant="secondary" className="rounded-full bg-black/50 text-white hover:bg-black/70" onClick={onClose}>
                            <X className="w-5 h-5" />
                        </Button>
                    </div>

                    {/* Image */}
                    <img
                        src={src}
                        alt={alt || "Full size image"}
                        className="max-h-full max-w-full object-contain"
                    />
                </div>
            </DialogContent>
        </Dialog>
    )
}
