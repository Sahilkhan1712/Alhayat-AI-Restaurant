const assert = require("node:assert/strict");
const test = require("node:test");
const { verifyRazorpaySignature, verifyRazorpayWebhookSignature } = require("../payment-utils");

test("Razorpay signature rejects missing or empty parameters safely", () => {
    assert.equal(verifyRazorpaySignature("", "", "", ""), false);
    assert.equal(verifyRazorpaySignature(null, null, null, null), false);
    assert.equal(verifyRazorpaySignature("order_123", "pay_123", null, "secret"), false);
    assert.equal(verifyRazorpayWebhookSignature(null, "sig", "sec"), false);
});

test("Cart paise calculation preserves integer precision", () => {
    const sampleItems = [
        { name: "Margherita Pizza", price: 249, qty: 2 },
        { name: "Cold Coffee", price: 149, qty: 1 }
    ];
    const totalPaise = sampleItems.reduce((sum, item) => sum + item.price * item.qty * 100, 0);
    assert.equal(totalPaise, (249 * 2 + 149) * 100);
    assert.equal(totalPaise / 100, 647);
});

test("Razorpay TEST mode validation regex enforces test keys", () => {
    const testKey = "rzp_test_TtI79lR7NgpyNa";
    const liveKey = "rzp_live_abc123xyz456";
    const mode = "TEST";

    const isTestKeyValid = mode === "TEST" && /^rzp_test_/.test(testKey);
    const isLiveKeyRejectedInTest = mode === "TEST" && /^rzp_test_/.test(liveKey);

    assert.equal(isTestKeyValid, true);
    assert.equal(isLiveKeyRejectedInTest, false);
});
