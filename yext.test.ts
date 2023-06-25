import { getEntities, getAllEntities } from "./yext";
import dotenv from "dotenv";
import { WeddingGuestSchema } from "./yextSchemas";
dotenv.config();

async function main() {
  if (!process.env.YEXT_API_KEY) {
    throw new Error("YEXT_API_KEY not set");
  }
  const entities = await getAllEntities(
    process.env.YEXT_API_KEY,
    { entityType: "ce_weddingGuest" },
    WeddingGuestSchema
  );
  console.log(`Successfully retrieved ${entities.length} entities`);
}

main();
