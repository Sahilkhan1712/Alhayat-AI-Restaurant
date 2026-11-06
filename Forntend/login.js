// ==========================================
// NORMAL LOGIN
// ==========================================

async function login() {
    const emailEl = document.getElementById("email");
    const passwordEl = document.getElementById("password");
    const loginBtn = document.getElementById("loginBtn");

    const email = emailEl ? emailEl.value.trim() : "";
    const password = passwordEl ? passwordEl.value.trim() : "";

    if (!email || !password) {
        alert("Please enter email and password");
        return;
    }

    const originalText = loginBtn ? loginBtn.innerHTML : "Login";
    if (loginBtn) {
        loginBtn.disabled = true;
        loginBtn.innerHTML = "⏳ Logging in...";
    }

    try {
        const apiBase = (window.ALHAYAT_CONFIG && window.ALHAYAT_CONFIG.API_BASE_URL) || "https://alhayat-ai-restaurant-backend.onrender.com";

        const res = await fetch(
            `${apiBase}/auth/login`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    email: email,
                    password: password
                })
            }
        );

        const data = await res.json();

        if (!data.success) {
            alert(data.message || "Login Failed");
            if (loginBtn) {
                loginBtn.disabled = false;
                loginBtn.innerHTML = originalText;
            }
            return;
        }

        // Save login data
        if (data.token) localStorage.setItem("token", data.token);
        if (data.user) localStorage.setItem("user", JSON.stringify(data.user));

        alert(`Welcome back, ${data.user.name || "Foodie"}! 👋`);

        // Redirect according to role
        if (data.user.role === "admin") {
            window.location.href = "admin.html";
        } else {
            window.location.href = "index.html";
        }

    } catch (error) {
        console.error("Login Error:", error);
        alert("Login Failed. Please check your network connection and try again.");
        if (loginBtn) {
            loginBtn.disabled = false;
            loginBtn.innerHTML = originalText;
        }
    }
}


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
        const apiBase = (window.ALHAYAT_CONFIG && window.ALHAYAT_CONFIG.API_BASE_URL) || "https://alhayat-ai-restaurant-backend.onrender.com";

        const res = await fetch(
            `${apiBase}/auth/google`,
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
        if (data.token) localStorage.setItem("token", data.token);
        if (data.user) localStorage.setItem("user", JSON.stringify(data.user));

        alert(`Welcome back, ${data.user.name || "Foodie"}! 👋`);

        // Redirect according to role
        if (data.user.role === "admin") {
            window.location.href = "admin.html";
        } else {
            window.location.href = "index.html";
        }

    } catch (error) {
        console.error("Google Login Error:", error);
        alert("Google Login Failed. Please try again.");
    }
}
