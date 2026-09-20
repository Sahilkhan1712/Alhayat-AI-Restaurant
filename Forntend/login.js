async function login() {

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    if (!email || !password) {
        alert("Please fill all fields");
        return;
    }

    try {

        const response = await fetch("https://alhayat-ai-restaurant-backend.onrender.com/auth/login", {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                email,
                password
            })

        });

        const data = await response.json();

        if (data.success) {

            // Save JWT Token
            localStorage.setItem("token", data.token);

            // Save User Information
            localStorage.setItem("user", JSON.stringify(data.user));

            alert("Login Successful");

            // Check User Role
            if (data.user.role === "admin") {

                // Admin → Admin Panel
                window.location.href = "admin.html";

            } else {

                // Normal User → Home Page
                window.location.href = "index.html";

            }

        } else {

            alert(data.message || "Invalid email or password");

        }

    } catch (error) {

        console.error("Login Error:", error);

        alert("Server Error. Please try again.");

    }

}