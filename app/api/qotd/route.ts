import { NextResponse } from "next/server"
import path from "path"
import { promises as fs } from "fs"

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        // userId is no longer strictly needed for lookup, but good to have context if we ever log it
        const userId = searchParams.get('userId')
        const today = new Date().toISOString().split('T')[0]

        // Read the JSON file
        const jsonDirectory = path.join(process.cwd(), 'app/api/qotd')
        const fileContents = await fs.readFile(jsonDirectory + '/questions.json', 'utf8')
        const questions = JSON.parse(fileContents)

        // 1. Try to find a question explicitly matching today's date
        let selectedQuestion = questions.find((q: any) => q.date === today)

        // 2. Fallback: If no date match, pick a consistent random one? 
        // User requested "If match found, fetch it". 
        // If NO match found, we should probably pick a random one so the UI isn't empty.
        // To make it semi-consistent without DB, we could hash the date? 
        // For now, let's just pick a random one from the pool.
        if (!selectedQuestion) {
            console.log(`No question found for date ${today}, picking random fallback.`)
            // Filter out questions that have future dates? Or just pick any without a date?
            // Let's pick from any question in the pool to ensure availability.
            const randomIndex = Math.floor(Math.random() * questions.length)
            selectedQuestion = questions[randomIndex]
        }

        // Return the question structured for the frontend
        return NextResponse.json({
            ...selectedQuestion,
            date: today // Ensure the frontend sees it as "today's" question even if it was a random pick
        })

    } catch (error) {
        console.error("QOTD JSON API Error:", error)
        return NextResponse.json({
            id: "fallback",
            date: new Date().toISOString().split('T')[0],
            question: "Which data structure follows LIFO?",
            options: ["Queue", "Tree", "Stack", "Graph"],
            correct_index: 2,
            fact: "LIFO stands for Last-In, First-Out, which is how a Stack operates."
        })
    }
}
