let discount = 0;

const socket = io("http://localhost:8000");

const notificationSound = new Audio("notification.mp3");

console.log("AI Restaurant Started");

let cart = JSON.parse(localStorage.getItem("cart")) || [];

let recommendation = "";


// ==========================================
// 🛒 ADD FOOD TO CART
// ==========================================

function addToCart(itemName, itemPrice) {

    const name = String(itemName).trim();
    const price = Number(itemPrice);

    if (!name || !Number.isFinite(price)) {

        console.error(
            "Invalid food:",
            itemName,
            itemPrice
        );

        alert("❌ Food price missing");

        return;
    }


    const existingItem = cart.find(
        item => item.name === name
    );


    if (existingItem) {

        existingItem.qty += 1;

    } else {

        cart.push({
            name: name,
            price: price,
            qty: 1
        });

    }


    // ==========================================
    // 🤖 AI RECOMMENDATION
    // ==========================================

    if (
        name.includes("Pizza") ||
        name.includes("Burger")
    ) {

        recommendation =
            "☕ Customers also like Cold Coffee";

    }

    else if (
        name.includes("Biryani") ||
        name.includes("Paneer")
    ) {

        recommendation =
            "🥗 Customers also like Special Salad";

    }

    else if (
        name.includes("Noodles")
    ) {

        recommendation =
            "☕ Customers also like Cold Coffee";

    }


    // ==========================================
    // 💾 SAVE CART
    // ==========================================

    localStorage.setItem(
        "cart",
        JSON.stringify(cart)
    );


    console.log(
        "🛒 Added:",
        name,
        "₹" + price
    );


    // ==========================================
    // 🛒 REFRESH CART
    // ==========================================

    renderCart();

}

// function addToCart(itemName) {
//   const item = foods.find(food => food.name === itemName);
//   const existing = cart.find(cartItem => cartItem.name === itemName);

//   if (existing) {
//     existing.qty += 1;
//   } else {
//     cart.push({ ...item, qty: 1 });
//   }
//   if (itemName === "Pizza" || itemName === "Burger") {
//     recommendation = "☕ Customers also like Cold Coffee";
//   }
//   else if (itemName === "Biryani" || itemName === "Paneer Tikka") {
//     recommendation = "🥗 Customers also like Special Salad";
//   }
//   else if (itemName === "Noodles") {
//     recommendation = "☕ Customers also like Cold Coffee";
//   }

//   renderCart();
// }
function renderCart() {

    const cartDiv = document.getElementById("cartItems");
    const totalPrice = document.getElementById("totalPrice");

    if (!cartDiv || !totalPrice) return;

    cartDiv.innerHTML = "";

    if (recommendation) {
        cartDiv.innerHTML += `
            <div class="alert alert-info">
                AI Recommendation:
                <br>
                ${recommendation}
            </div>
        `;
    }

    let total = 0;

    cart.forEach(item => {

        total += Number(item.price) * Number(item.qty);

        cartDiv.innerHTML += `
            <div class="card p-3 mb-2">

                <h5>${item.name}</h5>

                <p>₹${item.price}</p>

                <p>Qty: ${item.qty}</p>

                <button
                    class="btn btn-success btn-sm"
                    onclick="increaseQty('${item.name}')">
                    +
                </button>

                <button
                    class="btn btn-danger btn-sm"
                    onclick="decreaseQty('${item.name}')">
                    -
                </button>

            </div>
        `;
    });

    totalPrice.innerText = total - discount;

    // ⭐ Update checkout summary
    updateCheckoutSummary();
}


function increaseQty(name) {

    const item = cart.find(i => i.name === name);

    if (!item) return;

    item.qty++;

    renderCart();
}


function decreaseQty(name) {

    const item = cart.find(i => i.name === name);

    if (!item) return;

    if (item.qty > 1) {

        item.qty--;

    } else {

        cart = cart.filter(i => i.name !== name);

    }

    renderCart();
}

