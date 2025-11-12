"use client"

import { createAuthClient } from "better-auth/react";
import { inferAdditionalFields } from "better-auth/client/plugins";

export const authClient = createAuthClient({
  baseURL: typeof window !== "undefined" ? window.location.origin : "",
	plugins: [inferAdditionalFields()],
})

export const { signIn, signOut, signUp, useSession, getSession } = authClient;
