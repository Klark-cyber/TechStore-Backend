import path from "path"
import multer from "multer"
import {v4} from 'uuid'
//const {v4} = require("uuid")




//Bu mantiq faqat productga tegishli fileni saqlash imkonini beradi.Endi universal uploader yaratamiz.Yani har qaysi requestdan kelayotgan fileni istalgan joyga saqalsh mantigi

// const product_storage = multer.diskStorage({ //product_storage yangi product qoshilayotganda  productga tegishli rasmlar va filellarni yuklash uchun maxsus storage u multerning.discStorage methodi orqali yaratildi
//   destination: function (req, file, cb) {
//     cb(null, './uploads/products'); //kirib kelayotgan req hamda fileni yuklanadigan manzil
//   },
//   filename: function (req, file, cb) {
//     console.log(file);
//     const extension = path.parse(file.originalname).ext; //parse orqali filega tegishli originalnemning file formatini olib extensionga tengladik
//     const random_name = v4() + extension; //file nomiga qoshimcha random matnni qoshib storagega birgalikda maxfiylashtirib saqladik
//     cb(null, random_name); //random name v4 yordamida hosil bolgan stringni nom sifatida belgilab formatiniextensionga tenglab storega saqladi
//   },
// })


//export const uploadProductImage = multer({storage: product_storage}) //


function getTargetImageStorage(address: any) {
    return multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, `./uploads/${address}`);
        },
        filename: function (req, file, cb) {
            const extension = path.parse(file.originalname).ext;
            const random_name = v4() + extension;
            cb(null, random_name);
        },
    });
}

const makeUploader = (address: string) => {
    const storage = getTargetImageStorage(address);
    return multer({ storage: storage });
};

export default makeUploader;