import "dotenv/config";
import pkg from "pg";
const { Client } = pkg;

const client = new Client({
  connectionString: process.env.DATABASE_URL,
});


(async () => {
  try {
    console.log("Connecting...");
    await client.connect();
    console.log("✅ Neon DB connected successfully!");
    
    const res = await client.query("SELECT NOW()");
    console.log("Database Time:", res.rows[0].now);
    
    await client.end();
  } catch (e) {
    console.error("❌ Neon DB connection failed:");
    console.error(e); // Pura error object print karein taake reason dikhe
  }
})();