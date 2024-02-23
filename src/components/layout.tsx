import { signOut, useSession } from "next-auth/react"
import Link from "next/link"
import { useRouter } from "next/router"

export default function Layout({ children }: { children: React.ReactNode }) {
  const { data } = useSession()

  let navbar: React.ReactNode = null

  if (!data) {
    navbar = <PublicNavbar />
  } else {
    navbar = <ProtectedNavbar />
  }

  return (
    <>
      {navbar}

      {children}
    </>
  )
}

function PublicNavbar() {
  return null
}

function ProtectedNavbar() {
  const router = useRouter()

  const handleSignOut = async () => {
    await signOut({ redirect: false })

    await router.push("/")
  }

  return (
    <nav className="flex gap-3">
      <Link href="/dashboard">dashboard</Link>
      <Link href="/onboarding/step1">onboarding</Link>
      <Link href="/resume">resumes</Link>
      <button onClick={handleSignOut}>sign out</button>
    </nav>
  )
}
