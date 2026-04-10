import { Types } from 'mongoose';
import { Provider } from '../Enum';

export interface IUser {
  _id?: Types.ObjectId;
  username: string;
  email: string;
  password: string;
  phoneNumber: string;
  isConfirmed?: boolean;
  dateBirth?: Date;
  subId?: string;
  provider: Provider;
}
