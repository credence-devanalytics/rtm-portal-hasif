#!/usr/bin/env node

const { drizzle } = require("drizzle-orm/libsql");
const { createClient } = require("@libsql/client");
const { pgTable, text } = require("drizzle-orm/sqlite-core");
const nanoid = require("nanoid").nanoid;

// Recreate the users table schema (matching the TypeScript schema)
const users = pgTable("user_profile", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  role: text("role").notNull().default("user"), 	// peranan dalam sistem, user|admin|superadmin
  position: text("position"),  					// jawatan 
  systemId: text("systemId"),  					// user ID based on excel sheet
  taskRole: text("taskRole"), 					// peranan tugas
  emailVerified: boolean("emailVerified"),
  image: text("image"),
  createdAt: timestamp("createdAt").notNull(),
  updatedAt: timestamp("updatedAt").notNull(),
});


async function addUsers() {
  let db;
  let client;

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
  
  try {
    const connectionString = process.env.DATABASE_URL
    // Initialize database connection using libsql
    client = createClient({
      url: process.env.DATABASE_URL || `${connectionString}`,
    });
    db = drizzle(client);


    // Find user by email
    userData.forEach(async (userInfo) => {
      await db
        .insert(users)
        .values({
          id: nanoid(),
          name: userInfo.name,
          email: userInfo.email,
          role: userInfo.role,
          position: userInfo.position,
          systemId: userInfo.systemId,
          taskRole: userInfo.taskRole,
          emailVerified: false,
          image: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .returning();
    });

  } catch (error) {
    console.error("❌ Error inserting user:", error.message);
    process.exit(1);
  } finally {
    if (client) {
      client.close();
    }
  }
}

// Run the script
addUsers().catch((error) => {
  console.error("❌ Unexpected error:", error);
  process.exit(1);
});
