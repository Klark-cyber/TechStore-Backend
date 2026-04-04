import Errors, { HttpCode, Message } from "../libs/Errors";
import { T } from "../libs/types/common";
import { Response } from "express";
import { ExtendedRequest, Member } from "../libs/types/member";
import OrderService from "../models/order.service";
import { OrderInquiry, OrderUpdateInput } from "../libs/types/order";
import { OrderStatus } from "../libs/enums/order.enum";


const orderService = new OrderService();

const orderController: T = {};

orderController.createOrder = async (
  req: ExtendedRequest,
  res: Response
) => {
  try {
    console.log("createOrder");

    // 🔥 AUTH CHECK
    if (!req.member) {
      throw new Errors(
        HttpCode.UNAUTHORIZED,
        Message.NOT_AUTHENTIFICATED
      );
    }

    const result = await orderService.createOrder(
      req.member,
      req.body
    );

    res.status(HttpCode.CREATED).json(result);

  } catch (err) {
    console.log("Error, createOrder", err);

    if (err instanceof Errors) res.status(err.code).json(err);
    else res.status(Errors.standard.code).json(Errors.standard);
  }
};

orderController.getMyOrders = async (
  req: ExtendedRequest,
  res: Response
) => {
  try {
    console.log("getMyOrders");

    // 🔥 AUTH CHECK
    if (!req.member) {
      throw new Errors(
        HttpCode.UNAUTHORIZED,
        Message.NOT_AUTHENTIFICATED
      );
    }

    const { page, limit, orderStatus } = req.query;

    const inquiry: OrderInquiry = {
      page: Number(page) || 1,
      limit: Number(limit) || 10,
      orderStatus: orderStatus as OrderStatus,
    };

    const result = await orderService.getMyOrders(
      req.member,
      inquiry
    );

    res.status(HttpCode.OK).json(result); // 🔥 FIX (CREATED → OK)

  } catch (err) {
    console.log("Error, getMyOrders", err);

    if (err instanceof Errors) res.status(err.code).json(err);
    else res.status(Errors.standard.code).json(Errors.standard);
  }
};

orderController.updateOrder = async (req: ExtendedRequest, res: Response) => {
    console.log("ok keldi")
    try{
    console.log("updateOrder")
    const input: OrderUpdateInput = req.body;
    console.log("input:", input)
    const result = await orderService.updateOrder(req.member as Member, input)
        console.log("Step- 2")
    res.status(HttpCode.CREATED).json(result);
    }catch(err){
    console.log("Error, updateOrder", err) 
    if (err instanceof Errors) res.status(err.code).json(err)
    else res.status(Errors.standard.code).json(Errors.standard)
    }

};


export default orderController;