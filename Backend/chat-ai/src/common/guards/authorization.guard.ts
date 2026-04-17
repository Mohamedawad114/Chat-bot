import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';
import { IUser } from '../Interfaces';
import { Reflector } from '@nestjs/core';
@Injectable()
export class AuthorizationGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const type = context.getType();
    let user: IUser;
    if (type === 'http') user = context.switchToHttp().getRequest().user;
    if (type === 'ws') user = context.switchToWs().getClient().data.user;
    else return false;
    const allowedRoles = this.reflector.getAllAndOverride<string[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);
    const userRoles = user.role;
    if (allowedRoles && allowedRoles.includes(userRoles)) return true;
    return false;
  }
}
