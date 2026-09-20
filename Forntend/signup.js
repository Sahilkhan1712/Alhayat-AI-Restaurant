async function signup() {

    const name = document.getElementById("name").value;
    const email = document.getElementById("email").value;
    const phone = document.getElementById("phone").value;
    const password = document.getElementById("password").value;

    if (!name || !email || !phone || !password) {
        alert("Please fill all fields");
        return;
    }

    try {

        const response = await fetch("http://localhost:8000/auth/signup", {

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

            alert("Signup Successful");

            window.location.href = "login.html";

        } else {

            alert(data.message);

        }

    } catch (error) {

        console.log(error);

        alert("Server Error");

    }

}