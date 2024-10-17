const express = require("express");
const app = express();
const bcrypt = require("bcryptjs");
const saltRounds = 10;
const jwt = require("jsonwebtoken");
const passport = require("passport");
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
require("dotenv").config();
const PORT = process.env.PORT;
const cors = require("cors");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
//default settings
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
//connection
mongoose
  .connect(process.env.MONGO_URL)
  .then(() => {
    console.log("DB is connected");
  })
  .catch((err) => {
    console.log("Connection Problem");
    console.log(err);
    process.exit(1);
  });
// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Set up Cloudinary storage for Multer
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "Pran-Rokto", // Folder name in Cloudinary
    format: async (req, file) => "jpg", // You can specify file format or let Cloudinary auto-detect
    public_id: (req, file) => file.originalname.split(".")[0], // Use original file name as public ID
  },
});

// Set up Multer middleware
const upload = multer({ storage: storage });
//Schema
const univercelDatas = new mongoose.Schema({
  bloodGroup: String,
  districts: Array,
  upazillas: Array,
});
const donors = new mongoose.Schema({
  name: String,
  mobile: String,
  womenNumber: String,
  email: String,
  bloodGroup: String,
  lastDonationDate: Date,
  image: String,
  note: String,
  permanentAddress: {
    district: String,
    upazilla: String,
    address: String,
  },
  presentAddress: {
    district: String,
    upazilla: String,
    address: String,
  },
  gender: String,
  dob: Date,
  password: String,
});
const chatBox = new mongoose.Schema({
  name: String,
  image: String,
  message: String,
  mobile: String,
});
//Model
const univercel = new mongoose.model("univercelData", univercelDatas);
const donorsData = new mongoose.model("donorsData", donors);
const chatBoxMsg = new mongoose.model("chatBoxMsg", chatBox);
//passport
const JwtStrategy = require("passport-jwt").Strategy,
  ExtractJwt = require("passport-jwt").ExtractJwt;
