import { config } from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';

// 1️⃣ Construct absolute path to .env.test
const envPath = path.resolve(__dirname, '../../../.env.test'); // adjust ../../ according to location of set-env.ts

// 2️⃣ Check if file exists
if (!fs.existsSync(envPath)) {
  throw new Error(`❌ .env.test file not found at ${envPath}`);
}

// 3️⃣ Load .env.test
config({ path: envPath });

// 4️⃣ Ensure DATABASE_URL exists
if (!process.env.DATABASE_URL) {
  throw new Error('❌ DATABASE_URL missing in .env.test');
}
console.log('✅ Using test DB:', process.env.DATABASE_URL);
