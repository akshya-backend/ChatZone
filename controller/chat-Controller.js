import  jwt  from "jsonwebtoken";
import User from "../models/User-model.js"
import conversation from "../models/Message-model.js";
import { MapManager } from "../utilis/mapManager.js";
const chat_Init=async(req,res)=>{
    try {
        const id = req.id;
        const {friend_id}=req.body;                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           
        const user_info = await User.findById(id).select("-password");
        const friend_info = await User.findOne({userId:friend_id}).select("-password");
  
        if (!user_info || !friend_info) {
          return res.redirect("/");
        }
        const converstion_Id= user_info.friends.find((e)=>{
          return e.friendId.toString() === friend_info._id.toString()})
       // for friend list purpose
       const messageModel=await conversation.findById(converstion_Id.conversationId).populate("messages.sender").exec()
        const findFriend=messageModel.participants.find((e) =>e.user.toString() === user_info._id.toString())
        findFriend.pending_message = 0;
        await messageModel.save();
        const userInfo=await User.findById(user_info._id)
        .populate( "friends.friendId")
        .populate("friends.conversationId")
        .exec();
      // for converstaion 
        
        const friendid=friend_info.userId;
        const userId=userInfo.userId;
        const encodeEmail=  jwt.sign(userId,process.env.JwtsecretKey4user)
       
        res.render("index", { index: false, user: userInfo,friend:friend_info,encode:encodeEmail,encodefriend:friendid,message:messageModel,status:MapManager.myMap});
      } catch (error) {
        console.error("Error in mainpage Chat controller:", error);
        res.redirect("/");
      }
}

const addfriend = async (req, res) => {
  const { userID, friendID, messageID } =req.body;
  const user_info = await User.findOne({userId:userID})
  const friend_info = await User.findById(friendID)
  
  if (user_info && friend_info) {
    const obj = {
      friendId: user_info._id,
      conversationId: messageID
    };
    friend_info.friends.push(obj);
     await friend_info.save();
    res.status(200)
  } else {
    console.error("User or friend not found.");
    res.status(404).send("User or friend not found.");
  }
};

export {chat_Init,addfriend}