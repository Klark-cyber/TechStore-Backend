//Loyihamizda customize errorlarni ishlatmoqchi bolsak enum, JS tomonidan build bolgan Error classidan dan meros olgan holda yangi Errors klasslarni hosil qilamiz.

export enum HttpCode { //eng kop qollaniladigan http kodlar
    OK = 200,
    CREATED = 201,
    NOT_MODIFIED = 304,
    BAD_REQUEST = 400,
    UNAUTHORIZED = 401,
    FORBIDDEN = 403,
    NOT_FOUND = 404,
    INTERNAL_SERVER_ERROR = 500,
}


export enum Message { //error hosil bolganda yuboriladigan xabarlar
    SOMETHING_WENT_WRONG = "Something went wrong!",
    NO_DATA_FOUND = "No data is found!",
    CREATE_FAILED = "Create is failed!",
    UPDATE_FAILED = "Update is failed!",
   
    USED_NICK_PHONE = "You are inserting already used nick or phone number!",
    BLOCKED_USER = "You have been blocked!, contact restaurant",
    NO_MEMBER_NICK = "No member with that member nick!",
    WRONG_PASSWORD = "Wrong password, please try again!",
    NOT_AUTHENTIFICATED = "You are not authentificated, Please login first",
    TOKEN_CREATION_FAILED = "Token creation error!",
}

class Errors extends Error {
    public code: HttpCode;
    public message: Message;


    static standard ={
        code: HttpCode.INTERNAL_SERVER_ERROR,
        message: Message.SOMETHING_WENT_WRONG,
    };

constructor(statusCode: HttpCode, statusMessage: Message) { 
    super();
    this.code = statusCode; 
    this.message = statusMessage;
    }
}
export default Errors; // errorrs klasini file ichida default holda export qildik ammo bu klassdan boshqa yuqorida httpcode hamda message enumlarini shunchaki export qildik
