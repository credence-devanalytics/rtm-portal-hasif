import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { users, accounts } from "@/lib/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

export async function PUT(request: NextRequest) {
  try {
    // Get the session
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse the request body
    const { newPassword } = await request.json();

    // Validate the new password
    if (!newPassword || newPassword.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters long" },
        { status: 400 }
      );
    }

    // Check if user status is 'new'
    const user = session.user as any;
    if (user.status !== "new") {
      return NextResponse.json(
        { error: "Password change is only for first-time users" },
        { status: 403 }
      );
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // Update the password in the accounts table
    await db
      .update(accounts)
      .set({
        password: hashedPassword,
      })
      .where(eq(accounts.userId, session.user.id));

    // Update user status from 'new' to 'active'
    await db
      .update(users)
      .set({
        status: "active",
        updatedAt: new Date(),
      })
      .where(eq(users.id, session.user.id));

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
