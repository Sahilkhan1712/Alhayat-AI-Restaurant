// ==========================================
// PROFILE MANAGEMENT JAVASCRIPT
// ==========================================

let currentUser = null;
let currentToken = null;
let currentAvatarData = "";
let selectedAddressType = "Home";
let selectedDiet = "All / Non-Veg";
let avatarModalInstance = null;

document.addEventListener("DOMContentLoaded", () => {
    initProfilePage();
});

function initProfilePage() {
    currentToken = localStorage.getItem("token");
    const rawUser = localStorage.getItem("user");

    if (!rawUser) {
        alert("Please login first to access your profile.");
        window.location.href = "login.html";
        return;
    }

    try {
        currentUser = JSON.parse(rawUser);
    } catch (e) {
        console.error("Invalid user data in storage:", e);
        localStorage.removeItem("user");
        window.location.href = "login.html";
        return;
    }

    // Check for welcome flag
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get("welcome") === "1") {
        const welcomeBanner = document.getElementById("welcomeBanner");
        const welcomeHeading = document.getElementById("welcomeHeading");
        if (welcomeBanner) welcomeBanner.style.display = "flex";
        if (welcomeHeading && currentUser.name) {
            welcomeHeading.innerText = `Welcome to AlHayat AI, ${currentUser.name}! 🎉`;
        }
    }

    // Populate data from localStorage immediately
    populateUI(currentUser);

    // Fetch freshest data from backend
    fetchProfileFromServer();
}

function getDefaultAvatar(name) {
    const cleanName = encodeURIComponent((name || "Foodie").trim());
    return `https://api.dicebear.com/7.x/initials/svg?seed=${cleanName}&backgroundColor=ffc107&textColor=111111`;
}

function populateUI(user) {
    if (!user) return;

    // Header & summary
    const displayName = user.name || "Foodie User";
    const displayEmail = user.email || "";
    const displayBio = user.bio || "Food lover enjoying AI-crafted delicacies at AlHayat.";
    const displayPhone = user.phone || "";

    document.getElementById("profileCardName").innerText = displayName;
    document.getElementById("profileCardEmail").innerText = displayEmail;
    document.getElementById("profileCardBio").innerText = `"${displayBio}"`;
    document.getElementById("profileRoleBadge").innerText = user.role === "admin" ? "🛡️ Administrator" : "⭐️ VIP Foodie";

    // Form inputs
    document.getElementById("profileName").value = user.name || "";
    document.getElementById("profileEmail").value = displayEmail;
    document.getElementById("profilePhone").value = displayPhone;
    document.getElementById("profileBio").value = user.bio || "";
    document.getElementById("profileBirthday").value = user.birthday || "";
    document.getElementById("profileFavDish").value = user.favoriteDish || "";
    document.getElementById("profileDeliveryNotes").value = user.deliveryNotes || "";

    // Avatar
    currentAvatarData = user.avatar || "";
    const avatarImg = document.getElementById("profileAvatarPreview");
    if (avatarImg) {
        avatarImg.src = currentAvatarData || getDefaultAvatar(user.name);
    }

    // Address
    const address = user.address || {};
    document.getElementById("profileStreet").value = address.street || "";
    document.getElementById("profileLandmark").value = address.landmark || "";
    document.getElementById("profileCity").value = address.city || "";
    document.getElementById("profileState").value = address.state || "";
    document.getElementById("profilePincode").value = address.pincode || "";

    if (address.addressType) {
        selectAddressType(address.addressType);
    } else {
        selectAddressType("Home");
    }

    // Quick address summary card
    updateQuickAddressCard(address, displayPhone);

    // Dietary preference
    if (user.dietaryPreference) {
        selectDiet(user.dietaryPreference);
    } else {
        selectDiet("All / Non-Veg");
    }
}

