import { MongooseModule, Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { IUser } from '../Interfaces';
import { Gender, Provider } from '../Enum';
import { HydratedDocument } from 'mongoose';

@Schema({ autoIndex: true, strict: true, strictQuery: true })
export class User implements IUser {
  @Prop({ type: String, required: true })
  username!: string;
  @Prop({ type: String, required: true })
  email!: string;
  @Prop({ type: Date, required: false })
  dateBirth!: Date;
  @Prop({ type: Gender, required: true })
  gender!: Gender;
  @Prop({ type: String, required: true })
  phoneNumber!: string;
  @Prop({ type: Boolean, default: false })
  isConfirmed!: boolean;
  @Prop({
    type: String,
    required: function (this: User) {
      return this.provider === Provider.system;
    },
  })
  password!: string;
  @Prop({ type: String, enum: Provider, default: Provider.system })
  provider!: Provider;
  @Prop({ type: String, required: false })
  subId?: string;
}
const UserSchema = SchemaFactory.createForClass(User);
export type UserDocument = HydratedDocument<User>;
export const userModel = MongooseModule.forFeature([
  {
    name: User.name,
    schema: UserSchema,
  },
]);
