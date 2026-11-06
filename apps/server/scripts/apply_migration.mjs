import 'dotenv/config';
import { neon } from '@neondatabase/serverless';
import * as fs from 'fs';

const sql = neon(process.env.DATABASE_URL);

const migrationPath = 'C:/Users/MUSTAFA/drio-eat/apps/server/drizzle/20261104075059_sweet_mother_askani/migration.sql';
const raw = fs.readFileSync(migrationPath, 'utf-8');

// Split by Drizzle's statement-breakpoint marker
const statements = raw.split('--> statement-breakpoint')
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.startsWith('--'));

console.log(`Total statements to execute: ${statements.length}\n`);

let successCount = 0;
let failureCount = 0;
const failures = [];

for (let i = 0; i < statements.length; i++) {
    const stmt = statements[i];
    const preview = stmt.replace(/\s+/g, ' ').substring(0, 100);
    try {
        await sql.query(stmt);
        successCount++;
        console.log(`  [${i + 1}/${statements.length}] OK: ${preview}...`);
    } catch (e) {
        failureCount++;
        failures.push({ index: i + 1, sql: stmt, error: e instanceof Error ? e.message : String(e) });
        console.log(`  [${i + 1}/${statements.length}] FAIL: ${preview}...`);
        console.log(`         Error: ${e instanceof Error ? e.message : String(e)}`);
    }
}

console.log(`\n=== Migration Summary ===`);
console.log(`Total: ${statements.length}`);
console.log(`Success: ${successCount}`);
console.log(`Failures: ${failureCount}`);

if (failureCount > 0) {
    console.log(`\n=== Failures Detail ===`);
    for (const f of failures) {
        console.log(`\nStatement #${f.index}:`);
        console.log(`  SQL: ${f.sql.replace(/\s+/g, ' ').substring(0, 200)}...`);
        console.log(`  Error: ${f.error}`);
    }
    process.exit(1);
} else {
    console.log(`\nMigration applied successfully!`);
}
