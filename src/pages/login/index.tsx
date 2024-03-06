import { zodResolver } from "@hookform/resolvers/zod"
import { signIn } from "next-auth/react"
import Head from "next/head"
import Link from "next/link"
import { useRouter } from "next/router"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { MyErrorMessage } from "~/components/my-error-message"

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(50)
})

type LoginFormValues = z.infer<typeof loginSchema>

export default function Login() {
  const router = useRouter()

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema)
  })

  const onSubmit = async (data: LoginFormValues) => {
    const response = await signIn("credentials", {
      email: data.email,
      password: data.password,
      redirect: false
    })

    if (response?.ok) {
      await router.push("/dashboard")
    }
  }

  return (
    <>
      <Head>
        <title>Log in</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex min-h-screen flex-col items-center justify-center gap-10">
        <form
          className="flex flex-col items-center justify-center gap-4"
          onSubmit={handleSubmit(onSubmit)}
        >
          <input
            id="email"
            type="text"
            placeholder="email"
            className="input input-bordered w-full max-w-xs"
            {...register("email")}
          />
          <MyErrorMessage errors={errors} name={"email"} />

          <input
            id="password"
            placeholder="password"
            type="password"
            className="input input-bordered w-full max-w-xs"
            {...register("password")}
          />

          <MyErrorMessage errors={errors} name={"password"} />

          <MyErrorMessage errors={errors} name={"passwordConfirmation"} />

          <button
            id="login-btn"
            type="submit"
            className="btn btn-primary btn-outline"
          >
            LogIn
          </button>
        </form>
        <Link href="/">Create an account</Link>
      </main>
    </>
  )
}
