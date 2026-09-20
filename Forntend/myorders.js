
/* =====================================================
   PREMIUM MY ORDERS DESIGN
===================================================== */

const myOrdersStyle = document.createElement("style");

myOrdersStyle.innerHTML = `

    body {
        background:
            radial-gradient(circle at 10% 20%, rgba(255,193,7,0.08), transparent 25%),
            radial-gradient(circle at 90% 80%, rgba(255,193,7,0.06), transparent 25%),
            #101316 !important;

        color: white;
        padding-top: 70px;
    }

    #myOrders {
        width: 92%;
        max-width: 1150px;
        margin: 30px auto;
    }

    /* ORDER CARD */
    #myOrders .card.p-4.mb-4.bg-secondary.text-white {

        background:
            linear-gradient(
                145deg,
                rgba(38,42,47,0.98),
                rgba(18,21,24,0.98)
            ) !important;

        border: 1px solid rgba(255,193,7,0.35) !important;

        border-radius: 22px !important;

        padding: 28px !important;

        box-shadow:
            0 15px 35px rgba(0,0,0,0.45),
            0 0 25px rgba(255,193,7,0.08),
            inset 0 1px 0 rgba(255,255,255,0.08);

        position: relative;
        overflow: hidden;

        transition: all 0.3s ease;
    }

    /* GOLD GLOW LINE */
    #myOrders .card::before {

        content: "";

        position: absolute;

        top: 0;
        left: 0;
        right: 0;

        height: 3px;

        background: linear-gradient(
            90deg,
            transparent,
            #ffc107,
            #ffe082,
            #ffc107,
            transparent
        );

        box-shadow: 0 0 15px rgba(255,193,7,0.7);
    }

    /* HOVER */
    #myOrders .card:hover {

        transform: translateY(-5px);

        border-color: rgba(255,193,7,0.7) !important;

        box-shadow:
            0 20px 45px rgba(0,0,0,0.55),
            0 0 30px rgba(255,193,7,0.15);
    }

    /* ORDER ID */
    #myOrders .card h4:first-child {

        color: #ffc107;

        font-size: 22px;

        font-weight: 700;

        letter-spacing: 0.3px;
    }

    /* SEPARATOR */
    #myOrders .card hr {

        border-color: rgba(255,255,255,0.15);

        margin: 20px 0;
    }

    /* DETAILS */
    #myOrders .card p {

        background: rgba(255,255,255,0.035);

        border: 1px solid rgba(255,255,255,0.06);

        border-radius: 10px;

        padding: 11px 14px;

        margin: 10px 0;

        font-size: 15px;
    }

    /* ORDERED ITEMS */
    #myOrders .card h5 {

        color: #ffc107;

        font-size: 18px;

        margin-top: 25px !important;

        margin-bottom: 10px;
    }

    #myOrders .card ul {

        background: rgba(0,0,0,0.18);

        border-radius: 12px;

        padding: 14px 14px 14px 35px;

        border: 1px solid rgba(255,255,255,0.05);
    }

    #myOrders .card li {

        padding: 7px 0;

        color: #f1f1f1;

        border-bottom: 1px solid rgba(255,255,255,0.06);
    }

    #myOrders .card li:last-child {
        border-bottom: none;
    }

    /* TOTAL */
    #myOrders .card h4.text-warning {

        display: inline-block;

        margin-top: 18px;

        padding: 12px 20px;

        border-radius: 14px;

        background: linear-gradient(
            135deg,
            rgba(255,193,7,0.18),
            rgba(255,193,7,0.05)
        );

        border: 1px solid rgba(255,193,7,0.35);

        box-shadow:
            0 0 18px rgba(255,193,7,0.08);
    }

    /* DATE */
    #myOrders .card small {

        color: #aaa;

        margin-top: 18px !important;

        padding-top: 12px;

        border-top: 1px solid rgba(255,255,255,0.08);
    }


    /* ================================
       MOBILE
    ================================= */

    @media (max-width: 768px) {

        body {
            padding-top: 75px;
        }

        #myOrders {

            width: 94%;

            margin: 20px auto;
        }

        #myOrders .card.p-4.mb-4.bg-secondary.text-white {

            padding: 18px !important;

            border-radius: 18px !important;
        }

        #myOrders .card h4:first-child {

            font-size: 17px;

            line-height: 1.5;

            word-break: break-word;
        }

        #myOrders .card p {

            font-size: 14px;

            padding: 10px;

            line-height: 1.5;
        }

        #myOrders .card h5 {

            font-size: 16px;
        }

        #myOrders .card li {

            font-size: 14px;

            line-height: 1.5;
        }

        #myOrders .card h4.text-warning {

            font-size: 18px;

            width: 100%;

            text-align: center;

            box-sizing: border-box;
        }
    }

`;

document.head.appendChild(myOrdersStyle);
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