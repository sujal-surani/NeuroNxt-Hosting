"use client"

import { useState, useMemo } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Search, Loader2, CheckCircle2 } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"

interface PotentialMember {
    id: string
    name: string
    avatar: string
    branch?: string
    semester?: string
}

interface AddMemberDialogProps {
    isOpen: boolean
    onClose: () => void
    onAdd: (selectedIds: string[]) => Promise<void>
    candidates: PotentialMember[]
    isLoading?: boolean
}

export function AddMemberDialog({
    isOpen,
    onClose,
    onAdd,
    candidates,
    isLoading = false
}: AddMemberDialogProps) {
    const [searchQuery, setSearchQuery] = useState("")
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
    const [isAdding, setIsAdding] = useState(false)

    const filteredCandidates = useMemo(() => {
        return candidates.filter(c =>
            c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            c.branch?.toLowerCase().includes(searchQuery.toLowerCase())
        )
    }, [candidates, searchQuery])

    const toggleSelection = (id: string) => {
        const newSet = new Set(selectedIds)
        if (newSet.has(id)) {
            newSet.delete(id)
        } else {
            newSet.add(id)
        }
        setSelectedIds(newSet)
    }

    const handleAdd = async () => {
        if (selectedIds.size === 0) return

        setIsAdding(true)
        try {
            await onAdd(Array.from(selectedIds))
            setSelectedIds(new Set())
            setSearchQuery("")
            onClose()
        } catch (error) {
            console.error("Failed to add members", error)
        } finally {
            setIsAdding(false)
        }
    }

    const getInitials = (name: string) => {
        return name
            ?.split(' ')
            .map(n => n[0])
            .join('')
            .substring(0, 2)
            .toUpperCase() || '??'
    }

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !isAdding && onClose()}>
            <DialogContent className="sm:max-w-[425px] flex flex-col max-h-[85vh]">
                <DialogHeader>
                    <DialogTitle>Add Members</DialogTitle>
                    <p className="text-sm text-muted-foreground">
                        Select friends to add to this group.
                    </p>
                </DialogHeader>

                <div className="relative my-2">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                        placeholder="Search friends..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                    />
                </div>

                <div className="flex-1 min-h-0">
                    <ScrollArea className="h-[300px]">
                        {isLoading ? (
                            <div className="flex items-center justify-center h-full">
                                <Loader2 className="w-6 h-6 animate-spin text-primary" />
                            </div>
                        ) : filteredCandidates.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground text-sm">
                                {searchQuery ? "No matching friends found" : "No friends available to add"}
                            </div>
                        ) : (
                            <div className="space-y-2 p-1">
                                {filteredCandidates.map(candidate => (
                                    <div
                                        key={candidate.id}
                                        className={`flex items-center justify-between p-3 rounded-lg border transition-all cursor-pointer ${selectedIds.has(candidate.id)
                                                ? "bg-primary/5 border-primary"
                                                : "hover:bg-muted/50 border-input"
                                            }`}
                                        onClick={() => toggleSelection(candidate.id)}
                                    >
                                        <div className="flex items-center gap-3">
                                            <Avatar>
                                                <AvatarImage src={candidate.avatar} />
                                                <AvatarFallback>{getInitials(candidate.name)}</AvatarFallback>
                                            </Avatar>
                                            <div className="flex flex-col">
                                                <span className="text-sm font-medium">{candidate.name}</span>
                                                <span className="text-xs text-muted-foreground">
                                                    {candidate.branch}
                                                </span>
                                            </div>
                                        </div>
                                        <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${selectedIds.has(candidate.id)
                                                ? "bg-primary border-primary text-primary-foreground"
                                                : "border-muted-foreground/30"
                                            }`}>
                                            {selectedIds.has(candidate.id) && <CheckCircle2 className="w-3.5 h-3.5" />}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </ScrollArea>
                </div>

                <DialogFooter className="mt-2">
                    <Button variant="outline" onClick={onClose} disabled={isAdding}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleAdd}
                        disabled={selectedIds.size === 0 || isAdding}
                    >
                        {isAdding ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Adding...
                            </>
                        ) : (
                            `Add ${selectedIds.size} Member${selectedIds.size !== 1 ? 's' : ''}`
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
