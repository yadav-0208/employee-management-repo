const express = require('express');
const path = require('path');
const helmet = require('helmet');
const morgan = require('morgan');
const methodOverride = require('method-override');
const employeeRoute = require("./routes/employeeRoute");
const employeeApiRoutes = require("./routes/employeeApiRoutes");

const app = express();

//MiddleWares
app.use(helmet());
app.use(morgan());
app.use(express.urlencoded({extended:true}));
app.use(express.json());
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname,"public")))



//View Engine
app.set("view engine","ejs");
app.set("views", path.join(__dirname,"views"));

//Routes
app.get("/",(req,res)=>
    res.redirect("/employees"));
app.use("/employees",employeeRoute);
app.use("/api/employees",employeeApiRoutes);


//Error
app.use((req,res)=>{
    if(req.originalUrl.startsWith("/api")){
        return res.status(404).json({message:"Not Found"});
    }
    res.status(404).render("employees/show",{
        title: "Not Found",
        body:`<div class="container"><h2>404- Page Not Found</h2></div>`,
        emp:""
    
    });
});


module.exports = app;
