import mongoose, { Schema } from "mongoose";
import { Member } from "../libs/types/member";
import { MemberStatus, MemberType } from "../libs/enums/member.enum";

const memberSchema = new Schema<Member>(
  {
    memberType: {
      type: String,
      enum: Object.values(MemberType),
      default: MemberType.USER,
    },

    memberStatus: {
      type: String,
      enum: Object.values(MemberStatus),
      default: MemberStatus.ACTIVE,
    },

    memberNick: {
      type: String,
      required: true,
      unique: true,
      minlength: 3,
      maxlength: 30,
      trim: true,
    },
 
    memberPassword: {
      type: String,
      select: false,
      required: true,
      minlength: 6,
    },

    memberImage: {
      type: String,
      default: "",
    },

    memberPhone: {
      type: String,
      default: "",
    },

    memberAddress: {
      type: String,
      default: "",
    },

    memberDesc: {
      type: String,
      maxlength: 200,
      default: "",
    },

    memberPoints: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Member", memberSchema);