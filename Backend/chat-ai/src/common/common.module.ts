import { Global, Module } from "@nestjs/common";
import { TokenModule } from "./Utils/services";
import { UserRepository } from "./Repositories";
import { userModel } from "./models";

@Global()
@Module({
    imports: [TokenModule,userModel],
      providers: [ UserRepository],
  exports: [ UserRepository],
    })
export class CommonModule{} 