import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

// PUT - Change password
export async function PUT(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { currentPassword, newPassword } = await request.json();

    if (!currentPassword || !newPassword) {
      return NextResponse.json({ error: 'Current password and new password are required' }, { status: 400 });
    }

    if (newPassword.length < 8) {
      return NextResponse.json({ error: 'New password must be at least 8 characters long' }, { status: 400 });
    }

    // Use better-auth's changePassword API
    const result = await auth.api.changePassword({
      body: {
        currentPassword,
        newPassword,
        revokeOtherSessions: false
      },
      headers: request.headers
    });

    if (!result) {
      return NextResponse.json({ error: 'Failed to change password. Current password may be incorrect.' }, { status: 400 });
    }

    return NextResponse.json({ 
      message: 'Password updated successfully'
    });
  } catch (error: any) {
    console.error('Error updating password:', error);
    
    // Better-auth may throw specific errors
    if (error?.message?.includes('password')) {
      return NextResponse.json({ error: 'Current password is incorrect' }, { status: 400 });
    }
    
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}