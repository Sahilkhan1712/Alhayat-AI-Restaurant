let discount = 0;



const socket = typeof io !== "undefined"
    ? io("https://alhayat-ai-restaurant-backend.onrender.com")
    : null;


const notificationSound = new Audio("notification.mp3");

console.log("AI Restaurant Started");

let recommendation = "";
let cart = JSON.parse(localStorage.getItem("cart")) || [];



function updateFloatingCartCount() {
    const countElement = document.getElementById("floatingCartCount");

    if (!countElement) return;

    const totalItems = cart.reduce(
        (sum, item) => sum + (Number(item.qty) || 0),
        0
    );

    countElement.textContent = totalItems;
}



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
    updateFloatingCartCount();


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

    localStorage.setItem("cart", JSON.stringify(cart));
    updateFloatingCartCount();
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

    localStorage.setItem("cart", JSON.stringify(cart));
    updateFloatingCartCount();
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
    const userData = localStorage.getItem("user");

    if (!userData) {
        alert("Please Login First");
        window.location.href = "login.html";
        return;
    }

    let user;

    try {
        user = JSON.parse(userData);
    } catch (error) {
        alert("Please login again.");
        window.location.href = "login.html";
        return;
    }

    if (!cart || cart.length === 0) {
        alert("🛒 Your cart is empty!");
        return;
    }

    const addressElement = document.getElementById("orderAddress");
    if (!addressElement || !addressElement.value.trim()) {
        alert("📍 Please enter your delivery address");
        return;
    }

    const paymentElement = document.getElementById("selectedPaymentName");
    if (
        !paymentElement ||
        !paymentElement.innerText.trim() ||
        paymentElement.innerText.trim() === "Choose Payment Method"
    ) {
        alert("💳 Please select a payment method");
        return;
    }

    const payButton = document.querySelector(".place-order-btn");
    if (payButton) payButton.disabled = true;

    try {
        // STEP 1: Show demo payment processing and success screen.
        // This is only a simulation, NOT a real payment.
        const paymentSuccess = await showPaymentSuccessScreen();

        if (!paymentSuccess) return;

        // STEP 2: Only after the simulated success, create the order.
        const orderData = {
            customer: user.name,
            phone: user.phone,
            userId: user.id,
            address: addressElement.value.trim(),
            cart: cart,
            paymentMethod: paymentElement.innerText.trim(),
            paymentStatus: "Paid (Demo)"
        };

        const response = await fetch(
            "https://alhayat-ai-restaurant-backend.onrender.com/place-order",
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(orderData)
            }
        );

        const data = await response.json();

        if (!response.ok || !data.success) {
            throw new Error(data.message || "Order could not be placed.");
        }

        if (typeof notificationSound !== "undefined" && notificationSound) {
            notificationSound.play().catch(() => { });
        }


        alert(
            "✅ PAYMENT SUCCESSFUL!\n\n" +
            "🎉 Your Order Has Been Confirmed!\n\n" +
            "🍽️ Thank you for ordering from AlHayat Restaurant."
        );

        cart = [];
        localStorage.removeItem("cart");
        updateFloatingCartCount();
        renderCart();

        if (typeof closeCheckout === "function") {
            closeCheckout();
        }


        setTimeout(() => {
            window.location.href = "myorders.html";
        }, 2500);


    } catch (error) {
        console.error("Place Order Error:", error);

        alert("Order Error: " + error.message);
        alert("❌ " + error.message);
    } finally {
        if (payButton) payButton.disabled = false;
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
            "https://alhayat-ai-restaurant-backend.onrender.com/reserve-table",
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
            `https://alhayat-ai-restaurant-backend.onrender.com/track-order/${orderId}`,
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

                                <span class="${index <= currentIndex
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
if (socket) {
    socket.on("orderStatusUpdated", (order) => {
        const trackOrderIdElement =
            document.getElementById("trackOrderId");

        if (!trackOrderIdElement) return;

        const currentOrderId = trackOrderIdElement.value;

        if (currentOrderId === order._id) {
            alert(`📢 Order Status Updated to ${order.status}`);
            trackOrder();
        }
    });
}

// ==========================================
// 👤 USER NAVBAR LOGIN SYSTEM
// ==========================================

function updateUserNavbar() {
    const authNavItem = document.getElementById("authNavItem");
    if (!authNavItem) return;

    const userData = localStorage.getItem("user");

    if (!userData) {
        authNavItem.innerHTML = `
            <a href="login.html" class="btn btn-warning fw-bold px-4">
                🔐 Login
            </a>
        `;
        return;
    }

    try {
        const user = JSON.parse(userData);
        const name = user.name || "User";
        const email = user.email || "";

        authNavItem.innerHTML = `
            <div class="dropdown">
                <button
                    class="btn btn-warning fw-bold px-3 dropdown-toggle"
                    type="button"
                    data-bs-toggle="dropdown">
                    👋 Welcome, ${name}
                </button>

                <ul class="dropdown-menu dropdown-menu-end">
                    <li>
                        <h6 class="dropdown-header">👤 ${name}</h6>
                    </li>
                    <li>
                        <span class="dropdown-item-text">${email}</span>
                    </li>
                    <li><hr class="dropdown-divider"></li>
                    <li>
                        <button
                            class="dropdown-item text-danger fw-bold"
                            onclick="logoutUser()">
                            🚪 Logout
                        </button>
                    </li>
                </ul>
            </div>
        `;
    } catch (error) {
        console.error("User data error:", error);
        localStorage.removeItem("user");
        localStorage.removeItem("token");
    }
}

function logoutUser() {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    alert("Logout Successful 👋");
    window.location.href = "index.html";
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", updateUserNavbar);
} else {
    updateUserNavbar();
}

// ==========================================
// 🎟️ COUPON SYSTEM
// ==========================================

function applyCoupon() {
    const couponElement = document.getElementById("couponCode");
    if (!couponElement) return;

    const coupon = couponElement.value.trim().toUpperCase();
    const totalElement = document.getElementById("totalPrice");

    if (coupon === "WELCOME50") {
        discount = 50;
    } else if (coupon === "SAVE10") {
        const total = totalElement
            ? Number(totalElement.innerText) || 0
            : 0;
        discount = Math.floor(total * 0.10);
    } else {
        discount = 0;
        alert("Invalid Coupon");
        return;
    }

    const discountElement = document.getElementById("discountAmount");
    if (discountElement) {
        discountElement.innerText = discount;
    }

    renderCart();
    updateCheckoutSummary();
    alert("Coupon Applied Successfully");
}

// ==========================================
// 🤖 ALHAYAT AI FOOD ASSISTANT
// ==========================================

let aiChatHistory = [];

async function askAI() {
    const input = document.getElementById("chatInput");
    const responseBox = document.getElementById("chatResponse");

    if (!input || !responseBox) return;

    const message = input.value.trim();
    if (!message) return;

    responseBox.innerHTML += `
        <div class="ai-user-message">
            <strong>You</strong>
            <p>${escapeAIHTML(message)}</p>
        </div>
    `;

    input.value = "";

    const loadingId = "aiLoading_" + Date.now();

    responseBox.innerHTML += `
        <div id="${loadingId}" class="ai-loading-message">
            <strong>🤖 AlHayat AI</strong>
            <p>Thinking... 🍽️</p>
        </div>
    `;

    responseBox.scrollTop = responseBox.scrollHeight;

    try {
        const response = await fetch(
            "https://alhayat-ai-restaurant-backend.onrender.com/ai-chat",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    message,
                    history: aiChatHistory
                })
            }
        );

        const data = await response.json();

        document.getElementById(loadingId)?.remove();

        if (!response.ok || !data.success) {
            throw new Error(data.message || "AI Assistant error");
        }

        aiChatHistory.push(
            { role: "user", content: message },
            { role: "assistant", content: data.reply }
        );

        if (aiChatHistory.length > 20) {
            aiChatHistory = aiChatHistory.slice(-20);
        }

        responseBox.innerHTML += `
            <div class="ai-bot-message">
                <div class="ai-bot-avatar">🤖</div>
                <div class="ai-bot-content">
                    <strong>AlHayat AI</strong>
                    <p>${formatAIResponse(data.reply)}</p>
                </div>
            </div>
        `;

        responseBox.scrollTop = responseBox.scrollHeight;
    } catch (error) {
        console.error("AI Error:", error);
        document.getElementById(loadingId)?.remove();

        responseBox.innerHTML += `
            <div class="ai-error-message">
                <strong>⚠️ AlHayat AI</strong>
                <p>Sorry, AI Assistant is temporarily unavailable. Please try again.</p>
            </div>
        `;
    }
}

