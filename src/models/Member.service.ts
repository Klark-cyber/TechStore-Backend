import MemberModel from "../schema/Member.model";
import { LoginInput, Member, MemberInput, MemberUpdateInput } from "../libs/types/member"
import Errors, { HttpCode, Message } from "../libs/Errors";
import { MemberStatus, MemberType } from "../libs/enums/member.enum";
import * as bcrypt from "bcryptjs"
import { shapeIntoMongooseObjectId } from "../libs/config";

class MemberService { //MemberService module ichida Member Schema modelni ishlatamiz
  private readonly memberModel; //private holatdagi memberModel propertyni yasab oldik

  constructor() {
    this.memberModel = MemberModel; //MemberModel bu Member.model.ts ichidagi mongoose orqaali modelga aylantirilgan Member (MemberModel)dir.MemberModel orqali memberModel classini yaratib oldik
  }

  /** SPA */

  public async getAdmin(): Promise<Member[]> {
    const result = await this.memberModel
      .find({ memberType: MemberType.ADMIN })
      .exec();

    if (!result) {
      throw new Errors(HttpCode.NOT_FOUND, Message.NO_DATA_FOUND);
    }

    return result;
  }


  public async signup(input: MemberInput): Promise<Member> {
    const salt = await bcrypt.genSalt(10);
    input.memberPassword = await bcrypt.hash(input.memberPassword, salt);
    try {
      // ⚠️ TUZATILDI: avval `input` (mijozdan kelgan xom so'rov tanasi)
      // to'g'ridan-to'g'ri `create()`ga uzatilardi — va MemberInput
      // turi hatto `memberType`/`memberStatus`ni ixtiyoriy maydon sifatida
      // ruxsat berardi. Ya'ni ISTALGAN kishi oddiy ro'yxatdan o'tish
      // so'roviga `"memberType": "ADMIN"` qo'shib, hech qanday
      // autentifikatsiyasiz to'g'ridan-to'g'ri ADMIN hisob yarata olardi.
      // Endi bu ikki xavfsizlik-muhim maydon MIJOZDAN HECH QACHON
      // qabul qilinmaydi — har doim sxemaning xavfsiz standart qiymati
      // (USER / ACTIVE) qo'llanadi.
      const { memberType, memberStatus, ...safeInput } = input as any;
      const result = await this.memberModel.create(safeInput);
      result.memberPassword = '';
      return result.toJSON() as Member;

    } catch (err) {
      console.error("Error, service:signup", err);

      throw new Errors(
        HttpCode.BAD_REQUEST,
        Message.CREATE_FAILED
      );
    }
  }

  public async login(input: LoginInput): Promise<Member> {
    const member = await this.memberModel
      .findOne({
        memberNick: input.memberNick,
        memberStatus: { $ne: MemberStatus.DELETE }
      },
        { memberNick: 1, memberPassword: 1, memberStatus: 1 })
      .exec();

    if (!member) {
      throw new Errors(HttpCode.BAD_REQUEST, Message.NO_MEMBER_NICK);
    }

    if (member.memberStatus === MemberStatus.BLOCK) {
      throw new Errors(HttpCode.FORBIDDEN, Message.BLOCKED_USER);
    }

    // 🔥 PASSWORD CHECK
    const isMatch = await bcrypt.compare(
      input.memberPassword,
      member.memberPassword as string
    );

    if (!isMatch) {
      throw new Errors(HttpCode.UNAUTHORIZED, Message.WRONG_PASSWORD);
    }

    // 🔥 PASSWORDNI OLIB TASHLAYMIZ
    delete member.memberPassword;

    return await this.memberModel.findById(member._id).lean().exec() as Member;
  }



  public async getMemberDetail(member: Member): Promise<Member> {
    const memberId = shapeIntoMongooseObjectId(member._id);

    const result = await this.memberModel
      .findOne({
        _id: memberId,
        memberStatus: MemberStatus.ACTIVE,
      })
      .lean()
      .exec();

    if (!result) {
      throw new Errors(HttpCode.NOT_FOUND, Message.NO_DATA_FOUND);
    }

    // 🔥 PASSWORDNI OLIB TASHLAYMIZ
    delete result.memberPassword;

    return result;
  }

