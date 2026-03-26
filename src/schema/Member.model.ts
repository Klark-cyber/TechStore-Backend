import mongoose, {Schema} from 'mongoose';
import { MemberStatus, MemberType } from '../libs/enums/member.enum';
const memberSchema = new Schema({
    memberType: {
        type: String,
        enum: MemberType,//memberType enum korinishida bolishi kerak.MemberType import qilindi
        default:MemberType.USER //Default qiymat sifatida USERni kiritdik
    },

    memberStatus: {
        type: String,
        enum: MemberStatus,
        default: MemberStatus.ACTIVE
    },

    memberNick: {
        type: String,
        index: {unique: true, sparse: true}, //unique bu azolarning nick name unikal bolishini taminlaydi, sparse esa azo nick namega avval ishlatilgan nickname ishlatmoqchi bolsa himoyalaydi
        required: true, //required true bu agar member nick kiritmasa user qabul qilinmaydi. Yani nickname majburiy.required yozilmasa avtomatik false yani defolt sifatida falseni tayinlaydi
    },

    memberPhone: {
        type: String,
        index: { unique: true, sparce: true },
        required: true,
    },

    memberPassword: {
        type: String, 
        select: false, //select MongoDbdan malumot olinganda telraqamni olib berma deganidir.Yani userning tel raqami maxfiy malumot hisoblanadi
        required: true,
    },

    memberAddress: {
        type: String, 
    },

    memberDesc: {
        type: String, 
    },

    memberImage: {
        type: String, 
    },

    memberPoints: {
        type: Number, 
        default: 0,
    }
},
 {timestamps: true} //updatesAt va createdAt kabi malumotlarni defolt qoyib beradi
);

export default mongoose.model('Member', memberSchema) //mongoose orqali Schemani schema modelga aylantirib oldik
