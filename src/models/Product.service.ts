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

class ProductService{
    private readonly productModel;
    public viewService;
 constructor(){
        this.productModel = ProductModel;
        this.viewService = new ViewService()
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

public async getPoduct(memberId: ObjectId | null, id: String): Promise<Product[]> {
    const productId = shapeIntoMongooseObjectId(id);

    let result = await this.productModel.findOne({_id: productId, productStatus: ProductStatus.PROCESS}).exec();
    if(!result) throw new Errors(HttpCode.NOT_FOUND, Message.NO_DATA_FOUND)
    
    //TODO: if authentificated users => first => view log creation
    //Bu yerda 2 ta product hamda ViewService servise modellarini integratsiya qilamiz.Agar user login bolgan bolsa korishlar sonini oshiramiz aks holda oshmaydi
    if(memberId) {
        //Check Existence Agar tomosha qilgan bolsa
        const input: ViewInput = { memberId: memberId, viewRefId: productId, viewGroup: ViewGroup.PRODUCT };
        const existView = await this.viewService.checkViewExistence(input);
        console.log("exict:", !!existView) //existView mavjud bolsa true aks holda false qaytaradi

        //Insert New View Log Agar tomosha qilmagan bolsa
        if(!existView) {
            await this.viewService.insertMemberView(input);
        }

        //Increase Counts
        result = await this.productModel.findByIdAndUpdate(productId, {$inc: {productViews: +1}}, { new: true })
        .exec();
    }

    return result
}


    /** SSR */

public async getAllProducts(): Promise<Product[]> { //try?catch ishlatilmadi. try/catch maxsus yani DBga malumot yozgandagina ishlatiladi.Error hosil bolganda handle qilish uchun
    const result = await this.productModel.find().exec() //{new: true} agar qoyilmasa malumot topib ozgartirilsa ham browserga dastlabki korinishi korsatiladi.Yangilangan holatni korish uchun refresh qilishga togri keladi.refreshni oldini oloish uchun new: true qoyildi  
    
    if (!result) throw new Errors(HttpCode.NOT_FOUND, Message.NO_DATA_FOUND)
    return result
}


public async createNewProduct(input: ProductInput): Promise<Product> {
  try {
    if (
      input.productCollection === ProductCollection.TELEPHONE &&
      (!input.productMemory || !input.productRam)
    ) {
      throw new Error("RAM and Memory are required for TELEPHONE");
    }

    if (input.productCollection !== ProductCollection.TELEPHONE) {
      input.productMemory = undefined;
      input.productRam = undefined;
    }

    if (!input.attributes) {
      input.attributes = {};
    }

    return await this.productModel.create(input);

  } catch (err) {
    console.log("Error, model:createNewProduct:", err);

    throw new Errors(HttpCode.BAD_REQUEST, Message.CREATE_FAILED);
  }
}

 public async updateChosenProduct(id: string | string[], input: ProductUpdateInput): Promise<Product> { //try?catch ishlatilmadi. try/catch maxsus yani DBga malumot yozgandagina ishlatiladi.Error hosil bolganda handle qilish uchun
    //id: string => ObjectId
    id = shapeIntoMongooseObjectId(id); //idni stringdan object idga ozgartiryapmiz
    const result = await this.productModel.findOneAndUpdate({_id: id}, input, {new: true}).exec() //{new: true} agar qoyilmasa malumot topib ozgartirilsa ham browserga dastlabki korinishi korsatiladi.Yangilangan holatni korish uchun refresh qilishga togri keladi.refreshni oldini oloish uchun new: true qoyildi  
    
    if (!result) throw new Errors(HttpCode.NOT_MODIFIED, Message.UPDATE_FAILED)
    return result
}

};


export default ProductService;