function updateCheckoutSummary() {

    let itemsTotal = 0;

    cart.forEach(item => {

        itemsTotal +=
            Number(item.price || 0) *
            Number(item.qty || 1);

    });

    const deliveryCharge = 40;

    const currentDiscount = Number(discount || 0);

    const finalTotal =
        itemsTotal +
        deliveryCharge -
        currentDiscount;


    const itemsTotalElement =
        document.getElementById("checkoutItemsTotal");

    if (itemsTotalElement) {
        itemsTotalElement.innerText = itemsTotal;
    }


    const discountElement =
        document.getElementById("checkoutDiscount");

    if (discountElement) {
        discountElement.innerText = currentDiscount;
    }


    const finalTotalElement =
        document.getElementById("checkoutFinalTotal");

    if (finalTotalElement) {

        finalTotalElement.innerText =
            Math.max(finalTotal, 0);

    }

    console.log("Checkout:", {
        itemsTotal,
        deliveryCharge,
        currentDiscount,
        finalTotal
    });
}
function goToCheckout() {

    const checkout =
        document.getElementById("premiumCheckout");

    if (!checkout) {

        console.error(
            "❌ premiumCheckout not found"
        );

        return;
    }

    checkout.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });
}


function updateCheckoutSummary() {

    // Calculate cart items total
    let itemsTotal = 0;

    cart.forEach(item => {
        itemsTotal +=
            Number(item.price || 0) *
            Number(item.qty || 1);
    });

    // Delivery charge
    const deliveryCharge = 40;

    // Current discount
    const currentDiscount = Number(discount || 0);

    // Final amount
    const finalTotal =
        itemsTotal +
        deliveryCharge -
        currentDiscount;

    // Items Total
    const itemsTotalElement =
        document.getElementById("checkoutItemsTotal");

    if (itemsTotalElement) {
        itemsTotalElement.innerText = itemsTotal;
    }

    // Discount
    const discountElement =
        document.getElementById("checkoutDiscount");

    if (discountElement) {
        discountElement.innerText = currentDiscount;
    }

    // Final Total
    const finalTotalElement =
        document.getElementById("checkoutFinalTotal");

    if (finalTotalElement) {
        finalTotalElement.innerText =
            Math.max(finalTotal, 0);
    }

    console.log("💰 Checkout Summary:", {
        itemsTotal,
        deliveryCharge,
        discount: currentDiscount,
        finalTotal
    });
}

async function placeOrder() {

    // Check login
    const userData = localStorage.getItem("user");

    if (!userData) {
        alert("Please Login First");
        window.location.href = "login.html";
        return;
    }

    const user = JSON.parse(userData);

    // Check cart
    if (!cart || cart.length === 0) {
        alert("🛒 Your cart is empty!");
        return;
    }

    // Get address
    const addressElement = document.getElementById("orderAddress");

    if (!addressElement || !addressElement.value.trim()) {
        alert("📍 Please enter your delivery address");
        return;
    }

    // Get selected payment method
    const paymentElement = document.getElementById("selectedPaymentName");

    if (!paymentElement || paymentElement.innerText === "Choose Payment Method") {
        alert("💳 Please select a payment method");
        return;
    }

    const paymentMethod = paymentElement.innerText.trim();

    // Prepare order
    const orderData = {
        customer: user.name,
        phone: user.phone,
        userId: user.id,
        address: addressElement.value.trim(),
        cart: cart,
        paymentMethod: paymentMethod
    };

    console.log("📦 Order Data:", orderData);

    try {

        const response = await fetch("http://localhost:8000/place-order", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(orderData)
        });

        const data = await response.json();

        console.log("📥 Server Response:", data);

        if (data.success) {

            notificationSound.play().catch(err =>
                console.log("Notification sound:", err)
            );

            alert("✅ Order Placed Successfully!");

            // Clear cart
            cart = [];
            localStorage.removeItem("cart");

            // Refresh cart
            if (typeof renderCart === "function") {
                renderCart();
            }

            // Close checkout if function exists
            if (typeof closeCheckout === "function") {
                closeCheckout();
            }

            // Go to My Orders
            window.location.href = "myorders.html";

        } else {

            alert("❌ Order Failed: " + (data.message || "Something went wrong"));

        }

    } catch (error) {

        console.error("❌ Place Order Error:", error);

        alert("❌ Server Error. Please make sure backend is running on port 8000.");

    }
}
async function reserveTable() {

  const name =
    document.getElementById("customerName").value;

  const phone =
    document.getElementById("customerPhone").value;

  const guests =
    document.getElementById("guestCount").value;

  const date =
    document.getElementById("bookingDate").value;
  const time =
    document.getElementById(
      "bookingTime"
    ).value;

  if (!name || !phone || !guests || !date || !time) {

    alert("Please fill all fields");
    return;

  }

  const response =
    await fetch(
      "http://localhost:8000/reserve-table",
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json"
        },

        body: JSON.stringify({
          name,
          phone,
          guests,
          date,
          time
        })
      }
    );

  const data =
    await response.json();

  if (data.success) {

    alert(
      "✅ Table Reserved Successfully!"
    );

    document.getElementById("customerName").value = "";
    document.getElementById("customerPhone").value = "";
    document.getElementById("guestCount").value = "";
    document.getElementById("bookingDate").value = "";

  }

  else {

    alert(
      "❌ Reservation Failed"
    );

  }

}
// ==========================================
// 📦 TRACK ORDER
// ==========================================

