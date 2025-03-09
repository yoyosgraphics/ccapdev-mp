const { 
    createUser, 
    logInUser, 
    getUserID, 
    updateUserID 
} = require("../model/model");

// ========== REGISTRATION ==========

// Show registration form
const showRegisterForm = (req, res) => {
    res.render('register', { 
        formData: {}, 
        showPage: 'one',
        alerts: []
    });
};

// Process first registration step
const registerStepOne = (req, res) => {
    const { email_address, first_name, last_name } = req.body;
    
    // Basic validation
    if (!email_address || !first_name || !last_name) {
        return res.render('register', { 
            formData: req.body, 
            showPage: 'one',
            alerts: [{ type: 'error', message: 'All fields are required' }]
        });
    }
    
    // Render second registration step
    res.render('register', { 
        formData: req.body, 
        showPage: 'two',
        alerts: []
    });
};

// Complete registration process
const register = async (req, res) => {
    const { email_address, first_name, last_name, username, password, confirm_password, picture_address, biography } = req.body;
    
    const result = await createUser(email_address, first_name, last_name, username, password, confirm_password, picture_address, biography);
    
    if (result.success) {
        res.redirect('/login?alert=success&message=' + encodeURIComponent('Registration successful! Please log in.'));
    } else {
        res.render('register', { 
            formData: req.body, 
            showPage: 'two',
            alerts: [{ type: 'error', message: result.message }]
        });
    }
};

// ========== LOGIN ==========

// Show login form
const showLoginForm = (req, res) => {
    // Get alert from query parameters if present
    const alerts = [];
    if (req.query.alert && req.query.message) {
        alerts.push({ type: req.query.alert, message: req.query.message });
    }
    
    res.render('login', { 
        email: '',
        alerts: alerts
    });
};

// Process login
const login = async (req, res) => {
    const { email_address, password } = req.body;
    
    const result = await logInUser(email_address, password);
    
    if (result.success) {
        req.session.user = result.user;
        res.redirect('/home?alert=success&message=' + encodeURIComponent('You are now logged in'));
    } else {
        res.render('login', { 
            email: email_address,
            alerts: [{ type: 'error', message: result.message || 'Invalid credentials' }]
        });
    }
};

// Logout user
const logout = (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Error destroying session:', err);
        }
        res.redirect('/login?alert=success&message=' + encodeURIComponent('You have been logged out'));
    });
};

// ========== VIEW PROFILE ==========

// View user profile by ID
const getUserById = async (req, res) => {
    try {
        const user = await getUserID(req.params.id);
        
        if (!user || user.length === 0) {
            return res.status(404).render('404', { 
                message: 'User not found',
                alerts: [{ type: 'error', message: 'User not found' }]
            });
        }
        
        const alerts = [];
        if (req.query.alert && req.query.message) {
            alerts.push({ type: req.query.alert, message: req.query.message });
        }
        
        res.render('user_profile', { 
            user: user[0],
            alerts: alerts
        });
    } catch (error) {
        res.status(500).render('error', { 
            error: error.message,
            alerts: [{ type: 'error', message: error.message }]
        });
    }
};

// ========== EDIT PROFILE DETAILS ==========

// Show edit profile form
const showEditForm = async (req, res) => {
    try {
        const user = await getUserID(req.params.id);
        
        if (!user || user.length === 0) {
            return res.status(404).render('404', { 
                message: 'User not found',
                alerts: [{ type: 'error', message: 'User not found' }]
            });
        }
        
        res.render('edit_profile', { 
            user: user[0],
            alerts: []
        });
    } catch (error) {
        res.status(500).render('error', { 
            error: error.message,
            alerts: [{ type: 'error', message: error.message }]
        });
    }
};

// Update user profile
const updateUser = async (req, res) => {
    try {
        const { first_name, last_name, username, biography, picture_address } = req.body;
        const updatedUser = await updateUserID(req.params.id, first_name, last_name, username, biography, picture_address);
        
        if (!updatedUser) {
            return res.status(404).render('404', { 
                message: 'User not found',
                alerts: [{ type: 'error', message: 'User not found' }]
            });
        }
        
        res.redirect(`/users/${req.params.id}?alert=success&message=` + encodeURIComponent('Profile updated successfully'));
    } catch (error) {
        res.status(500).render('edit_profile', { 
            error: error.message, 
            user: { 
                _id: req.params.id,
                ...req.body
            },
            alerts: [{ type: 'error', message: error.message }]
        });
    }
};

module.exports = {
    showRegisterForm,
    registerStepOne,
    register,
    showLoginForm,
    login,
    logout,
    getUserById,
    showEditForm,
    updateUser
};