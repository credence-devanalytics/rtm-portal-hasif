import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/index';
import { users } from '@/lib/schema';
import { eq } from 'drizzle-orm';

// PUT - Update user profile (name and email)
export async function PUT(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name, email } = await request.json();

    if (!name && !email) {
      return NextResponse.json({ error: 'No updates provided' }, { status: 400 });
    }

    // Check if email is already taken by another user
    if (email) {
      const existingUser = await db.select()
        .from(users)
        .where(eq(users.email, email))
        .limit(1);
      
      if (existingUser.length > 0 && existingUser[0].id !== session.user.id) {
        return NextResponse.json({ error: 'Email already in use' }, { status: 409 });
      }
    }

    // Build update object
    const updateData: any = {
      updatedAt: new Date()
    };

    if (name) updateData.name = name;
    if (email) updateData.email = email;

    // Update user
    const [updatedUser] = await db.update(users)
      .set(updateData)
      .where(eq(users.id, session.user.id))
      .returning({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        image: users.image
      });

    return NextResponse.json({ 
      message: 'Profile updated successfully',
      user: updatedUser
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is admin
    const currentUser = await db
      .select({ 
        name: users.name, 
        email: users.email,
        role: users.role,
        status: users.status,
        systemId: users.systemId,
        position: users.position,
        taskRole: users.taskRole
      })
      .from(users)
      .where(eq(users.id, session.user.id))
      .limit(1);

    return Response.json({ user: currentUser[0] });

  } catch (error) {
    console.error("Error fetching users:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}