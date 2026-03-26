import cors from "cors"
import expreess from 'express'
import path from "path"
import router from "./router"
import routerAdmin from "./router-admin"
import morgan from "morgan" // morganni ishlatish uchun @types/morgan ham install qilindi
import cookieParser from 'cookie-parser'
import { MORGAN_FORMAT } from './libs/config'
import { T } from './libs/types/common'
import uuid from "uuid"


import session from 'express-session' //bu paket sessionni hosil qilish uchun kerak
import ConnectMongoDB from "connect-mongodb-session" //bu paket sessionni hosil qilish uchun kerak


const MongoDBStore = ConnectMongoDB(session) 
const store = new MongoDBStore({ //session borib saqlanaadigan collection manzili
    uri: String(process.env.MONGO_URL),  //Burak uchun ochigan MongoDB manzilini kiritamiz
    collection: "sessions"               //session saqlanishi kerak bolgan qaysi nom orqali ochilgan collection nomini kiritamiz
})

 
/** 1-ENTRANCE */
const app = expreess();
//console.log(__dirname); //__dirname bu dirname yozilgan filening manzili
app.use(expreess.static(path.join(__dirname, 'public'))) 
app.use('/uploads', expreess.static("./uploads")) //uploads fodlderni ham public qilib qoydik.Agar req /uploads ga kelsa server uploades folderni static qiladi
app.use(expreess.urlencoded({extended: true})); //traditional Api uchun xizmat qilib form tegidan kelayotgan malumotlarni qabul qilishga ruxsat beradi
app.use(expreess.json()); //RestAPI sifatida request bolayotgan datalarni bodysida kelayotgan json datani otqazishga ruxsat beryapmiz.
app.use(cors({credentials: true, origin: true})) //cors ixtiyoriy domendan kelayotgan requestlarni serverga kirishiga ruxsat beradi
app.use(cookieParser()) //kirib kelgan req tarkibida cookielarni korishimiz va res orqali browser cookielarini ozgartirishimiz mumkin boladi
app.use(morgan(MORGAN_FORMAT))

/** 2-SESSIONS */ //middleware sessionlarni integrate qilib olamiz
//1-req.session yaratiladi. 2-req.session.member mavjud boldi
app.use(
session({
  secret: String(process.env.SESSION_SECRET), //sidni shifrlash uchun ishlatiladigan mahfiy kalit
  cookie: {
    maxAge: 1000 * 3600 * 6 // 6 hours bu sessionning aktivlik vaqti
  },
  store: store, //sessionning Mongodb da saqlanadigan collection manzili
  resave: true, //true songi login qilingan vaqtdan boshlab emas dastlabki login bolgan vaqtdan boshlab 3 soat davomidagi session aktivligi.Agar false bolsa songi request timedan song 3 soat davomida aktivlik davom etadi
  saveUninitialized: true //requ
}));

app.use(function(req, res, next){ //app.use global midleware yani kirib kelayotgan barcha requestlar shu midlwaredan otadi
  const sessionInstance = req.session as T; //session yuqoridagi session midleware sababli paydo bolgan.Agar user login bolgan bolsa req tarkibida member mavjud boladi
  res.locals.member = sessionInstance.member; //Bu qator sessiondagi userni barcha sahifalar va filellar ishlatishi mumkin bolgan holatga keltiradi.res.locals browser veriable hisoblanadi
  next();
});

/** 3-VIEWS */
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', "ejs");



/** 4-ROUTERS */
app.use("/admin", routerAdmin);//EJS.1-maqsad: Beckend loyihamizni traditional frontend dewelopment yani Adminka loyihamizni qurish uchun ishlatamiz.BSSR yani backendda frontendni qurib olamiz.EJs frameworkdan foydalanamiz
app.use("/", router); //REACT.2-maqsad:SPA: REACT loyihamizga RestAPI server sifatida ishlatamiz.Middleware disign pattern ishlatilgan.
export default app; //in common js module.exports = app