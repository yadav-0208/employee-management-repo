const app = require("./app");
const dotenv = require("dotenv");
const connectDB = require('./config/db');



dotenv.config();
const PORT = process.env.PORT || 3000;

//connect DB to Server
connectDB().then(()=>{
    app.listen(PORT,()=> console.log(`Server is Running at http://localhost:${PORT}`));

});
