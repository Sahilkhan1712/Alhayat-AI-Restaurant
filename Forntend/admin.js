// ==========================================
// ADMIN PANEL
// ==========================================

let salesChartInstance = null;

// ==========================================
// GET LOGIN USER
// ==========================================

const user = JSON.parse(localStorage.getItem("user"));
const token = localStorage.getItem("token");

// ==========================================
// ADMIN SECURITY CHECK
// ==========================================

if (
    !user ||
    !token ||
    user.role !== "admin"
) {

    alert("Access Denied! Admin login required.");

    localStorage.removeItem("token");
    localStorage.removeItem("user");

    window.location.href = "login.html";

}


// ==========================================
// SOCKET.IO
// ==========================================

const socket = io("https://alhayat-ai-restaurant-backend.onrender.com");

console.log("Admin Panel Loaded");


// ==========================================
// PREVIOUS ORDER COUNT
// ==========================================

let previousOrderCount = 0;


// ==========================================
// AUTH HEADERS
// ==========================================

function authHeaders() {

    return {

        "Content-Type": "application/json",

        "Authorization": `Bearer ${token}`

    };

}


// ==========================================
// LOAD ORDERS
// ==========================================

async function loadOrders() {

    try {

        const response = await fetch(
            "https://alhayat-ai-restaurant-backend.onrender.com/orders",
            {
                method: "GET",
                headers: authHeaders()
            }
        );


        // Unauthorized
        if (response.status === 401 ||
            response.status === 403) {

            alert(
                "Admin session expired or access denied."
            );

            localStorage.removeItem("token");
            localStorage.removeItem("user");

            window.location.href = "login.html";

            return;

        }


        const orders = await response.json();


        // =====================================
        // NEW ORDER NOTIFICATION
        // =====================================

        if (
            previousOrderCount !== 0 &&
            orders.length > previousOrderCount
        ) {

            const sound =
                document.getElementById(
                    "notificationSound"
                );

            if (sound) {

                sound.play().catch(() => {});

            }

            alert("🔔 New Order Received!");

        }


        previousOrderCount = orders.length;


        // =====================================
        // DASHBOARD
        // =====================================

        document.getElementById(
            "totalOrders"
        ).innerText = orders.length;


        document.getElementById(
            "pendingOrders"
        ).innerText =

            orders.filter(
                order =>
                    (order.status || "Pending")
                    === "Pending"
            ).length;


        document.getElementById(
            "deliveredOrders"
        ).innerText =

            orders.filter(
                order =>
                    order.status === "Delivered"
            ).length;


        // =====================================
        // REVENUE
        // =====================================

        let revenue = 0;


        orders.forEach(order => {

            if (!Array.isArray(order.cart)) {
                return;
            }


            order.cart.forEach(item => {

                revenue +=
                    Number(item.price || 0) *
                    Number(item.qty || 0);

            });

        });


        document.getElementById(
            "totalRevenue"
        ).innerText =
            "₹" + revenue;


        // =====================================
        // BEST SELLING ITEMS
        // =====================================

        const itemStats = {};


        orders.forEach(order => {

            if (!Array.isArray(order.cart)) {
                return;
            }


            order.cart.forEach(item => {

                const name =
                    item.name || "Unknown Item";

                const qty =
                    Number(item.qty || 0);


                if (itemStats[name]) {

                    itemStats[name] += qty;

                } else {

                    itemStats[name] = qty;

                }

            });

        });


        let bestSellingHTML = "";


        Object.entries(itemStats)

            .sort(
                (a, b) =>
                    b[1] - a[1]
            )

            .forEach(
                ([name, qty]) => {

                    bestSellingHTML += `

                        <p>
                            🍽️ ${name}
                            :
                            <b>${qty}</b>
                            Orders
                        </p>

                    `;

                }
            );


        document.getElementById(
            "bestSellingItems"
        ).innerHTML =
            bestSellingHTML ||
            "<p>No sales data yet.</p>";


        // =====================================
        // SALES CHART
        // =====================================

        const ctx =
            document.getElementById(
                "salesChart"
            );


        if (ctx) {

            if (salesChartInstance) {

                salesChartInstance.destroy();

            }


            salesChartInstance =
                new Chart(
                    ctx,
                    {

                        type: "bar",

                        data: {

                            labels:
                                Object.keys(
                                    itemStats
                                ),

                            datasets: [

                                {

                                    label:
                                        "Orders",

                                    data:
                                        Object.values(
                                            itemStats
                                        ),

                                    borderWidth: 1

                                }

                            ]

                        },


                        options: {

                            responsive: true,

                            scales: {

                                y: {

                                    beginAtZero:
                                        true

                                }

                            }

                        }

                    }
                );

        }


        // =====================================
        // SEARCH + FILTER
        // =====================================

        const searchElement =
            document.getElementById(
                "searchOrder"
            );


        const filterElement =
            document.getElementById(
                "statusFilter"
            );


        const search =
            searchElement
                ? searchElement.value
                    .toLowerCase()
                : "";


        const filter =
            filterElement
                ? filterElement.value
                : "";


        const filteredOrders =
            orders.filter(order => {

                const name =
                    (
                        order.customer ||
                        ""
                    ).toLowerCase();


                const searchMatch =
                    name.includes(search);


                const statusMatch =
                    filter === "" ||
                    (
                        order.status ||
                        "Pending"
                    ) === filter;


                return (
                    searchMatch &&
                    statusMatch
                );

            });


        // =====================================
        // DISPLAY ORDERS
        // =====================================

        const ordersDiv =
            document.getElementById(
                "orders"
            );


        ordersDiv.innerHTML = "";


        if (filteredOrders.length === 0) {

            ordersDiv.innerHTML = `

                <div class="alert alert-warning">

                    No orders found.

                </div>

            `;

            return;

        }


        filteredOrders.forEach(order => {


            const cartItems =
                Array.isArray(order.cart)

                    ? order.cart.map(
                        item => `

                            <li>
                                ${item.name}
                                × ${item.qty}
                                =
                                ₹${item.price * item.qty}
                            </li>

                        `
                    ).join("")

                    : "";


            const total =
                Array.isArray(order.cart)

                    ? order.cart.reduce(
                        (sum, item) =>

                            sum +
                            (
                                Number(item.price || 0) *
                                Number(item.qty || 0)
                            ),

                        0
                    )

                    : 0;


            const status =
                order.status ||
                "Pending";


            ordersDiv.innerHTML += `

                <div class="card shadow-lg p-3 mb-4">

                    <h3>
                        ${order.customer || "Customer"}
                    </h3>


                    <p>
                        <b>📞 Phone :</b>
                        ${order.phone || "N/A"}
                    </p>


                    <p>
                        <b>📍 Address :</b>
                        ${order.address || "N/A"}
                    </p>


                    <p>
                        <b>💳 Payment :</b>
                        ${order.paymentMethod || "COD"}
                    </p>


                    <p>
                        <b>💰 Payment Status :</b>
                        ${order.paymentStatus || "Pending"}
                    </p>


                    <p>
                        <b>🕒 Time :</b>
                        ${
                            order.createdAt
                                ? new Date(
                                    order.createdAt
                                ).toLocaleString()
                                : "Old Order"
                        }
                    </p>


                    <ul>

                        ${cartItems}

                    </ul>


                    <h5>
                        Total : ₹${total}
                    </h5>


                    <h6 class="text-primary">

                        Status :
                        ${status}

                    </h6>


                    <!-- DELETE -->

                    <button

                        class="btn btn-danger w-100 mt-2"

                        onclick="
                            deleteOrder(
                                '${order._id}'
                            )
                        "

                    >

                        🗑 Delete Order

                    </button>


                    <!-- ACCEPT -->

                    ${
                        status === "Pending"

                            ? `

                                <button

                                    class="btn btn-success w-100 mt-2"

                                    onclick="
                                        updateStatus(
                                            '${order._id}',
                                            'Accepted'
                                        )
                                    "

                                >

                                    ✅ Accept Order

                                </button>

                            `

                            : ""
                    }


                    <!-- PREPARING -->

                    ${
                        status === "Accepted"

                            ? `

                                <button

                                    class="btn btn-info w-100 mt-2"

                                    onclick="
                                        updateStatus(
                                            '${order._id}',
                                            'Preparing'
                                        )
                                    "

                                >

                                    👨‍🍳 Start Preparing

                                </button>

                            `

                            : ""
                    }


                    <!-- OUT FOR DELIVERY -->

                    ${
                        status === "Preparing"

                            ? `

                                <button

                                    class="btn btn-primary w-100 mt-2"

                                    onclick="
                                        updateStatus(
                                            '${order._id}',
                                            'Out For Delivery'
                                        )
                                    "

                                >

                                    🚚 Out For Delivery

                                </button>

                            `

                            : ""
                    }


                    <!-- DELIVERED -->

                    ${
                        status ===
                        "Out For Delivery"

                            ? `

                                <button

                                    class="btn btn-warning w-100 mt-2"

                                    onclick="
                                        updateStatus(
                                            '${order._id}',
                                            'Delivered'
                                        )
                                    "

                                >

                                    📦 Mark Delivered

                                </button>

                            `

                            : ""
                    }


                    <!-- PAYMENT -->

                    ${
                        order.paymentStatus !==
                        "Paid"

                            ? `

                                <button

                                    class="btn btn-info w-100 mt-2"

                                    onclick="
                                        updatePaymentStatus(
                                            '${order._id}'
                                        )
                                    "

                                >

                                    💰 Mark As Paid

                                </button>

                            `

                            : ""
                    }


                    ${
                        status === "Delivered"

                            ? `

                                <div class="alert alert-success mt-3">

                                    ✅ Order Delivered Successfully

                                </div>

                            `

                            : ""
                    }

                </div>

            `;

        });

    }

    catch (error) {

        console.error(
            "Load Orders Error:",
            error
        );

    }

}


