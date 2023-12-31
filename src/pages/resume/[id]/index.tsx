import Head from "next/head"
import { useRouter } from "next/router"
import { Resume } from "~/components/resume"
import { api } from "~/utils/api"

export default function ResumeView() {
  const router = useRouter()
  const { id: resumeId, name } = router.query

  const { data, status } = api.resume.readById.useQuery(
    { resumeId: resumeId as string },
    { enabled: !!resumeId }
  )

  if (status === "error")
    return (
      <div>
        <Head>
          <title>gptBJ</title>
          <meta name="description" content="Generated by create-t3-app" />
          <link rel="icon" href="/favicon.ico" />
        </Head>
        {status}
      </div>
    )

  if (status === "success") {
    return (
      <>
        <Head>
          <title>gptBJ</title>
          <meta name="description" content="Generated by create-t3-app" />
          <link rel="icon" href="/favicon.ico" />
        </Head>
        {/* <div className="min-h-screen flex justify-center items-center"> */}
        <Resume data={{ ...data, firstAndLastName: name as string }} />
        {/* </div> */}
      </>
    )
  }

  return (
    <>
      <Head>
        <title>gptBJ</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="grid h-full place-items-center">Loading...</main>
    </>
  )
}
