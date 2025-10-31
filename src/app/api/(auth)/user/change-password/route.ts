import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/index";
import { users, accounts } from "@/lib/schema";
import { eq } from "drizzle-orm";

export async function PUT(request: NextRequest) {
  try {
    // Get the session
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse the request body
    const { newPassword, firstTime } = await request.json();

    // Validate the new password
    if (!newPassword || newPassword.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters long" },
        { status: 400 }
      );
    }

    // Update the password in the accounts table
    const result = await auth.api.changePassword(session.user.id, newPassword);

    // Update user status from 'new' to 'active'
    if (firstTime) {
      await db
        .update(users)
        .set({
          status: "active",
          updatedAt: new Date(),
        })
        .where(eq(users.id, session.user.id));              
    }

    return NextResponse.json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    console.error("Error changing password:", error);
    return NextResponse.json(
      { error: "Failed to change password" },
      { status: 500 }
    );
  }
}
