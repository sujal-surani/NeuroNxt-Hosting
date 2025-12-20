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

    // Use a predictable pseudo-random index based on the date
    // This ensures all users see the same question on the same day
    const getDailyQuestionIndex = () => {
        const today = new Date()
        const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 1000 / 60 / 60 / 24)
        return dayOfYear % questions.length
    }

    const [currentQIndex, setCurrentQIndex] = useState(0)
    const [selectedOption, setSelectedOption] = useState<number | null>(null)
    const [isAnswered, setIsAnswered] = useState(false)
    const [isCorrect, setIsCorrect] = useState(false)

    useEffect(() => {
        setMounted(true)
        const index = getDailyQuestionIndex()
        setCurrentQIndex(index)

        // Check localStorage if user already answered today
        const todayStr = new Date().toISOString().split('T')[0]
        const saved = localStorage.getItem("qotd_status")

        if (saved) {
            const parsed = JSON.parse(saved)
            if (parsed.date === todayStr && parsed.index === index) {
                setSelectedOption(parsed.selected)
                setIsAnswered(true)
                setIsCorrect(parsed.selected === questions[index].correct)
            }
        }
    }, [])

    const handleOptionClick = (index: number) => {
        if (isAnswered) return

        const correct = index === questions[currentQIndex].correct
        setSelectedOption(index)
        setIsAnswered(true)
        setIsCorrect(correct)

        // Save to local storage
        const todayStr = new Date().toISOString().split('T')[0]
        localStorage.setItem("qotd_status", JSON.stringify({
            date: todayStr,
            index: currentQIndex,
            selected: index
        }))
    }

    if (!mounted) return null

    const question = questions[currentQIndex]

    return (
        <Card
            className="border-primary/20 bg-gradient-to-br from-card to-primary/5 overflow-hidden h-[344px] flex flex-col"
        >
            <CardHeader className="pb-2 pt-4 px-3 flex-shrink-0">
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
                        {question.options.map((option, idx) => (
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
                                {question.options[question.correct]}
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
