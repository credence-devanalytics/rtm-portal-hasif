import { signUp } from "@/lib/auth-client";

async function registerUser(name, email, position, systemId, taskRole, router, setError) {
    try {
        console.log("Attempting to register user:", { email, name })
        
        const result = await signUp.email({
            name,
            email,
            password: "Default",
            position,
            systemId,
            taskRole,
        })
        
        console.log("Signup result:", result)
        
        if (result.error) {
        console.error("Signup error:", result.error)
        setError(result.error.message || "Registration failed. Please try again.")
        } else if (result.data) {
        console.log("Signup successful:", result.data)
        router.push("/") // Redirect to home page
        } else {
        setError("Registration failed. Please try again.")
        }
    } catch (err) {
        console.error("Signup catch error:", err)
        setError(`Registration failed: ${err instanceof Error ? err.message : String(err)}`)
    }
}

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
    
    // Process users sequentially to avoid overwhelming the server
    for (const user of userData) {
      console.log(`Processing user: ${user.name} (${user.email})`);
      
      // Mock router and setError for server-side usage
      const mockRouter = { push: (url) => console.log(`Would redirect to: ${url}`) };
      const mockSetError = (error) => console.error(`Error: ${error}`);
      
      await registerUser(
        user.name, 
        user.email, 
        user.position, 
        user.systemId, 
        user.taskRole, 
        mockRouter, 
        mockSetError
      );
      
      // Add small delay between registrations
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    console.log('\n=== Script completed successfully ===');
    return;

  } catch (error) {
    console.error('\n=== Script failed ===');
    console.error('Error:', error.message);
    process.exit(1);
  }
}

// Export functions
export { registerUser, runScript, userData };

// Run script if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runScript();
}