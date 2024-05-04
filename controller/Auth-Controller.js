import User from "../models/User-model.js";
import bcrypt from "bcrypt";
import  jwt   from "jsonwebtoken";
import nodemailer from "nodemailer";
import { MapManager } from "../utilis/mapManager.js";




   
const Verify_Pin = async (req, res,next) => {
    try {
      const token = req.cookies.token;
      if (!token ) {
       
        return res.render("PinPage");
      }
      const decodedToken = jwt.verify(token, process.env.JwtsecretKey);
      const { pass1, pass2, pass3, pass4 } = req.body;
      const pass = pass1 + pass2 + pass3 + pass4;

      if (pass.length !== 4 || isNaN(pass)) {
        return res.render("PinPage", { error: "Please Enter a 4-digit PIN" });
      }
  
      const findUser = await User.findOne({ email:decodedToken.email });
  
      if (!findUser) {
        res.clearCookie("token")
        return res.redirect("/");
      }
  
      const checkPass = await bcrypt.compare(pass, findUser.password);
  
      if (!checkPass) {
        
         return res.render("PinPage", { error: "Incorrect Password" });
      };
      req.id=findUser._id

 req.access=true;
 next()
    } catch (error) {
      console.error("Error occurred:", error);
      return res.status(500).json({ error: "Server Error" });
    }
  };

  const mainpage = async (req, res) => {
    try {
      const id = req.id;
      const user_info = await User.findById(id).select("-password");
  
      if (!user_info) {
        return res.redirect("/");
      }
  
      const userInfo=await User.findById(user_info._id)
      .populate( "friends.friendId")
      .populate("friends.conversationId")
      .exec();
      const userId=userInfo.userId;
      const encodeEmail=  jwt.sign(userId,process.env.JwtsecretKey4user)
      
      res.render("index", { index: true, user: userInfo,encode:encodeEmail,status:MapManager.myMap});
    } catch (error) {
      console.error("Error in mainpage controller:", error);
      res.redirect("/");
    }
  };
  
  
   const logout=async(req,res)=>{
    res.clearCookie("token"); // Use clearCookie to delete the cookie
    return res.status(200).json({ status:true });
  }

   

  const RootPage=async(req,res)=>{
    const token = req.cookies.token;
   if (token) {
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.render("PinPage")
   } else {
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.render("landingPage")

   }
  }


;
  
  
const pinChangeRequest = async (req, res) => {
  const currentUser = req.id;
  const user = await User.findById(currentUser);
  const secretKey = process.env.JwtsecretKey + user.password

  if (!user) {
      return res.status(404).json({ status: false, message: 'User not found' });
  }

  try {
      // Generate token with user ID, expiration time (10 minutes), and user's old password hash
      const passwordHash = user.password; // Assuming user's password hash is stored in user.password
      const token = jwt.sign({ userId: user._id }, secretKey, { expiresIn: '10m' });

      // Construct link with token
      const changePasswordLink = `http://localhost:2000/api/Chat-Zone/security/change-pinVerification?token=${token}&secret=${user.userId}`;

      const transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
              user: process.env.Gmail_AC,
              pass: process.env.Gmail_PS
          }
      });

      const mailOptions = {
          from: process.env.Gmail_AC,
          to: user.email.toString(),
          subject: 'PIN Change Request',
          html: `<p>Click <a href="${changePasswordLink}">here</a> to change your PIN.</p>`,
      };

      // Send email with PIN change link
      transporter.sendMail(mailOptions, (error, info) => {
          if (error) {
              // Send error response
              console.log(error);
              res.status(500).json({ success: false, message: 'Failed to send PIN change link, please check your connection' });
          } else {
              // Send success response
              res.status(200).json({ status: true, message: 'PIN change link sent successfully to your registered email' });
          }
      });
  } catch (error) {
      console.log(error);
      res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

  // Route for handling PIN ange request
  // Route for handling PIN change request
const changePinVerification = async (req, res) => {
  const token = req.query.token;
  const id = req.query.secret;


  try {
    const user = await User.findOne({userId:id});

      // Verify and decode token
      const secretKey= process.env.JwtsecretKey+user.password
      const decoded = jwt.verify(token,secretKey);

      
      // Check if the user's password hash matches the one stored in the token
      if (!user) {

          return res.render("PinPage", { error: 'User not found' });
      }

      if (decoded.exp < Date.now() / 1000) {
          return res.render("PinPage", { error: 'Token expired' });
      }

      // Proceed with PIN change
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expire','0')
      res.render("new_PinPage",{email:user.userId}) // Redirect to the PIN change page
  } catch (error) {
      return res.render("PinPage", { error: 'Invalid token' });
  }
};

  
  // Route for handling PIN change form submission
  const setNew_Pin = async (req, res) => {
      const userId = req.body.email; // Assuming user ID is stored in the request object
      const newPassword = req.body.newPin; // Assuming the new PIN is submitted in the request body
      
      try {
          // Update user's PIN (dummy update for demonstration)
          const user = await User.findOne({userId});
          user.password=newPassword;
          await user.save()
          res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
          res.setHeader('Pragma', 'no-cache');
          res.setHeader('Expires', '0');
          res.redirect("/"); // Redirect to the home page or any other desired page
      } catch (error) {
          return res.status(500).json({ message: 'Failed to update PIN' });
      }
  };
  
  
  

export {Verify_Pin,mainpage,logout,RootPage,changePinVerification,setNew_Pin,pinChangeRequest}