import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { username } = await request.json();
    
    if (!username) {
      return NextResponse.json(
        { error: 'Username is required' },
        { status: 400 }
      );
    }

    const tableauServerUrl = process.env.NEXT_PUBLIC_TABLEAU_SERVER_URL || 'https://tfbi-tableau.tmone.com.my/';
    const trustedUrl = `${tableauServerUrl}trusted/`;

    // Make request to Tableau trusted ticket endpoint
    const response = await fetch(trustedUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        username: username,
      }),
      // Disable SSL verification (equivalent to verify=False in Python)
      // Note: In production, you should use proper SSL certificates
    });

    let ticket = '';
    let status = '';

    if (response.ok) {
      ticket = await response.text();
      if (ticket !== '-1') {
        status = 'SSO';
      } else {
        status = 'Failed';
      }
    } else {
      console.error('Could not get trusted ticket with status code', response.status);
      ticket = '-1';
      status = 'Error';
    }

    return NextResponse.json({
      ticket,
      status,
      username,
      tableauServer: tableauServerUrl,
    });

  } catch (error) {
    console.error('Tableau trusted ticket error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to get trusted ticket',
        ticket: '-1',
        status: 'Error'
      },
      { status: 500 }
    );
  }
}