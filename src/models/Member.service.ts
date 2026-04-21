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
    const result = await this.memberModel.create(input);
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
  {memberNick: 1, memberPassword: 1, memberStatus:1 })
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

  const result = await this.memberModel
    .findOneAndUpdate(
      { _id: memberId, memberStatus: MemberStatus.ACTIVE }, // 🔥 faqat active user
      input,
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
    input.memberPassword = await bcrypt.hash(input.memberPassword, salt);

    const result = await this.memberModel.create(input);
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
            {memberNick: input.memberNick}, //findOne static methodi orqali member collectiondan memberNicki request orqali kirib kelgan memberNickga teng bolgan datani topamiz
            {memberNick: 1, memberPassword: 1, memberStatus: 1, memberType: 1}) //findOne methodi qabul qiladigan 2 argument bu topilgan malumotning ayni keraklilarini yoki maxfiyligi sababli korinmay qolgan qismini tanlab ajratib olib uchun ishlatiladi. agar 1 qoyilsa faqat osha malumot korinadi, agar 0 qoyilsa osha malumotdan boshqa barchasi korinadi. _id: istisno hisoblanib agar unga 0 qoysak u korinmaydi.Agar qiymat kiritmasak defolt 1 ni qabul qiladi 
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

  const result = await this.memberModel
    .findOneAndUpdate(
      {
        _id: memberId,
        memberStatus: { $ne: MemberStatus.DELETE }, // 🔥 delete bo‘lmagan user
      },
      input,
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

