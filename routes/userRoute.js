const express = require("express");
const router = express.Router();
const userController = require("../controller/userController");

// Registration routes
router.get('/register', userController.showRegisterForm);
router.post('/register/step1', userController.registerStepOne);
router.post('/register', userController.register);

// Login routes
router.get("/login", userController.showLoginForm);
router.post("/login", userController.login);

// Add logout route if you included it in your controller
router.get("/logout", userController.logout);

// User profile routes
router.get("/users/:id", userController.getUserById);
router.get("/users/:id/edit", userController.showEditForm);
router.post("/users/:id", userController.updateUser);

// User list route
// router.get("/users", userController.getAllUsersList);

module.exports = router;