import MemberModel from "../schema/Member.model";
import { LoginInput, Member, MemberInput, MemberUpdateInput } from "../libs/types/member"
import Errors, { HttpCode, Message } from "../libs/Errors";
import { MemberStatus, MemberType } from "../libs/enums/member.enum";
import * as bcrypt from "bcryptjs"
import { shapeIntoMongooseObjectId } from "../libs/config";

class MemberService { //MemberService module ichida Member Schema modelni ishlatamiz
    private readonly memberModel; //private holatdagi memberModel propertyni yasab oldik
    
    constructor(){
        this.memberModel = MemberModel; //MemberModel bu Member.model.ts ichidagi mongoose orqaali modelga aylantirilgan Member (MemberModel)dir.MemberModel orqali memberModel classini yaratib oldik
    }    

    /** SPA */

    public async getRestaurant(): Promise <Member> {
        const result = await this.memberModel
        .findOne({memberType: MemberType.RESTAURANT})
        .exec();
        if(!result) throw new Errors(HttpCode.NOT_MODIFIED, Message.UPDATE_FAILED)
            
        return result
    }



    public async signup(input: MemberInput): Promise<Member>{ //yangi public methodining defineqismini yasadik.U type MemberInputga teng bolgan inputni qabul qilib uni schima model orqali databasega yozadi. Method nomi ozi xizmat korrsatadigan kontrollerga tegishli restaurant controllerning.processSignup methodi bilan nomdosh bolishi kerak.Ushbu method kontrollerdan kelgan memberlarni schima modelga yuborib beradi 
        const salt = await bcrypt.genSalt() //genSalt() bu tasodifiy string bolib parolga qoshilib hash qilinadi.
        input.memberPassword = await bcrypt.hash(input.memberPassword, salt) //bcryptning hash() metodi orqali paswordni heshing qildik yani oqib bolmaydigan holatga keltirdik. 1- argument hashlanayotgan malumot, 2- argument nima orqali heshlash. bu qatordagi kodni input.memberPassword = await bcrypt.hash(input.memberPassword, 10) korinishida genSaltsiz ishlatish mumkin
       
       
        try{
        const result = await this.memberModel.create(input); //memberModel klasining .create() methodi orqali Db dagi member collectionga yangi malumotlarni olib borib yozdik va natijasini resultga tengladik
    //    const result = new this.memberModel(input); //malumotni DB ga qoshishning 2-usuli. 
    //    const result = await result.save(); 
        result.memberPassword = "" //password consoleda chiqishini oldini olish uchun uni bosh stringga tenglab qoydik
        return result.toJSON()

       }catch(err) { //Aggar biror xatolik sabab malumot DataBasega yozilmasa hosil bolgan error orniga ozimiz yozgan errorni browserga yubordik
        console.error("Error, model:signup", err)
        throw new Errors(HttpCode.BAD_REQUEST, Message.USED_NICK_PHONE); //Bu xato 2 ta holatda: 1-Username yoki password xato yoki malumot bazasida mavjud bolmasagina ishga tushadi
       }
}
    
    public async login(input: LoginInput): Promise<Member>{
        // TODO: Consider member status later
        const member = await this.memberModel
        .findOne( //mongoosening findOne static methodini chaqirib query condition yozamiz.
            {memberNick: input.memberNick,
             memberStatus: {$ne: MemberStatus.DELETE} //$ne no equal yani MemberStatus delete ga teng bomasligi kerak.Bu orqali delete bolib chiqib ketgan userlarni izlab otirma
            }, //findOne static methodi orqali member collectiondan memberNicki request orqali kirib kelgan memberNickga teng bolgan datani topamiz
            {memberNick: 1, memberPassword: 1, memberStatus: 1}) //findOne methodi qabul qiladigan 2 argument bu topilgan malumotning ayni keraklilarini yoki maxfiyligi sababli korinmay qolgan qismini tanlab ajratib olib uchun ishlatiladi. agar 1 qoyilsa faqat osha malumot korinadi, agar 0 qoyilsa osha malumotdan boshqa barchasi korinadi. _id: istisno hisoblanib agar unga 0 qoysak u korinmaydi.Agar qiymat kiritmasak defolt 1 ni qabul qiladi 
        .exec()
        if(!member) throw new Errors(HttpCode.BAD_REQUEST, Message.NO_MEMBER_NICK) //agar kiritilgan malumot member collectionda mavjud bolmasa err yuboramiz.
        else if(member.memberStatus === MemberStatus.BLOCK){ //Agar memberStatus restaran tomonidan blocklangan bolsa uni tekshirib kerakli xabarni yubordik
            throw new Errors(HttpCode.FORBIDDEN, Message.BLOCKED_USER)
        }
       
       const isMatch = await bcrypt.compare(input.memberPassword, member.memberPassword) //bcryptni compare() methodi kritilgan parolni avvaldan heshlangan parol bilan solishtirish imkonini beradi. 1- argument browserdan kelgan parol 2- argument malumot bazasidagi avvaldan heshlangan parol
        // const isMatch = input.memberPassword === member.memberPassword  //true/false //browserda kiritilgan parol malumot bazasida mavjud yoki yoqligini tekshiramiz.
        
        if(!isMatch) throw new Errors(HttpCode.UNAUTHORIZED, Message.WRONG_PASSWORD); //agar parol notogri kiritilga bolsa ozimiz yaratgan Errors customizied klasimiz orqali frontendga error xabarini yuboramiz.Agar error yuzaga kelsa keyingi qatorlar ishga tushmaydi
        
        return await this.memberModel.findById(member._id).lean().exec() //findById methofi orqali member ichidagi bizga korinmay turgan _id: orqalitanlab olib osha idga tegishli malumotlarni return orqali frontendga yuboramiz
    }



