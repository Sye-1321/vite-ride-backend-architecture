import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { UserStatus } from '../../../domain/user.types';
import { MongoDocument } from '@app/persistence';

export type UserDocument = UserDataModel & Document;

@Schema({ versionKey: false, timestamps: true })
export class UserDataModel extends MongoDocument {
  @Prop({ required: true, unique: true, index: true })
  phoneNumber: string;

  @Prop({ required: true })
  firstName: string;

  @Prop({ required: true })
  lastName: string;

  @Prop({ required: true })
  passwordHash: string;

  @Prop({ type: String, enum: Object.values(UserStatus) })
  status: UserStatus;

  @Prop({ type: String, default: null })
  refreshTokenHash: string | null;
}

export const UserSchema = SchemaFactory.createForClass(UserDataModel);
