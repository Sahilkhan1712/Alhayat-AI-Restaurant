const test = require("node:test");
const assert = require("node:assert/strict");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const User = require("../models/User");
const { authenticateToken } = require("../middleware/auth");

test("User schema includes all modern profile fields", () => {
    const paths = User.schema.paths;

    assert.ok(paths["name"], "name should be in schema");
    assert.ok(paths["email"], "email should be in schema");
    assert.ok(paths["phone"], "phone should be in schema");
    assert.ok(paths["avatar"], "avatar should be in schema");
    assert.ok(paths["bio"], "bio should be in schema");
    assert.ok(paths["address.street"], "address.street should be in schema");
    assert.ok(paths["address.landmark"], "address.landmark should be in schema");
    assert.ok(paths["address.city"], "address.city should be in schema");
    assert.ok(paths["address.state"], "address.state should be in schema");
    assert.ok(paths["address.pincode"], "address.pincode should be in schema");
    assert.ok(paths["address.addressType"], "address.addressType should be in schema");
    assert.ok(paths["dietaryPreference"], "dietaryPreference should be in schema");
    assert.ok(paths["favoriteDish"], "favoriteDish should be in schema");
    assert.ok(paths["birthday"], "birthday should be in schema");
    assert.ok(paths["deliveryNotes"], "deliveryNotes should be in schema");
});

test("authenticateToken middleware handles missing token with 401", () => {
    const req = { headers: {} };
    let statusSent = null;
    let jsonSent = null;
    const res = {
        status(s) {
            statusSent = s;
            return this;
        },
        json(j) {
            jsonSent = j;
            return this;
        }
    };
    let nextCalled = false;
    const next = () => { nextCalled = true; };

    authenticateToken(req, res, next);

    assert.equal(statusSent, 401);
    assert.equal(jsonSent.success, false);
    assert.equal(nextCalled, false);
});

test("authenticateToken middleware validates JWT token and attaches user to req", () => {
    process.env.JWT_SECRET = "testsecret123";
    const payload = { id: "user_abc_123", role: "user" };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1h" });

    const req = {
        headers: {
            authorization: `Bearer ${token}`
        }
    };
    const res = {};
    let nextCalled = false;
    const next = () => { nextCalled = true; };

    authenticateToken(req, res, next);

    assert.equal(nextCalled, true);
    assert.equal(req.user.id, "user_abc_123");
    assert.equal(req.user.role, "user");
});