function updateQuickAddressCard(address, phone) {
    const quickSummary = document.getElementById("quickAddressSummary");
    const quickType = document.getElementById("quickAddressType");
    const quickPhone = document.getElementById("quickPhoneSummary");

    if (quickType) quickType.innerText = selectedAddressType || "Home";
    if (quickPhone) quickPhone.innerText = `📞 Phone: ${phone || "Not set"}`;

    if (address && (address.street || address.city)) {
        const parts = [
            address.street,
            address.landmark ? `(Near: ${address.landmark})` : "",
            address.city,
            address.state,
            address.pincode
        ].filter(Boolean);

        if (quickSummary) {
            quickSummary.innerText = parts.join(", ");
        }
    } else {
        if (quickSummary) {
            quickSummary.innerText = "No address saved yet. Fill in your delivery address on the right to speed up checkout!";
        }
    }
}

// ==========================================
// SERVER API CALLS
// ==========================================

async function fetchProfileFromServer() {
    if (!currentToken) return;

    try {
        const apiBase = (window.ALHAYAT_CONFIG && window.ALHAYAT_CONFIG.API_BASE_URL) || "https://alhayat-ai-restaurant-backend.onrender.com";
        const res = await fetch(`${apiBase}/auth/profile`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${currentToken}`,
                "Content-Type": "application/json"
            }
        });

        if (res.ok) {
            const data = await res.json();
            if (data.success && data.user) {
                currentUser = { ...currentUser, ...data.user };
                localStorage.setItem("user", JSON.stringify(currentUser));
                populateUI(currentUser);
            }
        }
    } catch (err) {
        console.warn("Could not fetch profile from server (using local cache):", err);
    }
}

async function saveUserProfile() {
    const saveBtn = document.getElementById("saveProfileBtn");
    const originalText = saveBtn ? saveBtn.innerHTML : "Save";

    const name = document.getElementById("profileName").value.trim();
    const phone = document.getElementById("profilePhone").value.trim();
    const bio = document.getElementById("profileBio").value.trim();
    const birthday = document.getElementById("profileBirthday").value;
    const favoriteDish = document.getElementById("profileFavDish").value.trim();
    const deliveryNotes = document.getElementById("profileDeliveryNotes").value.trim();

    const street = document.getElementById("profileStreet").value.trim();
    const landmark = document.getElementById("profileLandmark").value.trim();
    const city = document.getElementById("profileCity").value.trim();
    const state = document.getElementById("profileState").value.trim();
    const pincode = document.getElementById("profilePincode").value.trim();

    if (!name) {
        alert("Please enter your name.");
        return;
    }

    if (!phone) {
        alert("Please enter your phone number.");
        return;
    }

    const updatedPayload = {
        name,
        phone,
        bio,
        birthday,
        avatar: currentAvatarData,
        dietaryPreference: selectedDiet,
        favoriteDish,
        deliveryNotes,
        address: {
            street,
            landmark,
            city,
            state,
            pincode,
            addressType: selectedAddressType
        }
    };

    if (saveBtn) {
        saveBtn.disabled = true;
        saveBtn.innerHTML = "⏳ Saving...";
    }

    // Always update local cache immediately
    currentUser = {
        ...currentUser,
        ...updatedPayload
    };
    localStorage.setItem("user", JSON.stringify(currentUser));
    populateUI(currentUser);

    // Sync with backend API
    try {
        const apiBase = (window.ALHAYAT_CONFIG && window.ALHAYAT_CONFIG.API_BASE_URL) || "https://alhayat-ai-restaurant-backend.onrender.com";
        const res = await fetch(`${apiBase}/auth/profile`, {
            method: "PUT",
            headers: {
                "Authorization": `Bearer ${currentToken}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(updatedPayload)
        });

        const data = await res.json();
        if (data.success && data.user) {
            currentUser = { ...currentUser, ...data.user };
            localStorage.setItem("user", JSON.stringify(currentUser));
            populateUI(currentUser);
        }
    } catch (err) {
        console.warn("Server sync error (saved locally):", err);
    }

    if (saveBtn) {
        saveBtn.disabled = false;
        saveBtn.innerHTML = originalText;
    }

    showToast("Profile & Address updated successfully! ✨");
}

// ==========================================
// PILL SELECTORS
// ==========================================

