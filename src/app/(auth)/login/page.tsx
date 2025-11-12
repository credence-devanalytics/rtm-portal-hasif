"use client"
import { FormLogo } from "@/components/Form-Logo"
import { signIn, useSession } from "@/lib/auth-client"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { PasswordInput } from "@/components/ui/password-input"
import { FaMicrosoft } from  "react-icons/fa6";

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

  function LoginForm() {
    interface LoginButtonProps {
      variant?: "default" | "outline" | "ghost";
      size?: "default" | "sm" | "lg";
      className?: string;
    }

    function LoginButton({
      variant = "default",
      size = "default",
      className,
    }: LoginButtonProps) {
      const [isLoading, setIsLoading] = useState(false);

      const handleMicrosoftSignIn = async () => {
        setIsLoading(true);
        try {
          await signIn.social({
            provider: "microsoft",
            callbackURL: "/",
          });
        } catch (error) {
          console.error("Sign in error:", error);
        } finally {
          setIsLoading(false);
        }
      };

      return (
        <Button
          onClick={handleMicrosoftSignIn}
          disabled={isLoading}
          variant={variant}
          size={size}
          className={className}
        >
          <FaMicrosoft className="mr-2 h-4 w-4" />
          {isLoading ? "Signing in..." : "Sign in with Microsoft"}
        </Button>
      );
    }

    return (
      <form className="p-6 md:p-8" onSubmit={handleLogin}>
        <FieldGroup>
          <div className="flex flex-col items-center gap-2 text-center">
            <h1 className="text-2xl font-bold">Welcome back</h1>
            <p className="text-muted-foreground text-balance">
              Login to your account
            </p>
          </div>
          {error && (
            <div className="text-red-500 text-sm text-center p-2 bg-red-50 rounded">
              {error}
            </div>
          )}
          <Field>
            <LoginButton />
          </Field>
          <FieldSeparator />
          <FieldDescription className="text-center">
            Have a problem? <a href="/contact">Contact us</a>
          </FieldDescription>
        </FieldGroup>
      </form>
    )
  }
  
  
  return (
    <div className="bg-muted flex min-h-svh flex-col items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm md:max-w-4xl">
        <FormLogo>
          <LoginForm />
        </FormLogo>
      </div>
    </div>
  )
}
