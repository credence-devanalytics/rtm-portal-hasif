import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { users, userAccess } from "@/lib/schema";
import { eq } from "drizzle-orm";

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
      .select({ role: users.role })
      .from(users)
      .where(eq(users.id, session.user.id))
      .limit(1);

    if (!currentUser.length || !["admin", "superadmin"].includes(currentUser[0].role)) {
      return Response.json({ error: "Forbidden" }, { status: 403 });
    }

    // Get all users
    const allUsers = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        image: users.image,
        createdAt: users.createdAt,
      })
      .from(users);

    // Fetch access permissions for all users
    const usersWithPermissions = await Promise.all(
      allUsers.map(async (user) => {
        const accessRecords = await db.select().from(userAccess).where(eq(userAccess.userId, user.id));
        
        const permissions: string[] = [];
        if (accessRecords.length > 0) {
          const access = accessRecords[0];
          const accessMapping: { [key: string]: string } = {
            socMedAcc: 'SocMedAcc',
            socMedSent: 'SocMedSent',
            rtmklik: 'RTMClick',
            mytv: 'MyTV',
            astro: 'ASTRO',
            unifitv: 'UnifiTV',
            wartaberita: 'Berita',
            marketing: 'Marketing'
          };
          
          Object.entries(access).forEach(([key, value]) => {
            if (value === true && accessMapping[key]) {
              permissions.push(accessMapping[key]);
            }
          });
        }
        
        return {
          ...user,
          permissions
        };
      })
    );

    return Response.json({ users: usersWithPermissions });
  } catch (error) {
    console.error("Error fetching users:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST - Create new user
export async function POST(request: Request) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is admin
    const currentUser = await db
      .select({ role: users.role })
      .from(users)
      .where(eq(users.id, session.user.id))
      .limit(1);

    if (!currentUser.length || !["admin", "superadmin"].includes(currentUser[0].role)) {
      return Response.json({ error: "Forbidden" }, { status: 403 });
    }

    const { name, email, role, permissions } = await request.json();

    if (!name || !email || !role) {
      return Response.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (!["user", "admin", "superadmin"].includes(role)) {
      return Response.json({ error: "Invalid role" }, { status: 400 });
    }

    // Check if user already exists
    const existingUser = await db.select().from(users).where(eq(users.email, email)).limit(1);
    if (existingUser.length > 0) {
      return Response.json({ error: "User already exists" }, { status: 409 });
    }

    // Create new user
    const newUserId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date();

    const [createdUser] = await db.insert(users).values({
      id: newUserId,
      name,
      email,
      role,
      emailVerified: false,
      createdAt: now,
      updatedAt: now
    }).returning();

    // Create user access permissions
    if (permissions && permissions.length > 0) {
      const permissionMapping: { [key: string]: string } = {
        'SocMedAcc': 'socMedAcc',
        'SocMedSent': 'socMedSent',
        'RTMClick': 'rtmklik',
        'MyTV': 'mytv',
        'ASTRO': 'astro',
        'UnifiTV': 'unifitv',
        'Berita': 'wartaberita',
        'Marketing': 'marketing'
      };

      const accessData: any = {
        userId: newUserId,
        socMedAcc: false,
        socMedSent: false,
        rtmklik: false,
        mytv: false,
        astro: false,
        unifitv: false,
        wartaberita: false,
        marketing: false,
        permission: 'read',
        createdAt: now,
        updatedAt: now
      };

      // Set permissions based on the provided array
      permissions.forEach((permission: string) => {
        const dbColumn = permissionMapping[permission];
        if (dbColumn) {
          accessData[dbColumn] = true;
        }
      });

      await db.insert(userAccess).values(accessData);
    }

    return Response.json({ 
      message: 'User created successfully',
      user: { ...createdUser, permissions: permissions || [] }
    });
  } catch (error) {
    console.error('Error creating user:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is admin
    const currentUser = await db
      .select({ role: users.role })
      .from(users)
      .where(eq(users.id, session.user.id))
      .limit(1);

    if (!currentUser.length || !["admin", "superadmin"].includes(currentUser[0].role)) {
      return Response.json({ error: "Forbidden" }, { status: 403 });
    }

    const { userId, name, email, role, permissions } = await request.json();

    if (!userId) {
      return Response.json({ error: "User ID is required" }, { status: 400 });
    }

    if (role && !["user", "admin", "superadmin"].includes(role)) {
      return Response.json({ error: "Invalid role" }, { status: 400 });
    }

    // Check if user exists
    const existingUser = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    if (existingUser.length === 0) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }

    // Update user basic info
    const updateData: any = {
      updatedAt: new Date()
    };

    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (role) updateData.role = role;

    const [updatedUser] = await db.update(users)
      .set(updateData)
      .where(eq(users.id, userId))
      .returning();

    // Update user permissions
    if (permissions !== undefined) {
      const permissionMapping: { [key: string]: string } = {
        'SocMedAcc': 'socMedAcc',
        'SocMedSent': 'socMedSent',
        'RTMClick': 'rtmklik',
        'MyTV': 'mytv',
        'ASTRO': 'astro',
        'UnifiTV': 'unifitv',
        'Berita': 'wartaberita',
        'Marketing': 'marketing'
      };

      const accessData: any = {
        socMedAcc: false,
        socMedSent: false,
        rtmklik: false,
        mytv: false,
        astro: false,
        unifitv: false,
        wartaberita: false,
        marketing: false,
        updatedAt: new Date()
      };

      // Set permissions based on the provided array
      permissions.forEach((permission: string) => {
        const dbColumn = permissionMapping[permission];
        if (dbColumn) {
          accessData[dbColumn] = true;
        }
      });

      // Check if user access record exists
      const existingAccess = await db.select().from(userAccess).where(eq(userAccess.userId, userId)).limit(1);
      
      if (existingAccess.length > 0) {
        // Update existing access record
        await db.update(userAccess)
          .set(accessData)
          .where(eq(userAccess.userId, userId));
      } else {
        // Create new access record
        await db.insert(userAccess).values({
          ...accessData,
          userId,
          permission: 'read',
          createdAt: new Date()
        });
      }
    }

    return Response.json({ 
      message: 'User updated successfully',
      user: { ...updatedUser, permissions: permissions || [] }
    });
  } catch (error) {
    console.error("Error updating user:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is admin
    const currentUser = await db
      .select({ role: users.role })
      .from(users)
      .where(eq(users.id, session.user.id))
      .limit(1);

    if (!currentUser.length || !["admin", "superadmin"].includes(currentUser[0].role)) {
      return Response.json({ error: "Forbidden" }, { status: 403 });
    }
    const { userId } = await request.json();

    if (!userId) {
      return Response.json({ error: "Missing userId" }, { status: 400 });
    }

    // Prevent admin from deleting themselves
    if (userId === session.user.id) {
      return Response.json({ error: "Cannot delete your own account" }, { status: 400 });
    }

    // Delete user access records first (foreign key constraint)
    await db.delete(userAccess).where(eq(userAccess.userId, userId));

    // Delete user
    await db.delete(users).where(eq(users.id, userId));

    return Response.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error("Error deleting user:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}