function aiQuickAsk(question) {
    const input = document.getElementById("chatInput");
    if (!input) return;

    input.value = question;
    askAI();
}

function escapeAIHTML(text) {
    return String(text)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function formatAIResponse(text) {
    return escapeAIHTML(text)
        .replace(/\n/g, "<br>")
        .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
}

// ==========================================
// 📱 PWA SERVICE WORKER
// ==========================================

if ("serviceWorker" in navigator) {
    navigator.serviceWorker
        .register("service-worker.js")
        .then(() => console.log("PWA Installed Successfully"))
        .catch(error => console.error("Service Worker Error:", error));
}

// ==========================================
// 🌙 DARK MODE
// ==========================================

function toggleDarkMode() {
    document.body.classList.toggle("light-mode");

    const theme = document.body.classList.contains("light-mode")
        ? "light"
        : "dark";

    localStorage.setItem("theme", theme);
}

if (localStorage.getItem("theme") === "light") {
    document.body.classList.add("light-mode");
}

// ==========================================
// 💳 PAYMENT OPTIONS
// ==========================================

function togglePaymentOptions() {
    const options = document.getElementById("paymentOptions");
    const arrow = document.getElementById("paymentArrow");

    if (!options) return;

    options.classList.toggle("open");

    if (arrow) {
        arrow.style.transform = options.classList.contains("open")
            ? "rotate(180deg)"
            : "rotate(0deg)";
    }
}

function selectPayment(method, icon, description) {
    const name = document.getElementById("selectedPaymentName");
    const text = document.getElementById("selectedPaymentText");
    const selectedIcon = document.getElementById("selectedPaymentIcon");
    const options = document.getElementById("paymentOptions");
    const arrow = document.getElementById("paymentArrow");
    const details = document.getElementById("paymentDetails");

    if (name) name.innerText = method;
    if (text) text.innerText = description;
    if (selectedIcon) selectedIcon.innerText = icon;

    if (details) {
        details.innerHTML = `
            <strong style="color:#ffc107;">✓ ${method} Selected</strong>
            <div style="color:#aaa;margin-top:5px;font-size:12px;">
                ${description}
            </div>
        `;
        details.classList.add("show");
    }

    if (options) options.classList.remove("open");
    if (arrow) arrow.style.transform = "rotate(0deg)";
}

function toggleMobileMenu() {
    document.getElementById("navbarLinks")
        ?.classList.toggle("mobile-menu-open");
}

function closeMobileMenu() {
    document.getElementById("navbarLinks")
        ?.classList.remove("mobile-menu-open");
}

document.addEventListener("click", function (event) {
    if (event.target.closest("#navbarLinks a")) {
        closeMobileMenu();
    }
});

// ==========================================
// 📝 JOB APPLICATION FORM
// ==========================================

function setupJobApplicationForm() {
    const jobForm = document.getElementById("jobApplicationForm");

    if (!jobForm || jobForm.dataset.handlerAttached === "true") {
        return;
    }

    jobForm.dataset.handlerAttached = "true";

    jobForm.addEventListener("submit", async function (event) {
        event.preventDefault();
        event.stopPropagation();

        const submitButton = jobForm.querySelector('button[type="submit"]');

        if (submitButton) {
            submitButton.disabled = true;
            submitButton.innerHTML = "⏳ Submitting...";
        }

        try {
            const response = await fetch(
                "https://alhayat-ai-restaurant-backend.onrender.com/job-application",
                {
                    method: "POST",
                    body: new FormData(jobForm)
                }
            );

            const result = await response.json();

            if (response.ok && result.success) {
                alert("✅ Application submitted successfully!");
                jobForm.reset();
            } else {
                alert("❌ " + (result.message || "Application failed"));
            }
        } catch (error) {
            console.error("Job Application Error:", error);
            alert("❌ Server error. Please try again.");
        } finally {
            if (submitButton) {
                submitButton.disabled = false;
                submitButton.innerHTML = "📨 Submit Application";
            }
        }
    });

    console.log("✅ Job Application Handler Attached");
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", setupJobApplicationForm);
} else {
    setupJobApplicationForm();
}

// ==========================================
// 🛒 OPEN CART SECTION
// ==========================================


function openCartSection() {
    const checkout = document.getElementById("premiumCheckout");
    const cartItems = document.getElementById("cartItems");

    if (checkout) {
        checkout.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });
    } else if (cartItems) {
        cartItems.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });
    } else {
        alert("Cart section nahi mila!");
    }
}


