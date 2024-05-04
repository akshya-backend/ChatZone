import { showErrorNotification,showSuccessMssge } from "/ErrorHandling-Message.js";
document.addEventListener('DOMContentLoaded', () => {
  // Scroll to the bottom of the chat area once the page is loaded
  scrollToBottom();
});
// event listener on add friend btn
 const addfriend=document.getElementById("addFriend")
 if (addfriend) {
  addfriend.addEventListener('click',addFriend)
 }

//Event handler to focus the input box is focused
document.addEventListener('click', (e) => {
  let targetElement = e.target.closest('.friends');
  if (e.target.id === 'indexAddFriend') {
      let ele = document.getElementById("friend-input");
      ele.focus();
      ele.style.border = "5px solid skyblue";
  }else if (targetElement) {
    // Access the "data" attribute value of the clicked element
    const dataAttributeValue = targetElement.getAttribute('data');
    submitForm( dataAttributeValue);
    // You can perform further actions with the data attribute value here
  } 

});


  
//request to Add Friend 
async function addFriend() {

  let friend=document.getElementById("friend-input")
  let friendId=friend.value;
  if (friendId.trim() == "") {
    return showErrorNotification("User Id Cannot be Empty")
  }
  const response= await fetch("/api/Chat-Zone/User/addFriend",{method: "POST",headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({friendId:friendId.trim()})})
  const res= await response.json()
  if (res.status) {
    friend.value ="";
    const dynamicHTML=`
    <div id="friends" data="${res.friendinfo.userId}" class="friends">
    <div style="position: relative; display: flex; align-items: center;">

            <div style="border: 3px solid ${res.isonline}; display: inline-block;"  class="profile friends-photo">
              <img src="${res.friendinfo.profilePicture}" alt="">
            </div>
            <span id="onlinestatus" style="position: absolute; bottom: 23px; left: 33px; width: 15px; height: 15px; background-color: ${res.isonline}; border-radius: 50%; border: 3px solid white;"></span>
            </div>
            <div class="friends-credent">
              <span class="friends-name">${res.friendinfo.name}</span>
            </div>           
     </div>`
  
  const srcField=document.getElementById("chat-list")
  srcField.insertAdjacentHTML("afterbegin",dynamicHTML)
  showSuccessMssge(`${res.friendinfo.name} Successfully Added to your Friend-List`)
  }else{
   showErrorNotification(res.message)
  }
}

// function to activate chat page
document.querySelectorAll(".friends").forEach(friend => {
  friend.addEventListener("click", (e) => {
    submitForm(friend.getAttribute("data"))
    
  },{once:true});
});
function submitForm(userId) {
  const form = document.createElement('form');
  form.method = 'post';
  form.action = '/api/Chat-Zone/chat/chat-index'; // Remove query parameters from action

  // Create a hidden input field for userId
  const userIdInput = document.createElement('input');
  userIdInput.type = 'hidden';
  userIdInput.name = 'friend_id'; // Set the name to match the server-side expectation
  userIdInput.value = userId; // Set the value to the userId
  form.appendChild(userIdInput);

  document.body.appendChild(form);
  form.submit();
}

// Function to scroll the chat area to the bottom
function scrollToBottom() {
  const chatArea = document.getElementById("chat-area");
  if (chatArea) {
    chatArea.scrollTop = chatArea.scrollHeight;

  }
}

// Event listener for when the DOM content is loaded
const button = document.getElementById('emojiButton');
const textarea = document.getElementById('type-area');
const picker = new EmojiButton({
  autoHide: false
});

let selectedEmojis = [];

picker.on('emoji', emoji => {
  // Clear selectedEmojis if textarea is empty
  if (textarea.value === '') {
    selectedEmojis = [];
  }
  selectedEmojis.push(emoji);
  textarea.value = selectedEmojis.join('');
});

if (button) {
  button.addEventListener('click', () => {
    picker.togglePicker(button);
  });
}

// Listen for text area input event
textarea?.addEventListener('input', () => {
  // Clear selectedEmojis if textarea is empty
  if (textarea.value === '') {
    selectedEmojis = [];
  }
});

// Listen for emoji picker close event
picker.on('picker:close', () => {
  // Clear selectedEmojis if textarea is empty
  if (textarea.value === '') {
    selectedEmojis = [];
  }
});




//  logout 
// JavaScript code to add an event listener to the logout button
document.getElementById('logout').addEventListener('click', autoRedirect,{once:true});
// Function to create and trigger a logout anchor element dynamically
 async function autoRedirect() {
  try {
    const id=document.getElementById('self-id').getAttribute('data-custom')
    const reply=  await fetch("/api/Chat-Zone/security/logout", {method: "POST",headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id})});
                    const response= await reply.json()
                    if (response.status) {
                      window.location.reload()
                    } 
  } catch (error) {
    console.log(error);
     window.location.reload()
  }
}

