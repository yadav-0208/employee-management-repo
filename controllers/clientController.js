const Client = require("../models/Client");
const bcrypt = require("bcrypt");

// Show Signup
exports.getSignup = (req, res) => {
  res.render("client_signup", { error: null });
};

// Handle Signup
exports.postSignup = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const existing = await Client.findOne({ email });
    if (existing) {
      return res.render("client_signup", { error: "Email already exists" });
    }

    //Hashed Password
    const hashedPassword = await bcrypt.hash(password,10);

    const newClient = new Client({ name,
       email,
        password:hashedPassword
       });
    await newClient.save();

    res.redirect("/client1/login"); // go to login page
  } catch (err) {
    console.error(err);
    res.render("client_signup", { error: "Something went wrong" });
  }
};

// Show Login
exports.getLogin = (req, res) => {
  res.render("client_login", { error: null });
};

// Handle Login
exports.postLogin = async (req, res) => {
  const { email, password } = req.body;

  try {
    const client = await Client.findOne({ email });

    if (!client) {
      return res.render("client_login", { error: "Invalid email or password" });
    }

    //Compare entered password with hashed
    const isMatch = await bcrypt.compare(password,client.password);
    if(!isMatch){
      return res.render("client_login",{error:"Invalid Password"})
    }

    res.redirect(`/client1/dashboard/${client._id}`);
  } catch (err) {
    console.error(err);
    res.render("client_login", { error: "Something went wrong" });
  }
};

// Show Dashboard
exports.getDashboard = async (req, res) => {
  try {
    const client = await Client.findById(req.params.id);
    if (!client) {
      return res.status(404).send("Client not found");
    }

    res.render("client_dashboard", { client });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
};
