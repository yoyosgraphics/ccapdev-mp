const { 
    createUser, 
    logInUser, 
    getUserID, 
    updateUserID, 
    getAllUsers 
} = require("../model/model");

// Show first registration page
const showRegisterForm = (req, res) => {
    res.render('views/register/page_one', { formData: {} });
};

// Process first registration step and show second page
const registerStepOne = (req, res) => {
    const { email_address, first_name, last_name } = req.body;
    // Validate first step data if needed
    
    // Render second page with data from first step
    res.render('views/register/page_two', { formData: req.body });
};

// Complete registration process
const register = async (req, res) => {
    const { email_address, first_name, last_name, username, password, confirm_password, picture_address, biography } = req.body;
    
    const result = await createUser(email_address, first_name, last_name, username, password, confirm_password, picture_address, biography);
    
    if (result.success) {
        res.redirect('/login?message=Registration successful');
    } else {
        res.render('views/register/page_two', { error: result.message, formData: req.body });
    }
};

// Log in User
const login = async (req, res) => {
    const { email_address, password } = req.body;
    
    const result = await logInUser(email_address, password);
    
    if (result.success) {
        req.session.user = result.user;
        res.redirect('views//home');
    } else {
        res.render('views/login/form', { error: result.message, email: email_address });
    }
};

// Render login form
const showLoginForm = (req, res) => {
    const message = req.query.message || '';
    res.render('views/login/form', { email: '', message: message });
};

// // Get User by ID (should view user profile) NOT DONE YET
const getUserById = async (req, res) => {
    try {
        const user = await getUserID(req.params.id);
        
        if (!user || user.length === 0) {
            return res.status(404).render('404', { message: 'User not found' });
        }
        
        res.render('views/user_profile', { user: user[0] });
    } catch (error) {
        res.status(500).render('error', { error: error.message });
    }
};

// Update User
const updateUser = async (req, res) => {
    try {
        const { first_name, last_name, username, biography, picture_address } = req.body;
        const updatedUser = await updateUserID(req.params.id, first_name, last_name, username, biography, picture_address);
        
        if (!updatedUser) {
            return res.status(404).render('404', { message: 'User not found' });
        }
        
        res.redirect(`/users/${req.params.id}?message=Profile updated successfully`);
    } catch (error) {
        res.status(500).render('profile/forms', { 
            error: error.message, 
            user: { 
                _id: req.params.id,
                ...req.body
            } 
        });
    }
};

// Render edit profile form
const showEditForm = async (req, res) => {
    try {
        const user = await getUserID(req.params.id);
        
        if (!user || user.length === 0) {
            return res.status(404).render('404', { message: 'User not found' });
        }
        
        res.render('views/edit_profile', { user: user[0] });
    } catch (error) {
        res.status(500).render('error', { error: error.message });
    }
};

// Get All Users
// const getAllUsersList = async (req, res) => {
//     try {
//         const users = await getAllUsers();
//         res.render('users', { users: users });
//     } catch (error) {
//         res.status(500).render('error', { error: error.message });
//     }
// };

module.exports = {
    register,
    registerStepOne,
    login,
    getUserById,
    updateUser,
    getAllUsersList,
    showRegisterForm,
    showLoginForm,
    showEditForm
};
