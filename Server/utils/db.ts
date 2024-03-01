import mongoose from "mongoose";
const Mongo_URL:string = process.env.MONGO_URL || "";

const connectDb = async()=>{
    await mongoose.connect(Mongo_URL).then((data:any)=>{
        console.log(`Database connection with ${data.connection.host}`);
        
    }).catch((error:any)=>{
        console.log(error.message);
        setTimeout(connectDb, 5000)
    });
}

export default connectDb