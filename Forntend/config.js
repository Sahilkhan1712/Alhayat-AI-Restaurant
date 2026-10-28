// Public frontend configuration only. Never put secrets or private keys here.
(function () {
    const hostname = window.location.hostname || "";
    const protocol = window.location.protocol || "";

    const isLocal =
        protocol === "file:" ||
        hostname === "localhost" ||
        hostname === "127.0.0.1" ||
        hostname === "0.0.0.0" ||
        hostname.startsWith("192.168.") ||
        hostname.startsWith("10.");

    // Production backend deployment URL
    const PROD_BACKEND_URL = "https://alhayat-ai-restaurant-backend.onrender.com";

    let apiBase = PROD_BACKEND_URL;
    if (isLocal) {
        apiBase = "http://localhost:8000";
    } else if (hostname.includes("onrender.com")) {
        apiBase = window.location.origin;
    }

    window.ALHAYAT_CONFIG = {
        API_BASE_URL: (window.ALHAYAT_API_BASE_URL || apiBase).replace(/\/$/, "")
    };

    window.getAlhayatApiUrl = function (path) {
        const base = (window.ALHAYAT_CONFIG && window.ALHAYAT_CONFIG.API_BASE_URL) || PROD_BACKEND_URL;
        const cleanPath = String(path || "").startsWith("/") ? path : `/${path}`;
        return `${base}${cleanPath}`;
    };
})();
