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
import MedinaLogo from "./MedinaLogo"
import { AuroraBackground } from "./ui/shadcn-io/aurora-background"

export function LoginForm({
  className,
  handleLogin,
  email,
  setEmail,
  password,
  setPassword,
  loading,
  error,
  ...props
}) {  
  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="overflow-hidden p-0">
        <CardContent className="grid p-0 md:grid-cols-2">
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
              <Field>
                <div className="flex items-center">
                  <FieldLabel htmlFor="password">Password</FieldLabel>
                  <a
                    href="#"
                    className="ml-auto text-sm underline-offset-2 hover:underline"
                  >
                    Forgot your password?
                  </a>
                </div>
                <PasswordInput 
                  id="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required 
                  disabled={loading}
                />
              </Field>
              <Field>
                <Button type="submit" disabled={loading}>
                  {loading ? "Signing in..." : "Login"}
                </Button>
              </Field>
              <FieldDescription className="text-center">
                Have a problem? <a href="/contact">Contact us</a>
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
