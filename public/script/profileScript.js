import { showErrorNotification, showSuccessMssge } from "../ErrorHandling-Message.js";

      
document.getElementById("change-pic-btn")?.addEventListener('click', () => {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/jpeg, image/png'
    ;
    fileInput.style.display = 'none';
    fileInput.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (file) {
            showLoadingScreen()
            uploadToCloudinary(file);
        }
    });
    document.body.appendChild(fileInput);
    fileInput.click();
});

async function uploadToCloudinary(file) {
    const formData = new FormData();
    formData.append('Image', file); // Append the file to the form data with key 'file'

    try {
        const response = await axios.post('/api/Chat-Zone/User/profilePicture', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        console.log('Upload response:', response.data);
        if (response.data.status) {
            hideLoadingScreen()
            const pic=document.getElementById("profilePic");
            pic.src=response.data.url;
            showSuccessMssge(response.data.message);
        } else {
            showErrorMessage(response.data.message);
        }
    } catch (error) {
        console.error('Error uploading profile picture:', error);
        showErrorMessage('An error occurred while uploading the profile picture');
    }
}




        document.addEventListener('DOMContentLoaded', function () {
            // Get the copy button and user ID input field
            let copyBtn = document.getElementById('userIdBtn');
            let userIdInput = document.getElementById('userid').value;

            // Add click event listener to the copy button
            copyBtn.addEventListener('click', function () {
                // Select the text inside the input field
                navigator.clipboard.writeText(userIdInput)
                .then(() => {
                    showSuccessMssge("Copied")
                    // Alert the user that the content has been copied
                })
                .catch(err => {
                    // Handle errors, if any
                    console.error('Failed to copy: ', err);
                });

               
            });
        });

        document.getElementById('changePassword')?.addEventListener('click', async function() {
            // Get the values of the input fields
            let currentPin = document.getElementById('currentPin').value;
            let newPin = document.getElementById('newPin').value;
            let confirmPin = document.getElementById('confirmPin').value;
            if (currentPin === '' || newPin === '' || confirmPin === '') {
                showErrorNotification('Please fill in all fields');
                return; // Exit the function if any field is empty
            }
         
            // Check if new pin and confirm pin match
            if (newPin !== confirmPin) {
                showErrorNotification("New Pin and Confirm Pin do not match");
                return; // Exit the function if they don't match
            }

            try {
                // Send a fetch request to the server
                const response = await fetch('/api/Chat-Zone/User/Change-Pin', {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        currentPin: currentPin,
                        newPin: newPin
                    })
                });
                const reply= await response.json()
                if (reply.status) {

                     showSuccessMssge(' Pin Changed Successfully');
                }else{
                    showErrorNotification(reply.message)

                }

                // Reset the input fields if needed
                document.getElementById('currentPin').value = '';
                document.getElementById('newPin').value = '';
                document.getElementById('confirmPin').value = '';
            } catch (error) {
                console.error('Error:', error);
                showErrorMessage('Failed to save changes');
            }
        });

// Show loading screen and disable change button
function showLoadingScreen() {
    document.getElementById('change-pic-btn').disabled = true;
    document.getElementById('loadingScreen').style.display = 'block';
}

// Hide loading screen and enable change button
function hideLoadingScreen() {
    document.getElementById('loadingScreen').style.display = 'none';
    document.getElementById('change-pic-btn').disabled = false;
}

