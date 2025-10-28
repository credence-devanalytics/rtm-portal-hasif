import { NextRequest, NextResponse } from 'next/server';

// Mock user data - replace with your actual database/API calls
const mockUsers = [
  {
    pk: 1,
    username: 'admin',
    email: 'admin@example.com',
    is_superuser: true,
  },
  {
    pk: 2,
    username: 'user1',
    email: 'user1@example.com',
    is_superuser: false,
  },
];

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = parseInt(params.id);
    
    if (!userId || isNaN(userId)) {
      return NextResponse.json(
        { error: 'Invalid user ID' },
        { status: 400 }
      );
    }

    // TODO: Replace with actual database query
    // Example: const user = await db.select().from(users).where(eq(users.id, userId));
    const user = mockUsers.find(u => u.pk === userId);

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(user);

  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user' },
      { status: 500 }
    );
  }
}