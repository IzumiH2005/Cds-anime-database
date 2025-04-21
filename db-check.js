import pg from 'pg';
const { Pool } = pg;

async function main() {
  if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL not defined");
    process.exit(1);
  }

  console.log("Connecting to database...");
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });

  try {
    // Check connection
    const result = await pool.query('SELECT NOW()');
    console.log("Database connection successful:", result.rows[0]);
    
    // List tables
    const tables = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    
    console.log("Existing tables:");
    tables.rows.forEach(row => {
      console.log(`- ${row.table_name}`);
    });
    
  } catch (error) {
    console.error("Error connecting to database:", error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

main();