import {NextFunction, Request, Response} from "express"; //{ req va res} qavs ichidaligiga sabab u export bolgan fileda req va res dan boshqa export bolgan malumotlar ham bor
import {T} from "../libs/types/common"; //T interfaceni import qildik
import MemberService from "../models/Member.service";
import { AdminRequest,LoginInput, MemberInput } from "../libs/types/member";
import { MemberType } from "../libs/enums/member.enum";
import { HttpCode, Message } from "../libs/Errors";
import Errors from "../libs/Errors";

const memberService = new MemberService(); //memberService bu MemberService() member service model ichida yaratilgan klassdan instance olgan  klass
const restaurantController: T ={};

restaurantController.goHome = (req: Request, res: Response ) => {
    try{ //
        console.log("goHome"); //Mantiq ishga tushganini yani buyruq ishga tushganini tekshiramiz.natija terminalda paydo boladi
        // LOGIC
        // SERVICE MODEL
        res.render('home'); //Express application views folder ichidagi home.ejs filega olib boradi 
        /*RESPONSE turlari:
            - send
            - json
            - redirect => boshqa urlga yuborish uchun
            - end
            - render  */
    } catch (err) { // catch qachonki try ichida biror xatolik sababli try amalga oshmasa osha error err bolib catchga parametr sifatida yuboriladi.
        console.log("Error, goHome:", err) //err try ichidag yuzaga kelgan xatolik
        res.redirect("/admin")
    }
};

restaurantController.getSignup = (req: Request, res: Response ) => {
    try{
        console.log("getSignup"); //Mantiq ishga tushganini yani buyruq ishga tushganini tekshiramiz.natija terminalda paydo boladi
        //res.send("SignUp Page") //Faqat signup Page sozini browserga yuboradi
        res.render('signup'); //views ichidagi signup.ejs filega yonaladi
    } catch (err) {
        console.log("Error, getSign:", err)
        res.redirect("/admin")
    }
};

restaurantController.getLogin = (req: Request, res: Response ) => {
    try{
        console.log("getLogin"); //Mantiq ishga tushganini yani buyruq ishga tushganini tekshiramiz.natija terminalda paydo boladi
        res.render('login'); //views ichidagi login.ejs filega yonaladi
    } catch (err) {
        console.log("Error, getLogin:", err)
        res.redirect("/admin")
    }
};

restaurantController.processSignup = async (req: AdminRequest, res: Response ) => { //Admin request Requestdan etands bolib yasalgan interface
    try{
        console.log("processSignup "); //Mantiq ishga tushganini yani buyruq ishga tushganini tekshiramiz.natija terminalda paydo boladi
        console.log("body:", req.body) //postman orqali frontenddan yuborilgan postlarni terminalda log qildik
       
        const newMember: MemberInput = req.body; //MemberInput new memberning type bolib uni alohida fileda shkllantirib oldik
        const file = req.file; //req.body ichida yuborilgan file yoki rasmning pathi yani joylashgan manzilini ajratib oldik
        if(!file) throw new Errors(HttpCode.BAD_REQUEST, Message.SOMETHING_WENT_WRONG) ///Agar user ras yuklamagan bolsa ushbu errorni yuboramiz
        
        newMember.memberImage = file?.path.replace(/\\/g, '/'); //rasm yoki file joylashgan manzilni agar mavjud bolsa Newmember.memberImagega tengladik.Bunday qilishdan maqsad DB ga rasmni emas rasm joylashgan manzilni yoqzmoqchimiz
        newMember.memberType = MemberType.ADMIN; //newMemberning defout type USER ammo biz uni RESTAURANTga tenglab oldik

        const result = await memberService.processSignup(newMember);
        //TODO: TOKENS AUTHENTIFICATION
        
        req.session.member = result; //req-request session midleware qismida hosil bolgan va har bir requestga avtomatik qoshiladigan object.member ozimiz yaratgan object nomi. session collection ichiga resultni borib joyladik.Shuningdek browser cookie ga SessionId ni yubordik.Agar bu qator bolmasa collectionga faqat session saqlanadi result saqlanmaydi.Natijada keyinchalik shu browserdan keladigan req uchun ayni shu browserga tegishli malumotni res.send qila olmaymiz
        // req.session.save(function(){ 
        //     res.redirect("/admin/product/all"); //save muvafaqqiyatli amalga oshsa browserni product/all pagega redirect qildik
        // });
        res.send(result)

    } catch (err) { //Agar malumot memberSchema talabiga javob bermasa masalan phoneNumber takroriy bolsa err yuzaga keladi.
        console.log("Error, processLogin", err)
        const message = err instanceof Errors ? err.message : Message.SOMETHING_WENT_WRONG; //Agar err Errors ga tegishli bolsa err.messageni aks holda Message.Something_went_wrongni yubor
        console.log("a")
        res.send(
            `<script> alert("${message}"); window.location.replace("/admin/signup") </script>`) // messageni res.send qildik shuningdek pageni admin/signup ga otkazib yubordik
    }
};

