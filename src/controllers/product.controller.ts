import {Request, Response} from "express";
import { T } from "../libs/types/common";
import Errors, { HttpCode, Message } from "../libs/Errors";
import ProductService from "../models/Product.service";
import { AdminRequest, ExtendedRequest } from "../libs/types/member";
import { ProductInput, ProductInquiry } from "../libs/types/product";
import { ProductCollection } from "../libs/enums/product.enum";

const productService = new ProductService(); //Product service model clasidan productService objectni hosil qildik 

const productController: T ={}; //productController nomli yangi object yaratdik type qilib Tni belgiladik

/** SPA */

productController.getProducts = async (req: Request, res: Response) => {
    try{    
        console.log("getProducts "); //Mantiq ishga tushganini yani buyruq ishga tushganini tekshiramiz.natija terminalda paydo boladi
        const {page, limit, order, productCollection, search } = req.query
        //console.log(`page: ${page}, order: ${order}, prductCollection: ${productCollection}`)
        console.log(req.query)
        console.log("keldi")
        const inquiry: ProductInquiry = {
            order: String(order),
            page: Number(page),
            limit: Number(limit), //yuqoridagi 3 ta qiymat doim mavjud bolishi kerak sababi uni product.ts ichida productInquiry ichida majburiy bor bolishini belgilaik
        };
        if(productCollection) inquiry.productCollection = productCollection as ProductCollection //productCollection ProductCollection ichidagi Enum qiymatlardan iborat
        if(search) inquiry.search = String(search)

        const result = await productService.getProducts(inquiry);

        res.status(HttpCode.OK).json(result)
        // const query = req.query; //?name=david&age=28&nation=german => natija: { name: 'david', age: '28', nation: 'german' }
        // console.log("req,query:", req.query)
        // const params = req.params;
        // console.log("req.params:", req.params) //request orqali paramsni olmoqchi bolsak avval router ichiga "/product/all/:id" /5kvfry => natija: { id: '5kvfry' }. paramsni urlning header qismi davomidan istalgancha qoshish mumkin.Shuningdek params va queryni ketma ket birgalikda ishlatish ham mumkin


    } catch (err) { 
        console.log("Error, getProducts", err)
        if (err instanceof Errors) res.status(err.code).json(err);
        else res.status(Errors.standard.code).json(Errors.standard);
    }
}

productController.getProduct = async (req: ExtendedRequest, res: Response) => { //getProductsga kelgan req dastlab retrievAuthga keladi agar user login bolgan bolsa req.member req tarkibiga qoshiladi.Shu sababli req: Extendedrequest boldi
    try{
        console.log("getProduct");
        const { id } = req.params;
        console.log("req.member",req.member)
        const memberId = req.member?._id ?? null, //agar req.member mavjud bolsa uni ichidan _id ni olib ber mavjud bolmasa memberId ni null ga tengla
              result = await productService.getPoduct(memberId, id as String);
        res.status(HttpCode.OK).json(result);
    }catch (err) { 
        console.log("Error, getProduct", err)
        if (err instanceof Errors) res.status(err.code).json(err);
        else res.status(Errors.standard.code).json(Errors.standard);
    }
    
}







/** SSR */

productController.getAllProducts = async (req: Request, res: Response ) => {
try{    
        console.log("getAllProducts "); //Mantiq ishga tushganini yani buyruq ishga tushganini tekshiramiz.natija terminalda paydo boladi
        const data = await productService.getAllProducts();
        // console.log("req.member:", req.member,) //Bu qator ishlashi uchun type Requestni AdminRequestga ozgartirish kerk boladi. sababi request tarkibida req.session.member mavjud
        console.log("products:", data)

        res.render("products", {products: data});// productController.getAllProducts methodi browserga wiews orqali pducts.ejs ni render qilyapti

    } catch (err) { 
        console.log("Error, getAllProducts", err)
        if (err instanceof Errors) res.status(err.code).json(err);
        else res.status(Errors.standard.code).json(Errors.standard);
    }
};

productController.createNewProduct = async (req: AdminRequest, res: Response ) => { //Bu mesod orqali yangi product qoshish mantiqini hosil qilamiz
try{
       console.log("createNewProduct "); //Mantiq ishga tushganini yani buyruq ishga tushganini tekshiramiz.natija terminalda paydo boladi
       console.log("req.body:", req.body)
       console.log("Files:", req.files) //agar browserdan bir nechta file kirib kelsa files, agar 1 dona rasm yoki file kelsa req.file orqali tekshiramiz.Buni multerning array hamda single nomli methodlari orqali yaratganmiz
      
       if(!req.files?.length) throw new Errors(HttpCode.INTERNAL_SERVER_ERROR, Message.CREATE_FAILED) //Agar user rasm qoshmagan bolsa ushbu errorni yuboramiz
       
        const data:ProductInput = req.body;
        data.productImages = req.files?.map(ele => {
           return ele.path.replace(/\\/g, '/'); //replace dan keyingi qism windowsda sodir boladigan xatolikni oldini olish uc=uchun yozildi 
        });

        await productService.createNewProduct(data);

        res.send(`<script> alert("Sucessfull creation"); window.location.replace("/admin/product/all")</script>`) // messageni res.send qildik shuningdek pageni admin/login ga otkazib yubordik
    } catch (err) { //Agar malumot memberSchema talabiga javob bermasa masalan phoneNumber takroriy bolsa err yuzaga keladi.
        console.log("Error, createNewProduct", err)
        const message = err instanceof Errors ? err.message : Message.SOMETHING_WENT_WRONG
         res.send(`<script> alert("${message}"); window.location.replace("/admin/product/all")</script>`) // messageni res.send qildik shuningdek pageni admin/login ga otkazib yubordik
    }
};

productController.updateChosenProduct = async (req: Request, res: Response ) => {
try{
        console.log("updateChosenProduct "); //Mantiq ishga tushganini yani buyruq ishga tushganini tekshiramiz.natija terminalda paydo boladi
        const id = req.params.id; //id bu url tarkibidagi mavjud element bolib, uni params orqali ajratib olib Objectidga aylantirib osha elementga tegishli malumotni ozgartirish uchun ozgartiryapmiz
        console.log("_id:", id); //params orqali url tarkibida kelayotgan kerakli paramsni ajratib oldik. (/:id) 
        const result = await productService.updateChosenProduct(id, req.body) //req.body togridan togri argument sifatida berildi. Sababi req.body tarkibida xech narsa ozgartirilmadi
        res.status(HttpCode.OK).json({data: result})
    } catch (err) { //Agar malumot memberSchema talabiga javob bermasa masalan phoneNumber takroriy bolsa err yuzaga keladi.
        console.log("Error, updateChosenProduct", err)
        if (err instanceof Errors) res.status(err.code).json(err);
        else res.status(Errors.standard.code).json(Errors.standard);
    }
};

export default productController; //File modul sifatida ishlatish uchun export qilib oldik