async function trackOrder() {

    const orderIdElement =
        document.getElementById("trackOrderId");

    const statusElement =
        document.getElementById("orderStatus");

    const timelineElement =
        document.getElementById("orderTimeline");

    if (!orderIdElement) {
        console.error("❌ trackOrderId not found");
        return;
    }

    const orderId =
        orderIdElement.value.trim();

    if (!orderId) {
        alert("Please enter your Order ID");
        return;
    }

    const token =
        localStorage.getItem("token");

    if (!token) {
        alert("Please Login First");
        window.location.href = "login.html";
        return;
    }

    try {

        const response = await fetch(
            `http://localhost:8000/track-order/${orderId}`,
            {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                }
            }
        );

        const data =
            await response.json();

        console.log(
            "📦 Track Order Response:",
            data
        );

        if (!response.ok) {
            throw new Error(
                data.message ||
                "Unable to track order"
            );
        }

        // ==============================
        // STATUS
        // ==============================

        if (statusElement) {

            statusElement.innerHTML = `
                <div class="alert alert-dark border border-warning">

                    <h4 class="text-warning">
                        📦 Order Status
                    </h4>

                    <h3 class="text-white">
                        ${data.status}
                    </h3>

                    <p class="mb-0 text-light">
                        ⏰ Estimated Delivery:
                        <strong class="text-warning">
                            ${data.deliveryTime}
                        </strong>
                    </p>

                </div>
            `;
        }

        // ==============================
        // ORDER TIMELINE
        // ==============================

        const steps = [
            "Pending",
            "Accepted",
            "Preparing",
            "Out For Delivery",
            "Delivered"
        ];

        const currentIndex =
            steps.indexOf(data.status);

        if (timelineElement) {

            timelineElement.innerHTML = `
                <div class="card bg-dark text-white p-4 mt-3">

                    <h5 class="text-warning mb-4">
                        🚚 Order Journey
                    </h5>

                    ${steps.map((step, index) => {

                        let icon = "⬜";

                        if (index < currentIndex) {
                            icon = "✅";
                        }

                        if (index === currentIndex) {
                            icon = "🟡";
                        }

                        if (
                            data.status === "Delivered" &&
                            step === "Delivered"
                        ) {
                            icon = "🎉";
                        }

                        return `
                            <div class="d-flex align-items-center mb-3">

                                <span style="
                                    font-size:22px;
                                    width:40px;
                                ">
                                    ${icon}
                                </span>

                                <span class="${
                                    index <= currentIndex
                                        ? "text-warning fw-bold"
                                        : "text-secondary"
                                }">
                                    ${step}
                                </span>

                            </div>
                        `;

                    }).join("")}

                </div>
            `;
        }

    } catch (error) {

        console.error(
            "❌ Track Order Error:",
            error
        );

        if (statusElement) {

            statusElement.innerHTML = `
                <div class="alert alert-danger">
                    ❌ ${error.message}
                </div>
            `;
        }
    }
}

