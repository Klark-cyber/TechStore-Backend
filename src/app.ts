import cors from "cors"
import expreess from 'express'
import path from "path"
import router from "./router"
import routerAdmin from "./router-admin"
import morgan from "morgan" // morganni ishlatish uchun @types/morgan ham install qilindi
import cookieParser from 'cookie-parser'
import { MORGAN_FORMAT } from './libs/config'
import { T } from './libs/types/common'


import session from 'express-session' //bu paket sessionni hosil qilish uchun kerak
import ConnectMongoDB from "connect-mongodb-session" //bu paket sessionni hosil qilish uchun kerak


const MongoDBStore = ConnectMongoDB(session)
const store = new MongoDBStore({ //session borib saqlanaadigan collection manzili
  uri: String(process.env.MONGO_URL),  //Burak uchun ochigan MongoDB manzilini kiritamiz
  collection: "sessions"               //session saqlanishi kerak bolgan qaysi nom orqali ochilgan collection nomini kiritamiz
})

// ⚠️ YANGI — avval bu yerda hech qanday xato tekshiruvi yo'q edi.
// Agar session'lar saqlanadigan MongoDB ulanishida muammo bo'lsa
// (masalan .env'da MONGO_URL noto'g'ri, yoki vaqtincha ulanish
// uzilishi), bu jimgina, hech qanday xabarsiz muvaffaqiyatsiz
// bo'lardi — va foydalanuvchi "login qilganman" deb hisoblasa-da,
// sessiyasi haqiqatda saqlanmagan/topilmagan bo'lardi.
store.on('error', (err) => {
  console.error('❌ Session store xatosi (MongoDB):', err);
});


/** 1-ENTRANCE */
const app = expreess();
//console.log(__dirname); //__dirname bu dirname yozilgan filening manzili
app.use(expreess.static(path.join(__dirname, 'public')))
app.use('/uploads', expreess.static("./uploads")) //uploads fodlderni ham public qilib qoydik.Agar req /uploads ga kelsa server uploades folderni static qiladi
app.use(expreess.urlencoded({ extended: true })); //traditional Api uchun xizmat qilib form tegidan kelayotgan malumotlarni qabul qilishga ruxsat beradi
app.use(expreess.json()); //RestAPI sifatida request bolayotgan datalarni bodysida kelayotgan json datani otqazishga ruxsat beryapmiz.
// ⚠️ TUZATILDI: avval `origin: true` — bu ISTALGAN veb-saytdan kelgan
// so'rovni, `credentials: true` bilan birga, qabul qilardi. Bu, boshqa
// birov o'z sahifasini ochib, tashrif buyuruvchining brauzeridagi session
// cookie'sidan foydalanib, ushbu API'ga uning nomidan so'rov yubora
// olishi mumkinligini anglatardi (CSRF-ga o'xshash xavf). Endi faqat
// haqiqiy frontend domenimiz va lokal rivojlantirish manzillariga
// ruxsat beriladi.
const allowedOrigins = [
  'https://featuretechstore.com',
  'https://www.featuretechstore.com',
  'http://localhost:3000',
  'http://localhost:3009',
];
app.use(cors({
  credentials: true,
  origin: (origin, callback) => {
    // ⚠️ YANGI: Vercel'ning avtomatik (*.vercel.app) domenlariga ham
    // ruxsat beramiz — chunki loyiha ko'pincha custom domendan oldin,
    // yoki u bilan bir qatorda, Vercel'ning o'zi bergan standart
    // manzili orqali ham sinab ko'riladi. Bu ro'yxatda bo'lmasa, CORS
    // butun so'rovni butunlay rad etardi (faqat cookie emas).
    const isVercelPreview = origin && /\.vercel\.app$/.test(origin);
    if (!origin || allowedOrigins.includes(origin) || isVercelPreview) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
}))
app.use(cookieParser()) //kirib kelgan req tarkibida cookielarni korishimiz va res orqali browser cookielarini ozgartirishimiz mumkin boladi
app.use(morgan(MORGAN_FORMAT))

/** 2-SESSIONS */ //middleware sessionlarni integrate qilib olamiz
//1-req.session yaratiladi. 2-req.session.member mavjud boldi
app.use(session({
  secret: String(process.env.SESSION_SECRET),
  cookie: {
    maxAge: 1000 * 3600 * 6,
    // ⚠️ TUZATILDI: avval 'lax' edi — bu cookie faqat "bir xil sayt"
    // so'rovlarida yuborilardi. Lekin frontend Vercel'ning standart
    // domeni (masalan *.vercel.app) orqali ham ochilishi mumkin — bu
    // backend domenimizdan (api.featuretechstore.com) BUTUNLAY BOSHQA
    // sayt hisoblanadi, shuning uchun brauzer cookie'ni jimgina
    // yubormay qo'yardi. Natijada frontend "men login qilganman"
    // deb hisoblasa-da (eski, saqlanib qolgan holat), backend
    // so'rovda hech qanday cookie ko'rmasdi va "not authenticated"
    // xatosini qaytarardi.
    // MUHIM: sameSite:'none' HAR DOIM secure:true bilan birga
    // bo'lishi SHART (brauzer talabi) — aks holda cookie butunlay
    // rad etiladi. Shuning uchun ikkalasi ham bir xil shartga
    // (NODE_ENV) bog'langan: production'da 'none'+true (Vercel kabi
    // boshqa domendan ham ishlaydi), lokalda 'lax'+false (oddiy
    // http://localhost uchun).
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    secure: process.env.NODE_ENV === 'production',
  },
  store: store,
  resave: true,
  saveUninitialized: true,
}));

app.use(function (req, res, next) { //app.use global midleware yani kirib kelayotgan barcha requestlar shu midlwaredan otadi
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