const Admin = require('../models/Admin');

exports.getLogin = (req,res)=>{
    res.render("admin_login",{error:null});

};

exports.postLogin = (req,res)=>{
    const {email,password}=req.body;
    
    const Admin_Email = 'pankaj@gmail.com';
    const Admin_Password = 'pankaj123';

    if(email === Admin_Email && password === Admin_Password){
        return res.redirect("/employees");
    }

    res.render("admin_login",{error:"Invalid Email and Password"});
};