    public  async getMemberDetail(member : Member): Promise <Member> {
        const memberId = shapeIntoMongooseObjectId(member._id);
        const result = await this.memberModel.findOne({_id: member._id, memberStatus: MemberStatus.ACTIVE}).exec();
        if(!result) throw new Errors(HttpCode.NOT_FOUND, Message.NO_DATA_FOUND)

        return result;
    }

    public async updateMember(member: Member, input: MemberUpdateInput): Promise<Member> {
        const memberId = shapeIntoMongooseObjectId(member._id);
        const salt = await bcrypt.genSalt() //genSalt() bu tasodifiy string bolib parolga qoshilib hash qilinadi.
        if(input.memberPassword){
            input.memberPassword = await bcrypt.hash(input?.memberPassword as string, salt) //bcryptning hash() metodi orqali paswordni heshing qildik yani oqib bolmaydigan holatga keltirdik. 1- argument hashlanayotgan malumot, 2- argument nima orqali heshlash. bu qatordagi kodni input.memberPassword = await bcrypt.hash(input.memberPassword, 10) korinishida genSaltsiz ishlatish mumkin
        }
        const result = await this.memberModel.findByIdAndUpdate({_id: memberId}, input, { new: true }).exec();
        if(!result) throw new Errors(HttpCode.NOT_MODIFIED, Message.UPDATE_FAILED)

        return result
    } 

    public async getTopUsers(): Promise<Member[]> { //Ushbu method natijasi member of array yani memberlardan tashkil topgan return boladi
    
        const result = await this.memberModel.find(
            {memberStatus: MemberStatus.ACTIVE,
             memberPoints: { $gte: 1 },
            }).sort({ memberPoints: -1 }) //-1 bu memberPointi yuqori bolgan natijalarni yuqoriga kotar sharti.shuningdek 'asc'= +1 va 'desc'= -1 qilib asc va descni raqamlar orniga almashtirib ishlatishimizz mumkin
            .limit(4)
            .exec();
        if(!result) throw new Errors(HttpCode.NOT_FOUND, Message.NO_DATA_FOUND)

        return result 
    } 

        public async addUserPoint(member: Member, point: number): Promise<Member> {
            const memberId = shapeIntoMongooseObjectId(member._id);

            return await this.memberModel.findOneAndUpdate({_id:memberId, memberType: MemberType.USER, memberStatus: MemberStatus.ACTIVE}, {$inc: {memberPoints: point}}, {new:true}).exec();
        }

    

    /** SSR*/

 public async processSignup(input: MemberInput): Promise<Member>{ //yangi public methodining defineqismini yasadik.U type MemberInputga teng bolgan inputni qabul qilib uni schima model orqali databasega yozadi. Method nomi ozi xizmat korrsatadigan kontrollerga tegishli restaurant controllerning.processSignup methodi bilan nomdosh bolishi kerak.Ushbu method kontrollerdan kelgan memberlarni schima modelga yuborib beradi 
    //    const exist = await this.memberModel
    //    .findOne({memberType: MemberType.RESTAURANT})
    //    .exec();
       
    //    if (exist) throw new Errors(HttpCode.BAD_REQUEST, Message.CREATE_FAILED); //Bu shart orqali MemberType RESTAURANT bolgan boshqa member mavjud bolsa unni qabul qilmasdan error yuborish kerakligini yozdik.Sababi Burakda faqat bitta restaurant mavjud bolishi kerak
       
        console.log("before: ", input.memberPassword)

        const salt = await bcrypt.genSalt() //genSalt() bu tasodifiy string bolib parolga qoshilib hash qilinadi.
        input.memberPassword = await bcrypt.hash(input.memberPassword, salt) //bcryptning hash() metodi orqali paswordni heshing qildik yani oqib bolmaydigan holatga keltirdik. 1- argument hashlanayotgan malumot, 2- argument nima orqali heshlash. bu qatordagi kodni input.memberPassword = await bcrypt.hash(input.memberPassword, 10) korinishida genSaltsiz ishlatish mumkin
        
        console.log("after: ", input.memberPassword)
       try{
       const result = await this.memberModel.create(input); //memberModel klasining .create() methodi orqali Db dagi member collectionga yangi malumotlarni olib borib yozdik va natijasini resultga tengladik
    //    const tempResult = new this.memberModel(input); //malumotni DB ga qoshishning 2-usuli. 
    //    const result = await tempResult.save(); 
       result.memberPassword = "" //password consoleda chiqishini oldini olish uchun uni bosh stringga tenglab qoydik
       console.log("Passed Here")
        return result
       }

       catch(err) { //Aggar biror xatolik sabab malumot DataBasega yozilmasa hosil bolgan error orniga ozimiz yozgan errorni browserga yubordik
       console.log("b")
        throw new Errors(HttpCode.BAD_REQUEST, Message.CREATE_FAILED);
       }
}

