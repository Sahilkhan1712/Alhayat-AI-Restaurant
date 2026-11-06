async function signup() {
    const nameEl = document.getElementById("name");
    const emailEl = document.getElementById("email");
    const phoneEl = document.getElementById("phone");
    const passwordEl = document.getElementById("password");
    const signupBtn = document.getElementById("signupBtn");

    const name = nameEl ? nameEl.value.trim() : "";
    const email = emailEl ? emailEl.value.trim() : "";
    const phone = phoneEl ? phoneEl.value.trim() : "";
    const password = passwordEl ? passwordEl.value.trim() : "";

    if (!name || !email || !phone || !password) {
        alert("Please fill all required fields");
        return;
    }

    if (password.length < 6) {
        alert("Password should be at least 6 characters long.");
        return;
    }

    const originalText = signupBtn ? signupBtn.innerHTML : "Signup";
    if (signupBtn) {
        signupBtn.disabled = true;
        signupBtn.innerHTML = "⏳ Creating your account...";
    }

    try {
        const apiBase = (window.ALHAYAT_CONFIG && window.ALHAYAT_CONFIG.API_BASE_URL) || "https://alhayat-ai-restaurant-backend.onrender.com";
        const response = await fetch(`${apiBase}/auth/signup`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                name,
                email,
                phone,
                password
            })
        });

        const data = await response.json();

        if (data.success) {
            // Save authentication details in localStorage
            if (data.token) {
                localStorage.setItem("token", data.token);
            }
            if (data.user) {
                localStorage.setItem("user", JSON.stringify(data.user));
            }

            alert("Signup Successful! 🎉 Welcome to AlHayat AI Restaurant.\nLet's set up your profile, address & preferences now!");
            
            // Redirect directly to the profile page
            window.location.href = "profile.html?welcome=1";
        } else {
            alert(data.message || "Signup failed. Please try again.");
            if (signupBtn) {
                signupBtn.disabled = false;
                signupBtn.innerHTML = originalText;
            }
        }
    } catch (error) {
        console.error("Signup Error:", error);
        alert("Network or Server error. Please check your connection and try again.");
        if (signupBtn) {
            signupBtn.disabled = false;
            signupBtn.innerHTML = originalText;
        }
    }
}