  public async updateMember(
    member: Member,
    input: MemberUpdateInput
  ): Promise<Member> {
    const memberId = shapeIntoMongooseObjectId(member._id);
    console.log(member)
    // 🔥 PASSWORD HASH (faqat bo‘lsa)
    if (input.memberPassword) {
      const salt = await bcrypt.genSalt(10);
      input.memberPassword = await bcrypt.hash(
        input.memberPassword,
        salt
      );
    }

    // ⚠️ TUZATILDI: avval butun req.body hech qanday filtrlashsiz
    // to'g'ridan-to'g'ri yozilardi. Bu — ISTALGAN oddiy login qilgan
    // foydalanuvchi o'z profilini yangilash so'rovi ichiga qo'shimcha
    // `memberType: "ADMIN"` yuborib, O'ZINI DARHOL ADMIN qilib
    // qo'yishi mumkin bo'lgan, juda jiddiy huquq eskalatsiyasi zaifligi
    // edi. Endi faqat profil tahrirlash funksiyasiga tegishli maydonlar
    // o'tkaziladi — memberType hech qachon bu yo'l bilan o'zgartirilmaydi.
    const allowedUpdate: Partial<MemberUpdateInput> = {};
    if (input.memberNick !== undefined) allowedUpdate.memberNick = input.memberNick;
    if (input.memberPhone !== undefined) allowedUpdate.memberPhone = input.memberPhone;
    // ⚠️ TUZATILDI: avval `!== undefined` tekshiruvi ishlatilgan edi — agar
    // foydalanuvchi "parolni o'zgartirish" maydonini BO'SH qoldirsa (parolni
    // o'zgartirmoqchi bo'lmasa), frontend baribir bo'sh satr ("") yuborishi
    // mumkin edi, va bo'sh satr ham "undefined emas" hisoblanadi — natijada
    // HAQIQIY, hash qilingan parol bo'sh satr bilan ustidan yozilib,
    // foydalanuvchi tizimga kira olmay qolardi. Endi faqat haqiqatan
    // qandaydir qiymat kiritilgan bo'lsa (bo'sh emas) yangilanadi.
    if (input.memberPassword) allowedUpdate.memberPassword = input.memberPassword;
    if (input.memberAddress !== undefined) allowedUpdate.memberAddress = input.memberAddress;
    if (input.memberDesc !== undefined) allowedUpdate.memberDesc = input.memberDesc;
    if (input.memberImage !== undefined) allowedUpdate.memberImage = input.memberImage;

    const result = await this.memberModel
      .findOneAndUpdate(
        { _id: memberId, memberStatus: MemberStatus.ACTIVE }, // 🔥 faqat active user
        allowedUpdate,
        { new: true }
      )
      .lean()
      .exec();

    if (!result) {
      throw new Errors(HttpCode.NOT_MODIFIED, Message.UPDATE_FAILED);
    }

    // 🔥 PASSWORDNI OLIB TASHLAYMIZ
    delete result.memberPassword;

    return result;
  }

  public async getTopUsers(): Promise<Member[]> {
    const result = await this.memberModel
      .find({
        memberStatus: MemberStatus.ACTIVE,
        memberPoints: { $gte: 1 },
      })
      .sort({ memberPoints: -1 })
      .limit(5)
      .lean()
      .exec();

    if (!result || result.length === 0) {
      throw new Errors(HttpCode.NOT_FOUND, Message.NO_DATA_FOUND);
    }

    // 🔥 PASSWORDNI OLIB TASHLAYMIZ
    result.forEach((el) => delete el.memberPassword);

    return result;
  }

  public async addUserPoint(
    member: Member,
    point: number
  ): Promise<Member> {
    const memberId = shapeIntoMongooseObjectId(member._id);

    const result = await this.memberModel
      .findOneAndUpdate(
        {
          _id: memberId,
          memberStatus: MemberStatus.ACTIVE,
        },
        { $inc: { memberPoints: point } },
        { new: true }
      )
      .lean()
      .exec();

    if (!result) {
      throw new Errors(HttpCode.NOT_MODIFIED, Message.UPDATE_FAILED);
    }

    // 🔥 PASSWORDNI OLIB TASHLAYMIZ
    delete result.memberPassword;

    return result;
  }


  /** SSR*/