    public async processLogin(input: LoginInput): Promise<Member>{
        const member = await this.memberModel
        .findOne( //mongoosening findOne static methodini chaqirib query condition yozamiz.
            {memberNick: input.memberNick}, //findOne static methodi orqali member collectiondan memberNicki request orqali kirib kelgan memberNickga teng bolgan datani topamiz
            {memberNick: 1, memberPassword: 1}) //findOne methodi qabul qiladigan 2 argument bu topilgan malumotning ayni keraklilarini yoki maxfiyligi sababli korinmay qolgan qismini tanlab ajratib olib uchun ishlatiladi. agar 1 qoyilsa faqat osha malumot korinadi, agar 0 qoyilsa osha malumotdan boshqa barchasi korinadi. _id: istisno hisoblanib agar unga 0 qoysak u korinmaydi.Agar qiymat kiritmasak defolt 1 ni qabul qiladi 
        .exec()
        if(!member) throw new Errors(HttpCode.BAD_REQUEST, Message.NO_MEMBER_NICK) //agar kiritilgan malumot member collectionda mavjud bolmasa err yuboramiz.

       
       const isMatch = await bcrypt.compare(input.memberPassword, member.memberPassword) //bcryptni compare() methodi kritilgan parolni avvaldan heshlangan parol bilan solishtirish imkonini beradi. 1- argument browserdan kelgan parol 2- argument malumot bazasidagi avvaldan heshlangan parol
        // const isMatch = input.memberPassword === member.memberPassword  //true/false //browserda kiritilgan parol malumot bazasida mavjud yoki yoqligini tekshiramiz.
        
        if(!isMatch) throw new Errors(HttpCode.UNAUTHORIZED, Message.WRONG_PASSWORD); //agar parol notogri kiritilga bolsa ozimiz yaratgan Errors customizied klasimiz orqali frontendga error xabarini yuboramiz.Agar error yuzaga kelsa keyingi qatorlar ishga tushmaydi
        
        return await this.memberModel.findById(member._id).exec() //findById methofi orqali member ichidagi bizga korinmay turgan _id: orqalitanlab olib osha idga tegishli malumotlarni return orqali frontendga yuboramiz
    }


     public async getUsers(): Promise<Member[]>{ //yangi public methodining defineqismini yasadik.U type MemberInputga teng bolgan inputni qabul qilib uni schima model orqali databasega yozadi. Method nomi ozi xizmat korrsatadigan kontrollerga tegishli restaurant controllerning.processSignup methodi bilan nomdosh bolishi kerak.Ushbu method kontrollerdan kelgan memberlarni schima modelga yuborib beradi 
        const result = await this.memberModel.find({memberType: MemberType.USER}).exec()
        if(!result) throw new Errors(HttpCode.NOT_FOUND, Message.NO_DATA_FOUND);
        return result;
}

public async updateChosenUser(input: MemberUpdateInput): Promise<Member>{ //yangi public methodining defineqismini yasadik.U type MemberInputga teng bolgan inputni qabul qilib uni schima model orqali databasega yozadi. Method nomi ozi xizmat korrsatadigan kontrollerga tegishli restaurant controllerning.processSignup methodi bilan nomdosh bolishi kerak.Ushbu method kontrollerdan kelgan memberlarni schima modelga yuborib beradi 
        console.log("keldi")
        input._id = shapeIntoMongooseObjectId(input._id);
        const result = await this.memberModel.findByIdAndUpdate({_id: input._id}, input, {new:true, runValidators:true}).exec()
        if(!result) throw new Errors(HttpCode.NOT_MODIFIED, Message.UPDATE_FAILED);
        return result;
}

   
}

export default MemberService