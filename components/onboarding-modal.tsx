"use client"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { toast } from "sonner"
import { Camera, Loader2, MapPin, Globe, Users } from "lucide-react"
import { ImageCropper } from "@/components/image-cropper"

interface OnboardingModalProps {
    isOpen: boolean
    userId: string
    currentFullName: string
    onComplete: () => void
}

export function OnboardingModal({ isOpen, userId, currentFullName, onComplete }: OnboardingModalProps) {
    const [loading, setLoading] = useState(false)
    const [bio, setBio] = useState("")
    const [location, setLocation] = useState("")
    const [visibility, setVisibility] = useState("institute")
    const [avatarUrl, setAvatarUrl] = useState("")
    const [showCropper, setShowCropper] = useState(false)
    const [selectedImage, setSelectedImage] = useState<string | null>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const router = useRouter()
    const supabase = createClient()

    if (!isOpen) return null

    const handleAvatarClick = () => {
        fileInputRef.current?.click()
    }

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (!file) return

        const reader = new FileReader()
        reader.onload = () => {
            setSelectedImage(reader.result as string)
            setShowCropper(true)
        }
        reader.readAsDataURL(file)
        // Reset input value so same file can be selected again
        event.target.value = ''
    }

    const handleCropComplete = async (croppedImageBlob: Blob) => {
        try {
            setLoading(true)
            const fileExt = 'jpg'
            const fileName = `${userId}-${Math.random()}.${fileExt}`
            const filePath = `${fileName}`

            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(filePath, croppedImageBlob)

            if (uploadError) {
                throw uploadError
            }

            const { data } = supabase.storage.from('avatars').getPublicUrl(filePath)
            setAvatarUrl(data.publicUrl)
            toast.success("Avatar uploaded!")
        } catch (error: any) {
            console.error('Error uploading avatar:', error)
            toast.error(error.message || "Error uploading avatar")
        } finally {
            setLoading(false)
            setShowCropper(false)
            setSelectedImage(null)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            const { error } = await supabase
                .from('profiles')
                .update({
                    bio,
                    location,
                    visibility,
                    is_onboarded: true,
                    avatar_url: avatarUrl || undefined
                })
                .eq('id', userId)

            if (error) throw error

            toast.success("Profile updated successfully!")
            onComplete()
            router.refresh()
        } catch (error) {
            console.error('Error updating profile:', error)
            toast.error("Failed to update profile")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[100] p-4">
            <div className="bg-card rounded-xl shadow-2xl max-w-lg w-full overflow-hidden border border-border">
                <div className="bg-primary/10 p-6 text-center">
                    <h2 className="text-2xl font-bold text-primary mb-2">Welcome to NeuroNxt!</h2>
                    <p className="text-muted-foreground">Let's set up your profile to get you started.</p>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Avatar Selection */}
                    <div className="flex flex-col items-center">
                        <div className="relative group cursor-pointer" onClick={handleAvatarClick}>
                            <Avatar className="w-24 h-24 border-4 border-background shadow-lg">
                                <AvatarImage src={avatarUrl} />
                                <AvatarFallback className="text-2xl bg-muted">
                                    {currentFullName.substring(0, 2).toUpperCase()}
                                </AvatarFallback>
                            </Avatar>
                            <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <Camera className="w-8 h-8 text-white" />
                            </div>
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">Click to change avatar</p>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleFileChange}
                        />
                    </div>

                    {/* Bio */}
                    <div className="space-y-2">
                        <Label htmlFor="bio">Bio</Label>
                        <Textarea
                            id="bio"
                            placeholder="Tell us a bit about yourself..."
                            value={bio}
                            onChange={(e) => setBio(e.target.value)}
                            className="resize-none h-24"
                        />
                    </div>

                    {/* Location */}
                    <div className="space-y-2">
                        <Label htmlFor="location">Location</Label>
                        <div className="relative">
                            <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                            <Input
                                id="location"
                                placeholder="City, Country"
                                value={location}
                                onChange={(e) => setLocation(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                    </div>

                    {/* Visibility */}
                    <div className="space-y-3">
                        <Label>Profile Visibility</Label>
                        <RadioGroup value={visibility} onValueChange={setVisibility} className="grid grid-cols-2 gap-4">
                            <div>
                                <RadioGroupItem value="institute" id="institute" className="peer sr-only" />
                                <Label
                                    htmlFor="institute"
                                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                                >
                                    <Globe className="mb-2 h-6 w-6" />
                                    <span className="text-sm font-medium">Whole Institute</span>
                                </Label>
                            </div>
                            <div>
                                <RadioGroupItem value="classmates" id="classmates" className="peer sr-only" />
                                <Label
                                    htmlFor="classmates"
                                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                                >
                                    <Users className="mb-2 h-6 w-6" />
                                    <span className="text-sm font-medium">Classmates Only</span>
                                </Label>
                            </div>
                        </RadioGroup>
                    </div>

                    <Button type="submit" className="w-full" disabled={loading}>
                        {loading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Saving...
                            </>
                        ) : (
                            "Complete Profile"
                        )}
                    </Button>
                </form>
            </div>

            <ImageCropper
                imageSrc={selectedImage}
                isOpen={showCropper}
                onClose={() => {
                    setShowCropper(false)
                    setSelectedImage(null)
                }}
                onCropComplete={handleCropComplete}
            />
        </div>
    )
}
