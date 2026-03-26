import mongoose, { Schema } from "mongoose";
import { ViewGroup } from "../libs/enums/view.enum";

const viewSchema = new Schema({

viewGroup: {
    type: String,
    enum: ViewGroup,
    required: true,
},

memberId: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: "Member" //reference "Member" service modelga qaratilgan boladi,Bu qiymatni yozish ixtiyoriy
},

viewRefId: {
    type: Schema.Types.ObjectId,
    required: true,
}

}, {timestamps: true } // :{createdAt: true, updatedAt: false} holatida yozishimz ham mumkin edi
);

export default mongoose.model("View", viewSchema);
