import mongoose, { Schema, Document } from "mongoose";
import { ProductStatus } from "../libs/enums/product.enum";
import { Product } from "../libs/types/product";

const productSchema = new Schema<Product>(
  {
    productStatus: {
      type: String,
      enum: Object.values(ProductStatus),
      default: ProductStatus.ACTIVE,
    },

    productName: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 100,
    },

    productPrice: {
      type: Number,
      required: true,
      min: 0,
    },

    productLeftCount: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },

    productBrand: {
      type: String,
      trim: true,
      default: "",
    },

    productDesc: {
      type: String,
      required: true,
      maxlength: 1000,
    },

    productImages: {
      type: [String],
      default: [],
    },

    /* ===== STATS ===== */

    productViews: {
      type: Number,
      default: 0,
    },

    productLikes: {
      type: Number,
      default: 0,
    },

    productRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },

    productReviews: {
      type: Number,
      default: 0,
    },

    /* ===== DYNAMIC ATTRIBUTES ===== */

    attributes: {
      type: Map,
      of: String,
      default: {},
    },

    categoryId: {
      type: Schema.Types.ObjectId,
      ref: "Category",
    },
  },
  { timestamps: true }
);


productSchema.index({ productName: "text", productDesc: "text" });
productSchema.index({ memberId: 1 });
productSchema.index({ categoryId: 1 });

export const ProductModel = mongoose.model<Product>(
  "Product",
  productSchema
);