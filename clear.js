import mongoose from "mongoose";

await mongoose.connect(process.env.MONGO_URI);

const collections = await mongoose.connection.db.collections();

for (const coll of collections) {
  await coll.deleteMany({});   // clears data but keeps schema & indexes
}

console.log("✅ All documents removed, collections remain.");
