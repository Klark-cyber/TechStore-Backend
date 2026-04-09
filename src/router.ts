import express, {Request, Response} from "express";
import memberController from "./controllers/member.controller"; 
import uploader from "./libs/utils/uploader";
import productController from "./controllers/product.controller";
import orderController from "./controllers/order.controller";

const router = express.Router();

// Member
router.get('/member/admin', memberController.getAdmin);
router.post('/member/signup', memberController.signup);
router.post('/member/login', memberController.login);
router.post('/member/logout',  memberController.logout); //Agar user logout bolmoqchi bolsa login bolgan bolishi kerak shu sababli verifyAuth middlewareni ishlatyapmiz
router.get('/member/detail',
    memberController.verifyAuth, 
    memberController.getMemberDetail) //Bu url orqali cookielar orqali shaxsni kim ekanligini aniqllashtiramiz
router.post('/member/update', 
    memberController.verifyAuth, 
    uploader("members").single('memberImage'), //memberSchema modelda userdan keladigan rasmni memberImage nomi ostida kelishini belgilagandik
    memberController.updateMember);

router.get('/member/top-users', memberController.getTopUsers);



// Prduct
router.get('/product/all', productController.getProducts);
router.get('/product/:id', 
    memberController.retrieveAuth, 
    productController.getProduct);
router.get(
    "/product/like/:id",
    memberController.verifyAuth, // user login bo‘lishini tekshiradi
    productController.likeProduct
);


// Order
router.post("/order/create", memberController.verifyAuth, orderController.createOrder)
router.get("/order/all", memberController.verifyAuth, orderController.getMyOrders);
router.post("/order/update", memberController.verifyAuth, orderController.updateOrder)

export default router