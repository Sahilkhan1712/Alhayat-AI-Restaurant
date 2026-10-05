// ==========================================
// GOOGLE LOGIN
// ==========================================

function loginWithGoogle() {

    if (!window.google) {
        alert("Google Login is loading. Please try again.");
        return;
    }

    google.accounts.id.initialize({

        client_id: "790936495034-53ncoiibiqc7oqn13as89ctb4j4fvga1.apps.googleusercontent.com",

        callback: handleGoogleLogin

    });

    google.accounts.id.prompt();

}


// ==========================================
// GOOGLE LOGIN CALLBACK
// ==========================================

async function handleGoogleLogin(response) {

    try {

        const res = await fetch(
            "https://alhayat-ai-restaurant-backend.onrender.com/auth/google",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    credential: response.credential
                })
            }
        );


        const data = await res.json();


        if (!data.success) {

            alert(data.message || "Google Login Failed");

            return;

        }


        // Save login data
        localStorage.setItem(
            "token",
            data.token
        );

        localStorage.setItem(
            "user",
            JSON.stringify(data.user)
        );


        alert("Google Login Successful");


        // Redirect according to role
        if (data.user.role === "admin") {

            window.location.href = "admin.html";

        } else {

            window.location.href = "index.html";

        }


    } catch (error) {

        console.error(
            "Google Login Error:",
            error
        );

        alert("Google Login Failed. Please try again.");

    }

}