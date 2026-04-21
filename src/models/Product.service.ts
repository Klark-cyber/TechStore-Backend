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
import { Member } from "../libs/types/member";
import ReviewModel from "../schema/Review.model";

class ProductService{
    private readonly productModel;
    public viewService;
    public likeService;
  reviewModel: any;
 constructor(){
        this.productModel = ProductModel;
        this.viewService = new ViewService()
        this.likeService = new LikeService();
        this.reviewModel = ReviewModel;
    }
    /** SPA */

public async getProducts(inquiry: ProductInquiry, memberId?: ObjectId | null): Promise<Product[]> {
  const match: any = {
    productStatus: ProductStatus.PROCESS,
  };

  if (inquiry.productCollection) {
    match.productCollection = inquiry.productCollection;
  }

  if (inquiry.productRam) {
    match.productRam = Number(inquiry.productRam);
  }

  if (inquiry.productMemory) {
    match.productMemory = Number(inquiry.productMemory);
  }

  if (inquiry.productBrand && inquiry.productBrand.trim() !== "") {
    match.productBrand = { $regex: new RegExp(inquiry.productBrand.trim(), "i") };
  }

  if (inquiry.search) {
    match.productName = { $regex: new RegExp(inquiry.search, "i") };
  }

  const sort: T =
    inquiry.order === "productPrice"
      ? { [inquiry.order]: 1 }
      : { [inquiry.order]: -1 };

  // string → ObjectId (meLiked lookup uchun muhim)
  const memberObjectId = memberId
    ? shapeIntoMongooseObjectId(memberId)
    : null;

  const result = await this.productModel
    .aggregate([
      { $match: match },

      // productSpecs: "16/128" format (TELEPHONE uchun)
      {
        $addFields: {
          productSpecs: {
            $cond: [
              { $eq: ["$productCollection", "TELEPHONE"] },
              {
                $concat: [
                  { $toString: { $ifNull: ["$productRam", "0"] } },
                  "/",
                  { $toString: { $ifNull: ["$productMemory", "0"] } },
                ]
              },
              "-"
            ]
          }
        }
      },

      { $sort: sort },
      { $skip: (inquiry.page * 1 - 1) * inquiry.limit },
      { $limit: inquiry.limit * 1 },

      // meLiked — login user bu productni liked qilganmi
      ...(memberObjectId
        ? [
            {
              $lookup: {
                from: "likes",
                let: { productId: "$_id" },
                pipeline: [
                  {
                    $match: {
                      $expr: {
                        $and: [
                          { $eq: ["$likeRefId", "$$productId"] },
                          { $eq: ["$memberId", memberObjectId] },
                          { $eq: ["$likeGroup", "PRODUCT"] },
                        ],
                      },
                    },
                  },
                ],
                as: "meLiked",
              },
            },
          ]
        : [
            { $addFields: { meLiked: [] } },
          ]),
    ])
    .exec();

  if (!result) throw new Errors(HttpCode.NOT_FOUND, Message.NO_DATA_FOUND);
return result;
}

public async rateProduct(member: Member, input: any): Promise<void> {
  const { productId, rating } = input;

  const prodId = shapeIntoMongooseObjectId(productId);

  // ❗ oldin baho berganmi?
  const exist = await this.reviewModel.findOne({
    productId: prodId,
    memberId: member._id,
  });

  if (exist) {
    throw new Errors(HttpCode.BAD_REQUEST, Message.CREATE_FAILED);
  }

  // ✅ yangi rating
  await this.reviewModel.create({
    productId: prodId,
    memberId: member._id,
    rating,
  });

  // 🔥 average hisoblash
  const stats = await this.reviewModel.aggregate([
    { $match: { productId: prodId } },
    {
      $group: {
        _id: "$productId",
        avg: { $avg: "$rating" },
        count: { $sum: 1 },
      },
    },
  ]);

  // ✅ product update
  await this.productModel.findByIdAndUpdate(prodId, {
    productRating: stats[0]?.avg || 0,
    productReviewCount: stats[0]?.count || 0,
  });
}

public async getProduct(memberId: ObjectId | null, id: string): Promise<Product> {
  const productId = shapeIntoMongooseObjectId(id);

  // View logic — o'zgarishsiz
  let result = await this.productModel
    .findOne({ _id: productId, productStatus: ProductStatus.PROCESS })
    .exec();

  if (!result) throw new Errors(HttpCode.NOT_FOUND, Message.NO_DATA_FOUND);

  if (memberId) {
    const input: ViewInput = {
      memberId: memberId,
      viewRefId: productId,
      viewGroup: ViewGroup.PRODUCT
    };
    const existView = await this.viewService.checkViewExistence(input);
    if (!existView) {
      await this.viewService.insertMemberView(input);
      result = await this.productModel
        .findByIdAndUpdate(productId, { $inc: { productViews: 1 } }, { new: true })
        .exec();
    }
  }

  // ✅ meLiked — aggregate orqali
  const memberObjectId = memberId ? shapeIntoMongooseObjectId(memberId) : null;

  const withLike = await this.productModel.aggregate([
    { $match: { _id: productId } },
    ...(memberObjectId ? [{
      $lookup: {
        from: "likes",
        let: { productId: "$_id" },
        pipeline: [{
          $match: {
            $expr: {
              $and: [
                { $eq: ["$likeRefId", "$$productId"] },
                { $eq: ["$memberId", memberObjectId] },
                { $eq: ["$likeGroup", "PRODUCT"] },
              ]
            }
          }
        }],
        as: "meLiked",
      }
    }] : [{ $addFields: { meLiked: [] } }]),
  ]).exec();

  return withLike[0] ?? result;
}

public async likeProduct(memberId: ObjectId, productId: string): Promise<void> {

    const likeRefId = shapeIntoMongooseObjectId(productId);

    const input: LikeInput = {
        memberId: shapeIntoMongooseObjectId(memberId),
        likeRefId: likeRefId,
        likeGroup: LikeGroup.PRODUCT
    };
console.log(memberId, productId)
    const existLike = await this.likeService.checkLikeExistence(input);

 
    if (existLike) {
      const result =  await this.likeService["likeModel"].findByIdAndDelete(existLike._id);

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

// public async getAllProducts(inquiry?: { search?: string; productCollection?: string }): Promise<any[]> {
//   try {
//     console.log("getAllProducts service");
//     console.log("inquiry:", inquiry);  // ← bu bor

//     const match: any = {
//       productStatus: { $ne: "DELETE" }
//     };

//     if (inquiry?.search) {
//       match.$or = [
//         { productName: { $regex: inquiry.search, $options: 'i' } },
//         { productBrand: { $regex: inquiry.search, $options: 'i' } }
//       ];
//     }

//     if (inquiry?.productCollection) {
//       match.productCollection = inquiry.productCollection;
//     }

//     console.log("match:", JSON.stringify(match));  // ← qo'shing
    
//     const result = await this.productModel
//       .find(match)
//       .sort({ createdAt: -1 })
//       .lean()
//       .exec();

//     console.log("result count:", result.length);  // ← qo'shing

//     return result as unknown as any[];

//   } catch (err) {
//     console.log("Error, getAllProducts service", err);
//     throw new Errors(HttpCode.INTERNAL_SERVER_ERROR, Message.SOMETHING_WENT_WRONG);
//   }
// }

// services/product.service.ts

public async getAllProducts(inquiry?: { search?: string; productCollection?: string }): Promise<any[]> {
  try {
    console.log("===== getAllProducts service called =====");
    console.log("Received inquiry:", inquiry);

    // Bazaviy filter (DELETE holatidagi productlarni chiqarma)
    const match: any = {
      productStatus: { $ne: "DELETE" }
    };

    // Agar search bo'lsa: productName yoki productBrand ichida qidirish
    if (inquiry?.search) {
      match.$or = [
        { productName: { $regex: inquiry.search, $options: "i" } },
        { productBrand: { $regex: inquiry.search, $options: "i" } }
      ];
    }

    // Agar category tanlangan bo'lsa
    if (inquiry?.productCollection && inquiry.productCollection !== "") {
      match.productCollection = inquiry.productCollection;
    }

    console.log("MongoDB filter (match):", JSON.stringify(match, null, 2));

    // DB query
    const result = await this.productModel
      .find(match)
      .sort({ createdAt: -1 })  // oxirgi qo'shilgan birinchi
      .lean()
      .exec();

    console.log("Number of products found:", result.length);

    return result as unknown as any[];

  } catch (err) {
    console.error("Error in getAllProducts service:", err);
    throw new Errors(HttpCode.INTERNAL_SERVER_ERROR, Message.SOMETHING_WENT_WRONG);
  }
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