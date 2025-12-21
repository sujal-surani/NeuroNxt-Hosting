"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Lightbulb, CheckCircle2, XCircle, Brain } from "lucide-react"

// Question Data
const questions = [
    {
        id: 1,
        question: "What does 'HTTP' stand for?",
        options: [
            "HyperText Transfer Protocol",
            "HyperText Transmission Process",
            "High Transmission Text Protocol",
            "Host Text Transfer Protocol"
        ],
        correct: 0,
        fact: "HTTP (Hypertext Transfer Protocol) is the foundation of data communication for the World Wide Web. It was initiated by Tim Berners-Lee at CERN in 1989."
    },
    {
        id: 2,
        question: "Which data structure operates on a LIFO (Last In, First Out) principle?",
        options: [
            "Queue",
            "Linked List",
            "Stack",
            "Tree"
        ],
        correct: 2,
        fact: "Stacks are used in function calls (call stack), undo mechanisms in text editors, and syntax parsing. Think of it like a stack of plates!"
    },
    {
        id: 3,
        question: "What is the time complexity of looking up a value in a Hash Map (average case)?",
        options: [
            "O(n)",
            "O(log n)",
            "O(1)",
            "O(n log n)"
        ],
        correct: 2,
        fact: "Hash Maps provide constant time O(1) lookups on average because they use a hashing function to map keys directly to indices in an array."
    },
    {
        id: 4,
        question: "Which of these is NOT a relational database?",
        options: [
            "PostgreSQL",
            "MySQL",
            "MongoDB",
            "SQLite"
        ],
        correct: 2,
        fact: "MongoDB is a NoSQL database that stores data in JSON-like documents, unlike SQL databases which use tables and rows."
    },
    {
        id: 5,
        question: "What does 'API' stand for?",
        options: [
            "Application Programming Interface",
            "Advanced Protocol Interface",
            "Automated Program Integration",
            "Application Process Integration"
        ],
        correct: 0,
        fact: "APIs allow different software applications to communicate. When you use an app like Instagram, it sends data to a server via an API!"
    }
]

export function QuestionOfTheDay() {
    const [mounted, setMounted] = useState(false)
    const [question, setQuestion] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    // Answer State
    const [selectedOption, setSelectedOption] = useState<number | null>(null)
    const [isAnswered, setIsAnswered] = useState(false)
    const [isCorrect, setIsCorrect] = useState(false)

    useEffect(() => {
        setMounted(true)

        const fetchQuestion = async () => {
            try {
                // Check if we already have today's Q cached in local storage to avoid API hit
                const todayStr = new Date().toISOString().split('T')[0]
                const cachedQ = localStorage.getItem("qotd_data")

                if (cachedQ) {
                    const parsed = JSON.parse(cachedQ)
                    if (parsed.date === todayStr) {
                        setQuestion(parsed)
                        setLoading(false)
                        restoreAnswerState(parsed)
                        return
                    }
                }

                // Fetch new from API
                const res = await fetch('/api/qotd')
                const data = await res.json()

                if (data && !data.error) {
                    setQuestion(data)
                    // Cache it
                    localStorage.setItem("qotd_data", JSON.stringify(data))
                    restoreAnswerState(data)
                }
            } catch (error) {
                console.error("Failed to fetch QOTD:", error)
            } finally {
                setLoading(false)
            }
        }

        fetchQuestion()
    }, [])

    const restoreAnswerState = (currentQ: any) => {
        // Check if user answered this specific question
        const savedState = localStorage.getItem("qotd_status")
        if (savedState) {
            const parsed = JSON.parse(savedState)
            // Use ID or date to verify match. Since we use date for daily, date is good.
            if (parsed.date === currentQ.date) {
                setSelectedOption(parsed.selected)
                setIsAnswered(true)
                setIsCorrect(parsed.selected === currentQ.correct_index)
            }
        }
    }

    const handleOptionClick = (index: number) => {
        if (isAnswered || !question) return

        const correct = index === question.correct_index
        setSelectedOption(index)
        setIsAnswered(true)
        setIsCorrect(correct)

        // Save answer state
        const todayStr = new Date().toISOString().split('T')[0]
        localStorage.setItem("qotd_status", JSON.stringify({
            date: todayStr,
            selected: index
        }))
    }

    if (!mounted) return null

    if (loading) {
        return (
            <Card className="border-primary/20 bg-gradient-to-br from-card to-primary/5 h-[344px] flex items-center justify-center">
                <div className="flex flex-col items-center gap-2 animate-pulse">
                    <Brain className="w-8 h-8 text-primary/40" />
                    <span className="text-xs text-muted-foreground">Loading Question...</span>
                </div>
            </Card>
        )
    }

    if (!question) return null

    return (
        <Card
            className="border-primary/20 bg-gradient-to-br from-card to-primary/5 overflow-hidden h-[344px] flex flex-col"
        >
            <CardHeader className="pb-1.5 pt-3 px-3 flex-shrink-0">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <Brain className="w-4 h-4 text-primary" />
                        <CardTitle className="text-sm">Question of the Day</CardTitle>
                    </div>
                    <Badge variant="outline" className="bg-background/50 text-[10px] h-5">Daily Trivia</Badge>
                </div>
                <CardDescription className="text-xs">Test your tech knowledge!</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 px-3 pb-3 flex-1 flex flex-col overflow-hidden">
                <div className="font-medium text-sm min-h-[40px]">
                    {question.question}
                </div>

                {!isAnswered ? (
                    <div className="grid grid-cols-1 gap-2">
                        {question.options.map((option: string, idx: number) => (
                            <Button
                                key={idx}
                                variant={"outline"}
                                className="justify-start text-left h-8 py-1 px-3 transition-all duration-300 text-xs hover:border-primary/50 hover:bg-accent"
                                onClick={() => handleOptionClick(idx)}
                            >
                                <span className="mr-2 text-xs font-mono opacity-70">{String.fromCharCode(65 + idx)}.</span>
                                <span className="flex-1 truncate">{option}</span>
                            </Button>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col h-full animate-in fade-in zoom-in-95 duration-300">
                        {/* Selected Result Display */}
                        <div className={`p-3 rounded-md mb-3 border ${isCorrect ? 'bg-green-500/10 border-green-500/20' : 'bg-red-500/10 border-red-500/20'}`}>
                            <div className="flex items-center space-x-2 mb-1">
                                {isCorrect ? <CheckCircle2 className="w-4 h-4 text-green-600" /> : <XCircle className="w-4 h-4 text-red-600" />}
                                <span className={`text-xs font-bold ${isCorrect ? 'text-green-700' : 'text-red-700'}`}>
                                    {isCorrect ? "Correct!" : "Not quite..."}
                                </span>
                            </div>
                            <div className="text-xs opacity-90">
                                <span className="font-semibold">Answer: </span>
                                {question.options[question.correct_index]}
                            </div>
                        </div>

                        {/* Quote/Fact Section */}
                        <div className="flex-1 p-3 rounded-md bg-primary/5 border border-primary/10 overflow-y-auto">
                            <div className="flex items-start space-x-2">
                                <Lightbulb className="w-3 h-3 text-primary mt-0.5" />
                                <p className="text-xs text-muted-foreground leading-relaxed">
                                    <span className="font-semibold text-foreground mr-1">Did you know?</span>
                                    {question.fact}
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
