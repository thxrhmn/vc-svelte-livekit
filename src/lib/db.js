import { MongoClient } from "mongodb";

const DB_URI = import.meta.env.VITE_DB_URI;

const connectToDatabase = async () => {
  const client = new MongoClient(DB_URI);
  await client.connect();
  return client.db('svelte-mongodb');
};

export default connectToDatabase();