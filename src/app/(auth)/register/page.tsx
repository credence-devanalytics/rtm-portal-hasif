"use client"

import { useState } from "react"
import { signUp } from "@/lib/auth-client"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function RegisterPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      console.log("Attempting to register user:", { email, name })
      
      const result = await signUp.email({
        email,
        password,
        name,
      })
      
      console.log("Signup result:", result)
      
      if (result.error) {
        console.error("Signup error:", result.error)
        setError(result.error.message || "Registration failed. Please try again.")
      } else if (result.data) {
        console.log("Signup successful:", result.data)
        router.push("/") // Redirect to home page
      } else {
        setError("Registration failed. Please try again.")
      }
    } catch (err) {
      console.error("Signup catch error:", err)
      setError(`Registration failed: ${err instanceof Error ? err.message : String(err)}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="">
          <CardTitle className="text-2xl font-bold text-center">Register</CardTitle>
          <CardDescription className="text-center">
            Create a new account to get started
          </CardDescription>
        </CardHeader>
        <CardContent className="">
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Full Name
              </label>
              <Input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="Enter your full name"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="Enter your email"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Create a password"
                minLength={6}
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              // disabled
              className="w-full"
            >
              {loading ? "Creating account..." : "Register"}
            </Button>
          </form>

          <p className="text-center text-sm text-gray-600 mt-4">
            Already have an account?{" "}
            <a href="/auth/login" className="text-blue-600 hover:text-blue-500">
              Login
            </a>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
