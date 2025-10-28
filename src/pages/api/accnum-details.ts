import { NextRequest, NextResponse } from 'next/server';

// Mock account number details - replace with your actual database/API calls
const mockAccNumDetails = [
  {
    acc_num: 'ACC001',
    dashboard_package: 'TA',
    userEmail: 'admin@example.com',
  },
  {
    acc_num: 'ACC002',
    dashboard_package: 'Standard',
    userEmail: 'user1@example.com',
  },
  {
    acc_num: 'ACC003',
    dashboard_package: 'Premium',
    userEmail: 'user1@example.com',
  },
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');
    
    if (!email) {
      return NextResponse.json(
        { error: 'Email parameter is required' },
        { status: 400 }
      );
    }

    // TODO: Replace with actual database query
    // Example: const accDetails = await db.select().from(accnum_details).where(like(accnum_details.userEmail, `%${email}%`));
    const accDetails = mockAccNumDetails.filter(acc => 
      acc.userEmail.includes(email)
    );

    // Return only the acc_num and dashboard_package fields as expected by the component
    const filteredDetails = accDetails.map(acc => ({
      acc_num: acc.acc_num,
      dashboard_package: acc.dashboard_package,
    }));

    return NextResponse.json(filteredDetails);

  } catch (error) {
    console.error('Error fetching account number details:', error);
    return NextResponse.json(
      { error: 'Failed to fetch account number details' },
      { status: 500 }
    );
  }
}