// ==========================================
// UPDATE ORDER STATUS
// ==========================================

async function updateStatus(
    orderId,
    status
) {

    try {

        const response =
            await fetch(
                "https://alhayat-ai-restaurant-backend.onrender.com/update-status",
                {

                    method: "POST",

                    headers: authHeaders(),

                    body: JSON.stringify({

                        orderId,
                        status

                    })

                }
            );


        const data =
            await response.json();


        if (
            response.status === 401 ||
            response.status === 403
        ) {

            alert(
                "Admin access denied."
            );

            return;

        }


        alert(data.message);

        loadOrders();

    }

    catch (error) {

        console.error(error);

        alert(
            "Status update failed."
        );

    }

}


// ==========================================
// DELETE ORDER
// ==========================================

async function deleteOrder(
    orderId
) {

    if (
        !confirm(
            "Delete this order?"
        )
    ) {

        return;

    }


    try {

        const response =
            await fetch(
                "https://alhayat-ai-restaurant-backend.onrender.com/delete-order",
                {

                    method: "POST",

                    headers: authHeaders(),

                    body: JSON.stringify({

                        orderId

                    })

                }
            );


        const data =
            await response.json();


        alert(data.message);

        loadOrders();

    }

    catch (error) {

        console.error(error);

        alert(
            "Delete Failed"
        );

    }

}


