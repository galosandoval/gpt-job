import { signIn } from "next-auth/react"
import Head from "next/head"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { api } from "~/utils/api"
import { useRouter } from "next/router"
import Link from "next/link"
import { MyErrorMessage } from "~/components/my-error-message"

const signUpSchema = z
  .object({
    email: z.string().email().max(255),
    password: z.string().min(8).max(50),
    passwordConfirmation: z.string().min(8).max(50)
  })
  .refine((data) => data.passwordConfirmation === data.password, {
    message: "Passwords don't match",
    path: ["passwordConfirmation"]
  })

type SignUpFormValues = z.infer<typeof signUpSchema>

export default function Home() {
  const router = useRouter()

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError
  } = useForm<SignUpFormValues>({
    resolver: zodResolver(signUpSchema)
  })

  const { mutate } = api.user.create.useMutation({
    onSuccess: async (_, { password, email }) => {
      const response = await signIn("credentials", {
        email,
        password,
        redirect: false
      })

      if (response?.ok) {
        await router.push("/onboarding/step1")
      }
    },
    onError: (error) => {
      console.log(error.message)
      setError("email", {
        message: error.message
      })
    }
  })

  const onSubmit = (data: SignUpFormValues) => {
    mutate(data)
  }

  return (
    <>
      <Head>
        <title>Sign Up</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex flex-col min-h-screen justify-center items-center gap-10">
        <form
          className="flex flex-col items-center justify-center gap-4"
          onSubmit={handleSubmit(onSubmit)}
        >
          <input
            type="text"
            placeholder="email"
            className="input input-bordered w-full max-w-xs"
            {...register("email")}
          />
          <MyErrorMessage errors={errors} name={"email"} />

          <input
            placeholder="password"
            type="password"
            className="input input-bordered w-full max-w-xs"
            {...register("password")}
          />

          <MyErrorMessage errors={errors} name={"password"} />

          <input
            placeholder="confirm password"
            type="password"
            className="input input-bordered w-full max-w-xs"
            {...register("passwordConfirmation")}
          />

          <MyErrorMessage errors={errors} name={"passwordConfirmation"} />

          <button type="submit" className="btn btn-primary btn-outline">
            Sign Up
          </button>
        </form>
        <Link href="/login">Login</Link>
      </main>
    </>
  )
}
