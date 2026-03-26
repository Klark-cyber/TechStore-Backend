import {ObjectId} from "mongoose";
import { ViewGroup } from "../enums/view.enum";

export interface View { //Bu type MongoDb member collectionga borib yozilib memberModelga qaytarilgan return resultning Promise<Member> returned type hisoblanadi 
    _id: ObjectId; 
    viewGroup: ViewGroup;
    memberId: ObjectId;
    viewRefId: ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

export interface ViewInput {
    memberId: ObjectId;
    viewRefId: ObjectId;
    viewGroup: ViewGroup;
}