restaurantController.processLogin = async (req: AdminRequest, res: Response ) => { 
    try{
        console.log("processLogin "); //Mantiq ishga tushganini yani buyruq ishga tushganini tekshiramiz.natija terminalda paydo boladi
        console.log("body:", req.body);
        const input: LoginInput = req.body; //input browserdan kelgan requestning bodysi

        const result = await memberService.processLogin(input); //processLogin methodi async bolganiga awaitni yozdik
        //TODO: TOKENS AUTHENTIFICATION
        
        
        req.session.member = result; // session collection ichiga resultni borib joyladik.Shuningdek browser cookie ga SessionId ni yubordik.Agar bu qator bolmasa collectionga faqat session saqlanadi result saqlanmaydi.Natijada keyinchalik shu browserdan keladigan req uchun ayni shu browserga tegishli malumotni res.send qila olmaymiz
        req.session.save(function(){ //req.session.save internet pas hududlarda req.session.member yani session collection amalga oshmasdan kngi qator kodlar ishga tushib ketishini oldini oladi yani malumot 100% dB ga yozilishini taminlaydi
             res.redirect("/admin/product/all"); //save muvafaqqiyatli amalga oshsa browserni product/all pagega redirect qildik
        });

    } catch (err) {
        console.log("Error, processLogin", err)
        const message = err instanceof Errors ? err.message : Message.SOMETHING_WENT_WRONG; //Agar err Errors ga tegishli bolsa err.messageni aks holda Message.Something_went_wrongni yubor
         res.send(
            `<script> alert("${message}"); window.location.replace("/admin/signup") </script>`) // messageni res.send qildik shuningdek pageni admin/signup ga otkazib yubordik // messageni res.send qildik shuningdek pageni admin/login ga otkazib yubordik
    }
};

restaurantController.checkAuthSession = async (req: AdminRequest, res: Response ) => { //Test uchun yozilgan ushbu Apida agar body qismida rreq.session.member mavjud bolsa uni Hi burakni yubordik.
    try{
        console.log("checkAuthSession "); //Mantiq ishga tushganini yani buyruq ishga tushganini tekshiramiz.natija terminalda paydo boladi
        console.log("body:", req.body);
        if(req.session?.member) //? belgisini yozishimizga sabab agar req tarkibida member mavjud bolsa kerakli response yuboriladi.Agar member mavjud bolmas yani user hali login qilib sidni olmagan bolsa error bolib side ishlamay qolishini oldini olish uchun
            res.send(`<script> alert("Hi ${req.session.member.memberNick}")</script>`) //Agar req.session ichida member mavjud bolmasa res.send orqali matn yubordik
        else res.send(`<script> alert("Hi ${Message.NOT_AUTHENTIFICATED}")</script>`); //Agar req.session.member mavjud bolmasa browserga customize error orqali yaratilgan yangi habar yubordik.<script> tegi orqali javaScript korinishiga keltirib oldik
    } catch (err) {
        console.log("Error, processLogin", err)
        res.send(err) //Agar biror err hosil bolsa osha errni ozini browserga yubordik
    }
};

