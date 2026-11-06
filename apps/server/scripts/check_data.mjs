import 'dotenv/config';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

async function main() {
  // Row counts for existing data
  for (const t of ['users','restaurants','orders','order_items','menu_categories','menu_items','reviews']) {
    try {
      const cnt = await sql`SELECT count(*) AS cnt FROM public.${sql.identifier([t])}`;
      console.log(`ROW COUNT ${t}: ${cnt[0].cnt}`);
    } catch (e) {
      console.log(`ROW COUNT ${t}: ERROR ${e.message}`);
    }
  }

  // Check restaurants.rating values for type conversion safety
  try {
    const ratings = await sql`SELECT DISTINCT rating FROM public.restaurants`;
    console.log('DISTINCT ratings:', JSON.stringify(ratings));
  } catch (e) {
    console.log('ratings check error:', e.message);
  }

  // Check orders.status values
  try {
    const statuses = await sql`SELECT DISTINCT status FROM public.orders`;
    console.log('DISTINCT order statuses:', JSON.stringify(statuses));
  } catch (e) {
    console.log('order statuses check error:', e.message);
  }

  // Check users.role values
  try {
    const roles = await sql`SELECT DISTINCT role FROM public.users`;
    console.log('DISTINCT user roles:', JSON.stringify(roles));
  } catch (e) {
    console.log('user roles check error:', e.message);
  }

  // Check existing FK constraint names on orders
  try {
    const fks = await sql`
      SELECT conname, pg_get_constraintdef(oid) as def
      FROM pg_constraint
      WHERE conrelid = 'public.orders'::regclass AND contype = 'f'
    `;
    console.log('orders FKs:', JSON.stringify(fks));
  } catch (e) {
    console.log('orders FKs error:', e.message);
  }

  // Check existing FK constraint names on reviews
  try {
    const fks = await sql`
      SELECT conname, pg_get_constraintdef(oid) as def
      FROM pg_constraint
      WHERE conrelid = 'public.reviews'::regclass AND contype = 'f'
    `;
    console.log('reviews FKs:', JSON.stringify(fks));
  } catch (e) {
    console.log('reviews FKs error:', e.message);
  }

  // Check existing FK constraint names on order_items
  try {
    const fks = await sql`
      SELECT conname, pg_get_constraintdef(oid) as def
      FROM pg_constraint
      WHERE conrelid = 'public.order_items'::regclass AND contype = 'f'
    `;
    console.log('order_items FKs:', JSON.stringify(fks));
  } catch (e) {
    console.log('order_items FKs error:', e.message);
  }

  // Check existing FK constraint names on restaurants
  try {
    const fks = await sql`
      SELECT conname, pg_get_constraintdef(oid) as def
      FROM pg_constraint
      WHERE conrelid = 'public.restaurants'::regclass AND contype = 'f'
    `;
    console.log('restaurants FKs:', JSON.stringify(fks));
  } catch (e) {
    console.log('restaurants FKs error:', e.message);
  }
}
main().catch(e=>{console.error(e);process.exit(1);});
