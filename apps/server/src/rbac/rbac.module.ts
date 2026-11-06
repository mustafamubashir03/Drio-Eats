import { Module, OnModuleInit } from "@nestjs/common";
import { RbacService } from "./rbac.service.js";
import { RbacGuard } from "./rbac.guard.js";
import { APP_GUARD } from "@nestjs/core";
import { RbacController } from "./rbac.controller.js";
import { DbModule } from "../db/db.module.js";

@Module({
	imports: [DbModule],
	providers: [
		RbacService,
		RbacGuard,
		{
			provide: APP_GUARD,
			useClass: RbacGuard,
		},
		RbacController,
	],
	exports: [RbacService, RbacGuard],
	controllers: [RbacController],
})
export class RbacModule implements OnModuleInit {
	constructor(private readonly rbacService: RbacService) {}

	async onModuleInit() {
		// Initialize default permissions and role-permission mappings
		await this.rbacService.initializePermissions();
	}
}
