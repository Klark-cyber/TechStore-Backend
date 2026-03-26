import { shapeIntoMongooseObjectId } from "../libs/config";
import Errors, { HttpCode, Message } from "../libs/Errors";
import { Member } from "../libs/types/member";
import { Order, OrderInquiry, OrderItemInput, OrderUpdateInput } from "../libs/types/order";
import OrderModel from "../schema/Order.model";
import OrderItemModel from "../schema/OrderItem.model";
import {ObjectId} from "mongoose";
import MemberService from "./Member.service";
import { OrderStatus } from "../libs/enums/order.enum";

class OrderService { //Order servis model 2 ta collection bilan yani 2 ta schema model bilan birga ishlaydi

    private readonly orderModel;
    private readonly orderItemModel;
    private readonly memberService;

    constructor() {
        this.orderModel = OrderModel;
        this.orderItemModel = OrderItemModel;
        this.memberService = new MemberService();
    }

    public async createOrder(member: Member, input: OrderItemInput[]): Promise<Order> { //postman orqali array korinishida req yuboramiz shu sababli [] qoyildi
        console.log("input: ", input)
        const memberId = shapeIntoMongooseObjectId(member._id);
        const amount = input.reduce((accumulator: number, item: OrderItemInput) => { //harid 100$ dan oshsa dastavka bepul mantigi
            return accumulator + item.itemPrice * item.itemQuantity
        }, 0); 
        const delivery = amount < 100 ? 5 : 0;

        try{ //order collectionga kim nimani qancha harid qilgani haqidagi malumotni yozamiz
            const newOrder: Order = await this.orderModel.create({
                orderTotal: amount+delivery,
                orderDelivery: delivery,
                memberId: memberId,
            });
                console.log("orderId:", newOrder._id)
                
                //TODO create order item
            const OrderId = newOrder._id;
            await this.recordOrderItem(OrderId, input);
            return newOrder; //newOrder bu order collectionga yozilgan malumot
        }catch(err){
             console.log("Error, model: createOrder:", err)
             throw new Errors(HttpCode.BAD_REQUEST, Message.CREATE_FAILED);
        }
    }
    //orderlarga dahldor orderitemni hosil qilamiz
    private async recordOrderItem(orderId: ObjectId, input: OrderItemInput[]):Promise<void>{
        const promisedList = input.map( async (item: OrderItemInput) => {
            item.orderId = orderId; //OrderItemInput interfaceda orderId? qilib bereb ketgandik endi uni qiymatini orderIdga tengladik. orderId=newOrderId ga teng 
            item.productId = shapeIntoMongooseObjectId(item.productId)
            await this.orderItemModel.create(item);
            return "inserted"
        })
        console.log("promisedList:", promisedList)
        const orderItemState = await Promise.all(promisedList) //Promised listni ichidagi har bir mantiqni bajarilishini taminlab beradigan Promise.All methodidan foydalanamiz.U promisedList ichida yani array ichidagi har bir element ordersItem ichiga yozilgandagina javob qaytaradi
        console.log("orderItemsState:", orderItemState);
    }

    public async getMyOrders(member: Member, inquiry: OrderInquiry): Promise<Order[]>{
        const memberId = shapeIntoMongooseObjectId(member._id);
        const matches = {memberId: memberId, orderStatus: inquiry.orderStatus}; //soralayotgan obyectning memberId si yuqorida hosil qilib olgan memberIdmizga teng bolsin
        const result = await this.orderModel.aggregate([
            { $match: matches},
            { $sort: {updatedAt: -1}},
            { $skip: (inquiry.page - 1) * inquiry.limit},
            { $limit: inquiry.limit },
            {
                $lookup: { //lookup pipline methodi aggregate qilish natijasida hosil bolgan array ustida iterate amalga oshirish imonini berdi va boshqa kollectiondan izlab topish imkonini beradi
                    from: "orderItems", //qaysi collectiondan izlash
                    localField: "_id", //itirate bolayotgan element idsi
                    foreignField: "orderId", // localField ichidagi id bilan boshqa collectiondagi id bir xil bolganini topish
                    as: "orderItems" //topilgan malumotni orderItems nomi ostida saqla
                }
            },
            {
                $lookup: {
                    from: "products",
                    localField: "orderItems.productId",
                    foreignField: "_id",
                    as: "productData"
                }
            }
        ]).exec();
        if(!result) throw new Errors(HttpCode.NOT_FOUND, Message.NO_DATA_FOUND)

        return result;
    }

    public async updateOrder(
        member: Member, 
        input:OrderUpdateInput
    ): Promise<Order> {
        const memberId = shapeIntoMongooseObjectId(member._id),
            orderId = shapeIntoMongooseObjectId(input.orderId),
            orderStatus = input.orderStatus;

        const result = await this.orderModel.findOneAndUpdate(
            {
            memberId: memberId, 
            _id: orderId,
        }, 
        {orderStatus: orderStatus}, 
        { new: true }
    )
        .exec();
        
        if(!result) throw new Errors(HttpCode.NOT_MODIFIED, Message.UPDATE_FAILED);
        
        //orderSytatus PAUSE => PROCESS memberPoints = +1 memberService modeldan foydalanamiz
        if(orderStatus === OrderStatus.PROCESS) {
            await this.memberService.addUserPoint(member, 1)
        }

        return result;
    }

}


export default OrderService;