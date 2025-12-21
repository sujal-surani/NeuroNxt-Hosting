import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { GoogleGenerativeAI } from "@google/generative-ai"

// Init Supabase Admin Client (Service Role)
// We need service role to WRITE to valid_questions if RLS denies public write
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY! // MUST BE IN .env.local

const supabase = createClient(supabaseUrl, supabaseServiceKey)

// Init Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

export async function GET() {
    try {
        const today = new Date().toISOString().split('T')[0]

        // 1. Check DB for today's question
        const { data: existingQuestion, error: dbError } = await supabase
            .from('daily_questions')
            .select('*')
            .eq('date', today)
            .single()

        if (existingQuestion) {
            return NextResponse.json(existingQuestion)
        }

        if (dbError && dbError.code !== 'PGRST116') { // PGRST116 is "No rows found"
            console.error("Database fetch error:", dbError)
            // Allow falling through to generation if DB just missed
        }

        // 2. Generate New Question via Gemini
        if (!process.env.GEMINI_API_KEY) {
            console.warn("Gemini API Key missing, using fallback")
            // Fallback immediately if no key
            const fallback = {
                question: "Who is known as the father of modern computer science?",
                options: ["Alan Turing", "Charles Babbage", "Bill Gates", "Steve Jobs"],
                correct_index: 0,
                fact: "Alan Turing proposed the Turing Machine, a theoretical model of a general-purpose computer."
            }
            return NextResponse.json({ ...fallback, date: today })
        }

        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-001" })

        const prompt = `
      Generate a unique, engaging, multiple-choice trivia question about computer science, software engineering, or modern tech history.
      Format the output strictly as a JSON object with no markdown block, like this:
      {
        "question": "The question text?",
        "options": ["Option A", "Option B", "Option C", "Option D"],
        "correct_index": 0,
        "fact": "A fun, short 'Did you know?' explanation about the answer."
      }
      Ensure the difficulty is moderate.
    `

        let generatedQ
        try {
            const result = await model.generateContent(prompt)
            const response = await result.response
            const text = response.text()

            // Clean markdown if Gemini adds it
            const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim()
            generatedQ = JSON.parse(jsonStr)
        } catch (aiError) {
            console.error("AI Generation failed, using fallback:", aiError)
            generatedQ = {
                question: "What does HTML stand for?",
                options: ["Hyper Text Markup Language", "High Tech Multi Language", "Hyperlink and Text Markup Language", "Home Tool Markup Language"],
                correct_index: 0,
                fact: "HTML was first proposed by Tim Berners-Lee in 1989."
            }
        }

        // 3. Save to DB
        const { data: savedQuestion, error: insertError } = await supabase
            .from('daily_questions')
            .insert({
                date: today,
                question: generatedQ.question,
                options: generatedQ.options,
                correct_index: generatedQ.correct_index,
                fact: generatedQ.fact
            })
            .select()
            .single()

        if (insertError) {
            console.error("Failed to save generated question:", insertError)
            return NextResponse.json({ ...generatedQ, date: today })
        }

        return NextResponse.json(savedQuestion)

    } catch (error) {
        console.error("QOTD API Critical Error (serving fallback):", error)
        // Absolute final fallback to prevent 500
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
