import {Request, Response} from "express";
import { T } from "../libs/types/common";
import Errors, { HttpCode, Message } from "../libs/Errors";
import ProductService from "../models/Product.service";
import { AdminRequest, ExtendedRequest } from "../libs/types/member";
import { ProductInput, ProductInquiry, ProductUpdateInput } from "../libs/types/product";
import { ProductCollection } from "../libs/enums/product.enum";

const productService = new ProductService(); //Product service model clasidan productService objectni hosil qildik 

const productController: T ={}; //productController nomli yangi object yaratdik type qilib Tni belgiladik

/** SPA */

productController.getProducts = async (req: Request, res: Response) => {
  try {
    console.log("getProducts");
    console.log(req.query);

    const {
      page = 1,
      limit = 10,
      order = "createdAt",
      productCollection,
      search,
      productRam,
      productMemory,
    } = req.query;

    const inquiry: ProductInquiry = {
      order: String(order),
      page: Number(page),
      limit: Number(limit),
    };

    if (productCollection)
      inquiry.productCollection = productCollection as ProductCollection;

    if (search) inquiry.search = String(search);

    // 🔥 NEW
    if (productRam) inquiry.productRam = String(productRam);
    if (productMemory) inquiry.productMemory = String(productMemory);

    const result = await productService.getProducts(inquiry);

    res.render("products", { products: result });

  } catch (err) {
    console.log("Error, getProducts", err);

    if (err instanceof Errors) res.status(err.code).json(err);
    else res.status(Errors.standard.code).json(Errors.standard);
  }
};

productController.getProduct = async (
  req: ExtendedRequest,
  res: Response
) => {
  try {
    console.log("getProduct");

    const { id } = req.params;

    // ❗ id tekshiruv (optional lekin pro-level)
    if (!id) {
      throw new Errors(HttpCode.BAD_REQUEST, Message.REQUIRED_PRODUCT_ID);
    }

    // 🔥 agar login bo‘lsa → memberId olinadi
    const memberId = req.member?._id ?? null;

    console.log("memberId:", memberId);

    const result = await productService.getProduct(
      memberId,
      id as string
    );

    res.status(HttpCode.OK).json(result);

  } catch (err) {
    console.log("Error, getProduct", err);

    if (err instanceof Errors) {
      res.status(err.code).json(err);
    } else {
      res.status(Errors.standard.code).json(Errors.standard);
    }
  }
};







/** SSR */

productController.getAllProducts = async (
  req: Request,
  res: Response
) => {
  try {
    console.log("getAllProducts");

    const data = await productService.getAllProducts();

    console.log("products count:", data.length);

    // 🔥 EJS render
    res.render("products", {
      products: data
    });

  } catch (err) {
    console.log("Error, getAllProducts", err);
  }
};

productController.createNewProduct = async (
  req: AdminRequest,
  res: Response
) => {
  try {
    console.log("createNewProduct");
    console.log("req.body:", req.body);
    console.log("files:", req.files);

    // ❗ IMAGE VALIDATION
    if (!req.files || !(req.files as Express.Multer.File[]).length) {
      throw new Errors(HttpCode.BAD_REQUEST,Message.REQUIRED_PRODUCT_IMAGES);
    }

    const data: ProductInput = req.body;

    // 🔥 IMAGE PATH FIX (Windows fix ham bor)
    data.productImages = (req.files as Express.Multer.File[]).map(file =>
      file.path.replace(/\\/g, "/")
    );

    // 🔥 TYPE CONVERSION (MUHIM)
    data.productPrice = Number(data.productPrice);
    data.productLeftCount = Number(data.productLeftCount);

    // 🔥 TELEPHONE VALIDATION
    if (
      data.productCollection === ProductCollection.TELEPHONE &&
      (!data.productRam || !data.productMemory)
    ) {
      throw new Errors(
        HttpCode.BAD_REQUEST,
        Message.RAM_MEMORY_REQUIRED
      );
    }

    // 🔥 ACCESSORY yoki OTHER bo‘lsa RAM/MEMORY ni olib tashlaymiz
    if (data.productCollection !== ProductCollection.TELEPHONE) {
      data.productRam = undefined;
      data.productMemory = undefined;
    }

    await productService.createNewProduct(data);

    // ✅ SUCCESS
    res.send(`
      <script>
        alert("Successful creation");
        window.location.replace("/admin/product/all");
      </script>
    `);

  } catch (err) {
    console.log("Error, createNewProduct", err);

    const message =
      err instanceof Errors
        ? err.message
        : "Something went wrong";

    res.send(`
      <script>
        alert("${message}");
        window.location.replace("/admin/product/all");
      </script>
    `);
  }
};
productController.updateChosenProduct = async (
  req: Request,
  res: Response
) => {
  try {
    console.log("updateChosenProduct");

    const { id } = req.params;

    // ❗ ID VALIDATION
    if (!id) {
      throw new Errors(HttpCode.BAD_REQUEST, Message.REQUIRED_PRODUCT_ID);
    }

    console.log("_id:", id);
    console.log("body:", req.body);

    const input: ProductUpdateInput = req.body;

    // 🔥 TYPE CONVERSION (MUHIM)
    if (input.productPrice) {
      input.productPrice = Number(input.productPrice);
    }

    if (input.productLeftCount) {
      input.productLeftCount = Number(input.productLeftCount);
    }

    const result = await productService.updateChosenProduct(id, input);

    res.status(HttpCode.OK).json({
      success: true,
      data: result
    });

  } catch (err) {
    console.log("Error, updateChosenProduct", err);

    if (err instanceof Errors) {
      res.status(err.code).json(err);
    } else {
      res.status(Errors.standard.code).json(Errors.standard);
    }
  }
};

export default productController; //File modul sifatida ishlatish uchun export qilib oldik