restaurantController.logout = (req: AdminRequest, res: Response ) => { 
    try{
        console.log("logout "); //Mantiq ishga tushganini yani buyruq ishga tushganini tekshiramiz.natija terminalda paydo boladi
        req.session.destroy(function(){ //agar logoutdan request kelsa osha req.session.memberga tegishli malumotlar destroy methodi orqali collectiondan ochirib yuboriladi
            res.redirect("/admin")
        })

    } catch (err) {
        console.log("Error, processLogin", err)
        res.redirect("/admin") //error yuzaga kelsa ham /admin pagega redirect qildi
    }
};
restaurantController.getUsers = async (req: Request, res: Response ) => {
    try{
        console.log("getUsers"); //Mantiq ishga tushganini yani buyruq ishga tushganini tekshiramiz.natija terminalda paydo boladi
        const result = await memberService.getUsers();
        console.log("result :", result)
        res.render("users", {users: result}); //users ejsga users nomli objectimizga resultni provide qilyapmiz yani path qilyapmiz 
    } catch (err) {
        console.log("Error, getUsers:", err)
        res.redirect("/admin")
    }
}

restaurantController.updateChosenUser = async (req: Request, res: Response ) => {
    console.log("kirib keldi")
    try{
        console.log("updateChosenUser"); //Mantiq ishga tushganini yani buyruq ishga tushganini tekshiramiz.natija terminalda paydo boladi
        const result = await memberService.updateChosenUser(req.body)

        res.status(HttpCode.OK).json({data: result})
    } catch (err) {
        console.log("Error, updateChosenUser:", err)
        if (err instanceof Errors) res.status(err.code).json(err);
        else res.status(Errors.standard.code).json(Errors.standard);

    }
}

restaurantController.verifyRestaurant = (req: AdminRequest, res: Response, next: NextFunction) => { // user kim ekanligini aniqlab restoran user ekanligini tekshirishi kerak bolgan middleware yozamiz.Bu mantiq faqatgina userlar productcontroller methodlaridan foydalana olishi uchun qilindi.Next: Nextfunction bu middlewareda qollaniladigan funksiya
        if(req.session?.member?.memberType === MemberType.ADMIN){ //? belgisini yozishimizga sabab agar req tarkibida member mavjud bolsa kerakli response yuboriladi.Agar member mavjud bolmas yani user hali login qilib sidni olmagan bolsa error bolib side ishlamay qolishini oldini olish uchun
         req.member = req.session.member; //Bu qator filtr vazifasini bajardi yani member mavjud bolgan requestlarnigina yani login bolgan userlarni otkazib yuboradi.Agar member mavjud bolmasa padagi catch ishga tushadi va userni login bolish uchun login pagega yuboradi.Shuningdek productcontroller ichidagi methodlarni yuqoridagi kabi if ichidagi shartga oxshab tekshirishni shart emas.Sabab verifiyRestoan allaqachon buni bizga bajarib berdi
         //req.raqam = req.session.member.memberPhone
         next(); //next qoyilishiga sabab tekshiruv tugagandan song keyingi bosqichga yani productkontrollerning methodlari ishga tushishi kerakligini anglatadi
    } else {
        const message = Message.NOT_AUTHENTIFICATED
       res.send(`<script> alert(" ${message}"); window.location.replace('/admin/login')</script>`); //Agar login bolmagan user topilsa uni avval login bol deb login pagega yuboramiz
    }
  
}

export default restaurantController; //default orqali export qilsak filening umumiy yaxlit natijasini export qilgan bolamiz. Agar export qilinadigan natija bir nechta bolsa defolt sozi ishlatilmaydi.