export const AUTH_TIMER= 24; 
export const MORGAN_FORMAT = `:method :url :response-time [:status] \n` //morgan format bu browserdan kelayotgan sorovni qaysi methodga tegishliligi, qaysi urlga kelayotgani, sorov vaqti va sorov statusini console qilib beradi.Qoshimcha malumot sifatida ishlatiladi. \n bu xar bir sorov yangi qatordan boshlanadi

import mongoose from "mongoose";
export const shapeIntoMongooseObjectId = (target: any) => { // params orqali kirib kelayotgan elementni object idga ozgartirish mantigi
    return typeof target === "string" ? new mongoose.Types.ObjectId(target) : target; //kirib kelayotgan params ning type string bolsa mongodb objectidga ozgartirai agar string bolmasa targetni ozini qaytaramzi
};