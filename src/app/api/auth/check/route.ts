import { auth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    // Get session from the request headers
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    // Check if user is authenticated
    if (!session?.user) {
      return NextResponse.json(
        { 
          authorized: false,
          error: "Unauthorized access" 
        }, 
        { status: 401 }
      );
    }

    // Optional: Add role-based access control
    // if (session.user.role !== 'internal' && session.user.role !== 'admin') {
    //   return NextResponse.json(
    //     { 
    //       authorized: false,
    //       error: "Insufficient permissions" 
    //     }, 
    //     { status: 403 }
    //   );
    // }

    // Log access attempt for security monitoring
    console.log(`Authorization check passed for user: ${session.user.email} at ${new Date().toISOString()}`);

    return NextResponse.json({
      authorized: true,
      user: {
        id: session.user.id,
        email: session.user.email,
        name: session.user.name
      }
    });
  } catch (error) {
    console.error("Error in authorization check API route:", error);
    return NextResponse.json(
      { 
        authorized: false,
        error: "Internal server error" 
      }, 
      { status: 500 }
    );
  }
}
