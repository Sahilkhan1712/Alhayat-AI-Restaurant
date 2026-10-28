const assert = require("node:assert/strict");
const test = require("node:test");
const crypto = require("crypto");
const { verifyRazorpaySignature, verifyRazorpayWebhookSignature } = require("../payment-utils");

test("accepts a valid Razorpay signature and rejects tampering", () => {
    const order = "order_test123";
    const payment = "pay_test123";
    const secret = "test_secret";
    const signature = crypto.createHmac("sha256", secret).update(`${order}|${payment}`).digest("hex");
    assert.equal(verifyRazorpaySignature(order, payment, signature, secret), true);
    assert.equal(verifyRazorpaySignature(order, payment, `${signature.slice(0, -1)}0`, secret), false);
});

test("accepts a valid webhook signature and rejects tampering", () => {
    const payload = JSON.stringify({ event: "payment.captured" });
    const secret = "webhook_secret";
    const signature = crypto.createHmac("sha256", secret).update(payload).digest("hex");
    assert.equal(verifyRazorpayWebhookSignature(payload, signature, secret), true);
    assert.equal(verifyRazorpayWebhookSignature(`${payload}x`, signature, secret), false);
});
