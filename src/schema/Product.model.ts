import mongoose, { Schema } from "mongoose";
import { ProductCollection, ProductMemory, ProductRam, ProductStatus } from "../libs/enums/product.enum";
import { Product } from "../libs/types/product";

const productSchema = new Schema(
  {
    productStatus: {
      type: String,
      enum: ProductStatus,
      default: ProductStatus.PROCESS,
    },

    productCollection: {
      type: String,
      enum: ProductCollection,
      required: true,
    },

    productName: {
      type: String,
      required: true,
    },

    productPrice: {
      type: Number,
      required: true,
    },

    productLeftCount: {
      type: Number,
      required: true,
    },
    //qoshimcha
     productMemory: {
      type: Number,
    },
    //qoshimcha
     productRam: {
      type: Number
    },

    //qoshimcha
    productBrand: {
      type: String,
      required: true,
      default: "",
    },

    productDesc: {
      type: String,
    },

    productImages: {
      type: [String],
      default: [],
    },

   
 //qoshimcha
    productViews: {
      type: Number,
      default: 0,
    },
 //qoshimcha
    productLikes: {
      type: Number,
      default: 0,
    },
 //qoshimcha
    productRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },

    productReviewCount: {
      type: Number, 
      default: 0 },

  },
  { timestamps: true }
);


productSchema.index(
  { productName: 1, productMemory: 1, productRam: 1 },
  { unique: true, sparse: true }
);

export default mongoose.model("Product",productSchema);