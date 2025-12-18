import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'

export async function POST(request: NextRequest) {
    const data = await request.formData()
    const file: File | null = data.get('file') as unknown as File

    if (!file) {
        return NextResponse.json({ success: false, message: 'No file uploaded' }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Ensure public/notes directory exists
    const uploadDir = path.join(process.cwd(), 'public', 'notes')
    try {
        await mkdir(uploadDir, { recursive: true })
    } catch (e) {
        console.error('Error creating directory:', e)
    }

    // Create unique filename to avoid overwrites
    // Sanitize original filename
    const sanitizedOriginalName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    const filename = sanitizedOriginalName.replace(/\.[^/.]+$/, "") + '-' + uniqueSuffix + path.extname(sanitizedOriginalName)
    const filepath = path.join(uploadDir, filename)

    try {
        await writeFile(filepath, buffer)
        const fileUrl = `/notes/${filename}`
        return NextResponse.json({ success: true, url: fileUrl, filename: filename })
    } catch (e) {
        console.error('Error saving file:', e)
        return NextResponse.json({ success: false, message: 'Error saving file' }, { status: 500 })
    }
}
