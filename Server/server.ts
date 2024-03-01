import {app} from "./app";
import connectDb from "./utils/db";
require("dotenv").config();

app.listen(process.env.PORT,()=>{
    console.log(`Serving is running on Port: ${process.env.PORT}`);
    connectDb()
})