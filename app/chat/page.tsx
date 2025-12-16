"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Sidebar } from "@/components/sidebar"
import { TopNavbar } from "@/components/top-navbar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { toast } from "sonner"
import { StudentProfilePopup } from "@/components/student-profile-popup"
import {
  Send,
  Search,
  Paperclip,
  Smile,
  ImageIcon,
  File,
  Mic,
  MicOff,
  Users,
  Plus,
  Heart,
  Reply,
  X,
  User,
  Mail,
  Calendar,
  BookOpen,
  Trophy,
  Flame,
  Link,
  GraduationCap,
  Clock,
  MoreVertical,
  Trash2,
  Download,
  Pin,
  UserMinus,
  UserPlus,
  UserX,
  Settings,
  Loader2,
  FileText,
  MessageCircle
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useRouter, useSearchParams } from "next/navigation"
import { ImageViewer } from "@/components/image-viewer"

interface ChatMessage {
  id: number
  content: string
  sender: "user" | "other"
  timestamp: Date
  type: "text" | "image" | "file" | "voice"
  fileName?: string
  fileSize?: string
  fileUrl?: string
  reactions?: { emoji: string; count: number; users: string[] }[]
  replyTo?: number
  senderId?: string
}

interface ChatContact {
  id: number
  conversationId?: number
  name: string
  avatar: string
  status: "online" | "offline" | "away"
  lastMessage: string
  lastMessageTime: string
  unreadCount: number
  isTyping?: boolean
  isGroup?: boolean
  memberCount?: number
  isPinned?: boolean
  isDisconnected?: boolean
  studentId?: string
  branch?: string
  semester?: string
  role?: string // Added role field
}

interface Student {
  id: string
  name: string
  avatar: string

  status: "online" | "offline" | "away"
  isConnected: boolean
  connectionStatus?: "pending" | "accepted" | "none"
  enrollment?: string
  branch?: string
  semester?: string
  bio?: string
  quizzesCompleted?: number
  studyStreak?: number
  connections?: number
  role?: string
  instituteCode?: string
  lastActive?: string
  email?: string
  location?: string
  visibility?: "institute" | "classmates"
}

