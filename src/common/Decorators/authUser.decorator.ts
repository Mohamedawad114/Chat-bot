import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const AuthUser = createParamDecorator((data, ctx: ExecutionContext) => {
  const user = ctx.switchToHttp().getRequest().user;
  return user;
});