async function showDemoPayment(orderId) {
    const choice = confirm(
        "💳 ALHAYAT DEMO PAYMENT\n\n" +
        "OK = Simulate Success\n" +
        "Cancel = Simulate Failure\n\n" +
        "No real money will be charged."
    );

    const outcome = choice ? "success" : "failure";

    try {
        const response = await fetch(
            "http://localhost:8000/demo-payment",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    orderId: orderId,
                    outcome: outcome
                })
            }
        );

        const result = await response.json();

        if (outcome === "success" && response.ok && result.success) {
            alert("✅ PAYMENT SUCCESSFUL!\n\nYour demo payment is complete.");
            return result;
        }

        if (outcome === "failure") {
            alert("❌ PAYMENT FAILED!\n\nNo money was charged.");
            return null;
        }

        throw new Error(result.message || "Payment failed");

    } catch (error) {
        console.error("Demo Payment Error:", error);
        alert("❌ " + error.message);
        return null;
    }
}


async function startDemoPayment() {
    const paymentElement = document.getElementById("selectedPaymentName");

    if (
        !paymentElement ||
        !paymentElement.innerText.trim() ||
        paymentElement.innerText.trim() === "Choose Payment Method"
    ) {
        alert("💳 Please select a payment method first.");
        return;
    }

    const paymentBox = document.createElement("div");
    paymentBox.id = "demoPaymentScreen";

    paymentBox.style.cssText = `
        position: fixed;
        inset: 0;
        z-index: 99999;
        background: rgba(255,255,255,0.98);
        display: flex;
        align-items: center;
        justify-content: center;
        font-family: Arial, sans-serif;
        text-align: center;
        padding: 24px;
    `;

    paymentBox.innerHTML = `
        <div>
            <div id="demoPaymentIcon"
                style="font-size:65px;color:#16a34a;">⏳</div>
            <h2 id="demoPaymentTitle" style="color:#15803d;">
                Processing Payment...
            </h2>
            <p id="demoPaymentMessage" style="color:#555;">
                Please wait, do not close this screen.
            </p>
            <div style="color:#15803d;font-weight:bold;">
                ALHAYAT DEMO PAYMENT
            </div>
        </div>
    `;

    document.body.appendChild(paymentBox);

    await new Promise(resolve => setTimeout(resolve, 1800));

    document.getElementById("demoPaymentIcon").innerHTML = "✓";
    document.getElementById("demoPaymentIcon").style.cssText +=
        ";font-size:80px;color:#16a34a;font-weight:bold;";
    document.getElementById("demoPaymentTitle").innerText =
        "Payment Successful!";
    document.getElementById("demoPaymentMessage").innerText =
        "Demo payment complete. No real money was charged.";

    await new Promise(resolve => setTimeout(resolve, 1500));

    paymentBox.remove();

    // Continue to the order placement function
    await placeOrderAfterDemoPayment();
}


