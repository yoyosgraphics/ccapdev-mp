const express = require("express");
const router = express.Router();
const { 
    register, 
    login, 
    getUserById, 
    updateUser, 
    getAllUsersList,
    showRegisterForm,
    showLoginForm,
    showEditForm
} = require("../controller/userController");

// View rendering routes
// Registration routes
router.get('/register', userController.showRegisterForm); 
router.post('/register/step1', userController.registerStepOne); // Process step 1 and show step 2
router.post('/register', userController.register); // Complete registration

router.get("/login", showLoginForm);
router.get("/:id/edit", showEditForm);

// API routes
router.post("/register", register);
router.post("/login", login);
router.get("/:id", getUserById);
router.put("/:id", updateUser);
router.get("/", getAllUsersList);

module.exports = router;
