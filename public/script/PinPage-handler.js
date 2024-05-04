import { showErrorNotification, showSuccessMssge } from "../ErrorHandling-Message.js";
document.querySelector(".forgetPin")?.addEventListener('click',Activate_ChngePass,{once:true})



 
    history.pushState(null, null, document.URL);
    window.addEventListener('popstate', function () {
        history.pushState(null, null, document.URL);
    });
        // Push current state to history when the page loads
    const inputs = document.querySelector("#allinputs");
        if (inputs) {
            inputs.addEventListener('input', (e) => {
                const target = e.target;
                const val = target.value;

                if (isNaN(val)) {
                    target.value = "";
                    return;
                }

                if (val != "") {
                    const nextNumber = parseInt(target.id.slice(-1)) + 1;
                    const nextInput = document.getElementById(`input${nextNumber}`);
                    if (nextInput) {
                        nextInput.focus();
                    } else {
                        const getSpinner = document.getElementById("spinnCircle");
                        getSpinner.style.display = "";
                        setTimeout(() => {
                             getSpinner.style.display = "none";

                            document.getElementById("loginForm").submit();

                        }, 1000);
                    }
                }
            });

            inputs.addEventListener("keyup", function (e) {
                const target = e.target;
                const key = e.key.toLowerCase();

                if (key == "backspace" || key == "delete") {
                    target.value = "";
                    const prev = target.previousElementSibling;
                    if (prev) {
                        prev.focus();
                    }
                    return;
                }
            });
        }


    
   async function Activate_ChngePass() {
    showSuccessMssge("Change Pin Link as been Send to your Registered Email")

     await   fetch("/api/Chat-Zone/security/Pin-Change-Request", {
                    method: 'POST',
                }).then(async (data) => {
                    const response= await data.json()
                    if (response.status) {
                        showSuccessMssge("Check Your Email")
                    }else{
                        showErrorNotification(response.message)
                    }
                }).catch((error) => {
                    console.error('There was a problem with the fetch operation:', error);
                    showErrorNotification('Failed to change pin');

                })

    }
    
   
    