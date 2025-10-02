const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost', 
  database: 'medina_dashboard',
  password: 'admin',
  port: 5432,
});

async function checkMarketingData() {
  try {
    // Check 2022 data
    const result2022 = await pool.query("SELECT * FROM marketing_channel_byyear WHERE report_type = 'Chart 1' AND year = 2022 LIMIT 5");
    console.log('2022 Marketing channel data:', JSON.stringify(result2022.rows, null, 2));
    
    // Check 2023 data
    const result2023 = await pool.query("SELECT * FROM marketing_channel_byyear WHERE report_type = 'Chart 1' AND year = 2023 LIMIT 5");
    console.log('2023 Marketing channel data:', JSON.stringify(result2023.rows, null, 2));
    
    // Check 2024 data
    const result2024 = await pool.query("SELECT * FROM marketing_channel_byyear WHERE report_type = 'Chart 1' AND year = 2024 LIMIT 5");
    console.log('2024 Marketing channel data:', JSON.stringify(result2024.rows, null, 2));
    
    // Check available years
    const years = await pool.query("SELECT DISTINCT year FROM marketing_channel_byyear WHERE report_type = 'Chart 1' ORDER BY year");
    console.log('Available years:', years.rows.map(row => row.year));
    
    const columns = await pool.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'marketing_channel_byyear'");
    console.log('Available columns:', columns.rows.map(row => row.column_name));
    
    await pool.end();
  } catch (error) {
    console.error('Error:', error.message);
  }
}

checkMarketingData();
