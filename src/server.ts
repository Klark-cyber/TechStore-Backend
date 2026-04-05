import dotenv from "dotenv"; // in common js const dotenv = require("dotenv"
dotenv.config(); //config() metodi .env file ichidagi maxfiy malumotlarni process.env orqali import qilish imkonini beradi
//console.log("PORT:",process.env.PORT) //process.env orqali .env ichidagi maxfiy malumotlar import qilinadi
//console.log("Mongo_Url:",process.env.MONGO_URL)

//CLUSTER => DATABASE => COLLECTION => DOCUMENT
import mongoose from 'mongoose';
import app from "./app" 

mongoose.connect(process.env.MONGO_URL as string, {})
.then((data)=>{
    console.log("MongoDb connection succeed")
    const PORT = process.env.PORT ?? 3009; //?? 3003 bu agar port mavjud bolmasa 3003 ni tanla buyrugi
    app.listen(PORT, function(){
        console.log(`The server is running successfully on port: ${PORT}`)
        console.info(`Admin project on http://localhost:${PORT}/admin \n`);
    })
})
.catch(err => console.log('ERROR on connection MongoDB', err)); // {}- connect options
