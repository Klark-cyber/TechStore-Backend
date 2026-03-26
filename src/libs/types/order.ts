import { ObjectId } from "mongoose"
import { OrderStatus } from "../enums/order.enum";
import { Product } from "./product";

export interface OrderItemInput { //Postman orqali kirib kelgan req.body
    itemQuantity: number;
    itemPrice: number;
    productId: ObjectId;
    orderId?: ObjectId;   //frontenddan kelmaydi ozimiz hosil qilamiz.Shu saabli optional qilib belgiladik
}

export interface Order { //schemadan kelgan return Prommise
    _id: ObjectId;
    orderTotal: number;
    orderDelivery: number;
    orderStatus: OrderStatus;  //enum
    memberId: ObjectId;
    createdAt: Date;
    updatedAt: Date;
    // from aggregations
    orderItems: OrederItem[];
    productData: Product[];
}

export interface OrederItem { 
    _id: ObjectId;
    itemQuantity: number;
    itemPrice: number;
    orderId: ObjectId;
    productId: ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

export interface OrderInquiry {
    page: number;
    limit: number;
    orderStatus: OrderStatus;
}

export interface OrderUpdateInput {
    orderId: string;
    orderStatus: OrderStatus;
}