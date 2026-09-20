const user = JSON.parse(localStorage.getItem("user"));

if (!user) {
    alert("Please Login First");
    window.location.href = "login.html";
}
async function loadMyOrders() {

    try {

        const userData = localStorage.getItem("user");
        const token = localStorage.getItem("token");

        if (!userData || !token) {
            alert("Please Login First");
            window.location.href = "login.html";
            return;
        }

        const user = JSON.parse(userData);

        const userId = user.id || user._id;

        if (!userId) {
            alert("User ID not found. Please login again.");

            localStorage.removeItem("user");
            localStorage.removeItem("token");

            window.location.href = "login.html";
            return;
        }

        console.log("👤 User ID:", userId);

        // Get only this user's orders
        const response = await fetch(
            `https://alhayat-ai-restaurant-backend.onrender.com/my-orders/${userId}`,
            {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                }
            }
        );

        console.log("📡 Response Status:", response.status);

        if (!response.ok) {
            const errorText = await response.text();
            console.error("Server Error:", errorText);

            throw new Error(
                `Server returned ${response.status}`
            );
        }

        const orders = await response.json();

        console.log("🛒 My Orders:", orders);

        const ordersDiv =
            document.getElementById("myOrders");

        if (!ordersDiv) {
            throw new Error(
                "myOrders element not found"
            );
        }

        if (!Array.isArray(orders)) {
            throw new Error(
                "Invalid orders response"
            );
        }

        if (orders.length === 0) {

            ordersDiv.innerHTML = `
                <div class="alert alert-warning text-center">
                    🛒 No Orders Found
                </div>
            `;

            return;
        }

        ordersDiv.innerHTML = "";

        orders.forEach(order => {

            const total = (order.cart || []).reduce(
                (sum, item) =>
                    sum +
                    Number(item.price || 0) *
                    Number(item.qty || 1),
                0
            );

            const cartItems = (order.cart || [])
                .map(item => `
                    <li>
                        ${item.name || "Food Item"}
                        × ${item.qty || 1}
                        — ₹${Number(item.price || 0) *
                            Number(item.qty || 1)}
                    </li>
                `)
                .join("");

            ordersDiv.innerHTML += `

                <div class="card p-4 mb-4 bg-secondary text-white">

                    <h4>
                        📦 Order ID:
                        ${order._id}
                    </h4>

                    <hr>

                    <p>
                        <b>👤 Customer:</b>
                        ${order.customer || "N/A"}
                    </p>

                    <p>
                        <b>📞 Phone:</b>
                        ${order.phone || "N/A"}
                    </p>

                    <p>
                        <b>📍 Address:</b>
                        ${order.address || "N/A"}
                    </p>

                    <p>
                        <b>📦 Status:</b>
                        ${order.status || "Pending"}
                    </p>

                    <p>
                        <b>💳 Payment:</b>
                        ${order.paymentMethod || "Not Selected"}
                    </p>

                    <h5 class="mt-3">
                        🍽️ Ordered Items
                    </h5>

                    <ul>
                        ${cartItems}
                    </ul>

                    <h4 class="text-warning">
                        💰 Total: ₹${total}
                    </h4>

                    <small class="d-block mt-2">
                        ${
                            order.createdAt
                            ? new Date(order.createdAt)
                                .toLocaleString()
                            : ""
                        }
                    </small>

                </div>
            `;

        });

    } catch (error) {

        console.error(
            "❌ My Orders Error:",
            error
        );

        alert(
            "Failed to load orders. Check browser console."
        );
    }
}
async function submitReview(orderId) {

    const rating =
        document.getElementById(`rating-${orderId}`).value;

    const review =
        document.getElementById(`review-${orderId}`).value;

    const response = await fetch(
        "https://alhayat-ai-restaurant-backend.onrender.com/add-review",
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                orderId,
                rating,
                review
            })
        }
    );

    const data = await response.json();

    alert(data.message);

    loadMyOrders();

}

loadMyOrders();
function downloadInvoice(orderId, customer, total) {

    const { jsPDF } = window.jspdf;

    const doc = new jsPDF();

    doc.setFontSize(20);
    doc.text("AlHayat AI Restaurant", 20, 20);

    doc.setFontSize(14);
    doc.text(`Order ID: ${orderId}`, 20, 40);
    doc.text(`Customer: ${customer}`, 20, 50);
    doc.text(`Total Amount: ₹${total}`, 20, 60);

    doc.text(
        `Date: ${new Date().toLocaleString()}`,
        20,
        70
    );

    doc.text(
        "Thank you for ordering with us!",
        20,
        90
    );

    doc.save(`Invoice-${orderId}.pdf`);
}