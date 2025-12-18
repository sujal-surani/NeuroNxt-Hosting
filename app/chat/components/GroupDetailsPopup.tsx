"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { LogOut, Trash2, Users, Loader2, MessageCircle, Pencil } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useState, useRef, useEffect } from "react"
import { ImageCropper } from "@/components/image-cropper"

interface Member {
    id: string
    name: string
    avatar: string
    role?: string
    isConnected: boolean
    connectionStatus: 'pending' | 'accepted' | 'none'
    isCurrentUser: boolean
}

interface GroupDetailsPopupProps {
    isOpen: boolean
    onClose: () => void
    groupName: string
    groupAvatar?: string
    members: Member[]
    onLeaveGroup: () => void
    isLeaving: boolean
    onAddMember: () => void
    onConnect: (id: string, name: string) => void
    onMessage: (member: Member) => void
    currentUserId: string
    // New props for editing
    groupDescription?: string
    onUpdateGroup?: (name: string, description: string, avatar: Blob | null) => Promise<void>
    isUpdating?: boolean
}

export function GroupDetailsPopup({
    isOpen,
    onClose,
    groupName,
    groupAvatar,
    members,
    onLeaveGroup,
    isLeaving,
    onAddMember,
    onConnect,
    onMessage,
    currentUserId,
    groupDescription,
    onUpdateGroup,
    isUpdating
}: GroupDetailsPopupProps) {
    const [isEditing, setIsEditing] = useState(false)
    const [editedName, setEditedName] = useState(groupName)
    const [editedDescription, setEditedDescription] = useState(groupDescription || "")
    const [selectedAvatar, setSelectedAvatar] = useState<string | null>(null)
    const [selectedFile, setSelectedFile] = useState<Blob | null>(null)
    const [showCropper, setShowCropper] = useState(false)
    const [cropperImage, setCropperImage] = useState<string | null>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)

    // Reset state when opening
    useEffect(() => {
        if (isOpen) {
            setEditedName(groupName)
            setEditedDescription(groupDescription || "")
            setIsEditing(false)
            setSelectedAvatar(null)
            setSelectedFile(null)
        }
    }, [isOpen, groupName, groupDescription])

    const handleAvatarClick = () => {
        if (isEditing) {
            fileInputRef.current?.click()
        }
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            // Read file for cropper
            const reader = new FileReader()
            reader.onload = () => {
                setCropperImage(reader.result as string)
                setShowCropper(true)
            }
            reader.readAsDataURL(file)
            e.target.value = '' // Reset input
        }
    }

    const handleCropComplete = (croppedBlob: Blob) => {
        setSelectedFile(croppedBlob)
        setSelectedAvatar(URL.createObjectURL(croppedBlob))
        setShowCropper(false)
        setCropperImage(null)
    }

    const handleSave = async () => {
        if (onUpdateGroup) {
            await onUpdateGroup(editedName, editedDescription, selectedFile)
            setIsEditing(false)
        }
    }
    const getInitials = (name: string) => {
        return name
            ?.split(' ')
            .map((n: string) => n[0])
            .join('')
            .substring(0, 2)
            .toUpperCase() || '??'
    }

    return (
        <>
            <Dialog open={isOpen} onOpenChange={onClose}>
                <DialogContent showCloseButton={false} className="sm:max-w-[480px] p-0 overflow-hidden border-none shadow-2xl bg-card">
                    {/* Header Section with Gradient/Color */}
                    <div className="bg-primary/10 p-6 flex flex-col items-center justify-center border-b border-border/50 relative shrink-0">
                        <div className="absolute top-4 right-4 z-10">
                            {!isEditing ? (
                                <Button variant="ghost" size="sm" onClick={() => setIsEditing(true)} className="h-8 w-8 p-0 rounded-full hover:bg-black/10">
                                    <Pencil className="h-4 w-4 text-foreground/70" />
                                </Button>
                            ) : (
                                <div className="flex items-center gap-1">
                                    <Button variant="ghost" size="sm" onClick={() => setIsEditing(false)} disabled={isUpdating} className="h-7 px-2 text-xs">
                                        Cancel
                                    </Button>
                                    <Button size="sm" onClick={handleSave} disabled={isUpdating} className="h-7 px-2 text-xs">
                                        {isUpdating ? <Loader2 className="h-3 w-3 animate-spin" /> : "Save"}
                                    </Button>
                                </div>
                            )}
                        </div>

                        <div className="relative group/avatar">
                            <Avatar
                                className={`h-24 w-24 mb-3 border-4 border-background shadow-sm ${isEditing ? 'cursor-pointer hover:opacity-90' : ''}`}
                                onClick={handleAvatarClick}
                            >
                                <AvatarImage src={selectedAvatar || groupAvatar} className="object-cover" />
                                {/* Need to handle current group avatar URL if we had it passed in props, for now simplified */}
                                {/* Ideally pass existing avatar url to props and use it as fallback before Initials if available */}
                                <AvatarFallback className="text-2xl bg-primary text-primary-foreground">
                                    {getInitials(editedName)}
                                </AvatarFallback>
                            </Avatar>
                            {isEditing && (
                                <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full cursor-pointer pointer-events-none">
                                    <span className="text-white text-xs font-medium">Change</span>
                                </div>
                            )}
                            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
                        </div>

                        {isEditing ? (
                            <div className="w-full space-y-2 px-8">
                                <Input
                                    value={editedName}
                                    onChange={(e) => setEditedName(e.target.value)}
                                    className="text-center text-lg font-bold h-9"
                                    placeholder="Group Name"
                                />
                            </div>
                        ) : (
                            <DialogTitle className="text-2xl font-bold text-center tracking-tight px-4 truncate w-full">{groupName}</DialogTitle>
                        )}

                        <p className="text-sm font-medium text-muted-foreground mt-1 bg-background/50 px-3 py-1 rounded-full">
                            {members.length} Participants
                        </p>
                    </div>

                    <div className="px-6 py-4 flex-1 overflow-hidden flex flex-col">
                        {/* Description Section */}
                        <div className="mb-6 shrink-0">
                            {isEditing ? (
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider ml-1">Description</label>
                                    <Textarea
                                        value={editedDescription}
                                        onChange={(e) => setEditedDescription(e.target.value)}
                                        className="resize-none text-sm bg-muted/30 min-h-[80px]"
                                        placeholder="Add a group description..."
                                        maxLength={500}
                                    />
                                </div>
                            ) : (
                                (groupDescription || "") && (
                                    <div className="text-center px-4">
                                        <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
                                            {groupDescription}
                                        </p>
                                    </div>
                                )
                            )}
                        </div>

                        <div className="flex items-center justify-between mb-3 shrink-0">
                            <h4 className="text-sm font-semibold text-foreground/80 flex items-center gap-2">
                                <Users className="w-4 h-4 text-primary" />
                                Group Members
                            </h4>
                            <Button variant="outline" size="sm" onClick={onAddMember} className="h-8 gap-1">
                                <Users className="w-3 h-3" />
                                Add Member
                            </Button>
                        </div>

                        <ScrollArea className="flex-1 w-full pr-4 -mr-4 min-h-0">
                            <div className="space-y-3 pr-4">
                                {members.map((member) => (
                                    <div key={member.id} className="group flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-all duration-200">
                                        <div className="flex items-center gap-3 overflow-hidden">
                                            <Avatar className="h-10 w-10 border border-border/50 flex-shrink-0">
                                                <AvatarImage src={member.avatar} alt={member.name} />
                                                <AvatarFallback className="bg-muted text-muted-foreground font-medium">
                                                    {getInitials(member.name)}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="flex flex-col min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors truncate">{member.name}</span>
                                                    {/* Badge for roles like Admin/Teacher if needed */}
                                                    {['admin', 'teacher'].includes(member.role?.toLowerCase() || '') && (
                                                        <div className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-primary/10 text-primary border border-primary/20 uppercase tracking-wide flex-shrink-0">
                                                            {member.role}
                                                        </div>
                                                    )}
                                                    {member.isCurrentUser && (
                                                        <span className="text-[10px] text-muted-foreground bg-muted px-1 rounded">(You)</span>
                                                    )}
                                                </div>
                                                <span className="text-xs text-muted-foreground capitalize truncate">
                                                    {member.role || 'Member'}
                                                </span>
                                            </div>
                                        </div>

                                        {!member.isCurrentUser && (
                                            <div className="flex items-center gap-2">
                                                {member.isConnected ? (
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 text-muted-foreground hover:text-primary"
                                                        onClick={() => onMessage(member)}
                                                        title="Message"
                                                    >
                                                        <MessageCircle className="h-4 w-4" />
                                                    </Button>
                                                ) : (
                                                    member.connectionStatus === 'pending' ? (
                                                        <span className="text-xs text-muted-foreground px-2">Pending</span>
                                                    ) : (
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="h-7 text-xs px-2 text-primary hover:text-primary/80 hover:bg-primary/10"
                                                            onClick={() => onConnect(member.id, member.name)}
                                                        >
                                                            Connect
                                                        </Button>
                                                    )
                                                )}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </ScrollArea>
                    </div>

                    <DialogFooter className="p-6 bg-muted/20 border-t border-border/50 flex flex-row items-center justify-between gap-4">
                        <Button variant="outline" onClick={onClose} className="flex-1">Close</Button>
                        <Button
                            variant="destructive"
                            onClick={onLeaveGroup}
                            disabled={isLeaving}
                            className="flex-1 shadow-sm hover:shadow-md transition-all"
                        >
                            {isLeaving ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Leaving...
                                </>
                            ) : (
                                <>
                                    <LogOut className="mr-2 h-4 w-4" />
                                    Leave Group
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
                <ImageCropper
                    imageSrc={cropperImage}
                    isOpen={showCropper}
                    onClose={() => {
                        setShowCropper(false)
                        setCropperImage(null)
                    }}
                    onCropComplete={handleCropComplete}
                />
            </Dialog>
        </>
    )
}
