import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Order extends Document {
  @Prop({ required: true })
  user_id!: string;

  @Prop({ required: true })
  product_id!: string;

  @Prop({ required: true })
  quantity!: number;

  @Prop({ required: true })
  total_price!: number;

  @Prop({ default: 'pending' })
  status!: string;
}

export const OrderSchema = SchemaFactory.createForClass(Order);
