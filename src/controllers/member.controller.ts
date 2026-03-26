import {NextFunction, Request, Response} from "express"; //{ req va res} qavs ichidaligiga sabab u export bolgan fileda req va res dan boshqa export bolgan malumotlar ham bor
import {T} from "../libs/types/common"; //T interfaceni import qildik
import MemberService from "../models/Member.service";
import { ExtendedRequest, LoginInput, Member, MemberInput, MemberUpdateInput } from "../libs/types/member";
import Errors, { HttpCode, Message } from "../libs/Errors";
import AuthService from "../models/Auth.service";
import { AUTH_TIMER } from "../libs/config";

const memberService = new MemberService(); 
const authService = new AuthService(); //Yangi Authservice service modelidan instance oldik

const memberController: T ={};
 
//REACT loyihamiz uchun

memberController.getRestaurant = async (req: Request, res: Response) => {
    try{
        console.log("getRestaurant"); 
        const result = await memberService.getRestaurant();
        
        res.status(HttpCode.OK).json(result)
    }catch(err){
    console.log("Error, getTopUsers", err)
    if (err instanceof Errors) res.status(err.code).json(err);
    else res.status(Errors.standard.code).json(Errors.standard);
    }
}


memberController.signup = async (req: Request, res: Response ) => {
    try{
        console.log("signup "); //Mantiq ishga tushganini yani buyruq ishga tushganini tekshiramiz.natija terminalda paydo boladi
        console.log("body:", req.body) //postman orqali frontenddan yuborilgan postlarni terminalda log qildik
       
        const input: MemberInput = req.body, //MemberInput new memberning type bolib uni alohida fileda shkllantirib oldik
         result: Member = await memberService.signup(input);
         console.log(result)
         const token = await authService.createToken(result);
         console.log("token =>", token)

         res.cookie("accessToken", token, {maxAge: AUTH_TIMER*3600*1000, httpOnly: false}) //Endi res.orqali browserga AcessToken nomi orqali yangi cookie hosil qila olamiz. token-acessToken ichiga saqlashimiz kerak bolgan malumot. maxAge optional bolib tokennning browserdagi yashash muddati.
        //TODO: TOKENS

        res.status(HttpCode.CREATED).json({ member: result, accessToken: token });
    } catch (err) { //Agar malumot memberSchema talabiga javob bermasa masalan phoneNumber takroriy bolsa err yuzaga keladi.
        console.log("Error, processSignup", err)
        if (err instanceof Errors) res.status(err.code).json(err);
        else res.status(Errors.standard.code).json(Errors.standard);
    }
};



memberController.login = async (req: Request, res: Response ) => { 
    try{
        console.log("login "); //Mantiq ishga tushganini yani buyruq ishga tushganini tekshiramiz.natija terminalda paydo boladi
        console.log("body:", req.body);

        const input: LoginInput = req.body, //input browserdan kelgan requestning bodysi
            result = await memberService.login(input), //processLogin methodi async bolganiga awaitni yozdik
            token = await authService.createToken(result); //createToken methode memberga tegishli malumotlarni token holatiga yani oqib bolmaydigan stringga aylantirib beradi.
            console.log("token is:", token)
        //TODO: TOKENS AUTHENTIFICATION
        res.cookie("accessToken", token, {maxAge: AUTH_TIMER*3600*1000, httpOnly: false}) //Endi res.orqali browserga AcessToken nomi orqali yangi cookie hosil qila olamiz. token-acessToken ichiga saqlashimiz kerak bolgan malumot. maxAge optional bolib tokennning browserdagi yashash muddati.
        //TODO: TOKENS

        res.status(HttpCode.OK).json({ member: result, accessToken: token });

        
    } catch (err) {
        console.log("Error, login", err)
    if (err instanceof Errors) res.status(err.code).json(err);
    else res.status(Errors.standard.code).json(Errors.standard);
    }
};

