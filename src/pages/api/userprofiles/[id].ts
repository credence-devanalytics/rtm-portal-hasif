import { NextRequest, NextResponse } from 'next/server';

// Mock user profile data - replace with your actual database/API calls
const mockUserProfiles = [
  {
    user_id: 1,
    acc_type: 'Admin',
    compName: 'RTM Corporation',
  },
  {
    user_id: 2,
    acc_type: 'Standard',
    compName: 'Customer Company',
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
    // Example: const userProfile = await db.select().from(userprofiles).where(eq(userprofiles.user_id, userId));
    const userProfile = mockUserProfiles.find(up => up.user_id === userId);

    if (!userProfile) {
      return NextResponse.json(
        { error: 'User profile not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(userProfile);

  } catch (error) {
    console.error('Error fetching user profile:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user profile' },
      { status: 500 }
    );
  }
}