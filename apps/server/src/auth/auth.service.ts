import { Injectable, BadRequestException, NotFoundException, Inject, Logger } from "@nestjs/common";
import { NeonHttpDatabase } from "drizzle-orm/neon-http";
import * as schema from "../db/schema/index.js";
import { eq } from "drizzle-orm";
import { auth } from "../auth.js";
import { RbacService } from "../rbac/rbac.service.js";

@Injectable()
export class AuthService {
	private readonly logger = new Logger(AuthService.name);

	constructor(
		@Inject("DB") private readonly db: NeonHttpDatabase,
		private readonly rbacService: RbacService,
	) {}

	async register(input: {
		firstName: string;
		lastName: string;
		email: string;
		password: string;
	}) {
		let result: any;
		try {
			result = await (auth as any).api.signUpEmail({
				body: {
					name: `${input.firstName} ${input.lastName}`.trim(),
					email: input.email,
					password: input.password,
					firstName: input.firstName,
					lastName: input.lastName,
				},
			});
		} catch (err: any) {
			const message = err?.message || err?.body?.message || "Registration failed";
			throw new BadRequestException(message);
		}

		if (!result?.user?.id) {
			throw new BadRequestException("Registration did not create a user");
		}

		// Assign CUSTOMER role by default (idempotent)
		await this.rbacService.assignRole(result.user.id, "CUSTOMER", result.user.id);

		const user = await this.getUserById(result.user.id);
		if (!user) throw new NotFoundException("User not found after registration");
		return { user, session: result };
	}

	async getUserById(userId: string) {
		const rows = await this.db
			.select()
			.from(schema.users)
			.where(eq(schema.users.id, userId as any));
		return rows[0] ?? null;
	}
}
