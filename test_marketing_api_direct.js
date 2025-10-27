const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'medina_dashboard',
  password: 'admin',
  port: 5432,
});

async function testMarketingAPI() {
  try {
    console.log('Testing Marketing API...\n');

    // Check if table exists
    const tableCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'marketing_channel_byyear'
      );
    `);
    console.log('Table exists:', tableCheck.rows[0].exists);

    if (!tableCheck.rows[0].exists) {
      console.log('ERROR: marketing_channel_byyear table does not exist!');
      await pool.end();
      return;
    }

    // Check total records
    const totalCount = await pool.query('SELECT COUNT(*) FROM marketing_channel_byyear');
    console.log('Total records in table:', totalCount.rows[0].count);

    // Check distinct report_types
    const reportTypes = await pool.query('SELECT DISTINCT report_type FROM marketing_channel_byyear');
    console.log('\nDistinct report_types:', reportTypes.rows.map(r => r.report_type));

    // Check 2024 data with report_type = 'Chart 1'
    const data2024 = await pool.query(`
      SELECT * FROM marketing_channel_byyear 
      WHERE year = 2024 AND report_type = 'Chart 1'
      LIMIT 10
    `);
    console.log('\n2024 Chart 1 records found:', data2024.rows.length);
    if (data2024.rows.length > 0) {
      console.log('Sample 2024 data:', JSON.stringify(data2024.rows[0], null, 2));
    } else {
      console.log('WARNING: No 2024 data found for Chart 1!');
    }

    // Check 2023 data with report_type = 'Chart 1'
    const data2023 = await pool.query(`
      SELECT * FROM marketing_channel_byyear 
      WHERE year = 2023 AND report_type = 'Chart 1'
      LIMIT 10
    `);
    console.log('\n2023 Chart 1 records found:', data2023.rows.length);
    if (data2023.rows.length > 0) {
      console.log('Sample 2023 data:', JSON.stringify(data2023.rows[0], null, 2));
    } else {
      console.log('WARNING: No 2023 data found for Chart 1!');
    }

    // Check all available years
    const years = await pool.query('SELECT DISTINCT year FROM marketing_channel_byyear ORDER BY year');
    console.log('\nAvailable years:', years.rows.map(r => r.year));

    // Check saluran values for Chart 1
    const salurans = await pool.query(`
      SELECT DISTINCT saluran FROM marketing_channel_byyear 
      WHERE report_type = 'Chart 1'
    `);
    console.log('\nDistinct saluran values for Chart 1:', salurans.rows.map(r => r.saluran));

    await pool.end();
    console.log('\nTest complete!');
  } catch (error) {
    console.error('Error:', error);
    await pool.end();
  }
}

testMarketingAPI();
