import { MongooseModule, Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { IUser } from '../Interfaces';
import { Gender, Provider, Sys_Role } from '../Enum';
import { HydratedDocument } from 'mongoose';
import { HashingService } from '../Utils';

@Schema({ autoIndex: true, strict: true, strictQuery: true ,timestamps:true})
export class User implements IUser {
  @Prop({ type: String, required: true })
  username!: string;
  @Prop({ type: String, required: true })
  email!: string;
  @Prop({ type: Date, required: false })
  dateBirth!: Date;
  @Prop({ type: String, enum: Gender, required: true })
  gender!: Gender;
  @Prop({
    type: String,
    required: function (this: User) {
      return this.provider === Provider.system;
    },
  })
  phoneNumber!: string;
  @Prop({ type: Boolean, default: false })
  isConfirmed!: boolean;
  @Prop({
    type: String,
    required: function (this: User) {
      return this.provider === Provider.system;
    },
    select: false,
  })
  password!: string;
  @Prop({
    type: String,
    enum: Provider,
    default: Provider.system,
    select: false,
  })
  provider!: Provider;
  @Prop({ type: String, required: false, select: false })
  subId?: string;
  @Prop({ type: String, enum: Sys_Role, default: Sys_Role.user })
  role!: Sys_Role;
}
export type UserDocument = HydratedDocument<User>;
const UserSchema = SchemaFactory.createForClass(User);
UserSchema.pre('save', async function () {
  const hashService = new HashingService();
  if (this.isModified('password')) {
    this.password = await hashService.generateHash(this.password);
  }
});
export const userModel = MongooseModule.forFeature([
  {
    name: User.name,
    schema: UserSchema,
  },
]);
