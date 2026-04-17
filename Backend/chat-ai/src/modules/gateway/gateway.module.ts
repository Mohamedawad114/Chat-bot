import { Module } from "@nestjs/common";
import { ChatModule } from "../chat/chat.module";
import { chatGateway } from "./gateway";
import { AIJobModule } from "src/common";

@Module({
    imports: [ChatModule,ChatModule,AIJobModule],
    providers:[chatGateway]
})
export class GatewayModule{}