async function showPaymentSuccessScreen() {
    const screen = document.createElement("div");

    screen.style.cssText = `
        position:fixed; inset:0; z-index:999999;
        background:#ffffff; display:flex;
        align-items:center; justify-content:center;
        text-align:center; font-family:Arial,sans-serif;
        padding:24px;
    `;

    screen.innerHTML = `
        <div>
            <div id="paySpinner" style="
                width:65px;height:65px;margin:0 auto 22px;
                border:6px solid #dcfce7;
                border-top:6px solid #16a34a;
                border-radius:50%;
                animation:alhayatSpin 0.8s linear infinite;">
            </div>
            <h2 id="payTitle" style="color:#15803d">
                Processing Payment...
            </h2>
            <p id="payMessage" style="color:#555">
                Please wait while we process your demo payment.
            </p>
            <p style="color:#16a34a;font-weight:bold">
                ALHAYAT DEMO PAYMENT
            </p>
        </div>
    `;

    const style = document.createElement("style");
    style.textContent = `
        @keyframes alhayatSpin {
            to { transform: rotate(360deg); }
        }
    `;

    document.head.appendChild(style);
    document.body.appendChild(screen);

    await new Promise(resolve => setTimeout(resolve, 2000));

    document.getElementById("paySpinner").remove();

    const title = document.getElementById("payTitle");
    title.innerHTML = "✓ Payment Successful!";
    title.style.cssText =
        "color:#15803d;font-size:28px;";

    document.getElementById("payMessage").innerText =
        "Demo payment complete. No real money was charged.";

    const tick = document.createElement("div");
    tick.innerHTML = "✓";
    tick.style.cssText = `
        width:85px;height:85px;margin:0 auto 18px;
        border-radius:50%;background:#16a34a;color:white;
        font-size:58px;line-height:85px;font-weight:bold;
    `;
    title.before(tick);

    await new Promise(resolve => setTimeout(resolve, 1500));

    screen.remove();
    style.remove();

    return true;
}


async function placeOrderAfterDemoPayment() {
    await placeOrder();
}