socket.on("orderStatusUpdated", (order) => {

    const currentOrderId =
        document.getElementById("trackOrderId").value;

    if (currentOrderId === order._id) {

        alert(`📢 Order Status Updated to ${order.status}`);

        trackOrder();

    }

});
// ==========================================
// 👤 USER NAVBAR LOGIN SYSTEM
// ==========================================

function updateUserNavbar() {

    const authNavItem = document.getElementById("authNavItem");

    if (!authNavItem) return;

    const userData = localStorage.getItem("user");

    // USER NOT LOGGED IN
    if (!userData) {

        authNavItem.innerHTML = `
            <a href="login.html" class="btn btn-warning fw-bold px-4">
                🔐 Login
            </a>
        `;

        return;
    }

    // USER LOGGED IN
    try {

        const user = JSON.parse(userData);

        const name = user.name || "User";
        const email = user.email || "";

        authNavItem.innerHTML = `
            <div class="dropdown">

                <button
                    class="btn btn-warning fw-bold px-3 dropdown-toggle"
                    type="button"
                    data-bs-toggle="dropdown"
                >
                    👋 Welcome, ${name}
                </button>

                <ul class="dropdown-menu dropdown-menu-end">

                    <li>
                        <h6 class="dropdown-header">
                            👤 ${name}
                        </h6>
                    </li>

                    <li>
                        <span class="dropdown-item-text">
                            ${email}
                        </span>
                    </li>

                    <li>
                        <hr class="dropdown-divider">
                    </li>

                    <li>
                        <button
                            class="dropdown-item text-danger fw-bold"
                            onclick="logoutUser()"
                        >
                            🚪 Logout
                        </button>
                    </li>

                </ul>

            </div>
        `;

    } catch (error) {

        console.log("User data error:", error);

        localStorage.removeItem("user");
        localStorage.removeItem("token");
    }
}


// LOGOUT
function logoutUser() {

    localStorage.removeItem("user");
    localStorage.removeItem("token");

    alert("Logout Successful 👋");

    window.location.href = "index.html";
}


// RUN AFTER PAGE LOAD
document.addEventListener("DOMContentLoaded", function () {

    updateUserNavbar();

});
function applyCoupon() {

  const coupon =
    document.getElementById("couponCode")
      .value
      .toUpperCase();

  if (coupon === "WELCOME50") {

    discount = 50;

  }

  else if (coupon === "SAVE10") {

    discount =
      Math.floor(
        Number(document.getElementById("totalPrice").innerText) * 0.10
      );

  }

  else {

    discount = 0;

    alert("Invalid Coupon");

  }

  document.getElementById("discountAmount")
    .innerText = discount;

  alert("Coupon Applied Successfully");
}
// ==========================================
// 🤖 ALHAYAT REAL AI FOOD ASSISTANT
// ==========================================

let aiChatHistory = [];

async function askAI() {

    const input = document.getElementById("chatInput");
    const responseBox = document.getElementById("chatResponse");

    if (!input || !responseBox) return;

    const message = input.value.trim();

    if (!message) {
        return;
    }

    // Show user message
    responseBox.innerHTML += `
        <div class="ai-user-message">
            <strong>You</strong>
            <p>${escapeAIHTML(message)}</p>
        </div>
    `;

    // Clear input
    input.value = "";

    // Loading
    responseBox.innerHTML += `
        <div id="aiLoading" class="ai-loading-message">
            <strong>🤖 AlHayat AI</strong>
            <p>Thinking... 🍽️</p>
        </div>
    `;

    responseBox.scrollTop = responseBox.scrollHeight;

    try {

        const response = await fetch("http://localhost:8000/ai-chat", {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                message: message,
                history: aiChatHistory
            })

        });

        const data = await response.json();

        // Remove loading
        const loading = document.getElementById("aiLoading");

        if (loading) {
            loading.remove();
        }

        if (!response.ok || !data.success) {

            throw new Error(
                data.message || "AI Assistant error"
            );

        }

        // Save conversation
        aiChatHistory.push({
            role: "user",
            content: message
        });

        aiChatHistory.push({
            role: "assistant",
            content: data.reply
        });

        // Keep only recent conversation
        if (aiChatHistory.length > 20) {
            aiChatHistory =
                aiChatHistory.slice(-20);
        }

        // Show AI response
        responseBox.innerHTML += `
            <div class="ai-bot-message">

                <div class="ai-bot-avatar">
                    🤖
                </div>

                <div class="ai-bot-content">

                    <strong>AlHayat AI</strong>

                    <p>
                        ${formatAIResponse(data.reply)}
                    </p>

                </div>

            </div>
        `;

        responseBox.scrollTop =
            responseBox.scrollHeight;

    }

    catch (error) {

        console.error("❌ AI Error:", error);

        const loading =
            document.getElementById("aiLoading");

        if (loading) {
            loading.remove();
        }

        responseBox.innerHTML += `
            <div class="ai-error-message">

                <strong>⚠️ AlHayat AI</strong>

                <p>
                    Sorry, AI Assistant is temporarily
                    unavailable. Please try again.
                </p>

            </div>
        `;
    }
}


