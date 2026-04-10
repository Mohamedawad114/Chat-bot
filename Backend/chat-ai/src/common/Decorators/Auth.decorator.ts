import { applyDecorators, SetMetadata, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../guards/authentication.guard';
import { AuthorizationGuard } from '../guards/authorization.guard';

export const Roles = (...roles: string[]) => SetMetadata('roles', roles);
export function Auth(...roles: string[]) {
  return applyDecorators(
    UseGuards(AuthGuard, AuthorizationGuard),
    Roles(...roles),
  );
}