export default function ChatPage() {
  const supabase = createClient()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  const [contacts, setContacts] = useState<ChatContact[]>([])
  const [selectedContact, setSelectedContact] = useState<ChatContact | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [isRecording, setIsRecording] = useState(false)
  const [replyingTo, setReplyingTo] = useState<number | null>(null)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [showNewChatModal, setShowNewChatModal] = useState(false)
  const [studentSearchQuery, setStudentSearchQuery] = useState("")
  const [students, setStudents] = useState<Student[]>([]) // Connected students for new chat
  const [showStudentInfo, setShowStudentInfo] = useState(false)
  const [selectedStudentInfo, setSelectedStudentInfo] = useState<Student | null>(null)
  const [isPinned, setIsPinned] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const [showComingSoonModal, setShowComingSoonModal] = useState(false)
  const [showDisconnectModal, setShowDisconnectModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showClearChatModal, setShowClearChatModal] = useState(false)
  const [showGroupModal, setShowGroupModal] = useState(false)
  const [isAdmin, setIsAdmin] = useState(true)
  const [showDisconnectedAlert, setShowDisconnectedAlert] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const imageInputRef = useRef<HTMLInputElement>(null)
  const [viewImage, setViewImage] = useState<string | null>(null)

  // Presence State
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set())

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])



  // Initial Data Fetch
  useEffect(() => {
    const init = async () => {
      setLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push("/auth/login")
        return
      }
      setCurrentUser(user)
      await fetchConversations(user.id)
      setLoading(false)
    }
    init()
  }, [])

  // Handle URL parameters for opening a specific chat
  useEffect(() => {
    const handleUrlParams = async () => {
      const targetUserId = searchParams.get('id')
      const targetUserName = searchParams.get('person')

      if (targetUserId && currentUser && !loading) {
        try {
          // 1. Get or create conversation
          const { data: convId, error } = await supabase.rpc('get_or_create_conversation', {
            target_user_id: targetUserId
          })

          if (error) throw error

          // 2. Check if it exists in current contacts
          const existingContact = contacts.find(c => c.conversationId === convId)

          if (existingContact) {
            setSelectedContact(existingContact)
          } else {
            // 3. If not in contacts, we need to fetch the user details to add it temporarily
            // (It will be permanently added on next fetch if we send a message, 
            // but for now we just want to show the empty chat)

            // We might need to fetch the profile if we don't have it
            const { data: profile, error: profileError } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', targetUserId)
              .single()

            if (profileError) throw profileError

            const newContact: ChatContact = {
              id: convId,
              conversationId: convId,
              name: profile.full_name || targetUserName || "Unknown",
              avatar: profile.avatar_url || getInitials(profile.full_name || targetUserName || "?"),
              status: profile.status || "offline",
              lastMessage: "Start a conversation",
              lastMessageTime: "Just now",
              unreadCount: 0,
              studentId: profile.id,
              isGroup: false,
              isDisconnected: false
            }

            setContacts(prev => [newContact, ...prev])
            setSelectedContact(newContact)
          }

          // 4. Clear URL params
          router.replace('/chat')
        } catch (error) {
          console.error('Error opening chat from URL:', error)
          toast.error("Failed to open chat")
        }
      }
    }

    handleUrlParams()
    handleUrlParams()
  }, [currentUser, loading, searchParams, contacts])

  // Presence Subscription
  useEffect(() => {
    if (!currentUser) return

    const channel = supabase.channel('online_users')

    channel
      .on('presence', { event: 'sync' }, () => {
        const newState = channel.presenceState()
        const onlineIds = new Set<string>()

        Object.values(newState).forEach((presences: any) => {
          presences.forEach((presence: any) => {
            if (presence.user_id) onlineIds.add(presence.user_id)
          })
        })
        setOnlineUsers(onlineIds)
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({
            user_id: currentUser.id,
            online_at: new Date().toISOString(),
          })
        }
      })

    return () => {
      supabase.removeChannel(channel)
    }
  }, [currentUser])

  // Real-time subscriptions
  useEffect(() => {
    if (!currentUser) return

    // Subscribe to new messages in active conversation
    const messageChannel = supabase
      .channel('chat-messages')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages' },
        (payload) => {
          if (selectedContact && payload.new.conversation_id === selectedContact.conversationId) {
            // Add new message to current view
            const newMsg = payload.new
            const isMe = newMsg.sender_id === currentUser.id
            setMessages(prev => [...prev, {
              id: newMsg.id,
              content: newMsg.content,
              sender: isMe ? "user" : "other",
              timestamp: new Date(newMsg.created_at),
              type: newMsg.type as any,
              fileName: newMsg.file_name,
              fileSize: newMsg.file_size,
              fileUrl: newMsg.file_url,
              senderId: newMsg.sender_id
            }])
          }
          // Refresh conversations list to update last message
          fetchConversations(currentUser.id)
        }
      )
      .subscribe()

    // Subscribe to conversation updates (for last message)
    const conversationChannel = supabase
      .channel('chat-conversations')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'conversations' },
        (payload) => {
          fetchConversations(currentUser.id)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(messageChannel)
      supabase.removeChannel(conversationChannel)
    }
  }, [currentUser, selectedContact])

  const fetchConversations = async (userId: string) => {
    // Use new RPC to get all conversations (groups + 1-on-1)
    const { data, error } = await supabase.rpc('get_user_conversations', {
      p_user_id: userId
    })

    if (error) {
      console.error('Error fetching conversations:', error)
      toast.error("Failed to load chats")
      return
    }

    console.log('Fetched conversations:', data) // Debug log

    const formattedContacts: ChatContact[] = data
      .map((conv: any) => {
        const isGroup = conv.is_group
        const lastMsg = conv.last_message
        const isPinned = false // Pinned logic needs update for groups if desired, simplistic for now
        const isDisconnected = false // Group logic doesn't really have 'disconnected' in same way

        let displayName = conv.name
        let displayAvatar = conv.group_avatar
        let displayDesc = conv.description
        let otherUserRole = undefined
        let displayStudentId = undefined
        let displayBranch = undefined
        let displaySemester = undefined

        if (isGroup) {
          // It's a group
          if (!displayName) displayName = "Unnamed Group"
          if (!displayAvatar) displayAvatar = "https://ui-avatars.com/api/?name=" + encodeURIComponent(displayName) + "&background=random"
        } else {
          // It's 1-on-1
          // Participants JSONB contains the OTHER user
          const otherUser = conv.participants && conv.participants.length > 0 ? conv.participants[0] : null

          if (otherUser) {
            displayName = otherUser.full_name
            displayAvatar = otherUser.avatar_url || getInitials(displayName)
            otherUserRole = otherUser.role
            displayStudentId = otherUser.id
            // Branch/Sem might not be in the RPC minimal profile return, can add if needed
          } else {
            displayName = "Deleted User"
            displayAvatar = getInitials("DU")
          }
        }

        return {
          id: conv.id,
          conversationId: conv.id,
          name: displayName,
          avatar: displayAvatar,
          status: "offline", // Online status needs complex logic for groups, skip for now
          lastMessage: lastMsg
            ? (lastMsg.type === 'image'
              ? 'Sent an image'
              : lastMsg.type === 'file'
                ? 'Sent a file'
                : (lastMsg.content.length > 30 ? lastMsg.content.substring(0, 30) + '...' : lastMsg.content))
            : (isGroup ? "New group created" : "Tap to start chatting"),
          lastMessageTime: formatTime(conv.updated_at),
          unreadCount: conv.unread_count || 0,
          studentId: displayStudentId,
          branch: displayBranch,
          semester: displaySemester,
          isGroup: isGroup,
          memberCount: isGroup ? (conv.participants ? conv.participants.length : 0) : 2,
          isPinned: isPinned,
          isDisconnected: isDisconnected,
          role: otherUserRole
        }
      })

    // Deduplicate contacts by conversationId
    const uniqueContacts = formattedContacts.filter((contact, index, self) =>
      index === self.findIndex((c) => c.conversationId === contact.conversationId)
    )

    // Sort contacts: Pinned first, then by updated_at
    uniqueContacts.sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1
      if (!a.isPinned && b.isPinned) return 1
      return 0 // Keep existing order (updated_at)
    })

    setContacts(uniqueContacts)

    // Auto-select removed as per user request
    // if (!selectedContact && formattedContacts.length > 0) {
    //   setSelectedContact(formattedContacts[0])
    // }
  }

  const fetchMessages = async (conversationId: number) => {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true })

    if (error) {
      console.error('Error fetching messages:', error)
      return
    }

    const formattedMessages: ChatMessage[] = data.map((msg: any) => ({
      id: msg.id,
      content: msg.content,
      sender: msg.sender_id === currentUser.id ? "user" : "other",
      timestamp: new Date(msg.created_at),
      type: msg.type,
      fileName: msg.file_name,
      fileSize: msg.file_size,
      fileUrl: msg.file_url,
      senderId: msg.sender_id
    }))

    setMessages(formattedMessages)
  }

  const markAsRead = async (conversationId: number) => {
    if (!currentUser) return

    const { error } = await supabase
      .from('messages')
      .update({ is_read: true })
      .eq('conversation_id', conversationId)
      .neq('sender_id', currentUser.id)
      .eq('is_read', false)

    if (error) {
      console.error('Error marking messages as read:', error)
    } else {
      // Update local state to clear badge only on success
      setContacts(prev => prev.map(c =>
        c.conversationId === conversationId ? { ...c, unreadCount: 0 } : c
      ))
    }
  }

  useEffect(() => {
    if (selectedContact?.conversationId) {
      fetchMessages(selectedContact.conversationId)
      markAsRead(selectedContact.conversationId)
    }
  }, [selectedContact])

  // Fetch connected students for "New Chat"
  const fetchConnectedStudents = async () => {
    if (!currentUser) return

    const { data: connections, error } = await supabase
      .from('connections')
      .select(`
        *,
        requester:profiles!requester_id(*),
        recipient:profiles!recipient_id(*)
      `)
      .eq('status', 'accepted')
      .or(`requester_id.eq.${currentUser.id},recipient_id.eq.${currentUser.id}`)

    if (error) {
      console.error('Error fetching connections:', error)
      return
    }

    const studentsList: Student[] = connections.map((conn: any) => {
      const isRequester = conn.requester_id === currentUser.id
      const friend = isRequester ? conn.recipient : conn.requester
      return {
        id: friend.id,
        name: friend.full_name,
        avatar: friend.avatar_url || getInitials(friend.full_name),
        branch: friend.branch,
        semester: friend.semester,
        status: friend.status || "offline",
        isConnected: true,

      }
    })

    setStudents(studentsList)
  }

  const handleNewChat = () => {
    fetchConnectedStudents()
    setShowNewChatModal(true)
    setStudentSearchQuery("")
  }

  const startChatWithStudent = async (student: Student) => {
    // Use RPC to get existing conversation or create new one (handles hidden/deleted chats)
    const { data: convId, error } = await supabase.rpc('get_or_create_conversation', {
      target_user_id: student.id
    })

    if (error) {
      console.error('Error starting chat:', error)
      toast.error("Failed to start chat")
      return
    }

    // Check if it's already in our local list
    const existingLocal = contacts.find(c => c.conversationId === convId)
    if (existingLocal) {
      // Update local state to remove disconnected status
      const updatedContact = { ...existingLocal, isDisconnected: false }
      setContacts(contacts.map(c => c.conversationId === convId ? updatedContact : c))
      setSelectedContact(updatedContact)
    } else {
      // Add to local list
      const newContact: ChatContact = {
        id: convId,
        conversationId: convId,
        name: student.name,
        avatar: student.avatar,
        status: student.status,
        lastMessage: "Start a conversation",
        lastMessageTime: "Just now",
        unreadCount: 0,
        studentId: student.id,
        isGroup: false,
        isDisconnected: false
      }
      setContacts([newContact, ...contacts])
      setSelectedContact(newContact)
    }
    setShowNewChatModal(false)
    toast.success(`Started chat with ${student.name}`)
  }

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedContact?.conversationId || !currentUser) return

    const content = newMessage
    setNewMessage("") // Clear input immediately

    const { data: messageData, error: messageError } = await supabase
      .from('messages')
      .insert({
        conversation_id: selectedContact.conversationId,
        sender_id: currentUser.id,
        content: content,
        type: 'text'
      })
      .select()
      .single()

    if (messageError) {
      console.error('Error sending message:', messageError)
      toast.error("Failed to send message")
      return
    }

    // Undelete conversation for all users (so it reappears if hidden)
    await supabase.rpc('undelete_conversation', { p_conversation_id: selectedContact.conversationId })

    // Update conversation last_message_id
    await supabase
      .from('conversations')
      .update({
        last_message_id: messageData.id,
        updated_at: new Date().toISOString()
      })
      .eq('id', selectedContact.conversationId)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const handleCreateGroup = async (name: string, description: string, participantIds: string[]) => {
    if (!currentUser) return
    if (!name.trim()) {
      toast.error("Group name is required")
      return
    }
    if (participantIds.length === 0) {
      toast.error("Select at least one member")
      return
    }

    const toastId = toast.loading("Creating group...")

    try {
      const { data: conversationId, error } = await supabase.rpc('create_group_conversation', {
        p_creator_id: currentUser.id,
        p_name: name,
        p_description: description,
        p_participant_ids: participantIds
      })

      if (error) throw error

      toast.success("Group created!", { id: toastId })
      setShowGroupModal(false)

      // Refresh list
      await fetchConversations(currentUser.id)

      // Optionally select the new group
      // fetchConversations will put it at top, so we could find it
    } catch (error) {
      console.error('Error creating group:', error)
      toast.error("Failed to create group", { id: toastId })
    }
  }


  // Helpers
  const getInitials = (name: string) => {
    return name
      ?.split(' ')
      .map(n => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase() || '??'
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diff = now.getTime() - date.getTime()

    if (diff < 86400000) { // Less than 24 hours
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    } else {
      return date.toLocaleDateString()
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "online": return "bg-green-500"
      case "away": return "bg-yellow-500"
      case "offline": return "bg-gray-400"
      default: return "bg-gray-400"
    }
  }

  // Filter contacts
  const filteredContacts = contacts.filter((contact) =>
    contact.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Filter students for new chat
  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(studentSearchQuery.toLowerCase())
  )

  // Other UI handlers (simplified for now)
  const handleEmojiClick = (emoji: string) => {
    setNewMessage(prev => prev + emoji)
    setShowEmojiPicker(false)
  }

  const toggleEmojiPicker = () => setShowEmojiPicker(!showEmojiPicker)
  const toggleRecording = () => setIsRecording(!isRecording)
  const handleImageUpload = () => imageInputRef.current?.click()

  const handleImageChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Limit initial check to 10MB to avoid freezing
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Image too large. Please select an image under 10MB.")
      return
    }

    const toastId = toast.loading("Compressing and uploading...")

    try {
      // 1. Compress Client-Side
      const { compressImage } = await import('@/lib/imageCompression') // Dynamic import to keep init bundle small
      const compressedFile = await compressImage(file)

      // 2. Generate path (user_id/timestamp_filename.webp)
      if (!currentUser) throw new Error("Not authenticated")
      const timestamp = Date.now()
      // Sanitize filename: remove special chars, spaces -> underscores
      const sanitizedName = compressedFile.name.replace(/[^a-zA-Z0-9.-]/g, "_")
      const filePath = `${currentUser.id}/${timestamp}_${sanitizedName}`

      console.log('Uploading to path:', filePath) // Debug

      // 3. Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase
        .storage
        .from('chat-attachments')
        .upload(filePath, compressedFile, {
          cacheControl: '3600',
          upsert: false
        })

      if (uploadError) throw uploadError

      // 4. Get Public URL
      const { data: { publicUrl } } = supabase
        .storage
        .from('chat-attachments')
        .getPublicUrl(filePath)

      console.log('Generated Public URL:', publicUrl) // Debug

      // 5. Send Message as 'image'
      const { data: messageData, error: messageError } = await supabase
        .from('messages')
        .insert({
          conversation_id: selectedContact?.conversationId,
          sender_id: currentUser.id,
          content: "Sent an image", // Fallback text
          type: 'image',
          file_url: publicUrl,
          file_name: compressedFile.name,
          file_size: (compressedFile.size / 1024).toFixed(1) + " KB"
        })
        .select()
        .single()

      if (messageError) throw messageError

      // 6. Update Conversation
      await supabase
        .from('conversations')
        .update({
          last_message_id: messageData.id,
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedContact?.conversationId)

      toast.success("Image sent", { id: toastId })

    } catch (error) {
      console.error('Error sending image:', error)
      toast.error("Failed to send image", { id: toastId })
    } finally {
      // Reset input
      if (imageInputRef.current) {
        imageInputRef.current.value = ""
      }
    }
  }

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Limit to 10MB
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File is too large. Max limit is 10MB.")
      return
    }

    const toastId = toast.loading("Uploading file...")

    try {
      if (!currentUser) throw new Error("Not authenticated")
      const timestamp = Date.now()
      // Sanitize filename
      const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_")
      const filePath = `${currentUser.id}/${timestamp}_${sanitizedName}`

      // Upload to Supabase Storage (Reuse chat-attachments)
      const { data: uploadData, error: uploadError } = await supabase
        .storage
        .from('chat-attachments')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (uploadError) throw uploadError

      // Get Public URL
      const { data: { publicUrl } } = supabase
        .storage
        .from('chat-attachments')
        .getPublicUrl(filePath)

      // Send Message as 'file'
      const { data: messageData, error: messageError } = await supabase
        .from('messages')
        .insert({
          conversation_id: selectedContact?.conversationId,
          sender_id: currentUser.id,
          content: "Sent a file", // Fallback text
          type: 'file',
          file_url: publicUrl,
          file_name: file.name,
          file_size: (file.size / 1024 / 1024).toFixed(2) + " MB"
        })
        .select()
        .single()

      if (messageError) throw messageError

      // Update Conversation
      await supabase
        .from('conversations')
        .update({
          last_message_id: messageData.id,
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedContact?.conversationId)

      toast.success("File sent", { id: toastId })

    } catch (error) {
      console.error('Error sending file:', error)
      toast.error("Failed to send file", { id: toastId })
    } finally {
      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  const handleStudentInfoClick = async () => {
    // Prevent opening profile for teachers
    if (selectedContact?.role === 'teacher') return

    if (selectedContact && !selectedContact.isGroup) {
      // Fetch full profile details
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', selectedContact.studentId)
        .single()

      if (error) {
        console.error('Error fetching profile:', error)
        toast.error("Failed to load profile")
        return
      }

      // Fetch connection count
      const { count: connectionCount, error: countError } = await supabase
        .from('connections')
        .select('*', { count: 'exact', head: true })
        .or(`requester_id.eq.${profile.id},recipient_id.eq.${profile.id}`)
        .eq('status', 'accepted')

      const student: Student = {
        id: profile.id,
        name: profile.full_name,
        avatar: profile.avatar_url || getInitials(profile.full_name),
        branch: profile.branch,
        semester: profile.semester,
        status: profile.status || "offline",
        isConnected: true,
        bio: profile.bio,
        role: profile.role,
        instituteCode: profile.institute_code,
        lastActive: profile.last_active,
        email: profile.email,
        location: profile.location,
        connections: connectionCount || 0,
        visibility: profile.visibility
      }
      setSelectedStudentInfo(student)
      setShowStudentInfo(true)
    }
  }

  const closeStudentInfo = () => {
    setShowStudentInfo(false)
    setSelectedStudentInfo(null)
  }

  const handleDeleteChat = () => setShowDeleteModal(true)
  const confirmDeleteChat = async () => {
    if (!selectedContact?.conversationId) return

    try {
      const { error } = await supabase.rpc('delete_conversation_for_user', {
        p_conversation_id: selectedContact.conversationId
      })

      if (error) throw error

      // Remove from local state
      setContacts(prev => prev.filter(c => c.id !== selectedContact.id))
      setSelectedContact(null)
      setMessages([])

      toast.success("Chat deleted successfully")
    } catch (error) {
      console.error('Error deleting chat:', error)
      toast.error("Failed to delete chat")
    } finally {
      setShowDeleteModal(false)
      setShowDisconnectedAlert(false)
    }
  }

  const handlePinChat = async () => {
    if (!selectedContact?.conversationId || !currentUser) return

    const isCurrentlyPinned = selectedContact.isPinned
    const newPinnedStatus = !isCurrentlyPinned

    try {
      // Fetch current pinned_by array
      const { data: conv, error: fetchError } = await supabase
        .from('conversations')
        .select('pinned_by')
        .eq('id', selectedContact.conversationId)
        .single()

      if (fetchError) throw fetchError

      let pinnedBy = conv.pinned_by || []

      if (newPinnedStatus) {
        if (!pinnedBy.includes(currentUser.id)) {
          pinnedBy.push(currentUser.id)
        }
      } else {
        pinnedBy = pinnedBy.filter((id: string) => id !== currentUser.id)
      }

      const { error: updateError } = await supabase
        .from('conversations')
        .update({ pinned_by: pinnedBy })
        .eq('id', selectedContact.conversationId)

      if (updateError) throw updateError

      // Update local state
      setContacts(prev => {
        const updated = prev.map(c =>
          c.id === selectedContact.id ? { ...c, isPinned: newPinnedStatus } : c
        )
        // Re-sort
        return updated.sort((a, b) => {
          if (a.isPinned && !b.isPinned) return -1
          if (!a.isPinned && b.isPinned) return 1
          // We can't easily access updated_at here for secondary sort without storing it more explicitly,
          // but usually the list order is preserved enough or we can rely on index if needed.
          // For now, let's just sort by pin.
          return 0
        })
      })

      setSelectedContact(prev => prev ? { ...prev, isPinned: newPinnedStatus } : null)
      toast.success(newPinnedStatus ? "Chat pinned" : "Chat unpinned")

    } catch (error) {
      console.error('Error pinning chat:', error)
      toast.error("Failed to update pin status")
    }
  }

  const handleExportChat = () => {
    toast.info("Feature will be available soon")
    setShowDropdown(false)
  }

  const handleClearChat = () => setShowClearChatModal(true)

  const confirmClearChat = async () => {
    if (!selectedContact?.conversationId) return

    try {
      const { error } = await supabase.rpc('clear_chat_for_user', {
        p_conversation_id: selectedContact.conversationId
      })

      if (error) throw error

      setMessages([])
      toast.success("Chat history cleared")
    } catch (error) {
      console.error('Error clearing chat:', error)
      toast.error("Failed to clear chat history")
    } finally {
      setShowClearChatModal(false)
    }
  }

  const handleDisconnectStudent = () => setShowDisconnectModal(true)

  const confirmDisconnect = async () => {
    if (!selectedContact?.studentId || !currentUser) return

    try {
      const { error } = await supabase.rpc('disconnect_user', {
        target_user_id: selectedContact.studentId
      })

      if (error) throw error

      // Update local state
      setContacts(prev => prev.filter(c => c.id !== selectedContact.id))
      // Also remove from students list if it exists there (for New Chat modal)
      setStudents(prev => prev.filter(s => s.id !== selectedContact.studentId))

      setSelectedContact(null)
      setMessages([])

      toast.success("Student disconnected")
    } catch (error) {
      console.error('Error disconnecting:', error)
      toast.error("Failed to disconnect")
    } finally {
      setShowDisconnectModal(false)
    }
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      if (showDropdown && !target.closest('.dropdown-container')) {
        setShowDropdown(false)
      }
    }
    if (showDropdown) document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showDropdown])


  if (loading) {
    return (
      <div className="flex h-screen bg-background items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <TopNavbar />

        <main className="flex-1 flex overflow-hidden max-w-full">
          {/* Contacts Sidebar */}
          <div className="w-80 lg:w-80 md:w-72 sm:w-64 border-r border-border flex flex-col flex-shrink-0 bg-card min-w-0">
            <div className="p-3 border-b border-border">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-semibold">Messages</h2>
                <div className="flex items-center gap-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 w-7 px-0"
                    title="Create Group"
                    onClick={() => {
                      fetchConnectedStudents()
                      setShowGroupModal(true)
                    }}
                  >
                    <Users className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 bg-transparent"
                    onClick={handleNewChat}
                  >
                    <Plus className="w-3 h-3 mr-1" />
                    New
                  </Button>
                </div>
              </div>
              <div className="relative">
                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-muted-foreground w-3 h-3" />
                <Input
                  placeholder="Search conversations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 h-8 text-sm"
                />
              </div>
            </div>

            <ScrollArea className="flex-1">
              <div className="p-1">
                {filteredContacts.map((contact) => (
                  <div
                    key={contact.id}
                    onClick={() => {
                      if (contact.isDisconnected) {
                        setSelectedContact(contact)
                        setShowDisconnectedAlert(true)
                      } else {
                        setSelectedContact(contact)
                      }
                    }}
                    className={`flex items-center space-x-2 p-2 rounded-lg cursor-pointer hover:bg-muted/50 transition-colors mb-1 ${selectedContact?.id === contact.id ? "bg-muted" : ""
                      }`}
                  >
                    <div className="relative">
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={contact.avatar.length > 2 ? contact.avatar : undefined} />
                        <AvatarFallback
                          className={`${contact.isGroup ? "bg-purple-500" : "bg-primary"} text-primary-foreground text-sm`}
                        >
                          {contact.avatar.length > 2 ? getInitials(contact.name) : contact.avatar}
                        </AvatarFallback>
                      </Avatar>
                      {contact.isGroup ? (
                        <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-purple-500 border-2 border-background rounded-full flex items-center justify-center">
                          <Users className="w-1.5 h-1.5 text-white" />
                        </div>
                      ) : (
                        <div
                          className={`absolute -bottom-1 -right-1 w-3 h-3 ${(contact.studentId && onlineUsers.has(contact.studentId)) ? "bg-green-500" : "bg-gray-300"
                            } border-2 border-background rounded-full`}
                        ></div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-medium truncate flex items-center gap-1 text-sm">
                          {contact.name}
                          {contact.isPinned && (
                            <Pin className="w-3 h-3 text-blue-500" />
                          )}
                          {contact.isGroup && (
                            <span className="text-xs text-muted-foreground">({contact.memberCount})</span>
                          )}
                        </h4>
                        <span className="text-xs text-muted-foreground">{contact.lastMessageTime}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-muted-foreground truncate pr-2">
                          {contact.isTyping ? <span className="text-primary">Typing...</span> : contact.lastMessage}
                        </p>
                        {contact.unreadCount > 0 && selectedContact?.id !== contact.id && (
                          <Badge
                            variant="default"
                            className="ml-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-[10px]"
                          >
                            {contact.unreadCount}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>

          {/* Chat Area */}
          <div className="flex-1 flex flex-col min-w-0 bg-background overflow-hidden max-w-full">
            {selectedContact ? (
              <>
                {/* Chat Header */}
                <div className="p-3 border-b border-border bg-card/30 flex-shrink-0">
                  <div className="flex items-center justify-between min-w-0">
                    <div className="flex items-center space-x-3 min-w-0 flex-1">
                      <div className="relative">
                        <Avatar className="w-9 h-9">
                          <AvatarImage src={selectedContact.avatar.length > 2 ? selectedContact.avatar : undefined} />
                          <AvatarFallback
                            className={`${selectedContact.isGroup ? "bg-purple-500" : "bg-primary"} text-primary-foreground text-sm`}
                          >
                            {selectedContact.avatar.length > 2 ? getInitials(selectedContact.name) : selectedContact.avatar}
                          </AvatarFallback>
                        </Avatar>
                        {selectedContact.isGroup ? (
                          <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-purple-500 border-2 border-background rounded-full flex items-center justify-center">
                            <Users className="w-1.5 h-1.5 text-white" />
                          </div>
                        ) : (
                          <div
                            className={`absolute -bottom-1 -right-1 w-3 h-3 ${(selectedContact.studentId && onlineUsers.has(selectedContact.studentId)) ? "bg-green-500" : "bg-gray-300"
                              } border-2 border-background rounded-full`}
                          ></div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3
                          className="font-semibold flex items-center gap-2 text-sm truncate cursor-pointer hover:text-primary transition-colors"
                          onClick={handleStudentInfoClick}
                        >
                          <span className="truncate">{selectedContact.name}</span>
                          {selectedContact.isGroup && (
                            <Badge variant="secondary" className="text-xs h-5 flex-shrink-0">
                              {selectedContact.memberCount} members
                            </Badge>
                          )}
                        </h3>
                        <p className="text-xs text-muted-foreground capitalize truncate">
                          {selectedContact.isGroup
                            ? "Group chat"
                            : (selectedContact.studentId && onlineUsers.has(selectedContact.studentId))
                              ? <span className="text-green-600 font-medium">Online</span>
                              : "Offline"
                          }
                        </p>
                      </div>
                    </div>

                    <div className="flex space-x-1 flex-shrink-0 relative dropdown-container">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 hover:bg-muted"
                        onClick={() => setShowDropdown(!showDropdown)}
                      >
                        <MoreVertical className="w-4 h-4" />
                      </Button>

                      {/* Create Group Button */}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => {
                          fetchConnectedStudents() // Fetch students to select from
                          setShowGroupModal(true)
                        }}
                      >
                        <Users className="h-4 w-4" />
                      </Button>

                      {showDropdown && (
                        <div className="absolute right-0 top-10 bg-card border border-border rounded-lg shadow-lg z-50 w-48">
                          <div className="p-1">
                            {selectedContact?.role !== 'teacher' && (
                              <button
                                onClick={() => {
                                  handleStudentInfoClick()
                                  setShowDropdown(false)
                                }}
                                className="w-full flex items-center px-2 py-1.5 text-sm hover:bg-muted rounded-sm"
                              >
                                <User className="w-4 h-4 mr-2" />
                                View Profile
                              </button>
                            )}
                            <button
                              onClick={() => {
                                handlePinChat()
                                setShowDropdown(false)
                              }}
                              className="w-full flex items-center px-2 py-1.5 text-sm hover:bg-muted rounded-sm"
                            >
                              <Pin className="w-4 h-4 mr-2" />
                              {selectedContact.isPinned ? "Unpin Chat" : "Pin Chat"}
                            </button>
                            <button
                              onClick={handleExportChat}
                              className="w-full flex items-center px-2 py-1.5 text-sm hover:bg-muted rounded-sm"
                            >
                              <Download className="w-4 h-4 mr-2" />
                              Export Chat
                            </button>
                            <button
                              onClick={() => {
                                handleClearChat()
                                setShowDropdown(false)
                              }}
                              className="w-full flex items-center px-2 py-1.5 text-sm hover:bg-muted rounded-sm"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Clear Chat History
                            </button>
                            {/* Hide Disconnect for Teachers AND for Students chatting with Teachers */}
                            {(currentUser?.user_metadata?.role !== 'teacher' && selectedContact.role !== 'teacher') && (
                              <button
                                onClick={() => {
                                  handleDisconnectStudent()
                                  setShowDropdown(false)
                                }}
                                className="w-full flex items-center px-2 py-1.5 text-sm hover:bg-muted rounded-sm text-destructive"
                              >
                                <UserMinus className="w-4 h-4 mr-2" />
                                Disconnect
                              </button>
                            )}
                            <button
                              onClick={() => {
                                handleDeleteChat()
                                setShowDropdown(false)
                              }}
                              className="w-full flex items-center px-2 py-1.5 text-sm hover:bg-muted rounded-sm text-destructive"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete Chat
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Messages */}
                <ScrollArea className="flex-1 p-2 sm:p-4 min-h-0">
                  <div className="space-y-3 sm:space-y-4 max-w-full">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex mb-4 gap-2 ${message.sender === "user" ? "justify-end" : "justify-start"}`}
                      >
                        {/* Avatar for Receiver */}
                        {message.sender !== "user" && (
                          <Avatar className="w-6 h-6 mt-auto">
                            <AvatarImage src={selectedContact?.avatar} />
                            <AvatarFallback className="text-[10px]">{getInitials(selectedContact?.name || "?")}</AvatarFallback>
                          </Avatar>
                        )}

                        <div
                          className={`relative max-w-[70%] sm:max-w-[75%] shadow-sm min-w-[4rem] flex flex-col ${message.sender === "user"
                            ? "bg-slate-700 text-white rounded-2xl rounded-tr-sm"
                            : "bg-gray-200 dark:bg-zinc-800 text-gray-900 dark:text-gray-100 rounded-2xl rounded-tl-sm"
                            }`}
                        >
                          {/* Text Content */}
                          {message.type === "text" && (
                            <div className="text-sm whitespace-pre-wrap leading-relaxed px-4 py-2">
                              {message.content}
                              {/* Inline Timestamp spacer */}
                              <span className="inline-block w-11 h-0"></span>
                            </div>
                          )}

                          {/* Image Content - Full Bleed with small padding */}
                          {message.type === "image" && (
                            <div className="p-1">
                              <img
                                src={message.fileUrl || message.content}
                                alt="Sent image"
                                className="rounded-xl w-full h-auto max-h-80 object-cover cursor-pointer hover:opacity-95 transition-opacity"
                                onClick={() => setViewImage(message.fileUrl || message.content)}
                                onError={(e) => {
                                  e.currentTarget.style.display = 'none';
                                }}
                              />
                              {message.content !== "Sent an image" && <p className="text-sm mt-2 px-2 pb-1">{message.content}</p>}
                            </div>
                          )}

                          {/* File Content */}
                          {message.type === "file" && (
                            <div className="p-2">
                              <div
                                className={`flex items-center gap-3 p-3 rounded-xl border transition-colors cursor-pointer ${message.sender === "user"
                                  ? "bg-white/10 border-white/10 hover:bg-white/20"
                                  : "bg-background border-border/50 shadow-sm hover:bg-background/80"
                                  }`}
                                onClick={() => window.open(message.fileUrl, '_blank')}
                              >
                                <div className={`p-2.5 rounded-full shrink-0 ${message.sender === "user" ? "bg-white/20" : "bg-white dark:bg-zinc-900"
                                  }`}>
                                  <FileText className={`w-4 h-4 ${message.sender === "user" ? "text-white" : "text-gray-700 dark:text-gray-400"
                                    }`} />
                                </div>
                                <div className="flex-1 min-w-0 grid gap-0.5">
                                  <p className="text-sm font-medium truncate">
                                    {message.fileName || "Unknown File"}
                                  </p>
                                  <p className={`text-[10px] ${message.sender === "user" ? "text-slate-300" : "text-gray-500"
                                    }`}>
                                    {message.fileSize || "Unknown size"}
                                  </p>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Timestamp */}
                          <div className={`text-[10px] select-none text-right px-3 pb-1.5 -mt-1 ${message.type === 'image' ? 'absolute bottom-2 right-2 bg-black/40 text-white px-1.5 py-0.5 rounded-full backdrop-blur-sm' : ''
                            } ${message.sender === "user" && message.type !== 'image' ? "text-slate-300" : "text-gray-500"
                            }`}>
                            {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </div>
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>
                </ScrollArea>

                {/* Message Input */}
                <div className="p-2 sm:p-3 border-t border-border bg-card/30 flex-shrink-0">
                  <div className="flex items-end space-x-2 min-w-0">
                    <div className="flex space-x-1 flex-shrink-0">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <Paperclip className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={handleImageUpload}
                      >
                        <ImageIcon className="w-4 h-4" />
                      </Button>
                    </div>

                    <div className="flex-1 relative min-w-0">
                      <Input
                        placeholder="Type a message..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        className="pr-10 h-9 min-w-0"
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7 p-0"
                        onClick={toggleEmojiPicker}
                      >
                        <Smile className="w-4 h-4" />
                      </Button>
                    </div>

                    <div className="flex space-x-1 flex-shrink-0">
                      <Button onClick={sendMessage} disabled={!newMessage.trim()} size="sm" className="h-8">
                        <Send className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Emoji Picker */}
                  {showEmojiPicker && (
                    <div className="absolute bottom-full left-0 mb-2 p-2 bg-card border border-border rounded-lg shadow-lg z-10">
                      <div className="grid grid-cols-8 gap-1">
                        {["😀", "😂", "😍", "🥰", "😎", "🤔", "😢", "😡", "👍", "👎", "❤️", "🎉", "🔥", "💯", "✨", "🎯"].map((emoji) => (
                          <Button
                            key={emoji}
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-lg"
                            onClick={() => handleEmojiClick(emoji)}
                          >
                            {emoji}
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground p-8 text-center bg-muted/10">
                <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-6">
                  <MessageCircle className="w-10 h-10 text-primary" />
                </div>
                <h3 className="text-2xl font-bold mb-3 text-foreground">Welcome to NeuroNxt Chat</h3>
                <p className="max-w-md text-base mb-8 leading-relaxed">
                  Connect with your classmates, discuss projects, and share knowledge in real-time.
                  Select a conversation from the sidebar or start a new chat to begin.
                </p>
                <Button onClick={handleNewChat} size="lg" className="shadow-lg hover:shadow-xl transition-all">
                  <Plus className="w-5 h-5 mr-2" />
                  Start New Chat
                </Button>
              </div>
            )}
          </div>
        </main >
      </div >

      {/* Hidden File Inputs */}
      < input
        ref={fileInputRef}
        type="file"
        className="hidden"
        onChange={handleFileChange}
        accept=".pdf,.doc,.docx,.txt,.zip,.rar"
      />
      <input
        ref={imageInputRef}
        type="file"
        className="hidden"
        onChange={handleImageChange}
        accept="image/*"
      />

      {/* New Chat Modal */}
      {
        showNewChatModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-card p-6 rounded-lg shadow-lg max-w-2xl w-full mx-4 max-h-[80vh] flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Start New Chat</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowNewChatModal(false)}
                  className="h-8 w-8 p-0"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search your connections..."
                  value={studentSearchQuery}
                  onChange={(e) => setStudentSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              <ScrollArea className="flex-1 max-h-96">
                <div className="space-y-2">
                  {filteredStudents.map((student) => (
                    <div
                      key={student.id}
                      className="flex items-center justify-between p-3 border border-border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={student.avatar} />
                          <AvatarFallback className="bg-primary text-primary-foreground">
                            {getInitials(student.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h4 className="font-medium text-sm">{student.name}</h4>
                          <p className="text-xs text-muted-foreground">{student.branch} • {student.semester}</p>
                        </div>
                      </div>

                      <Button
                        size="sm"
                        onClick={() => startChatWithStudent(student)}
                        className="h-8"
                      >
                        Start Chat
                      </Button>
                    </div>
                  ))}

                  {filteredStudents.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p>No connections found</p>
                      <p className="text-sm">Try searching with a different term</p>
                    </div>
                  )}
                </div>
              </ScrollArea>

            </div>
          </div>
        )
      }

      {/* Student Profile Popup */}
      <StudentProfilePopup
        student={selectedStudentInfo}
        isOpen={showStudentInfo}
        onClose={closeStudentInfo}
      />

      {/* Delete Chat Confirmation Modal */}
      {
        showDeleteModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-card p-6 rounded-lg shadow-lg max-w-md w-full mx-4">
              <div className="text-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Trash2 className="w-8 h-8 text-red-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Delete Chat</h3>
                <p className="text-muted-foreground mb-6">
                  Are you sure you want to delete this chat?
                  This action cannot be undone.
                </p>
                <div className="flex space-x-3">
                  <Button
                    variant="outline"
                    onClick={() => setShowDeleteModal(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={confirmDeleteChat}
                    className="flex-1 bg-red-600 hover:bg-red-700"
                  >
                    Delete Chat
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )
      }

      {/* Clear Chat Confirmation Modal */}
      {
        showClearChatModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-card p-6 rounded-lg shadow-lg max-w-md w-full mx-4">
              <div className="text-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Trash2 className="w-8 h-8 text-red-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Clear Chat History</h3>
                <p className="text-muted-foreground mb-6">
                  Are you sure you want to clear all messages in this chat?
                  This action cannot be undone.
                </p>
                <div className="flex space-x-3">
                  <Button
                    variant="outline"
                    onClick={() => setShowClearChatModal(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={confirmClearChat}
                    className="flex-1 bg-red-600 hover:bg-red-700"
                  >
                    Clear History
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )
      }

      {/* Disconnect Confirmation Modal */}
      {
        showDisconnectModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-card p-6 rounded-lg shadow-lg max-w-md w-full mx-4">
              <div className="text-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <UserMinus className="w-8 h-8 text-red-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Disconnect Student</h3>
                <p className="text-muted-foreground mb-6">
                  Are you sure you want to disconnect from <strong>{selectedContact?.name}</strong>?
                  You will not be able to chat with this user and your chats will be deleted.
                </p>
                <div className="flex space-x-3">
                  <Button
                    variant="outline"
                    onClick={() => setShowDisconnectModal(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={confirmDisconnect}
                    className="flex-1 bg-red-600 hover:bg-red-700"
                  >
                    Disconnect
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )
      }
      {/* Disconnected Alert Modal */}
      {
        showDisconnectedAlert && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-card p-6 rounded-lg shadow-lg max-w-md w-full mx-4">
              <div className="text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <UserX className="w-8 h-8 text-gray-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Disconnected</h3>
                <p className="text-muted-foreground mb-6">
                  You have been disconnected from <strong>{selectedContact?.name}</strong>.
                  Messages have been deleted.
                </p>
                <div className="flex space-x-3">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowDisconnectedAlert(false)
                      setSelectedContact(null)
                    }}
                    className="flex-1"
                  >
                    Close
                  </Button>
                  <Button
                    onClick={confirmDeleteChat}
                    className="flex-1 bg-red-600 hover:bg-red-700"
                  >
                    Remove from List
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )
      }
      <ImageViewer
        isOpen={!!viewImage}
        onClose={() => setViewImage(null)}
        src={viewImage || ""}
      />

      {/* Create Group Modal */}
      {
        showGroupModal && (
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-card border border-border rounded-lg shadow-lg w-full max-w-md flex flex-col max-h-[90vh]">
              <div className="p-4 border-b border-border flex items-center justify-between">
                <h2 className="font-semibold">Create New Group</h2>
                <Button variant="ghost" size="icon" onClick={() => setShowGroupModal(false)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <div className="p-4 space-y-4 flex-1 overflow-y-auto">
                <div>
                  <label className="text-sm font-medium mb-1 block">Group Name</label>
                  <Input
                    id="group-name-input"
                    placeholder="e.g. Study Group A"
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-1 block">Description (Optional)</label>
                  <Input
                    id="group-desc-input"
                    placeholder="What's this group for?"
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Add Members</label>
                  <Input
                    className="mb-2"
                    placeholder="Search students..."
                    value={studentSearchQuery}
                    onChange={(e) => setStudentSearchQuery(e.target.value)}
                  />

                  <div className="space-y-2 mt-2 max-h-48 overflow-y-auto border rounded-md p-2">
                    {filteredStudents.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-2">No students found</p>
                    ) : (
                      filteredStudents.map(student => (
                        <div key={student.id} className="flex items-center space-x-3 p-2 hover:bg-muted/50 rounded-md">
                          <input
                            type="checkbox"
                            id={`student-${student.id}`}
                            className="mr-2"
                          />
                          <Avatar className="w-8 h-8">
                            <AvatarImage src={student.avatar} />
                            <AvatarFallback>{getInitials(student.name)}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <p className="text-sm font-medium">{student.name}</p>
                            <p className="text-xs text-muted-foreground">{student.branch}</p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              <div className="p-4 border-t border-border flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowGroupModal(false)}>Cancel</Button>
                <Button onClick={() => {
                  const nameInput = document.getElementById('group-name-input') as HTMLInputElement
                  const descInput = document.getElementById('group-desc-input') as HTMLInputElement
                  const selectedIds = students
                    .filter(s => (document.getElementById(`student-${s.id}`) as HTMLInputElement)?.checked)
                    .map(s => s.id)

                  handleCreateGroup(nameInput.value, descInput.value, selectedIds)
                }}>
                  Create Group
                </Button>
              </div>
            </div>
          </div>
        )
      }
    </div >
  )
}