// ==========================================
// ⚡ QUICK AI QUESTIONS
// ==========================================

function aiQuickAsk(question) {

    const input =
        document.getElementById("chatInput");

    if (!input) return;

    input.value = question;

    askAI();
}


// ==========================================
// 🧹 SAFE HTML
// ==========================================

function escapeAIHTML(text) {

    return String(text)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


// ==========================================
// ✨ FORMAT AI RESPONSE
// ==========================================

function formatAIResponse(text) {

    return escapeAIHTML(text)
        .replace(/\n/g, "<br>")
        .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
}
if ("serviceWorker" in navigator) {

  navigator.serviceWorker
    .register("service-worker.js")

    .then(() => {
      console.log("PWA Installed Successfully");
    })

    .catch(err => {
      console.log(err);
    });

}
function toggleDarkMode() {

    document.body.classList.toggle("light-mode");

    if (document.body.classList.contains("light-mode")) {
        localStorage.setItem("theme", "light");
    } else {
        localStorage.setItem("theme", "dark");
    }
}

if (localStorage.getItem("theme") === "light") {
    document.body.classList.add("light-mode");
}
// ================================
// PAYMENT OPTIONS TOGGLE
// ================================

function togglePaymentOptions() {

    const options = document.getElementById("paymentOptions");
    const arrow = document.getElementById("paymentArrow");

    if (!options) {
        console.log("Payment options not found");
        return;
    }

    options.classList.toggle("open");

    if (options.classList.contains("open")) {

        if (arrow) {
            arrow.style.transform = "rotate(180deg)";
        }

    } else {

        if (arrow) {
            arrow.style.transform = "rotate(0deg)";
        }
    }
}


// ================================
// SELECT PAYMENT METHOD
// ================================

function selectPayment(method, icon, description) {

    const name =
        document.getElementById("selectedPaymentName");

    const text =
        document.getElementById("selectedPaymentText");

    const selectedIcon =
        document.getElementById("selectedPaymentIcon");

    const options =
        document.getElementById("paymentOptions");

    const arrow =
        document.getElementById("paymentArrow");

    const details =
        document.getElementById("paymentDetails");


    if (name) {
        name.innerText = method;
    }

    if (text) {
        text.innerText = description;
    }

    if (selectedIcon) {
        selectedIcon.innerText = icon;
    }


    if (details) {

        details.innerHTML = `
            <strong style="color:#ffc107;">
                ✓ ${method} Selected
            </strong>

            <div style="
                color:#aaa;
                margin-top:5px;
                font-size:12px;
            ">
                ${description}
            </div>
        `;

        details.classList.add("show");
    }


    if (options) {
        options.classList.remove("open");
    }

    if (arrow) {
        arrow.style.transform = "rotate(0deg)";
    }
}

function goToCheckout() {

    const checkout =
        document.getElementById("premiumCheckout");

    if (!checkout) {
        console.error("❌ Premium Checkout section not found");
        return;
    }

    checkout.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });
}