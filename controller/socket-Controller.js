import {  uploadfile_2_cloudinary } from "../config/cloudinary.js";
import conversation from "../models/Message-model.js";
import User from "../models/User-model.js";
import { MapManager } from "../utilis/mapManager.js";

async function handleIncomingMessage(socket, messageData, io) {
  try {
    // Retrieve the current user
    const friendId = messageData.friendId;

    const currentUser = await User.findOne({ userId: socket.userId }).populate("friends.friendId");
    const friend_info=await User.findOne({userId:friendId})
    // Find the friend and messageObj based on friend ID
  
    const friend = currentUser.friends.find((friend) => friend.friendId.userId.toString() === friendId.toString());
  
    if (friend.blocked == true) { 
       let  data="Cannot send Messages! You Have Blocked this Person " 
       socket.emit("blocked-response",data)
       return;
    }
    const isfriend = friend_info.friends.find((friend) => friend.friendId._id.toString() === currentUser._id.toString());

    if (isfriend?.blocked ==true ) {
     let  data=" You Have Blocked by this Person ! Cannot Send Message" 
       socket.emit("blocked-response",data)
       return;
   }
    const messageObj = await conversation.findById(friend.conversationId);

    // Create the message object
    const newMessage = {
      sender: currentUser._id,
      contentType: "Text/String",
      content: messageData.message,
      timestamp: Date.now(),
    };
    // Check if friend is online (using MapManager)
    const friendSocketId = MapManager.get(friendId);

    if (!friendSocketId) {
      // Friend is offline, store message and send response locally
      // (Consider using Redis for message storage, discussed later)
      messageObj.messages.push(newMessage);
      await messageObj.save();
      messageData.filetype ="text"
      socket.emit("message-response", messageData); // Local response
    } else {
      // Friend is online, send message to friend and update messageObj

      const reply = {
        message: messageData.message,
        friendId: currentUser.userId,
        friendPic: friend.friendId.profilePicture, // Assuming friendId has profilePicture
        friendName: friend.friendId.name, // Assuming friendId has name
        userPic: currentUser.profilePicture,
        userName: currentUser.name,
        messageId: friend.conversationId,
        userID: friend.friendId._id,
        messageObj: newMessage,
        filetype:"text/String"
      };

      socket.emit("message-response", reply);
      io.to(friendSocketId).emit("message-from-friend", reply);

     messageObj.messages.push(newMessage);
     const result=  await messageObj.save();
    }
  } catch (error) {
    console.error("Error handling message:", error);
    socket.emit("error", "An error occurred while handling the message");
  }
}
async function handle_sendFile(type,friendId,path,socket,io){   
  const link = await uploadfile_2_cloudinary(path)
  if (!link) {
    let  message="File Sharing not Possible, Make Sure You Are Connected To Internet" 
    socket.emit("blocked-response",message)
    return;
  }
  const currentUser = await User.findOne({ userId: socket.userId }).populate("friends.friendId");
  const friend_info=await User.findOne({userId:friendId})
  const friend = currentUser.friends.find((friend) => friend.friendId.userId.toString() === friendId.toString());
  

  if (friend.blocked == true) { 
     let  message="Cannot send Messages! You Have Blocked this Person " 
     socket.emit("blocked-response",message)
     return;
  }
  const isfriend = friend_info.friends.find((friend) => friend.friendId._id.toString() === currentUser._id.toString());

  if (isfriend.blocked ==true ) {
   let  message=" You Have Blocked by this Person ! Cannot Send Message" 
     socket.emit("blocked-response",message)
     return;
 }
  const getMessage_Model= await conversation.findById(friend.conversationId)
  const db_obj={
    sender:currentUser._id,
    contentType:type,
    content:link
  }
  getMessage_Model.messages.push(db_obj)
   const response=await getMessage_Model.save()
  const obj= {
    message: link,
    friendId: currentUser.userId,
    friendPic: friend.friendId.profilePicture, // Assuming friendId has profilePicture
    friendName: friend.friendId.name, // Assuming friendId has name
    userPic: currentUser.profilePicture,
    userName: currentUser.name,
    messageId: friend.conversationId,
    userID: friend.friendId._id,
    filetype:type,
    status:MapManager.get(socket.userId) ? 'limegreen':'red',
  };
if (MapManager.get(friendId)) {
  io.to(MapManager.get(friendId)).emit("message-from-friend",obj)
}
socket.emit("message-response", obj);


}


async function handleUserOnline(socket,io,isOnline) {
  try {
    const currentUser = await User.findOne({ userId: socket.userId }).populate("friends.friendId");
    const friendLists= currentUser?.friends.map((e)=>{ return e.friendId.userId})
    friendLists.forEach((v) => {
      const friendSocketId = MapManager.get(v);
      if (friendSocketId) {
        if (isOnline) {
          io.to(friendSocketId).emit("userIsOnline",(socket.userId))
  
        } else {
          io.to(friendSocketId).emit("userIsOffline",(socket.userId))
        }
      }
    })
  } catch (error) {
    console.log(error);
  }

}
export {handle_sendFile, handleIncomingMessage,handleUserOnline
 };
