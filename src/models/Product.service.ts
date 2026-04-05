import { shapeIntoMongooseObjectId } from "../libs/config";
import { ProductCollection, ProductStatus } from "../libs/enums/product.enum";
import Errors, { HttpCode, Message } from "../libs/Errors";
import { T } from "../libs/types/common";
import { Product, ProductInput, ProductInquiry, ProductUpdateInput } from "../libs/types/product";
import ProductModel from "../schema/Product.model";
import {ObjectId} from "mongoose"
import ViewService from "./View.service";
import { ViewInput } from "../libs/types/view";
import { ViewGroup } from "../libs/enums/view.enum";
import LikeService from "./Like.service";
import { LikeInput } from "../libs/types/like";
import { LikeGroup } from "../libs/enums/Like.enum";

class ProductService{
    private readonly productModel;
    public viewService;
    public likeService;
 constructor(){
        this.productModel = ProductModel;
        this.viewService = new ViewService()
        this.likeService = new LikeService();
    }
    /** SPA */

public async getProducts(inquiry: ProductInquiry): Promise<Product[]> {
  console.log("inquiry:", inquiry);

  const match: T = { productStatus: ProductStatus.PROCESS };

  if (inquiry.productCollection) {
    match.productCollection = inquiry.productCollection;
  }

  if (inquiry.search) {
    match.productName = { $regex: new RegExp(inquiry.search, "i") };
  }

  // 🔥 RAM filter
  if (inquiry.productRam) {
    match.productRam = inquiry.productRam;
  }

  // 🔥 MEMORY filter
  if (inquiry.productMemory) {
    match.productMemory = inquiry.productMemory;
  }

  const sort: T =
    inquiry.order === "productPrice"
      ? { [inquiry.order]: 1 }
      : { [inquiry.order]: -1 };

  const result = await this.productModel
    .aggregate([
      { $match: match },

      // 🔥 4GB/64GB format
      {
        $addFields: {
          productSpecs: {
            $cond: [
              { $eq: ["$productCollection", "TELEPHONE"] },
              { $concat: ["$productRam", "/", "$productMemory"] },
              "-"
            ]
          }
        }
      },

      { $sort: sort },
      { $skip: (inquiry.page * 1 - 1) * inquiry.limit },
      { $limit: inquiry.limit * 1 }
    ])
    .exec();

  if (!result || result.length === 0)
    throw new Errors(HttpCode.NOT_FOUND, Message.NO_DATA_FOUND);

  return result;
}

public async getProduct(
  memberId: ObjectId | null,
  id: string
): Promise<Product> {

  const productId = shapeIntoMongooseObjectId(id);

  let result = await this.productModel
    .findOne({
      _id: productId,
      productStatus: ProductStatus.PROCESS
    })
    .exec();

  if (!result) {
    throw new Errors(HttpCode.NOT_FOUND, Message.NO_DATA_FOUND);
  }

  // 🔥 AGAR USER LOGIN BO‘LGAN BO‘LSA
  if (memberId) {

    const input: ViewInput = {
      memberId: memberId,
      viewRefId: productId,
      viewGroup: ViewGroup.PRODUCT
    };

    // 🔍 VIEW BOR-YO‘QLIGINI TEKSHIRAMIZ
    const existView = await this.viewService.checkViewExistence(input);

    // 🆕 AGAR YO‘Q BO‘LSA → YARATAMIZ
    if (!existView) {
      await this.viewService.insertMemberView(input);

      // 📈 VIEW COUNT OSHIRAMIZ
      result = await this.productModel
        .findByIdAndUpdate(
          productId,
          { $inc: { productViews: 1 } },
          { new: true }
        )
        .exec();
    }
  }

  return result;
}

public async likeProduct(memberId: ObjectId, productId: string): Promise<void> {

    const likeRefId = shapeIntoMongooseObjectId(productId);

    const input: LikeInput = {
        memberId: memberId,
        likeRefId: likeRefId,
        likeGroup: LikeGroup.PRODUCT
    };

    const existLike = await this.likeService.checkLikeExistence(input);

    // 🔴 AGAR LIKE BOR BO‘LSA → O‘CHIRAMIZ
    if (existLike) {
        await this.likeService["likeModel"].findByIdAndDelete(existLike._id);

        await this.productModel.findByIdAndUpdate(
            likeRefId,
            { $inc: { productLikes: -1 } }
        ).exec();

    } else {
        // 🟢 AGAR YO‘Q BO‘LSA → QO‘SHAMIZ
        await this.likeService.insertMemberLike(input);

        await this.productModel.findByIdAndUpdate(
            likeRefId,
            { $inc: { productLikes: 1 } }
        ).exec();
    }
}

