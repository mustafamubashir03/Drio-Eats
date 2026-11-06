import { Global, Module } from "@nestjs/common";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";

@Global()
@Module({
    providers: [
        {
            provide: 'DB',
            useFactory: () => {
                const sql = neon(process.env.DATABASE_URL!);
                return drizzle({ client: sql })
            }
        }
    ],
    exports: ['DB']
})
export class DbModule { }