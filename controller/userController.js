const { 
    createUser, 
    logInUser, 
    getUserID, 
    updateUserID, 
    getAllUsers 
} = require("../model/model");

// Show first registration page
const showRegisterForm = (req, res) => {
    res.render('register', { 
        formData: {}, 
        showPage: 'one',
        messages: req.flash() 
    });
};

// Process first registration step and show second page
const registerStepOne = (req, res) => {
    const { email_address, first_name, last_name } = req.body;
    
    // Basic validation
    if (!email_address || !first_name || !last_name) {
        req.flash('error', 'All fields are required');
        return res.render('register', { 
            formData: req.body, 
            showPage: 'one',
            messages: req.flash()
        });
    }
    
    // Render register page with second step visible
    res.render('register', { 
        formData: req.body, 
        showPage: 'two',
        messages: req.flash()
    });
};

// Complete registration process
const register = async (req, res) => {
    const { email_address, first_name, last_name, username, password, confirm_password, picture_address, biography } = req.body;
    
    const result = await createUser(email_address, first_name, last_name, username, password, confirm_password, picture_address, biography);
    
    if (result.success) {
        req.flash('success', 'Registration successful! Please log in.');
        res.redirect('/login');
    } else {
        req.flash('error', result.message);
        res.render('register', { 
            formData: req.body, 
            showPage: 'two',
            messages: req.flash()
        });
    }
};

// Log in User
const login = async (req, res) => {
    const { email_address, password } = req.body;
    
    const result = await logInUser(email_address, password);
    
    if (result.success) {
        req.session.user = result.user;
        req.flash('success', 'You are now logged in');
        res.redirect('/home');
    } else {
        req.flash('error', result.message || 'Invalid credentials');
        res.render('login', { 
            email: email_address,
            messages: req.flash() 
        });
    }
};

// Render login form
const showLoginForm = (req, res) => {
    res.render('login', { 
        email: '',
        messages: req.flash() 
    });
};

// Get User by ID (view user profile)
const getUserById = async (req, res) => {
    try {
        const user = await getUserID(req.params.id);
        
        if (!user || user.length === 0) {
            req.flash('error', 'User not found');
            return res.status(404).render('404', { 
                message: 'User not found',
                messages: req.flash()
            });
        }
        
        res.render('user_profile', { 
            user: user[0],
            messages: req.flash()
        });
    } catch (error) {
        req.flash('error', error.message);
        res.status(500).render('error', { 
            error: error.message,
            messages: req.flash()
        });
    }
};

// Update User
const updateUser = async (req, res) => {
    try {
        const { first_name, last_name, username, biography, picture_address } = req.body;
        const updatedUser = await updateUserID(req.params.id, first_name, last_name, username, biography, picture_address);
        
        if (!updatedUser) {
            req.flash('error', 'User not found');
            return res.status(404).render('404', { 
                message: 'User not found',
                messages: req.flash()
            });
        }
        
        req.flash('success', 'Profile updated successfully');
        res.redirect(`/users/${req.params.id}`);
    } catch (error) {
        req.flash('error', error.message);
        res.status(500).render('edit_profile', { 
            error: error.message, 
            user: { 
                _id: req.params.id,
                ...req.body
            },
            messages: req.flash()
        });
    }
};

// Render edit profile form
const showEditForm = async (req, res) => {
    try {
        const user = await getUserID(req.params.id);
        
        if (!user || user.length === 0) {
            req.flash('error', 'User not found');
            return res.status(404).render('404', { 
                message: 'User not found',
                messages: req.flash()
            });
        }
        
        res.render('edit_profile', { 
            user: user[0],
            messages: req.flash()
        });
    } catch (error) {
        req.flash('error', error.message);
        res.status(500).render('error', { 
            error: error.message,
            messages: req.flash()
        });
    }
};

// Get All Users
const getAllUsersList = async (req, res) => {
    try {
        const users = await getAllUsers();
        res.render('users', { 
            users: users,
            messages: req.flash()
        });
    } catch (error) {
        req.flash('error', error.message);
        res.status(500).render('error', { 
            error: error.message,
            messages: req.flash()
        });
    }
};

// Logout user
const logout = (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Error destroying session:', err);
        }
        req.flash('success', 'You have been logged out');
        res.redirect('/login');
    });
};

module.exports = {
    register,
    registerStepOne,
    login,
    getUserById,
    updateUser,
    getAllUsersList,
    showRegisterForm,
    showLoginForm,
    showEditForm,
    logout
};