    /** SSR */

public async getAllProducts(): Promise<Product[]> {

  const result = await this.productModel
    .aggregate([
      // 🔥 faqat active productlar
      {
        $match: {
        }
      },

      // 🔥 TELEPHONE uchun specs yasaymiz
      {
        $addFields: {
          productSpecs: {
            $cond: [
              { $eq: ["$productCollection", "TELEPHONE"] },
              { $concat: [
            { $toString: "$productRam" },
            "/",
            { $toString: "$productMemory" }
          ] },
              "-"
            ]
          }
        }
      },

      // 🔥 eng yangilari tepada
      {
        $sort: { createdAt: -1 }
      }
    ])
    .exec();

  // ❗ MUHIM: [] ni ham tekshiramiz
  if (!result || result.length === 0) {
    throw new Errors(HttpCode.NOT_FOUND, Message.NO_DATA_FOUND);
  }

  return result;
}


public async createNewProduct(input: ProductInput): Promise<Product> {
  try {
    // 🔥 SAFETY (fallback - agar controllerdan o'tib ketsa)
    switch (input.productCollection) {

      case ProductCollection.TELEPHONE:
        if (!input.productRam || !input.productMemory) {
          throw new Errors(
            HttpCode.BAD_REQUEST,
            Message.RAM_MEMORY_REQUIRED
          );
        }
        break;

      case ProductCollection.MACBOOKS:
        if (!input.productMemory) {
          throw new Errors(
            HttpCode.BAD_REQUEST,
            Message.RAM_MEMORY_REQUIRED
          );
        }
        input.productRam = undefined;
        break;

      default:
        input.productRam = undefined;
        input.productMemory = undefined;
        break;
    }

    // 🔥 ATTRIBUTES DEFAULT
    if (!input.attributes) {
      input.attributes = {};
    }

    // 🔥 CREATE
    return await this.productModel.create(input);

  } catch (err) {
    console.log("Error, model:createNewProduct:", err);

    throw new Errors(HttpCode.BAD_REQUEST, Message.CREATE_FAILED);
  }
}

public async updateChosenProduct(
  id: string | string[],
  input: ProductUpdateInput
): Promise<Product> {

  id = shapeIntoMongooseObjectId(id);

  // 🔥 TELEPHONE + MACBOOKS validation
  if (
    [ProductCollection.TELEPHONE, ProductCollection.MACBOOKS].includes(
      input.productCollection as ProductCollection
    )
  ) {
    if (!input.productMemory) {
      throw new Errors(
        HttpCode.BAD_REQUEST,
        Message.RAM_MEMORY_REQUIRED
      );
    }
  }

  // 🔥 BOSHQA CATEGORY → RAM/MEMORY o‘chadi
  if (
    input.productCollection &&
    ![ProductCollection.TELEPHONE, ProductCollection.MACBOOKS].includes(
      input.productCollection
    )
  ) {
    input.productRam = undefined;
    input.productMemory = undefined;
  }

  const result = await this.productModel
    .findOneAndUpdate(
      { _id: id },
      input,
      {
        new: true,
        runValidators: true // 🔥 MUHIM
      }
    )
    .exec();

  console.log("UPDATED:", result); // 🔥 DEBUG

  if (!result) {
    throw new Errors(HttpCode.NOT_MODIFIED, Message.UPDATE_FAILED);
  }

  return result;
}

};


export default ProductService;