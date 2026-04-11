import { InjectModel } from '@nestjs/mongoose';
import { BaseRepository } from './Base.repository';
import { User, UserDocument } from '../models';
import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';

@Injectable()
export class UserRepository extends BaseRepository<UserDocument> {
  constructor(
    @InjectModel(User.name) protected readonly userModel: Model<UserDocument>,
  ) {
    super(userModel);
  }
  async findByEmail(email: string) {
    return await this.findOneDocument({ email: email });
  }
}
