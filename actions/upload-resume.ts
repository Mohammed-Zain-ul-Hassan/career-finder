'use server'

import { createClient } from '@/lib/supabase/server'
import { parsePdf } from '@/lib/pdf-loader'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { revalidatePath } from 'next/cache'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

export async function uploadResume(formData: FormData) {
    const file = formData.get('file') as File
    if (!file) {
        return { error: 'No file provided' }
    }

    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
        return { error: 'Unauthorized: Please log in first' }
    }

    const userId = user.id

    try {
        // 1. Upload to Supabase Storage
        console.log('Starting upload to storage...')
        const fileExt = file.name.split('.').pop()
        const filePath = `${userId}/${Date.now()}.${fileExt}`

        const { error: uploadError } = await supabase.storage
            .from('resumes')
            .upload(filePath, file)

        if (uploadError) {
            console.error('Upload error details:', uploadError)
            return { error: `Failed to upload file: ${uploadError.message}` }
        }
        console.log('Upload successful')

        // 2. Parse PDF
        console.log('Parsing PDF...')
        const arrayBuffer = await file.arrayBuffer()
        const buffer = Buffer.from(arrayBuffer)
        const text = await parsePdf(buffer)
        console.log('PDF parsed, text length:', text.length)

        // 3. AI Extraction
        console.log('Starting AI extraction with gemini-2.5-flash-lite...')
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" })
        const prompt = `You are a Resume Parser. Extract the following JSON structure from the resume text below. Return ONLY the JSON, no markdown formatting.
    
    Structure:
    { 
      "contactInfo": { "email": string, "phone": string, "linkedin": string, "website": string }, 
      "summary": string, 
      "skills": { "category": string, "items": string[] }[], 
      "experience": { "role": string, "company": string, "duration": string, "keyAchievements": string[] }[], 
      "education": { "degree": string, "school": string, "year": string }[], 
      "technicalProficiency": { "tech": string, "level": "Beginner" | "Intermediate" | "Advanced" | "Expert" }[] 
    }

    Resume Text:
    ${text}`

        const result = await model.generateContent(prompt)
        const response = await result.response
        const textResponse = response.text()
        console.log('AI response received')

        // Clean up markdown code blocks if present
        const jsonString = textResponse.replace(/```json/g, '').replace(/```/g, '').trim()
        const structuredData = JSON.parse(jsonString)

        // 4. Save to Database
        console.log('Saving to database...')
        const { error: dbError } = await supabase
            .from('resumes')
            .insert({
                user_id: userId,
                file_path: filePath,
                original_name: file.name,
                structured_data: structuredData
            })

        if (dbError) {
            console.error('DB Insert error details:', dbError)
            return { error: `Failed to save resume data: ${dbError.message}` }
        }

        revalidatePath('/dashboard')
        return { success: true }

    } catch (error: any) {
        console.error('Processing error stack:', error.stack)
        return { error: `Failed to process resume: ${error.message}` }
    }
}
