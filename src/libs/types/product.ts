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
     productMemory: number;
    productRam: number;
    productLikes: number,
    productRating: number,
    productDesc?: string;
    productImages: string[];
    attributes: ProductAttributes,
    productViews: number;
    createdAt: Date;
    updatedAt: Date;
}

export type ProductAttributes = {
    [key in AttributeKey ]?: string;
}


export interface ProductInput{
    productStatus?: ProductStatus;
    productCollection: ProductCollection; //Product Type
    productName: string;
    productPrice: number;
    productLeftCount: number;
    productBrand: string,
    productMemory?: number;
    productRam?: number;
    productDesc?: string;
    productImages?: string[];
    productViews?: number;
    attributes?: Record<string, string>;
}

export interface ProductInquiry {
  order: string;
  page: number;
  limit: number;
  productCollection?: ProductCollection;
  search?: string;
  productRam?: string;       // 🔥 new
  productMemory?: string;    // 🔥 new
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