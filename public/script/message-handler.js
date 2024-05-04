
 export function handle_friend_request(data) {
   const chat_element = document.getElementById("chat-area");
   if (!chat_element) {
       scan_and_update(data)       
     } else {
      const isOnline = document.getElementById("friendId");
      isOnline.getAttribute("data") == data.friendId ? Active_Chat(data):scan_and_update(data)
     }
}




async function Add_New_Friend(data) {
   const element = `
     <div id="friends" class="friends" data="${data.friendId}">
       <div style="position: relative; display: flex; align-items: center;">
         <div style="border: 3px solid limegreen; display: inline-block;" class="profile friends-photo">
         <img src="${data.userPic}" alt="">
       </div>
       <span id="onlinestatus" style="position: absolute; bottom: 23px; left: 33px; width: 15px; height: 15px; background-color: limegreen; border-radius: 50%; border: 3px solid white;"></span>
       </div>
       <div class="friends-credent">

         <span class="friends-name">${data.userName}</span>
         <span class="friends-message">${data.file? "":data.message}</span>
       </div>
       <span class="badge notif-badge">1</span>
     </div>
   `;
 
   const chatList = document.querySelector(".chat-list");
   chatList.insertAdjacentHTML('beforeend', element);
 
   const obj = { userID: data.friendId, friendID: data.userID, messageID: data.messageId };
   const response = await fetch("/api/Chat-Zone/chat/addfriend", {
     method: "POST",
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify(obj)
   });
 }
 




async function scan_and_update(data,callredis) {
   const friendlist = document.querySelectorAll(".friends");
  if (friendlist.length == 0) {
  await Add_New_Friend(data)
  }
  else{
   const friendsDiv = document.getElementById("chat-list");
   const friendsElement = friendsDiv.querySelector(`[data="${data.friendId}"]`);
   if (friendsElement) {
     let pending_div = friendsElement.querySelector(".badge.notif-badge");
     let value = pending_div.textContent;
     console.log(pending_div, value);
     value === "" || isNaN(Number(value)) ? value = "1" : value = String(Number(value) + 1);
     pending_div.textContent = value; 
  }else{
    await Add_New_Friend(data)
      }
    }
}


function Active_Chat(data) {
   const chat_element = document.getElementById("chat-area");
   const  dynamic_div=`<div id="friends-chat" class="friends-chat">
        <div class="profile friends-chat-photo">
          <img src=${data.userPic} alt="">
        </div>
        <div class="friends-chat-content">
          <p class="friends-chat-name">${data.userName} </p>

          ${message_typeReceiver(data.filetype,data.message)}         
          <h5 class="chat-datetime">${formatTime()}</h5>
        </div>
      </div>`
    chat_element.insertAdjacentHTML('beforeend', dynamic_div);
    chat_element.scrollTop = chat_element.scrollHeight;
}

 export function self_MessagePrint(data) {
   const chat_element = document.getElementById("chat-area");
   const lastChild = chat_element.lastElementChild;

   const message = `
   <div id="your-chat" class="your-chat">
   ${message_type(data.filetype,data.message)}
   <p class="chat-datetime">${formatTime()}</p>
   </div>`;
   // Add the message HTML to the chat area
   if (data.filetype != "text/String"  &&  lastChild) {
    chat_element.removeChild(lastChild);

   }
   chat_element.insertAdjacentHTML('beforeend', message);

   // Focus on the newly added message
   chat_element.scrollTop = chat_element.scrollHeight;  
}





function formatTime() {
   const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
   const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

   const now = new Date();

   const dayOfWeek = daysOfWeek[now.getDay()];
   const month = months[now.getMonth()];
   const date = now.getDate();
   const hours = now.getHours() % 12 || 12; // Convert to 12-hour format
   const minutes = ('0' + now.getMinutes()).slice(-2);
   const ampm = now.getHours() >= 12 ? 'p.m' : 'a.m';

   return `${dayOfWeek}, ${month} ${date} | ${hours}:${minutes} ${ampm}`;
}
function message_type(data, message) {
  console.log();
  const  part=data.split("/")

   switch (part[0]) {
   case "image":
      return `<div><a href="${message}" download><img src="${message}" style="width: 250px; height: 200px; border-radius: 10px;"> </a></div>`;
   case "audio":
      return `<div><audio controls><source src="${message}" type="audio/mpeg">Your browser does not support the audio element.</audio><br></div>`;
   case "video":
      return `<div><video width="320" height="240" controls><source src="${message}" type="video/mp4">Your browser does not support the video tag.</video><br><a href="${message}" download>Download Video</a></div>`;
   case "document":
    return `<div class="your-chat-balloon"><a style="color:white" href="${message}" download>${part[1]}<span class="glyphicon glyphicon-download-alt" style="font-size: 20px; margin-left: 10px; color:white;"></span></a></div>`;
    default:
      return `<p class="your-chat-balloon">${message}</p>`;
   }
}

function message_typeReceiver(data, message) {
  const  part=data.split("/")

  switch (part[0]) {
  case "image":
     return `<div><a href="${message}" download><img src="${message}" style="width: 250px; height: 200px; border-radius: 10px;"> </a></div>`;
  case "audio":
     return `<div><audio controls><source src="${message}" type="audio/mpeg">Your browser does not support the audio element.</audio><br></div>`;
  case "video":
     return `<div><video width="320" height="240" controls><source src="${message}" type="video/mp4">Your browser does not support the video tag.</video><br><a href="${message}" download>Download Video</a></div>`;
  case "document":
    return `<div class="friends-chat-balloon"><a style="color:black;" href="${message}" download>${part[1]}<span class="glyphicon glyphicon-download-alt" style="font-size: 20px; margin-left: 10px; color:black;"></span></a></div>`;
    default:
   const div=`<p class="friends-chat-balloon">${message}</p>`
     return div ;
  }
}