window.deleteOrder =
    deleteOrder;


// ==========================================
// UPDATE PAYMENT
// ==========================================

async function updatePaymentStatus(
    orderId
) {

    try {

        const response =
            await fetch(
                "https://alhayat-ai-restaurant-backend.onrender.com/update-payment",
                {

                    method: "POST",

                    headers: authHeaders(),

                    body: JSON.stringify({

                        orderId

                    })

                }
            );


        const data =
            await response.json();


        alert(data.message);


        setTimeout(
            () => {

                loadOrders();

            },
            300
        );

    }

    catch (error) {

        console.error(error);

        alert(
            "Payment Update Failed"
        );

    }

}


window.updatePaymentStatus =
    updatePaymentStatus;


// ==========================================
// SOCKET.IO
// ==========================================

socket.on(
    "orderStatusUpdated",
    (order) => {

        console.log(
            "SOCKET EVENT RECEIVED:",
            order
        );

        loadOrders();

    }
);


// ==========================================
// LOAD RESERVATIONS
// ==========================================

async function loadReservations() {

    try {

        const response =
            await fetch(
                "https://alhayat-ai-restaurant-backend.onrender.com/reservations",
                {

                    method: "GET",

                    headers:
                        authHeaders()

                }
            );


        if (
            response.status === 401 ||
            response.status === 403
        ) {

            alert(
                "Admin access denied."
            );

            return;

        }


        const reservations =
            await response.json();


        const reservationList =
            document.getElementById(
                "reservationList"
            );


        reservationList.innerHTML = "";


        if (
            reservations.length === 0
        ) {

            reservationList.innerHTML = `

                <div class="alert alert-warning">

                    No reservations found.

                </div>

            `;

            return;

        }


        reservations.forEach(r => {

            reservationList.innerHTML += `

                <div class="col-md-4">

                    <div class="card p-3">

                        <h5>
                            ${r.name}
                        </h5>


                        <p>
                            📞 ${r.phone}
                        </p>


                        <p>
                            👥 Guests:
                            ${r.guests}
                        </p>


                        <p>
                            📅 ${r.date}
                        </p>


                        <p>
                            🕒 ${r.time}
                        </p>


                        <span
                            class="badge bg-success mb-2"
                        >

                            ${r.status || "Pending"}

                        </span>


                        <br>


                        <button

                            class="btn btn-success btn-sm me-2"

                            onclick="
                                updateReservationStatus(
                                    '${r._id}',
                                    'Confirmed'
                                )
                            "

                        >

                            Confirm

                        </button>


                        <button

                            class="btn btn-danger btn-sm"

                            onclick="
                                updateReservationStatus(
                                    '${r._id}',
                                    'Cancelled'
                                )
                            "

                        >

                            Cancel

                        </button>

                    </div>

                </div>

            `;

        });

    }

    catch (error) {

        console.error(
            "Reservation Error:",
            error
        );

    }

}


