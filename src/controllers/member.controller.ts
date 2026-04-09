import {NextFunction, Request, Response} from "express"; //{ req va res} qavs ichidaligiga sabab u export bolgan fileda req va res dan boshqa export bolgan malumotlar ham bor
import {T} from "../libs/types/common"; //T interfaceni import qildik
import MemberService from "../models/Member.service";
import { ExtendedRequest, LoginInput, Member, MemberInput, MemberUpdateInput } from "../libs/types/member";
import Errors, { HttpCode, Message } from "../libs/Errors";
import AuthService from "../models/Auth.service";
import { AUTH_TIMER } from "../libs/config";
import productController from "./product.controller";

const memberService = new MemberService(); 
const authService = new AuthService(); //Yangi Authservice service modelidan instance oldik

const memberController: T ={};
 
//REACT loyihamiz uchun

memberController.getAdmin = async (req: Request, res: Response) => {
  try {
    console.log("getAdmin");
    const result = await memberService.getAdmin();
    res.status(HttpCode.OK).json(result);
  } catch (err) {
    console.log("Error, getAdmin", err);
    if (err instanceof Errors) {
      res.status(err.code).json(err);
    } else {
      res.status(Errors.standard.code).json(Errors.standard);
    }
  }
};


memberController.signup = async (req: Request, res: Response) => {
  try {
    console.log("signup");
    console.log("body:", req.body);
    const input: MemberInput = req.body;
    // 🔥 VALIDATION
    if (!input.memberNick || !input.memberPassword) {
      throw new Errors(HttpCode.BAD_REQUEST, Message.NICK_PASSWORD_REQUIRED);
    }
    const result: Member = await memberService.signup(input);

    // 🔥 TOKEN
    const token = await authService.createToken(result);

    console.log("token =>", token);

    // 🔥 COOKIE (XAVFSIZ VARIANT)
    res.cookie("accessToken", token, {
      maxAge: AUTH_TIMER * 3600 * 1000,
      httpOnly: true, // ❗ MUHIM (oldin false edi)
      sameSite: "lax",
    });

    res.status(HttpCode.CREATED).json({
      member: result,
      accessToken: token,
    });

  } catch (err) {
    console.log("Error, processSignup", err);

    if (err instanceof Errors) {
      res.status(err.code).json(err);
    } else {
      res.status(Errors.standard.code).json(Errors.standard);
    }
  }
};


memberController.login = async (req: Request, res: Response) => {
  try {
    console.log("login");
    console.log("body:", req.body);

    const input: LoginInput = req.body;

    const result = await memberService.login(input);

    // 🔥 TOKEN
    const token = await authService.createToken(result);
    console.log("token is:", token);

    // 🔥 COOKIE (XAVFSIZ)
    res.cookie("accessToken", token, {
      maxAge: AUTH_TIMER * 3600 * 1000,
      httpOnly: true,  
      sameSite: "lax",
    });

    res.status(HttpCode.OK).json({
      member: result,
      accessToken: token //❗ optional (xavfsizlik uchun olib tashlash mumkin)
    });

  } catch (err) {
    console.log("Error, login", err);

    if (err instanceof Errors) {
      res.status(err.code).json(err);
    } else {
      res.status(Errors.standard.code).json(Errors.standard);
    }
  }
};

memberController.logout = (req: ExtendedRequest, res: Response) => {
  try {
    console.log("logout");

    // 🔥 COOKIE NI TO‘LIQ O‘CHIRISH
    res.clearCookie("accessToken", {
      httpOnly: true,
      sameSite: "lax",
    });

    res.status(HttpCode.OK).json({
      success: true,
      logout: true,
    });

  } catch (err) {
    console.log("Error, logout", err);

    if (err instanceof Errors) {
      res.status(err.code).json(err);
    } else {
      res.status(Errors.standard.code).json(Errors.standard);
    }
  }
};

memberController.getMemberDetail = async (
  req: ExtendedRequest,
  res: Response
) => {
  try {
    console.log("getMemberDetail");

    // 🔥 AUTH CHECK (MUHIM)
    if (!req.member) {
      throw new Errors(HttpCode.UNAUTHORIZED, Message.NO_DATA_FOUND);
    }

    const result = await memberService.getMemberDetail(req.member);

    res.status(HttpCode.OK).json(result);

  } catch (err) {
    console.log("Error, getMemberDetail", err); // ❗ to‘g‘rilandi

    if (err instanceof Errors) {
      res.status(err.code).json(err);
    } else {
      res.status(Errors.standard.code).json(Errors.standard);
    }
  }
};

memberController.updateMember = async (
  req: ExtendedRequest,
  res: Response
) => {
  try {
    console.log("updateMember");

    // 🔥 AUTH CHECK
    if (!req.member) {
      throw new Errors(
        HttpCode.UNAUTHORIZED,
        Message.NOT_AUTHENTIFICATED
      );
    }

    const input: MemberUpdateInput = req.body;
console.log(input)
    // 🔥 IMAGE
    if (req.file) {
      input.memberImage = req.file.path.replace(/\\/g, "/");
    }

    const result = await memberService.updateMember(req.member, input);
    if (!result) {
      throw new Errors(
        HttpCode.NOT_MODIFIED,
        Message.UPDATE_FAILED
      );
    }

    res.status(HttpCode.OK).json(result);

  } catch (err) {
    console.log("Error, updateMember", err);

    if (err instanceof Errors) {
      res.status(err.code).json(err);
    } else {
      res.status(Errors.standard.code).json(Errors.standard);
    }
  }
};


memberController.getTopUsers = async (
  req: Request,
  res: Response
) => {
  try {
    console.log("getTopUsers");

    const result = await memberService.getTopUsers();

    if (!result || result.length === 0) {
      throw new Errors(HttpCode.NOT_FOUND, Message.NO_DATA_FOUND);
    }

    res.status(HttpCode.OK).json(result);

  } catch (err) {
    console.log("Error, getTopUsers", err);

    if (err instanceof Errors) {
      res.status(err.code).json(err);
    } else {
      res.status(Errors.standard.code).json(Errors.standard);
    }
  }
};


memberController.verifyAuth = async (
  req: ExtendedRequest,
  res: Response,
  next: NextFunction
) => {
  console.log("keldi")
  try {
    const token = req.cookies["accessToken"];

    // 🔥 TOKEN CHECK
    if (!token) {
      throw new Errors(
        HttpCode.UNAUTHORIZED,
        Message.NOT_AUTHENTIFICATED
      );
    }

    const member = await authService.checkAuth(token);

    if (!member) {
      throw new Errors(
        HttpCode.UNAUTHORIZED,
        Message.NOT_AUTHENTIFICATED
      );
    }

    req.member = member;

    next();

  } catch (err) {
    console.log("Error, verifyAuth", err);

    if (err instanceof Errors) {
      res.status(err.code).json(err);
    } else {
      res.status(Errors.standard.code).json(Errors.standard);
    }
  }
};

  memberController.retrieveAuth = async (
  req: ExtendedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.cookies?.accessToken;

    if (token) {
      const member = await authService.checkAuth(token);
      if (member) {
        req.member = member;
      }
    }

    next(); // 🔥 har doim davom etadi

  } catch (err) {
    console.log("Error, retrieveAuth", err);
    next(); // 🔥 hatto error bo‘lsa ham davom etadi
  }
};

export default memberController; //default orqali export qilsak filening umumiy yaxlit natijasini export qilgan bolamiz. Agar export qilinadigan natija bir nechta bolsa defolt sozi ishlatilmaydi.