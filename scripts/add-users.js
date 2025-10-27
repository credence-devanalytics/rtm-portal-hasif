import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { users } from '../src/lib/schema.js';
import { nanoid } from 'nanoid';

// Database connection
const connectionString = process.env.DATABASE_URL || 'postgresql://username:password@localhost:5432/database_name';
const sql = postgres(connectionString);
const db = drizzle(sql);

/**
 * Adds an array of users to the database
 * @param {Array} userArray - Array of user objects
 * @param {string} userArray[].name - User's full name
 * @param {string} userArray[].email - User's email address
 * @param {string} userArray[].position - User's position/jawatan
 * @param {string} userArray[].systemId - User ID from excel sheet
 * @param {string} userArray[].taskRole - User's task role/peranan tugas
 * @param {string} [userArray[].role] - System role (defaults to 'user')
 */
async function addUsers(userArray) {
  try {
    console.log(`Starting to add ${userArray.length} users...`);
    
    // Validate input
    if (!Array.isArray(userArray) || userArray.length === 0) {
      throw new Error('userArray must be a non-empty array');
    }

    // Validate required fields for each user
    const requiredFields = ['name', 'email', 'position', 'systemId', 'taskRole'];
    for (let i = 0; i < userArray.length; i++) {
      const user = userArray[i];
      for (const field of requiredFields) {
        if (!user[field]) {
          throw new Error(`Missing required field '${field}' for user at index ${i}`);
        }
      }
      
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(user.email)) {
        throw new Error(`Invalid email format for user at index ${i}: ${user.email}`);
      }
    }

    // Prepare users for insertion
    const usersToInsert = userArray.map(user => ({
      id: nanoid(), // Generate unique ID
      name: user.name,
      email: user.email,
      role: user.role || 'user', // Default to 'user' if not specified
      position: user.position,
      systemId: user.systemId,
      taskRole: user.taskRole,
      emailVerified: false, // Default to false
      image: user.image || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    }));

    // Insert users into database
    const insertedUsers = await db.insert(users).values(usersToInsert).returning();
    
    console.log(`Successfully added ${insertedUsers.length} users:`);
    insertedUsers.forEach(user => {
      console.log(`- ${user.name} (${user.email}) - Role: ${user.role}, Position: ${user.position}`);
    });

    return insertedUsers;

  } catch (error) {
    console.error('Error adding users:', error.message);
    throw error;
  } finally {
    // Close database connection
    await sql.end();
  }
}

// Example usage with sample data
const userData = [
  {
    name: "Syahirda Binti Samsudin",
    email: "syahirda.samsudin@credence.tech",
    position: "",
    systemId: "", 
    taskRole: "",
    role: "superadmin"
  },
  {
    name: "Shahrin Amin Bin Sharifudin",
    email: "shahrinamin.sharifudin@credence.tech",
    position: "",
    systemId: "", 
    taskRole: "",
    role: "admin"
  },
  {
    name: "Muhammad Hasif Bin Jasmi Apindi",
    email: "hasi.jasmiapindi@credence.tech",
    position: "",
    systemId: "", 
    taskRole: "",
    role: "user"
  }
];

// Function to run the script
async function runScript() {
  try {
    console.log('=== RTM User Addition Script ===\n');
    
    // You can replace sampleUsers with your actual user array
    const result = await addUsers(userData);
    
    console.log('\n=== Script completed successfully ===');
    return result;
    
  } catch (error) {
    console.error('\n=== Script failed ===');
    console.error('Error:', error.message);
    process.exit(1);
  }
}

// Export functions for use in other modules
export { addUsers, runScript };

// Run script if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runScript();
}