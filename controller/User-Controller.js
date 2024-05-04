import nodemailer from "nodemailer";
import User from "../models/User-model.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import conversation from "../models/Message-model.js";
import { uploadfile_2_cloudinary } from "../config/cloudinary.js";
import { MapManager } from "../utilis/mapManager.js";
const OTP_OBJ=new Map()
const sendOTP = async (req, res) => {
    try {
        const { email } = req.body;
        const isUser= await User.findOne({email:email})
        if (isUser) {
            const maxAge = (7 * 24 * 60 * 60)*1000;
            const token = jwt.sign({email},process.env.JwtsecretKey)
            res.cookie('token', token, { maxAge, httpOnly: true });
        // Return success response
        return res.status(200).json({ success: true, redirect:true});
        }
        const otp = generateOTP(); 
        console.log(`OTP for ${email} is ${otp}`);// Function to generate OTP
        const timestamp = Date.now(); 
        const valuemap= OTP_OBJ.set(email, { otp, timestamp });
        // Save OTP and timestamp to a data store (e.g., database) for verification

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.Gmail_AC,
                pass: process.env.Gmail_PS
            }
        });

        const mailOptions = {
            from: process.env.Gmail_AC,
            to: email.toString(),
            subject: 'OTP Verification',
            text: `Your OTP for ChatZone App Verification is ${otp}. This OTP is valid only for 10 minutes.`
        };

        // Send email with OTP


        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                // Send error response
                res.status(500).json({ success: false, message: 'Failed to send OTP', error: error.message });
            } else {
                // Send success response
                res.status(200).json({ success: true, message: `OTP sent successfully ` });
            }
        });
        
    } catch (error) {
        // Handle errors
        console.error('Error sending OTP:', error);
        // Send error response
        res.status(500).json({ success: false, message: 'Failed to send OTP', error: error.message });
    }
};


const verifyOTP=async(req,res)=>{
    try {
        const { email, otp } = req.body;
        
        const storedData = OTP_OBJ.get(email);
        if (!storedData) {
            // Email not found in the OTP map
            return res.status(404).json({success:false,message:'Email not found'});
        }
  
        if (storedData.otp !==  otp.toString()) {
            // Invalid OTP
            return res.status(401).json({success:false,message:'Invalid OTP'});
        }
  
        const currentTime = Date.now();
        const otpTimestamp = storedData.timestamp;
        const timeDifference = (currentTime - otpTimestamp) / 1000; // Time difference in seconds
  
        if (timeDifference > 600) {
            // OTP has expired
            otpMap.delete(email); // Remove expired OTP from the map
            return res.status(401).json({success:false,message:'OTP has expired'});
        }
  
        // OTP verified successfully
    OTP_OBJ.delete(email); // Remove the OTP from the map after successful verification
        return res.status(200).json({success:true,data:email ,message:'OTP verified successfully'});
    } catch (error) {
        // Handle unexpected errors
        console.error('Error occurred during OTP verification:', error);
        res.status(500).json({success:false,message:'Internal Server Error'});
    }
}


const registration = async (req, res) => {
    try {
        const { email, name, pass } = req.body;
        console.log(email,name,pass)
        const maxAge = (7 * 24 * 60 * 60)*1000;

        // Validate email, name, and password
        if (!email || !name || !pass) {
            return res.status(400).json({ success: false,message:"Unable to get User Info" });
        }
        // Create a new user
        const newUser = new User({
            name,
            email: email.toLowerCase(),
            password:pass
        });

        // Save the new user
        const result = await newUser.save({ validateBeforeSave: true })

        // Generate JWT token
        const token = jwt.sign({ email: result.email }, process.env.JwtsecretKey);

        // Set token in cookie
        res.cookie('token', token, { maxAge, httpOnly: true });

        // Return success response
        return res.status(200).json({ success: true, email: result.email });
    } catch (error) {
        console.error("Technical error:", error);
        // Handle error and return appropriate response
        return res.status(500).json({ success: false, message: "An internal server error occurred." });
    }
}

 const addFriend=async(req,res)=>{
    try {
        const currentUser=req.id;
        const { friendId } = req.body;
        const finduser = await User.findById(currentUser).select(" -password")
        const targetUserInfo = await User.findOne({ userId: friendId }).select(" -password")
        
          if (!targetUserInfo) {
            return res.status(404).json({status:false ,message: "User not found Please Enter Valid Id " });
          }
    
          if (finduser.userId === targetUserInfo.userId) {
            return res.status(400).json({ status:false,message: "You cannot add yourself as  friend" });
          }
    
          const isUserAlreadyInConversations = finduser.friends.some(conversation =>
            conversation.friendId.toString() === targetUserInfo._id.toString()
          );
    
          if (isUserAlreadyInConversations) {
            return res.status(400).json({ status:false, message: "User already in conversations" });
          }
          const obj1={
         user:finduser._id,
         name:finduser.name
          }
          const obj2={
            user:targetUserInfo._id,
            name:targetUserInfo.name
          }
          const Newconversation = new conversation({
            participants:[obj1,obj2]
          });

          const new_conv=   await Newconversation.save()
          const newConversation = {
            friendId: targetUserInfo._id,
            conversationId:new_conv._id
          };
    
          finduser.friends.push(newConversation);
          const UptadedUser= await finduser.save();
          
          let isonline =MapManager.get(targetUserInfo.userId) ? "limegreen" :"red";
          console.log(isonline);
        //   await handleRecentInteraction(currentUser, targetUserInfo._id, isGroup);
       
        return res.json({ status:true,friendinfo:targetUserInfo,isonline});
      } catch (error) {
        console.error('Error in userContact:', error);
        res.status(500).json({ error: "Internal server error" });
      }
 }