// ==========================================
// UPDATE RESERVATION STATUS
// ==========================================

async function updateReservationStatus(
    reservationId,
    status
) {

    try {

        const response =
            await fetch(
                "https://alhayat-ai-restaurant-backend.onrender.com/update-reservation-status",
                {

                    method: "POST",

                    headers: authHeaders(),

                    body: JSON.stringify({

                        reservationId,
                        status

                    })

                }
            );


        const data =
            await response.json();


        if (data.success) {

            alert(
                "Reservation Updated"
            );

            loadReservations();

        } else {

            alert(
                data.message ||
                "Update Failed"
            );

        }

    }

    catch (error) {

        console.error(error);

        alert(
            "Reservation Update Failed"
        );

    }

}


window.updateReservationStatus =
    updateReservationStatus;


// ==========================================
// INITIAL LOAD
// ==========================================

loadOrders();

loadReservations();
function logoutAdmin() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    window.location.href = "login.html";
}

window.logoutAdmin = logoutAdmin;
// SHOW ADMIN NAME
const adminUser = JSON.parse(localStorage.getItem("user") || "{}");

const adminNameElement = document.getElementById("adminName");

if (adminNameElement) {
    adminNameElement.innerText =
        adminUser.name ||
        adminUser.username ||
        adminUser.fullName ||
        adminUser.email ||
        "Admin";
}