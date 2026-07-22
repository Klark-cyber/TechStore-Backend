import express, { Request, Response } from "express";
import adminController from "./controllers/admin.controller"; //memberController {} qavssiz import bolganiga sabab memberController ozi joylashgan fileda export bolgan boshqa malumot yoqligidaa
import productController from "./controllers/product.controller";
//import { uploadProductImage } from "./libs/utils/uploader";
import makeUploader from "./libs/utils/uploader";
const routerAdmin = express.Router();

/* Admin (store owner) */
routerAdmin.get('/', adminController.goHome);

routerAdmin
    .get('/login', adminController.getLogin)
    .post('/login', adminController.processLogin);//pasdagi kodlarni shu shaklda chiroyli holatga keltirdik
//routerAdmin.post('/login', adminController.processLogin) //login urlidan ham GET/POST methodi uchun foydalandik.
//routerAdmin.post('/login/process', adminController.processLogin) //post methodini sinash uchun alohida processLogin methodini shakllantirdik.Lekin browser getdan boshqa methodlarni ishga tushura olmaydi

routerAdmin
    .get('/signup', adminController.getSignup)
    .post('/signup', makeUploader('members').single("memberImage"))
    .post('/signup', adminController.processSignup);//

routerAdmin.get('/check-me', adminController.checkAuthSession);

routerAdmin.get('/logout', adminController.logout)


/* Product */
routerAdmin.get("/product/all",
    adminController.verifyAdmin,
    productController.getAllProducts) //endpoin product/all bolsa productControllening getAll products methodi ishga tushadi


routerAdmin.post("/product/create",
    adminController.verifyAdmin,
    //uploadProductImage.single("productImage"), //royxatdan otgan Restoran uchun yangi productga tegishli file va rasm qoshishga ruxsat berish mantigi. single() bitta file uchun , array() bir nechta file yuklaydi
    makeUploader('products').array("productImages", 5), //multer req.bodyda kelgan fileni tutib serverga saqlab beradi
    productController.createNewProduct) //adminController.verifyAdmin yozishdan maqsad adminController ichida yaratib olgan verifyAdmin midlewareni coll qildik.bu midleware faqatgin login bolgan userlar uchun productController methodlari ishga tushuishi kerakligini anglatadi

routerAdmin.post("/product/:id",
    adminController.verifyAdmin,
    productController.updateChosenProduct)


/* User */ //Bu yerda admin userga tegishli malumotni ozgartira oladi
routerAdmin.get("/user/all", adminController.verifyAdmin, adminController.getUsers)
routerAdmin.post("/user/edit", adminController.verifyAdmin, adminController.updateChosenUser) // ⚠️ TUZATILDI: verifyAdmin O'CHIRIB QO'YILGAN edi — bu shuni anglatardiki, HECH QANDAY login qilmasdan, istalgan kishi bu endpoint'ga o'zi xohlagan _id va maydonlarni (masalan memberType: ADMIN) yuborib, ISTALGAN foydalanuvchini (o'zini ham) admin qilib qo'yishi yoki parolini o'zgartirishi mumkin edi. Endi qayta yoqildi.

export default routerAdmin