memberController.logout = (req: ExtendedRequest, res: Response) => {

    try{
        console.log("logout")
        res.cookie("accessToken", '', { maxAge: 0, httpOnly: true} ); //res tarkibidagi cookieni ichidagi accessTokenni tugatishimiz kerak boladi
        res.status(HttpCode.OK, ).json({logout: true});
    }catch(err){
    console.log("Error, login", err)
    if (err instanceof Errors) res.status(err.code).json(err);
    else res.status(Errors.standard.code).json(Errors.standard);
    }
}

memberController.getMemberDetail = async (req: ExtendedRequest, res: Response) => { //Bu method ishga tushishidan oldin verifyAuth midleware natijasida req.member request tarkibiga qoshiladi va ushbu methodga kelgan request ichida osha memberga tegishli malumotlar shakllanib tayyor holatda boladi
    try{
        console.log("getMemberDetail") 
        const result = await memberService.getMemberDetail(req.member);
        res.status(HttpCode.OK).json(result)
    }catch(err){
    console.log("Error, login", err)
    if (err instanceof Errors) res.status(err.code).json(err);
    else res.status(Errors.standard.code).json(Errors.standard);
    }
}

memberController.updateMember = async (req: ExtendedRequest, res: Response) => {
    try{
        console.log("updateMember") 
        const input: MemberUpdateInput = req.body;
        if(req.file) input.memberImage = req.file.path.replace(/\\/,"/"); //regular expression windows uchun  
        const result = await memberService.updateMember(req.member, input)
        res.status(HttpCode.OK).json(result);

    }catch(err){
    console.log("Error, updateMember", err)
    if (err instanceof Errors) res.status(err.code).json(err);
    else res.status(Errors.standard.code).json(Errors.standard);
    }
}


memberController.getTopUsers = async (req: Request, res:Response) => {
     try{
        console.log("topUsers") 
        const result = await memberService.getTopUsers();
        res.status(HttpCode.OK).json(result)
    }catch(err){
    console.log("Error, getTopUsers", err)
    if (err instanceof Errors) res.status(err.code).json(err);
    else res.status(Errors.standard.code).json(Errors.standard);
    }
}



memberController.verifyAuth = async (req : ExtendedRequest , res : Response, next: NextFunction) => {
    try{
        const token = req.cookies["accessToken"]; //browserdan kelgan request ichida accessToken mavjudligini tekshiramiz
        if(token) req.member = await authService.checkAuth(token);
        if(!req.member) throw new Errors(HttpCode.UNAUTHORIZED, Message.NOT_AUTHENTIFICATED)
        next(); //agar user login bolsa keyingi bosqichga otadi
    }catch(err) {
         console.log("Error, verifyAuth", err)
    if (err instanceof Errors) res.status(err.code).json(err);
    else res.status(Errors.standard.code).json(Errors.standard); //Agar user login bolmagan bolsa userga togridan togri err responseni amalga oshiradi 
    }
}

    memberController.retrieveAuth = async (req : ExtendedRequest , res : Response, next: NextFunction) => { //Bu method user authentificated bolganini tekshiradi agar logi bolsa keyingi bosqichga otadi agar err yuzaga kelsa ham keyingi bosqichga otadi.Hamda request tarkibida member nomli object yaratib unga memberni qoshamiz
    try{
        const token = req.cookies["accessToken"]; //browserdan kelgan request ichida accessToken mavjudligini tekshiramiz
        if(token) req.member = await authService.checkAuth(token); //payload yani decode token malumotlarini member orqali req ga yuklayi
        next();
    }catch(err) { //xar qanday holatda ham keyingi bosqichga otsin.yani login bolmagan bolsa ham keyingi bosqichga otkazib yuboradi
         console.log("Error, retrieveAuth", err);
         next();
    }
}

export default memberController; //default orqali export qilsak filening umumiy yaxlit natijasini export qilgan bolamiz. Agar export qilinadigan natija bir nechta bolsa defolt sozi ishlatilmaydi.