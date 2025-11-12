"use client";

import { signIn } from "@/lib/auth-client";
import { useState } from "react";
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
import { FaMicrosoft } from  "react-icons/fa6";

interface FormLogoProps {
  className?: string;
  children: React.ReactNode;
  [key: string]: any;
}

export function FormLogo({
  className,
  children,
  ...props
}: FormLogoProps) {

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
        <Card className="overflow-hidden p-0">
          <CardContent className="grid p-0 md:grid-cols-2">
            {children}
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