function selectAddressType(type) {
    selectedAddressType = type;
    const group = document.getElementById("addressTypeGroup");
    if (!group) return;

    const buttons = group.querySelectorAll(".pill-btn");
    buttons.forEach(btn => {
        if (btn.getAttribute("data-type") === type) {
            btn.classList.add("active");
        } else {
            btn.classList.remove("active");
        }
    });

    const quickType = document.getElementById("quickAddressType");
    if (quickType) quickType.innerText = type;
}

function selectDiet(diet) {
    selectedDiet = diet;
    const group = document.getElementById("dietaryGroup");
    if (!group) return;

    const buttons = group.querySelectorAll(".pill-btn");
    buttons.forEach(btn => {
        if (btn.getAttribute("data-diet") === diet) {
            btn.classList.add("active");
        } else {
            btn.classList.remove("active");
        }
    });
}

// ==========================================
// AVATAR & PHOTO PICKER
// ==========================================

function openPhotoPickerModal() {
    const modalEl = document.getElementById("avatarModal");
    if (!modalEl) return;
    if (!avatarModalInstance) {
        avatarModalInstance = new bootstrap.Modal(modalEl);
    }
    avatarModalInstance.show();
}

function closePhotoPickerModal() {
    if (avatarModalInstance) {
        avatarModalInstance.hide();
    }
}

function handleAvatarFileSelect(event) {
    const file = event.target.files && event.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
        alert("Please select a valid image file (PNG, JPG, WEBP).");
        return;
    }

    const reader = new FileReader();
    reader.onload = function (e) {
        const img = new Image();
        img.onload = function () {
            // Resize image to max 320x320 for light & fast base64 storage
            const canvas = document.createElement("canvas");
            const maxDim = 320;
            let width = img.width;
            let height = img.height;

            if (width > height) {
                if (width > maxDim) {
                    height = Math.round((height * maxDim) / width);
                    width = maxDim;
                }
            } else {
                if (height > maxDim) {
                    width = Math.round((width * maxDim) / height);
                    height = maxDim;
                }
            }

            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext("2d");
            ctx.drawImage(img, 0, 0, width, height);

            const compressedBase64 = canvas.toDataURL("image/jpeg", 0.85);
            currentAvatarData = compressedBase64;

            const preview = document.getElementById("profileAvatarPreview");
            if (preview) preview.src = currentAvatarData;

            closePhotoPickerModal();
            showToast("Photo selected! Click 'Save Profile Changes' to keep it.");
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
}

function choosePresetAvatar(emoji) {
    // Generate clean SVG avatar with the chosen emoji
    const svg = `
        <svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200">
            <defs>
                <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stop-color="#242424"/>
                    <stop offset="100%" stop-color="#111111"/>
                </linearGradient>
            </defs>
            <circle cx="100" cy="100" r="95" fill="url(#bg)" stroke="#ffc107" stroke-width="8"/>
            <text x="100" y="125" font-size="90" text-anchor="middle" dominant-baseline="middle">${emoji}</text>
        </svg>
    `.trim();

    currentAvatarData = `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;

    const preview = document.getElementById("profileAvatarPreview");
    if (preview) preview.src = currentAvatarData;

    closePhotoPickerModal();
    showToast(`Avatar updated to ${emoji}! Click 'Save Profile Changes' to keep it.`);
}

function removeAvatar() {
    currentAvatarData = "";
    const preview = document.getElementById("profileAvatarPreview");
    if (preview && currentUser) {
        preview.src = getDefaultAvatar(currentUser.name);
    }
    closePhotoPickerModal();
    showToast("Profile picture reset. Click 'Save Profile Changes' to keep it.");
}

// ==========================================
// TOAST NOTIFICATION
// ==========================================

function showToast(message) {
    const toast = document.getElementById("profileToast");
    const toastMsg = document.getElementById("toastMsg");
    if (!toast || !toastMsg) return;

    toastMsg.innerText = message;
    toast.style.display = "flex";

    setTimeout(() => {
        toast.style.display = "none";
    }, 3500);
}

// ==========================================
// LOGOUT
// ==========================================

function logoutProfile() {
    if (confirm("Are you sure you want to log out from AlHayat AI?")) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        alert("Logout Successful 👋 See you soon!");
        window.location.href = "login.html";
    }
}
