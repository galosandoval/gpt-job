import { signOut } from "next-auth/react"
import Head from "next/head"
import { useRouter } from "next/router"
import { Fragment, useEffect } from "react"
import { api } from "~/utils/api"
import { z } from "zod"
import { type ChatParams } from "../api/resume/chat"
import { useChat } from "ai/react"

const resumeId = "pm9ctl649di9bi5ftjsfpexw"

const generateForm = z.object({
  jobDescription: z.string()
})
type GenerateForm = z.infer<typeof generateForm>

export default function Dashboard() {
  const router = useRouter()

  const { data: users, status } = api.user.readAll.useQuery()
  const { data: resume, status: resumeStatus } = api.resume.readById.useQuery(
    { resumeId },
    { enabled: !!resumeId }
  )

  useEffect(() => {
    console.log(status)
    console.log(users)
  }, [status])

  const handleSignOut = async () => {
    await signOut({ redirect: false })

    await router.push("/")
  }

  interface PdfRequestBody {
    resumeId: string
  }

  const handleDownloadPdf = async () => {
    const requestBody: PdfRequestBody = { resumeId }

    try {
      const response = await fetch("/api/resume/pdf", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(requestBody)
      })

      const blob = await response.blob()

      const link = document.createElement("a")
      link.href = window.URL.createObjectURL(blob)
      link.download = `your-file-name.pdf`
      link.click()
    } catch (error) {
      console.error(error)
    }
  }

  const params: Omit<ChatParams, "messages"> = {
    education:
      "Lambda School is a 6+ month Computer Science & Software Engineering Academy that provides an immersive hands-on curriculum with a focus on computer science, web and mobile development, UX design, and data science.\n      • Approached all coding challenges using pair programming\n      • Utilized Git workflow on all projects\n      • Gained hands-on experience with client and server testing\n      • Completed all curriculum course work including: React, Redux, Node, Express, Jest,and Python\n      • Wrote production-ready code using ReactJS, Redux, and CSS on the front end and NodeJS and Express on the back end to build single page applications",
    experience:
      "General Manager\n        Go Get Em Tiger · Full-time\n        Feb 2017 - Mar 2020 · 3 yrs 2 mos\n        A high volume coffee bar in Downtown LA\n        • Optimized all systems in the store including administration and the flow of service\n        • Received 2 bonuses after reducing expenses by minimizing waste and correct allocation of staff\n        • Interviewed, hired, and trained new staff",
    skills: "React, Redux, Node, Express, Jest, Python",
    name: "John Doe",
    profession: "Software Engineer",
    interests:
      "When I’m not coding you’ll find me cooking, climbing, making ceramic mugs, or playing flag football."
  }

  const { messages, input, handleInputChange, handleSubmit } = useChat({
    api: "/api/resume/chat",
    body: {
      ...params
    }
  })

  console.log(messages)
  // const { register, handleSubmit } = useForm<GenerateForm>({
  //   resolver: zodResolver(generateForm)
  // })

  const onSubmit = async (values: GenerateForm) => {
    const params: Omit<ChatParams, "messages"> = {
      education:
        "Lambda School is a 6+ month Computer Science & Software Engineering Academy that provides an immersive hands-on curriculum with a focus on computer science, web and mobile development, UX design, and data science.\n      • Approached all coding challenges using pair programming\n      • Utilized Git workflow on all projects\n      • Gained hands-on experience with client and server testing\n      • Completed all curriculum course work including: React, Redux, Node, Express, Jest,and Python\n      • Wrote production-ready code using ReactJS, Redux, and CSS on the front end and NodeJS and Express on the back end to build single page applications",
      experience:
        "General Manager\n        Go Get Em Tiger · Full-time\n        Feb 2017 - Mar 2020 · 3 yrs 2 mos\n        A high volume coffee bar in Downtown LA\n        • Optimized all systems in the store including administration and the flow of service\n        • Received 2 bonuses after reducing expenses by minimizing waste and correct allocation of staff\n        • Interviewed, hired, and trained new staff",
      skills: "React, Redux, Node, Express, Jest, Python",
      name: "John Doe",
      profession: "Software Engineer",
      interests:
        "When I’m not coding you’ll find me cooking, climbing, making ceramic mugs, or playing flag football."
    }

    try {
      const response = await fetch("/api/resume/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(params)
      })

      console.log(await response.json())
    } catch (error) {
      console.error(error)
    }
  }
  return (
    <>
      <Head>
        <title>Section1</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <button className="btn btn-accent btn-active" onClick={handleSignOut}>
        Log out
      </button>
      <div className="flex w-full items-center justify-center"></div>

      <form onSubmit={handleSubmit}>
        <input
          placeholder="desciption"
          onChange={handleInputChange}
          value={input}
        />
        <button type="submit" className="btn btn-primary">
          generate
        </button>
      </form>
      {messages.map((message) => (
        <Fragment key={message.id}>{message.content}</Fragment>
      ))}
    </>
  )
}