// profile page functionality

const profile=async(req,res)=>{
    let currentUser;
    let self_visit;
    if (req.query.friendId) {
        currentUser=req.query.friendId;
        self_visit=false
    } else {
         currentUser=req.id;
         self_visit=true
 
    }
    const finduser = await User.findById(currentUser)
    .select(" -password")
    .populate( "friends.friendId")
    .populate("friends.conversationId")
    .exec();
    res.render("profilePage",{user:finduser,self_visit})
}



const updateProfilePicture = async (req, res) => {
    try {
        
        // Check if file is uploaded
        if (!req.file) {
            return res.status(400).json({ status: false, message: "No file uploaded" });
        }
        
        // Assuming req.id contains the current user's ID
        const currentUser = req.id;
        // Assuming User model and findById function are correctly defined
        const findUser = await User.findById(currentUser).select("-password");

        // Upload file to Cloudinary and get URL
        let type=true
        const response = await uploadfile_2_cloudinary(req.file.path,type);

        // Update user's profile picture URL
        findUser.profilePicture = response;

        // Save updated user to the database
        await findUser.save();

        // Send success response
        res.status(200).json({ status: true, url:response ,message: "Profile Picture Successfully Changed" });
    } catch (error) {
        console.error("Error updating profile picture:", error);
        res.status(500).json({ status: false, message: "An error occurred while updating profile picture" });
    }
}


const changePin = async (req, res) => {
    const { currentPin, newPin } = req.body; 
    try {
        const currentUser=req.id;

        const user = await User.findById(currentUser);
        const isMatch = await bcrypt.compare(currentPin, user.password);
        if (!isMatch) {
            return res.status(400).json({ status: false, message: 'Current PIN is incorrect' });
        }

        // Update the user's PIN in the database
        user.password = newPin;
        // Save the updated user object
        await user.save()
        return res.status(200).json({ status: true, message: 'PIN changed successfully' });
    } catch (error) {
        console.error('Error changing PIN:', error);
        return res.status(500).json({ status: false, message: 'Internal server error' });
    }
};

const Update_Info = async (req, res) => {
    try {
        const { bio, birthday, address, phone, name } = req.body;      
        const currentUser = req.id;
        const user = await User.findById(currentUser);

        if (!user) {
            return res.status(404).json({ status: false, message: 'User not found' });
        }

        // Update user information
        user.bio = bio;
        user.address = address;
        user.DOB = birthday;
        user.phone = phone;
        user.name=name;

        // Save the updated user object
         const result=await user.save();
         console.log(result);

        // Send success response
        return res.status(200).json({ status: true, message: 'User Info changed successfully' });
    } catch (error) {
        // Log the error
        console.error('Error updating user info:', error);
        
        // Send error response
        return res.status(500).json({ status: false, message: 'Internal server error' });
    }
};

const Update_link = async (req, res) => {
    try {
        const { facebook,github,linkedin,instagram,twitter } = req.body;      
        const currentUser = req.id;
        const user = await User.findById(currentUser);

        if (!user) {
            return res.status(404).json({ status: false, message: 'User not found' });
        }

        // Update user information
         user.links.facebook=facebook,
         user.links.twitter=twitter,
         user.links.github=github,
         user.links.instagram=instagram,
         user.links.linkedin=linkedin

        // Save the updated user object
        await user.save();

        // Send success response
        return res.status(200).json({ status: true, message: 'User Info changed successfully' });
    } catch (error) {
        // Log the error
        console.error('Error updating user info:', error);
        
        // Send error response
        return res.status(500).json({ status: false, message: 'Internal server error' });
    }
};


const block_friend = async (req, res) => {
    try {
      const userId = req.id; // Assuming you have the user's ID
      const friendIdToRemove = req.body.friendId; // Assuming you have the friend's ID to remove
  
      const user = await User.findOne({ _id: userId });
      const friendDB = await User.findOne({_id: friendIdToRemove });

  
      if (!user) {
        // User not found
        return res.status(400).json({ status: false, message: 'User not found' });
      }
  
      // Find the friend index in the user's friends array
      const friendIndex = user.friends.findIndex(friend => friend.friendId.toString() === friendIdToRemove);
  
      if (friendIndex === -1) {
        // Friend not found in the user's friends list
        return res.status(400).json({ status: false, message: 'Friend not found in users friends list' });
      }
  
      // Toggle the blocked status of the friend
       let action = user.friends[friendIndex].blocked ;
       action === true ? user.friends[friendIndex].blocked =false :user.friends[friendIndex].blocked =true;
  
      // Save the updated user
      const updatedUser = await user.save();
      let message;
      let blocked;
      if (user.friends[friendIndex].blocked === true) {
        message = "Friend blocked Successfully";
        blocked=true;
      } else {
        message = "Friend unblocked Successfully";
        blocked=false;
      }
  
      // Return success response
      return res.status(200).json({ status: true, name:friendDB.name,blocked ,message: message });
    } catch (error) {
      console.error(error);
      // Error handling
      return res.status(500).json({ status: false, message: "Internal error" });
    }
  }
  
// Function to generate OTP
function generateOTP() {
    return Math.floor(1000 + Math.random() * 9000).toString(); // 6-digit OTP
}

export { block_friend ,Update_link,Update_Info,changePin,updateProfilePicture,sendOTP ,verifyOTP,registration,addFriend,profile};
