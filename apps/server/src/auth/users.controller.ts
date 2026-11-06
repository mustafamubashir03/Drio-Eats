import { Controller, Get, UseGuards } from "@nestjs/common";
import { AuthGuard, Session } from "@thallesp/nestjs-better-auth";
import { RbacGuard } from "../rbac/rbac.guard.js";
import { Roles } from "../rbac/rbac.decorator.js";
import { AuthService } from "./auth.service.js";

@Controller("users")
@UseGuards(AuthGuard, RbacGuard)
export class UsersController {
  constructor(private readonly authService: AuthService) {}

  @Get("me")
  async me(@Session() session: any) {
    const userId = session?.user?.id;
    if (!userId) return { user: null };
    const user = await this.authService.getUserById(userId);
    if (!user) return { user: null };
    return { user };
  }

  @Get("profile")
  @Roles("CUSTOMER", "DRIVER", "RESTAURANT_OWNER", "SUPERADMIN")
  async profile(@Session() session: any) {
    const userId = session?.user?.id;
    if (!userId) return { user: null };
    const user = await this.authService.getUserById(userId);
    if (!user) return { user: null };
    return { user };
  }
}
