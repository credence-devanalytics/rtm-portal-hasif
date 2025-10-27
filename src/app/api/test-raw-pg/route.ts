import { NextResponse } from 'next/server';
import { Pool } from 'pg';

export async function GET() {
  try {
    console.log('Testing raw pg connection...');
    
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
    });
    
    // Test direct pool query
    const result = await pool.query('SELECT * FROM marketing_channel_byyear LIMIT 1');
    
    console.log('✓ Direct pool query worked:', result.rows);
    
    await pool.end();
    
    return NextResponse.json({
      success: true,
      rowCount: result.rowCount,
      sample: result.rows[0],
      fields: result.fields.map(f => ({ name: f.name, dataTypeID: f.dataTypeID }))
    });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
      detail: error.detail,
      code: error.code,
      stack: error.stack
    }, { status: 500 });
  }
}