  public async processSignup(input: MemberInput): Promise<Member> {
    try {
      if (!input.memberNick || !input.memberPassword) {
        throw new Errors(HttpCode.BAD_REQUEST, Message.NICK_PASSWORD_REQUIRED);
      }

      // ✅ Duplicate tekshiruv
      const existing = await this.memberModel.findOne({ memberNick: input.memberNick });
      if (existing) {
        throw new Errors(HttpCode.BAD_REQUEST, Message.USED_NICK_PHONE);
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(input.memberPassword, salt);

      // ⚠️ TUZATILDI: avval butun `input` (xom req.body) to'g'ridan-to'g'ri
      // create()ga uzatilardi. Controller memberType'ni ADMIN'ga majburlab
      // qo'yadi (shuning uchun bu yerda huquq eskalatsiyasi xavfi yo'q),
      // lekin mijoz baribir qo'shimcha `memberStatus` yoki boshqa kutilmagan
      // maydonlarni yuborishi mumkin edi. Endi faqat ro'yxatdan o'tish
      // formasiga tegishli maydonlar o'tkaziladi.
      const safeInput = {
        memberNick: input.memberNick,
        memberPhone: input.memberPhone,
        memberPassword: hashedPassword,
        memberImage: input.memberImage,
        memberType: input.memberType, // controller tomonidan ADMIN'ga majburlanadi
      };

      const result = await this.memberModel.create(safeInput);
      const member = result.toObject();
      delete member.memberPassword;

      return member;

    } catch (err) {
      console.log("Error, processSignup", err);

      if (err instanceof Errors) throw err; // ✅ Errors ni qayta tashla
      throw new Errors(HttpCode.BAD_REQUEST, Message.USED_NICK_PHONE);
    }
  }
  public async processLogin(input: LoginInput): Promise<Member> {
    console.log("Qidirilayotgan nick:", input.memberNick);

    const member = await this.memberModel
      .findOne( //mongoosening findOne static methodini chaqirib query condition yozamiz.
        { memberNick: input.memberNick }, //findOne static methodi orqali member collectiondan memberNicki request orqali kirib kelgan memberNickga teng bolgan datani topamiz
        { memberNick: 1, memberPassword: 1, memberStatus: 1, memberType: 1 }) //findOne methodi qabul qiladigan 2 argument bu topilgan malumotning ayni keraklilarini yoki maxfiyligi sababli korinmay qolgan qismini tanlab ajratib olib uchun ishlatiladi. agar 1 qoyilsa faqat osha malumot korinadi, agar 0 qoyilsa osha malumotdan boshqa barchasi korinadi. _id: istisno hisoblanib agar unga 0 qoysak u korinmaydi.Agar qiymat kiritmasak defolt 1 ni qabul qiladi 
      .exec()
    console.log(member)
    if (!member) {
      throw new Errors(HttpCode.BAD_REQUEST, Message.NO_MEMBER_NICK);
    }

    if (member.memberStatus === MemberStatus.BLOCK) {
      throw new Errors(HttpCode.FORBIDDEN, Message.BLOCKED_USER);
    }

    // 🔥 PASSWORD CHECK
    if (!member.memberPassword) {
      throw new Errors(HttpCode.INTERNAL_SERVER_ERROR, Message.SOMETHING_WENT_WRONG);
    }

    const isMatch = await bcrypt.compare(
      input.memberPassword,
      member.memberPassword
    );

    if (!isMatch) {
      throw new Errors(HttpCode.UNAUTHORIZED, Message.WRONG_PASSWORD);
    }

    // 🔥 PASSWORDNI OLIB TASHLAYMIZ
    delete member.memberPassword;

    return member;
  }


  public async getUsers(): Promise<Member[]> {
    const result = await this.memberModel
      .find({
        memberType: MemberType.USER,
      })
      // .lean()
      .exec();

    if (!result || result.length === 0) {
      throw new Errors(HttpCode.NOT_FOUND, Message.NO_DATA_FOUND);
    }

    // 🔥 PASSWORDNI OLIB TASHLAYMIZ
    result.forEach((el) => delete el.memberPassword);

    return result;
  }

  public async updateChosenUser(
    input: MemberUpdateInput
  ): Promise<Member> {
    const memberId = shapeIntoMongooseObjectId(input._id);

    // ⚠️ TUZATILDI: avval butun req.body (`input`) hech qanday
    // filtrlashsiz to'g'ridan-to'g'ri findOneAndUpdate'ga uzatilardi.
    // Mongoose'ning "strict" rejimi faqat sxemada UMUMAN yo'q
    // maydonlarni bloklaydi — memberType/memberPassword esa sxemaning
    // haqiqiy, mavjud maydonlari, shuning uchun ular bloklanmasdi. Ya'ni
    // agar so'rovga (marshrutga endi qaytarilgan auth tekshiruvidan
    // tashqari) kimdir qo'shimcha `memberType: "ADMIN"` yoki
    // `memberPassword: "..."` yuborsa, bu ham qabul qilinardi. Admin
    // panelidagi haqiqiy funksiya (users.ejs) faqat memberStatus'ni
    // o'zgartiradi — shuning uchun faqat shu maydonlarni o'tkazamiz.
    const allowedUpdate: Partial<MemberUpdateInput> = {};
    if (input.memberStatus !== undefined) allowedUpdate.memberStatus = input.memberStatus;
    if (input.memberNick !== undefined) allowedUpdate.memberNick = input.memberNick;
    if (input.memberPhone !== undefined) allowedUpdate.memberPhone = input.memberPhone;
    if (input.memberAddress !== undefined) allowedUpdate.memberAddress = input.memberAddress;
    if (input.memberDesc !== undefined) allowedUpdate.memberDesc = input.memberDesc;
    if (input.memberImage !== undefined) allowedUpdate.memberImage = input.memberImage;

    const result = await this.memberModel
      .findOneAndUpdate(
        {
          _id: memberId,
          memberStatus: { $ne: MemberStatus.DELETE }, // 🔥 delete bo‘lmagan user
        },
        allowedUpdate,
        { new: true, runValidators: true }
      )
      .lean()
      .exec();

    if (!result) {
      throw new Errors(HttpCode.NOT_MODIFIED, Message.UPDATE_FAILED);
    }

    // 🔥 PASSWORDNI OLIB TASHLAYMIZ
    delete result.memberPassword;

    return result;
  }

}

export default MemberService