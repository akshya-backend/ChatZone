export function showErrorNotification(message) {
    var notification = document.createElement('div');
    notification.id = 'notification';
    notification.style.cssText = 'z-index:1; height:fit-content;position: fixed; text-align: center; max-width: 350px; top: -100px; left: 50%; transform: translateX(-50%); background-color: #f44336; color: white; padding: 10px; border-radius: 10px;  transition: top 0.5s ease-in-out; display: flex; align-items: center; justify-content: flex-start;';
    
    var avatar = document.createElement('div');
    avatar.style.cssText = 'width: 40px; height: 40px; border-radius: 50%; background-color: white; color: #f44336; font-size: 24px; display: flex; align-items: center; justify-content: center; margin-right: 20px;';
    avatar.innerHTML = '!';
    
    var messageText = document.createElement('div');
    messageText.textContent = message;
    messageText.style.flex = '1';
    
    notification.appendChild(avatar);
    notification.appendChild(messageText);
    
    document.body.appendChild(notification);

    setTimeout(function () {
        notification.style.top = '15px'; // Slide in from the top
        setTimeout(function () {
            notification.style.top = '-100px'; // Slide out from the top
            setTimeout(function () {
                notification.remove();
            }, 500);
        }, 3000);
    }, 100);
}

 export  function  showSuccessMssge(message) {
    var notification = document.createElement('div');
    notification.id = 'notification';
    notification.style.cssText = 'position: fixed; text-align: center; min-width: 350px; top: -100px; left: 50%; transform: translateX(-50%); background-color: green; color: white; padding: 6px; border-radius: 10px;  transition: top 0.5s ease-in-out; display: flex; align-items: center; justify-content: flex-start;';
    
    var avatar = document.createElement('div');
    avatar.style.cssText = 'width: 40px; height: 40px; border-radius: 50%; background-color: white; color: green; font-size: 29px; display: flex; align-items: center; justify-content: center; margin-right: 20px;';
    avatar.innerHTML = '&#10004;'
    
    var messageText = document.createElement('div');
    messageText.textContent = message;
    messageText.style.flex = '1';
    
    notification.appendChild(avatar);
    notification.appendChild(messageText);
    
    document.body.appendChild(notification);
  
  setTimeout(function () {
        notification.style.top = '15px'; 
        setTimeout(function () {
            notification.style.top = '-100px'; 
            setTimeout(function () {
                notification.remove();
            }, 500);
        }, 3000);
    }, 100);
  }