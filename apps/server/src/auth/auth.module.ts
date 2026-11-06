import { Module } from "@nestjs/common";
import { AuthService } from "./auth.service.js";
import { UsersController } from "./users.controller.js";
import { RbacModule } from "../rbac/rbac.module.js";

@Module({
	imports: [RbacModule],
	providers: [AuthService],
	controllers: [UsersController],
	exports: [AuthService, RbacModule],
})
export class AuthBusinessModule {}
