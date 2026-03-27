import { AttributeKey, ProductCollection, ProductStatus } from "../enums/product.enum";
import { ObjectId } from 'mongoose';

//.  TECHSTROE
export interface Product{
    _id: ObjectId;
    productStatus: ProductStatus;
    productCollection: ProductCollection;
    productName: string;
    productPrice: number;
    productLeftCount: number;
    productBrand: string;
    productVolume: number;
    productLikes: number,
    productRating: number,
    productDesc?: string;
    productImages: string[];
    productReviews: number,
    attributes: ProductAttributes,
    categoryId?: ObjectId,
    productViews: number;
    createdAt: Date;
    updatedAt: Date;
}

export type ProductAttributes = {
    [key in AttributeKey ]?: string;
}






export interface ProductInput{
    productStatus?: ProductStatus;
    productCollection: ProductCollection;
    productName: string;
    productPrice: number;
    productLeftCount: number;
    productVolume?: number;
    productDesc?: string;
    productImages?: string[];
    productViews?: number;
}

export interface ProductInquiry {
    order: string;
    page: number;
    limit: number;
    productCollection?: ProductCollection;
    search?: string; 
}

export interface ProductUpdateInput{ //bu update boladigan productning interface.Hammasini ? opsional qilishdan saabab user qaysi malumotni istasa oshani update qiladi.
     _id: ObjectId; //Qaysi productni update qilmoqchi bolsak oshani idsini qoshib kiritishiiz shart
    productStatus?: ProductStatus;
    productCollection?: ProductCollection;
    productName?: string;
    productPrice?: number;
    productLeftCount?: number;
    productVolume?: number;
    productDesc?: string;
    productImages?: string[];
    productViews?: number;
}