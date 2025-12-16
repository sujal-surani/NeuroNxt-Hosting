"use client"

import React from "react"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Send, Mic, MicOff, Brain, BookOpen, Lightbulb, Code, Calculator } from "lucide-react"

interface Message {
  id: number
  content: string
  sender: "user" | "ai"
  timestamp: Date
  type?: "text" | "code" | "formula"
}

interface AIChatAssistantProps {
  initialQuery?: string | null
  onQueryProcessed?: () => void
}

const mockMessages: Message[] = [
  {
    id: 1,
    content:
      "Hello! I'm your AI study assistant. I can help you with explanations, solve problems, generate practice questions, and more. What would you like to study today?",
    sender: "ai",
    timestamp: new Date(Date.now() - 300000),
  },
]

const quickActions = [
  { icon: BookOpen, label: "Explain Concept", prompt: "Explain this concept to me:" },
  { icon: Lightbulb, label: "Generate Quiz", prompt: "Create a quiz about:" },
  { icon: Code, label: "Code Example", prompt: "Show me code example for:" },
  { icon: Calculator, label: "Solve Problem", prompt: "Help me solve this problem:" },
]

export function AIChatAssistant({ initialQuery, onQueryProcessed }: AIChatAssistantProps) {
  const [messages, setMessages] = useState<Message[]>(mockMessages)
  const [inputMessage, setInputMessage] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [hasProcessedInitialQuery, setHasProcessedInitialQuery] = useState(false)
  const endRef = useRef<HTMLDivElement | null>(null)
  const messagesContainerRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (initialQuery && initialQuery.trim() && !hasProcessedInitialQuery) {
      sendMessage(initialQuery.trim())
      setHasProcessedInitialQuery(true)
      onQueryProcessed?.()
    }
  }, [initialQuery, hasProcessedInitialQuery, onQueryProcessed])

  useEffect(() => {
    // Keep the scroll anchored to the messages container without shifting the page
    const container = messagesContainerRef.current
    if (!container) return
    container.scrollTop = container.scrollHeight
  }, [messages, isTyping])

  const sendMessage = async (content: string) => {
    if (!content.trim()) return

    const userMessage: Message = {
      id: messages.length + 1,
      content: content.trim(),
      sender: "user",
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInputMessage("")
    setIsTyping(true)

    setTimeout(() => {
      const aiResponse: Message = {
        id: messages.length + 2,
        content: generateAIResponse(content),
        sender: "ai",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, aiResponse])
      setIsTyping(false)
    }, 1500)
  }

  const generateAIResponse = (userInput: string): string => {
    const input = userInput.toLowerCase()

    if (input.includes("algorithm") || input.includes("complexity")) {
      return "Great question about algorithms! Time complexity is crucial for understanding algorithm efficiency. Here's a breakdown:\n\n• O(1) - Constant time: Array access, hash table lookup\n• O(log n) - Logarithmic: Binary search, balanced tree operations\n• O(n) - Linear: Array traversal, linear search\n• O(n log n) - Linearithmic: Merge sort, heap sort\n• O(n²) - Quadratic: Bubble sort, nested loops\n\nWould you like me to explain any specific algorithm or provide examples?"
    }

    if (input.includes("machine learning") || input.includes("ml")) {
      return "Machine Learning is fascinating! Here are the key concepts:\n\n**Supervised Learning:**\n• Uses labeled training data\n• Examples: Classification, Regression\n• Algorithms: Linear Regression, Decision Trees, SVM\n\n**Unsupervised Learning:**\n• Finds patterns in unlabeled data\n• Examples: Clustering, Dimensionality Reduction\n• Algorithms: K-means, PCA, DBSCAN\n\nKey Steps:\n1. Data Collection & Preprocessing\n2. Feature Selection\n3. Model Training\n4. Evaluation & Validation\n5. Deployment\n\nWhat specific aspect would you like to explore?"
    }

    if (input.includes("data structure") || input.includes("data structures")) {
      return "Data structures are fundamental building blocks in computer science! Here are the main types:\n\n**Linear Data Structures:**\n• Arrays - Fixed size, indexed access\n• Linked Lists - Dynamic size, sequential access\n• Stacks - LIFO (Last In, First Out)\n• Queues - FIFO (First In, First Out)\n\n**Non-Linear Data Structures:**\n• Trees - Hierarchical structure (Binary Trees, BST, AVL)\n• Graphs - Nodes connected by edges\n• Hash Tables - Key-value pairs with fast lookup\n\n**When to use which:**\n• Arrays: When you need fast random access\n• Linked Lists: When you frequently insert/delete\n• Trees: For hierarchical data and searching\n• Graphs: For representing relationships\n\nWhich data structure would you like me to explain in detail?"
    }

    if (input.includes("study plan") || input.includes("create a study plan")) {
      return "I'd be happy to help you create a personalized study plan! Here's a structured approach:\n\n**Step 1: Assessment**\n• Identify your current knowledge level\n• Define your learning goals and timeline\n• List available study hours per day/week\n\n**Step 2: Plan Structure**\n• Break topics into manageable chunks\n• Allocate time based on difficulty and importance\n• Include regular review sessions\n\n**Step 3: Study Techniques**\n• Active recall and spaced repetition\n• Practice problems and quizzes\n• Teaching concepts to others\n\n**Sample Weekly Schedule:**\n• Monday-Wednesday: New concepts\n• Thursday: Practice problems\n• Friday: Review and quiz\n• Weekend: Project work or deep dive\n\nWhat subject are you planning to study? I can create a more specific plan for you!"
    }

    if (input.includes("quiz") || input.includes("generate quiz")) {
      return "I can help you generate customized quizzes! Here's what I can create:\n\n**Quiz Types:**\n• Multiple Choice Questions\n• True/False Questions\n• Fill-in-the-blank\n• Short Answer Questions\n• Code Completion Challenges\n\n**Difficulty Levels:**\n• Beginner - Basic concepts and definitions\n• Intermediate - Application and analysis\n• Advanced - Complex problem-solving\n\n**Popular Topics:**\n• Programming fundamentals\n• Data structures and algorithms\n• Machine learning concepts\n• Database design\n• System design\n\nWhat topic would you like me to create a quiz for? Just specify the subject and difficulty level!"
    }

    return `I understand you're asking about "${userInput}". Let me help you break it down step by step. Could you provide more specific details about what you'd like to learn or any particular aspect you're struggling with? I can provide explanations, examples, or even generate practice problems to help you master the concept.\n\n**I can help with:**\n• Detailed explanations of concepts\n• Step-by-step problem solving\n• Creating practice quizzes\n• Generating code examples\n• Building study plans\n• Reviewing and summarizing topics\n\nWhat would be most helpful for you right now?`
  }

  const handleQuickAction = (prompt: string) => {
    setInputMessage(prompt + " ")
  }

  const toggleVoiceInput = () => {
    setIsListening(!isListening)
    // TODO: Implement actual voice recognition
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage(inputMessage)
    }
  }

  return (
    <Card className="h-[700px] flex flex-col">
      <CardHeader className="pb-3 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
              <Brain className="w-5 h-5 text-primary" />
            </div>
            <div>
              <CardTitle className="flex items-center">
                AI Study Assistant
                <Badge variant="secondary" className="ml-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
                  Online
                </Badge>
              </CardTitle>
              <CardDescription>Your personal AI tutor for any subject</CardDescription>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
        <div className="flex-1 flex flex-col min-h-0">
          {/* Messages Area */}
          <div
            className="flex-1 overflow-y-auto px-4 scrollbar-none hover:scrollbar-thin scrollbar-track-slate-100 scrollbar-thumb-slate-300 hover:scrollbar-thumb-slate-400 scrollbar-thumb-rounded-full transition-all duration-300"
            style={{
              scrollbarWidth: "thin",
              scrollbarColor: "rgb(203 213 225) transparent",
            }}
            ref={messagesContainerRef}
          >
            <div className="space-y-4 py-4">
              {messages.map((message) => (
                <div key={message.id} className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`flex space-x-2 max-w-[80%] ${message.sender === "user" ? "flex-row-reverse space-x-reverse" : ""}`}
                  >
                    <Avatar className="w-8 h-8 flex-shrink-0">
                      {message.sender === "ai" ? (
                        <AvatarFallback className="bg-primary text-primary-foreground">
                          <Brain className="w-4 h-4" />
                        </AvatarFallback>
                      ) : (
                        <AvatarFallback className="bg-secondary text-secondary-foreground">U</AvatarFallback>
                      )}
                    </Avatar>
                    <div
                      className={`rounded-lg p-3 ${
                        message.sender === "user" ? "bg-primary text-primary-foreground" : "bg-muted"
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                      <p className="text-xs opacity-70 mt-1">
                        {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="flex justify-start">
                  <div className="flex space-x-2 max-w-[80%]">
                    <Avatar className="w-8 h-8">
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        <Brain className="w-4 h-4" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="bg-muted rounded-lg p-3">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
                        <div
                          className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
                          style={{ animationDelay: "0.1s" }}
                        ></div>
                        <div
                          className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
                          style={{ animationDelay: "0.2s" }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={endRef} />
            </div>
          </div>

          {/* Input Area */}
          <div className="border-t bg-background p-4 flex-shrink-0 sticky bottom-0">
            <div className="flex flex-wrap gap-2 mb-4">
              {quickActions.map((action) => (
                <Button
                  key={action.label}
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickAction(action.prompt)}
                  className="text-xs"
                >
                  {React.createElement(action.icon, { className: "w-3 h-3 mr-1" })}
                  {action.label}
                </Button>
              ))}
            </div>

            <div className="flex space-x-2">
              <div className="flex-1 relative">
                <Input
                  placeholder="Ask me anything about your studies..."
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="pr-12 h-10"
                />
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8"
                  onClick={toggleVoiceInput}
                >
                  {isListening ? <MicOff className="w-4 h-4 text-red-500" /> : <Mic className="w-4 h-4" />}
                </Button>
              </div>
              <Button onClick={() => sendMessage(inputMessage)} disabled={!inputMessage.trim()} className="px-4 h-10">
                <Send className="w-4 h-4" />
              </Button>
            </div>

            {isListening && (
              <div className="flex items-center justify-center text-sm text-muted-foreground mt-2">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse mr-2"></div>
                Listening...
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