const opts = {};
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = process.env.SECRET_KEY;
passport.use(
  new JwtStrategy(opts, async function (jwt_payload, done) {
    try {
      const donor = await donorsData.findOne({ _id: jwt_payload.id });
      if (donor) {
        return done(null, donor);
      } else {
        return done(null, false);
      }
    } catch (err) {
      return done(err, false);
    }
  })
);
//Routes
//chatbox
app.post("/chatbox", async (req, res) => {
  const { name, image, message, mobile } = req.body;
  try {
    const newMessage = await new chatBoxMsg({ name, image, message, mobile });
    await newMessage.save();
    res.status(201).send(newMessage);
  } catch (error) {
    res.status(400).send({ msg: error.message });
  }
});
app.get("/chatbox", async (req, res) => {
  try {
    const message = await chatBoxMsg.find({});
    res.status(201).send(message);
  } catch (error) {
    res.status(400).send({ msg: error.message });
  }
});
//Profile->Done
app.get(
  "/profile",
  passport.authenticate("jwt", { session: false }),
  function (req, res) {
    try {
      res.send({ verifiedUser: true });
    } catch (error) {
      res.send({ verifiedUser: false });
    }
  }
);
//Univercel Data-> Done
app.post("/univercelData", async (req, res) => {
  const newData = await new univercel({
    bloodGroup: req.body.bloodGroups,
    districts: req.body.districts,
    upazillas: [],
  });
  await newData.save();
  res.status(200).send(newData);
});
//Get Univercel Data-> Done
app.get("/univercelData", async (req, res) => {
  const data = await univercel.find({});
  res.status(200).send(data);
});
//Upazillas-> Done
app.post("/upazilla", async (req, res) => {
  try {
    // Find the document containing the upazillas array
    const findData = await univercel.findOne({
      "upazillas.district_id": req.body.upazilla, // Search for documents that have upazillas with the given id
    });

    if (!findData) {
      return res.status(404).send({ message: "No data found" });
    }

    // Filter the upazillas array to return only the matching upazilla
    const matchedUpazillas = findData.upazillas.filter(
      (upazilla) => upazilla.district_id === req.body.upazilla
    );

    res.status(200).send(matchedUpazillas); // Return only the matched upazillas
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "Server error" });
  }
});
//Districts-> Done
app.post("/getDistrict", async (req, res) => {
  const { districtNumber } = req.body;
  const findDistrict = await univercel.findOne({
    "districts.id": districtNumber,
  });

  if (!findDistrict) {
    return res.status(404).send({ message: "No data found" });
  }

  // Filter the upazillas array to return only the matching upazilla
  const matchedDistrict = findDistrict.districts.filter(
    (district) => district.id === req.body.districtNumber
  );

  res.status(200).send(matchedDistrict); // Return only the matched upazillas
  // res.status(200).send(findDistrict);
});
//Registration-> Done
app.post("/donorsData", async (req, res) => {
  const {
    name,
    mobile,
    womenNumber,
    email,
    bloodGroup,
    lastDonationDate,
    gender,
    dob,
    password,
  } = req.body;
  const { district, upazilla, address } = req.body.presentAddress;
  const findUser = await donorsData.findOne({ mobile });
  try {
    if (findUser) {
      res.status(201).send({
        status: "notOk",
        msg: "আপনার দেয়া নাম্বার দিয়ে ইতোমধ্যে একটি একাউন্ট খোলা আছে। অনুগ্রহ করে লগইন করুন! ",
      });
    } else {
      bcrypt.hash(password, saltRounds, async (err, hashedPassword) => {
        if (err) throw err;
        const newDonor = await new donorsData({
          name,
          mobile,
          womenNumber,
          email,
          bloodGroup,
          lastDonationDate,
          gender,
          dob,
          password: hashedPassword,
          presentAddress: {
            district,
            upazilla,
            address,
          },
        });
        await newDonor.save();
        res.status(200).send(newDonor);
      });
    }
  } catch (error) {
    res.status(202).send({ msg: error.message });
  }
});
//Donor-Update-> Done
app.post("/donor/update/:number", async (req, res) => {
  const { number } = req.params;
  const {
    name,
    mobile,
    email,
    bloodGroup,
    lastDonationDate,
    gender,
    dob,
    womenNumber,
  } = req.body;
  const { district, upazilla, address } = req.body.presentAddress;
  const findNumUser = await donorsData.findOne({ mobile: number });
  try {
    if (findNumUser) {
      const findDonor = await donorsData.findOneAndUpdate(
        { mobile: number },
        {
          name,
          mobile,
          womenNumber,
          email,
          bloodGroup,
          lastDonationDate,
          gender,
          dob,
          presentAddress: {
            district,
            upazilla,
            address,
          },
        },
        { new: true }
      );
      res.status(200).send(findDonor);
    } else {
      const findDonor = await donorsData.findOneAndUpdate(
        { womenNumber: number },
        {
          name,
          mobile,
          womenNumber,
          email,
          bloodGroup,
          lastDonationDate,
          gender,
          dob,
          presentAddress: {
            district,
            upazilla,
            address,
          },
        },
        { new: true }
      );
      res.status(200).send(findDonor);
    }
  } catch (error) {
    console.log(error.message);
  }
});
//Profile-Photo-> Done
app.post(
  "/donor/update/photo/:number",
  upload.single("image"),
  async (req, res) => {
    const { number } = req.params;
    const findDonor = await donorsData.findOneAndUpdate(
      { mobile: number },
      {
        image: req.file.path,
      },
      { new: true }
    );
    res.status(200).send(findDonor);
  }
);
//Login-> Done
app.post("/login", async (req, res) => {
  const { mobile, password } = req.body;

  const findUser = await donorsData.findOne({ mobile: mobile });
  const findWomenDonor = await donorsData.findOne({
    womenNumber: mobile,
  });

  try {
    if (findUser) {
      bcrypt.compare(password, findUser.password, (err, isMatch) => {
        if (err) throw err;
        if (isMatch) {
          const payload = {
            id: findUser._id,
            mobile: mobile,
          };
          const token = jwt.sign(payload, process.env.SECRET_KEY);
          res.status(200).send({ token: "Bearer " + token, mobile: mobile });
        } else {
          res.status(200).send({ msg: "Passwords do not match." });
        }
      });
    } else {
      if (findWomenDonor) {
        bcrypt.compare(password, findWomenDonor.password, (err, isMatch) => {
          if (err) throw err;
          if (isMatch) {
            const payload = {
              id: findWomenDonor._id,
              mobile: mobile,
            };
            const token = jwt.sign(payload, process.env.SECRET_KEY);
            res.status(200).send({ token: "Bearer " + token, mobile: mobile });
          } else {
            res.status(200).send({ msg: "Passwords do not match." });
          }
        });
      } else {
        res.status(200).send({ msg: "Invalid Information" });
      }
    }
  } catch (error) {
    console.log(error.message);
  }
});
//Manage Date-> Done
app.post("/manage-date/:number", async (req, res) => {
  const { number } = req.params;
  const findUser = await donorsData.findOneAndUpdate(
    { mobile: number },
    {
      lastDonationDate: req.body.date,
      note: req.body.note,
    },
    { new: true }
  );
  res.status(200).send(findUser);
});
//Changed-Passoword-> Done
app.post("/change-password/:number", async (req, res) => {
  const { number } = req.params;
  const findUser = await donorsData.findOne({ mobile: number });

  //
  if (findUser) {
    bcrypt.compare(req.body.oldPassword, findUser.password, (err, isMatch) => {
      if (err) throw err;
      if (isMatch) {
        //
        bcrypt.hash(
          req.body.newPassword,
          saltRounds,
          async (err, hashedPassword) => {
            if (err) throw err;
            findUser.password = hashedPassword;
            findUser.save();
            res.status(200).send({ msg: "Successfully Changed the password" });
          }
        );
        //
      } else {
        res.status(401).send({ msg: "পুরোনো পাসওয়ার্ড ভুল দিয়েছেন !" });
      }
    });
  } else {
    res.status(400).send({ msg: "Wrong info" });
  }
});
//Search Result-> Done
app.post("/getSearchResult", async (req, res) => {
  const { bloodGroup, district, upazilla } = req.body;
  const findBloodGroup = await donorsData.find({ bloodGroup: bloodGroup });
  if (findBloodGroup) {
    const filterDonor = findBloodGroup.filter((donor) => {
      return donor.presentAddress.district === district;
    });
    if (filterDonor) {
      if (upazilla) {
        const finalDonor = filterDonor.filter((donor) => {
          return donor.presentAddress.upazilla === upazilla;
        });
        res.status(200).send(finalDonor);
      } else {
        res.status(200).send(filterDonor);
      }
    }
  } else {
    res.status(400).send({ msg: "No donor found" });
  }
});
//Donor-Details-> Done
app.get("/donor/:number", async (req, res) => {
  const number = req.params.number;
  const findUser = await donorsData.findOne({ mobile: number });
  const findWomenUser = await donorsData.findOne({ womenNumber: number });
  if (findUser) {
    res.status(200).send(findUser);
  } else {
    if (findWomenUser) {
      res.status(200).send(findWomenUser);
    } else {
      res.status(401).send({ msg: "Not Found" });
    }
  }
});
//All donors-> done
app.get("/all-donors", async (req, res) => {
  const findDonors = await donorsData.find({});
  res.status(200).send(findDonors);
});
//
app.get("/", (req, res) => {
  res.send("Welcome to SERVER");
});
app.listen(PORT, () => {
  console.log(`http://localhost:${PORT}`);
});
