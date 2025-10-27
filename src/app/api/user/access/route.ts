import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { userAccess } from '@/lib/schema';
import { eq } from 'drizzle-orm';
import { auth } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || session.user.id;

    // Fetch user access permissions
    const accessRecords = await db.select().from(userAccess).where(eq(userAccess.userId, userId)).limit(1);
    
    if (accessRecords.length === 0) {
      return NextResponse.json({ access: null });
    }

    const access = accessRecords[0];
    
    // Return the access object with boolean values
    return NextResponse.json({ 
      access: {
        socMedAcc: access.socMedAcc,
        socMedSent: access.socMedSent,
        rtmklik: access.rtmklik,
        mytv: access.mytv,
        astro: access.astro,
        unifitv: access.unifitv,
        wartaberita: access.wartaberita,
        marketing: access.marketing
      }
    });
  } catch (error) {
    console.error('Error fetching user access:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}