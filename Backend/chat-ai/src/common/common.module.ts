import { Global, Module } from "@nestjs/common";
import { TokenModule } from "./Utils/services";
import { UserRepository } from "./Repositories";

@Global()
@Module({
    imports: [TokenModule],
      providers: [ UserRepository],
  exports: [ UserRepository],
    })
export class CommonModule{} 