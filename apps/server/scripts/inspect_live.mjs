import 'dotenv/config';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

async function main() {
  const tables = await sql`SELECT table_name FROM information_schema.tables WHERE table_schema='public' ORDER BY table_name`;
  console.log('=== TABLES ===');
  console.log(JSON.stringify(tables, null, 2));

  const enums = await sql`SELECT typname FROM pg_type WHERE typtype='e' ORDER BY typname`;
  console.log('=== ENUMS ===');
  console.log(JSON.stringify(enums, null, 2));

  const cols = await sql`
    SELECT table_name, column_name, data_type, is_nullable, column_default
    FROM information_schema.columns
    WHERE table_schema='public'
    ORDER BY table_name, ordinal_position`;
  console.log('=== COLUMNS ===');
  console.log(JSON.stringify(cols, null, 2));

  const fks = await sql`
    SELECT tc.table_name, kcu.column_name, ccu.table_name AS foreign_table, ccu.column_name AS foreign_column, rc.delete_rule
    FROM information_schema.table_constraints tc
    JOIN information_schema.key_column_usage kcu ON tc.constraint_name=kcu.constraint_name
    JOIN information_schema.constraint_column_usage ccu ON ccu.constraint_name=tc.constraint_name
    JOIN information_schema.referential_constraints rc ON rc.constraint_name=tc.constraint_name
    WHERE tc.constraint_type='FOREIGN KEY' AND tc.table_schema='public'
    ORDER BY tc.table_name`;
  console.log('=== FOREIGN KEYS ===');
  console.log(JSON.stringify(fks, null, 2));

  const idx = await sql`
    SELECT tablename, indexname, indexdef FROM pg_indexes WHERE schemaname='public' ORDER BY tablename, indexname`;
  console.log('=== INDEXES ===');
  console.log(JSON.stringify(idx, null, 2));

  const checks = await sql`
    SELECT conrelid::regclass AS tbl, pg_get_constraintdef(oid) AS def FROM pg_constraint WHERE contype='c' AND connamespace='public'::regnamespace`;
  console.log('=== CHECK CONSTRAINTS ===');
  console.log(JSON.stringify(checks, null, 2));

  const uniq = await sql`
    SELECT tc.table_name, kcu.column_name, tc.constraint_name
    FROM information_schema.table_constraints tc
    JOIN information_schema.key_column_usage kcu ON tc.constraint_name=kcu.constraint_name
    WHERE tc.constraint_type='UNIQUE' AND tc.table_schema='public'`;
  console.log('=== UNIQUE CONSTRAINTS ===');
  console.log(JSON.stringify(uniq, null, 2));

  // enum values
  const ev = await sql`
    SELECT t.typname, e.enumlabel FROM pg_type t JOIN pg_enum e ON e.enumtypid=t.oid ORDER BY t.typname, e.enumsortorder`;
  console.log('=== ENUM VALUES ===');
  console.log(JSON.stringify(ev, null, 2));

  // row counts for existing data
  for (const t of ['users','restaurants','orders','order_items','menu_categories','menu_items','reviews']) {
    try {
      const cnt = await sql`SELECT count(*) AS cnt FROM ${sql.identifier([t])}`;
      console.log(`ROW COUNT ${t}: ${cnt[0].cnt}`);
    } catch (e) {
      console.log(`ROW COUNT ${t}: ERROR ${e}`);
    }
  }
}
main().catch(e=>{console.error(e);process.exit(1);});
