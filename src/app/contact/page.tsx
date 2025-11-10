"use client"
import { LoginForm } from "@/components/LoginForm"
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
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AuroraBackground } from "@/components/ui/shadcn-io/aurora-background"
import MedinaLogo from "@/components/MedinaLogo"

function ContactForm({
    className,
    contactReason,
    setContactReason,
    fullName,
    setFullName,
    email,
    setEmail,
    dashboard,
    setDashboard,
    comments,
    setComments,
    loading,
    setLoading,
    error,
    setError,
  ...props
}) {
    const router = useRouter()
    
    const handleSubmit = async (e) => {
      e.preventDefault()
      setLoading(true)
      setError("")
      alert("Form submitted successfully!")
      setLoading(false)
      router.push("/") 
    }
    return (
      <div className={cn("flex flex-col gap-6", className)} {...props}>
        <Card className="overflow-hidden p-0">
          <CardContent className="grid p-0 md:grid-cols-2">
            <form className="p-6 md:p-8" onSubmit={handleSubmit}>
              <FieldGroup>
                <div className="flex flex-col items-center gap-2 text-center">
                  <h1 className="text-2xl font-bold">Contact Us</h1>
                  <p className="text-muted-foreground text-balance">
                    Get in touch with our support team
                  </p>
                </div>
                {error && (
                  <div className="text-red-500 text-sm text-center p-2 bg-red-50 rounded">
                    {error}
                  </div>
                )}
                
                <Field>
                  <FieldLabel htmlFor="contactReason">Contact Reason</FieldLabel>
                  <Select value={contactReason} onValueChange={setContactReason}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a reason" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="request-access">Request access</SelectItem>
                      <SelectItem value="report-issue">Report issue</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>

                {contactReason === "request-access" && (
                  <>
                    <Field>
                      <FieldLabel htmlFor="fullName">Full Name</FieldLabel>
                      <Input
                        id="fullName"
                        type="text"
                        placeholder="Your full name"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        required
                        disabled={loading}
                      />
                    </Field>
                    <Field>
                      <FieldLabel htmlFor="email">Email</FieldLabel>
                      <Input
                        id="email"
                        type="email"
                        placeholder="mail@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        disabled={loading}
                      />
                    </Field>
                  </>
                )}

                {contactReason === "report-issue" && (
                  <Field>
                    <FieldLabel htmlFor="dashboard">Dashboard</FieldLabel>
                    <Select value={dashboard} onValueChange={setDashboard}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select dashboard" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="socmed-account">SocMed Account</SelectItem>
                        <SelectItem value="socmed-sentiment">SocMed Sentiment</SelectItem>
                        <SelectItem value="rtmklik">RTMKlik</SelectItem>
                        <SelectItem value="astro">ASTRO</SelectItem>
                        <SelectItem value="unifitv">UnifiTV</SelectItem>
                        <SelectItem value="warta-berita">Warta Berita</SelectItem>
                        <SelectItem value="marketing">Marketing</SelectItem>
                      </SelectContent>
                    </Select>
                  </Field>
                )}

                {contactReason && (
                  <Field>
                    <FieldLabel htmlFor="comments">Comments</FieldLabel>
                    <Textarea
                      id="comments"
                      placeholder="Please describe your request or issue in detail..."
                      value={comments}
                      onChange={(e) => setComments(e.target.value)}
                      required
                      disabled={loading}
                      rows={4}
                    />
                  </Field>
                )}

                <Field>
                  <Button type="submit" disabled={loading || !contactReason || !comments || 
                    (contactReason === "request-access" && (!fullName || !email)) ||
                    (contactReason === "report-issue" && !dashboard)}>
                    {loading ? "Submitting..." : "Submit"}
                  </Button>
                </Field>
                <FieldDescription className="text-center">
                  Looking to log in? <a href="/login" className="hover:underline">Go to Login</a>
                </FieldDescription>
              </FieldGroup>
            </form>
            <div className="bg-muted relative hidden md:block overflow-hidden">
              <AuroraBackground className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-[800px] object-cover dark:brightness-[0.2] dark:grayscale items-center justify-center">
                <MedinaLogo className="-translate-x-16"/>
              </AuroraBackground>
            </div>
          </CardContent>
        </Card>
        <FieldDescription className="px-6 text-center">
          By clicking continue, you agree to our <a href="#">Terms of Service</a>{" "}
          and <a href="#">Privacy Policy</a>.
        </FieldDescription>
      </div>
    )
  }

export default function ContactPage() {
  const [contactReason, setContactReason] = useState("")
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [dashboard, setDashboard] = useState("")
  const [comments, setComments] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  return (
    <div className="bg-muted flex min-h-svh flex-col items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm md:max-w-4xl">
        <ContactForm 
          contactReason={contactReason}
          setContactReason={setContactReason}
          fullName={fullName}
          setFullName={setFullName}
          email={email}
          setEmail={setEmail}
          dashboard={dashboard}
          setDashboard={setDashboard}
          comments={comments}
          setComments={setComments}
          loading={loading}
          setLoading={setLoading}
          error={error}
          setError={setError}
          className="" 
        />
      </div>
    </div>
  )
}