document.addEventListener('DOMContentLoaded', function() {
    // Add event listener to the button
    document.getElementById('bioChanges').addEventListener('click', async function() {
        try {
            // Get input values
            let bio = document.getElementById('bioInput').value;
            let birthday = document.getElementById('birthdayInput').value;
            let address = document.getElementById('addressInput').value;
            let phone = document.getElementById('phoneInput').value;
            let name = document.getElementById('nameInput').value;

            if (phone.trim() != "") {
               if ( !isValidPhoneNumber(phone)) {
                showErrorNotification("Please enter a 10-digit phone number.");
                return;
            } 
            }
            
            // Create data object
            let data = {
                bio: bio,
                birthday: birthday,
                address: address,
                phone: phone,
                name:name
            };

            // Send data to controller using fetch API
            const response = await fetch('/api/Chat-Zone/User/User-info-update', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });
            const responseData = await response.json();

            // Check if request was successful
            if (responseData.status) {
                // Show success message
                showSuccessMssge(responseData.message);
            } else {
                showErrorNotification(responseData.message)            }
        } catch (error) {
            // Handle error
            console.error(error);
            // Show error message
                 showErrorNotification(responseData.message)        }
    });
});
document.addEventListener('DOMContentLoaded', function() {
    // Add event listener to the button
    document.getElementById('link-btn').addEventListener('click', async function() {
        try {
            // Get input values
            let facebook = document.getElementById('facebookInput').value;
            let github = document.getElementById('githubInput').value;
            let linkedin = document.getElementById('linkedinInput').value;
            let instagram = document.getElementById('InstagramInput').value;
            let twitter = document.getElementById('twitterInput').value;
            
            const data = {
              facebook,
              github,
              linkedin,
              instagram,
              twitter 
            };

            // Send data to controller using fetch API
            const response = await fetch('/api/Chat-Zone/User/User-link-update', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });
            const responseData = await response.json();

            // Check if request was successful
            if (responseData.status) {
                // Show success message
                showSuccessMssge(responseData.message);
            } else {
                showErrorNotification(responseData.message)            }
        } catch (error) {
            // Handle error
            console.error(error);
            // Show error message
                 showErrorNotification(responseData.message)        }
    });
});


document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('facebookInput')?.addEventListener("change", function() {
        validateInput(this.value);
    });
    document.getElementById('githubInput')?.addEventListener("change", function() {
        validateInput(this.value);
    });
    document.getElementById('linkedinInput')?.addEventListener("change", function() {
        validateInput(this.value);
    });
    document.getElementById('InstagramInput')?.addEventListener("change", function() {
        validateInput(this.value);
    });
    document.getElementById('twitterInput')?.addEventListener("change", function() {
        validateInput(this.value);
    });
});



function isValidPhoneNumber(phoneNumber) {
    let regEx = /^\d{10}$/;
    return regEx.test(phoneNumber);
}
function validateInput(url) {
    console.log(url);
    const urlPattern = /^(ftp|http|https):\/\/[^ "]+$/;
    const isValid = urlPattern.test(url);
    if (!isValid) {
        showErrorNotification("Invalid Link")
    }
    return 
}


async function blockfriend(friendId) {
    const obj = { friendId };
    try {
        const response = await fetch('/api/Chat-Zone/User/block-friend', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(obj)
        });
        const responseData = await response.json();

        if (responseData.status) {
            const ele = document.getElementById("blocked");
            if (responseData.blocked) {
                ele.style.backgroundColor = "green";
                ele.style.borderColor = "green";
                ele.textContent = "Unblock";
                
                const div = document.getElementById("parentfriend-name");
                const element = `${responseData.name} <span id="inlineblocked" style="color: white;background-color: red; border-radius: 10px; margin-left: 10px; padding: 5px;"> Blocked</span>`;
                div.innerHTML = element;
                
                showSuccessMssge(responseData.message);
                return
            } else {
                ele.style.backgroundColor = "red";
                ele.textContent = "Block";
                ele.style.borderColor = "red";
                
                const element = document.getElementById("inlineblocked");
                if (element) {
                    element.remove();
                }
                
                showSuccessMssge(responseData.message);
                return
            }
        } else {
            showErrorNotification(responseData.message);
        }
    } catch (error) {
        console.error(error);
        showErrorNotification("An error occurred while processing your request.");
    }
}

function visitProfile(friendId) {
    const anchor = document.createElement('a');
            anchor.href =`/api/Chat-Zone/User/profile-page?friendId=${friendId}`
            anchor.click();
}
function ChatInit(friendId) {
    const form = document.createElement('form');
    form.action = '/api/Chat-Zone/chat/chat-index';
    form.method = 'POST';
    const input = document.createElement('input');
    input.type = 'hidden';
    input.name = 'friend_id';
    input.value = friendId;
    form.appendChild(input);
    document.body.appendChild(form);
    form.submit();
}
function leaveGroup(friendId) {
    console.log("from leaveGroup");
}

document.addEventListener("click", (e) => {
    if (e.target.id === 'blocked') {
        const id = e.target.getAttribute('data');
        blockfriend(id);
    } else if (e.target.id === 'VisitProfile') {
        const id = e.target.getAttribute('data');
        visitProfile(id);
    } else if (e.target.id === 'chatInit') {
        const id = e.target.getAttribute('data');
        ChatInit(id);
    } else if (e.target.id === 'leaveGroup') {
        const id = e.target.getAttribute('data');
        leaveGroup(id);
    }
    
});

