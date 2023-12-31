import { OpenAIStream, StreamingTextResponse } from "ai"
import { type NextRequest } from "next/server"
import {
  type ChatCompletionRequestMessage,
  Configuration,
  OpenAIApi
} from "openai-edge"
import { z } from "zod"

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY
})
const openai = new OpenAIApi(configuration)

export const config = {
  runtime: "edge"
}

export const chatParams = z.object({
  experience: z.string(),
  education: z.string(),
  profession: z.string(),
  interests: z.string().optional(),
  messages: z.array(
    z.object({
      role: z.enum(["user", "assistant", "system"]),
      content: z.string()
    })
  )
})

export type ChatParams = z.infer<typeof chatParams>

export default async function handler(req: NextRequest) {
  const request = await req.json()

  const input = chatParams.parse(request)

  const { education, experience, interests, messages, profession } = input

  const chat: ChatCompletionRequestMessage[] = [
    {
      role: "system",
      content: `You are a helpful resume building assistant. Generate a resume that is 1 page long based on the following user's information: Profession: ${profession} Work Experience: ${experience}, Interests: ${interests}, Education: ${education}. The following is the job description: ${messages[0]?.content}. Use the job description provided to fill in the resume with keywords for a recruiter or recruiting algorithm. Do not include any explanations, only provide a RFC8259 compliant JSON response following this format without deviation:
      {
        "profession": "Profession of user.",
        "education": [{
          "description": "Description of education.",
          "schoolName": "Name of school.",
          "startDate": "Start date of education.",
          "endDate": "End date of education.",
          "degree": "Degree of education.",
          "gpa": "GPA of education."
        }],
        "skills": ["Array of skills that are relevant to the job description. Includes 5 to 10 hard or soft skills."],
        "experience": [{
          "description": "Description of work experience that is 3-6 sentences.",
          "companyName": "Name of company.",
          "startDate": "Start date of work experience.",
          "endDate": "End date of work experience.",
          "title": "Title of work experience."
        }],
        "interests": "Friendly description of interests, for example: 'When I'm not {profession}, I...'",
        "summary": "Brief summary of resume, keep it less than 500 characters"
      }`
    }
  ]

  const response = await openai.createChatCompletion({
    model: "gpt-3.5-turbo-0613",
    stream: true,
    messages: chat
  })

  // Convert the response into a friendly text-stream
  const stream = OpenAIStream(response)
  // Respond with the stream
  return new StreamingTextResponse(stream)
}
