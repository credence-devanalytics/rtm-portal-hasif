"use client"
import { LoginForm } from "@/components/LoginForm"
import { signIn, useSession } from "@/lib/auth-client"
import { useRouter } from "next/navigation"
import { useState } from "react"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()
  const { data: session, isPending } = useSession()

  if (session && !isPending) {
    router.push("/")
    return (
      <div>Redirecting...</div>
    )
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const result = await signIn.email({
        email,
        password,
      })
      
      if (result.error) {
        setError(result.error.message || "Invalid email or password")
      } else {
        const response = await fetch('/api/user/profile', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        const userData = await response.json();
        // console.log("Fetched user profile data:", result);
        // console.log("Fetched user profile data:", userData);

        // Check if user status is 'new' and redirect to change-password
        if (userData?.user.status === "new") {
          router.push("/change-password")
        } else {
          router.push("/")
        }
      }
    } catch (err) {
      setError("Invalid email or password: " + (err instanceof Error ? err.message : String(err)))
    } finally {
      setLoading(false)
    }
  }
  
  return (
    <div className="bg-muted flex min-h-svh flex-col items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm md:max-w-4xl">
        <LoginForm 
          handleLogin={handleLogin}
          email={email}
          setEmail={setEmail}
          password={password}
          setPassword={setPassword}
          loading={loading}
          error={error}
          className="" 
        />
      </div>
    </div>
  )
}
