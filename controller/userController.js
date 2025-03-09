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
        showPage: true,
        showPageTwo: false,
        alerts: []
    });
};

const registerStepOne = (req, res) => {
    const { email_address, first_name, last_name, username, password, confirm_password } = req.body;
    
    // Basic validation
    if (!email_address || !first_name || !last_name || !username || !password || !confirm_password) {
        return res.render('register', { 
            formData: req.body, 
            showPage: true, // Added this line
            showPageTwo: false,
            alerts: [{ type: 'error', message: 'All fields are required' }]
        });
    }
    
    // Additional validation can be added here (password matching, email format, etc.)
    if (password !== confirm_password) {
        return res.render('register', { 
            formData: req.body,
            showPage: true, // Added this line
            showPageTwo: false,
            alerts: [{ type: 'error', message: 'Passwords do not match' }]
        });
    }
    
    // Render second registration step
    res.render('register', { 
        formData: req.body,
        showPage: false, // Added this line to hide first step
        showPageTwo: true,
        alerts: []
    });
};

// Complete registration process
const register = async (req, res) => {
    try {
        const { email_address, first_name, last_name, username, password, confirm_password, picture_address, biography } = req.body;
        
        // Check if any required first-step fields are missing
        if (!email_address || !first_name || !last_name || !username || !password || !confirm_password) {
            return res.render('register', { 
                formData: req.body,
                showPage: false, // Added this line 
                showPageTwo: true,
                alerts: [{ type: 'error', message: 'Missing required information' }]
            });
        }
        
        const result = await createUser(email_address, first_name, last_name, username, password, confirm_password, picture_address, biography);
        
        if (result.success) {
            res.redirect('/login?alert=success&message=' + encodeURIComponent('Registration successful! Please log in.'));
        } else {
            res.render('register', { 
                formData: req.body,
                showPage: false, // Added this line
                showPageTwo: true,
                alerts: [{ type: 'error', message: result.message }]
            });
        }
    } catch (error) {
        console.error("Registration error:", error);
        res.render('register', { 
            formData: req.body,
            showPage: false, // Added this line
            showPageTwo: true,
            alerts: [{ type: 'error', message: 'An error occurred during registration' }]
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
        alerts: alerts,
        logged_in: !!req.session.user,
        show_auth: !req.session.user,
        user: req.session.user || null
    });
};

// Process login
const login = async (req, res) => {
    const { email_address, password } = req.body;
    
    try {
        console.log("Login attempt with:", email_address); // Debug logging
        
        const result = await logInUser(email_address, password);
        
        console.log("Login result:", result); // Debug logging
        
        if (result.success && result.user) { // Added check for result.user
            // Store user in session
            // Convert MongoDB ObjectId to string to avoid serialization issues
            const userToStore = {...result.user};
            
            // Ensure _id is stored as a string
            if (userToStore._id) {
                if (typeof userToStore._id === 'object' && userToStore._id.toString) {
                    userToStore._id = userToStore._id.toString();
                } else if (typeof userToStore._id === 'object' && userToStore._id.$oid) {
                    userToStore._id = userToStore._id.$oid;
                }
            }
            
            req.session.user = userToStore;
            
            // Log session state for debugging
            console.log("User set in session:", req.session.user);
            
            // Redirect to home page after successful login
            return res.redirect('/?alert=success&message=' + encodeURIComponent('You are now logged in'));
        } else {
            // Render login page with error
            return res.render('login', { 
                email: email_address,
                alerts: [{ type: 'error', message: result.message || 'Invalid credentials' }],
                logged_in: false, // Added these missing properties
                show_auth: true,
                user: null
            });
        }
    } catch (error) {
        console.error("Login error:", error);
        return res.render('login', { 
            email: email_address,
            alerts: [{ type: 'error', message: 'An error occurred during login' }],
            logged_in: false, // Added these missing properties
            show_auth: true,
            user: null
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
        console.log("Fetching user with ID:", req.params.id);
        const user = await getUserID(req.params.id);
        
        if (!user || !Array.isArray(user) || user.length === 0) {
            console.log("User not found:", req.params.id);
            return res.status(404).render('404', { 
                message: 'User not found',
                logged_in: !!req.session.user,
                show_auth: !req.session.user,
                alerts: [{ type: 'error', message: 'User not found' }]
            });
        }
        
        console.log("User found:", user[0]);
        
        const alerts = [];
        if (req.query.alert && req.query.message) {
            alerts.push({ type: req.query.alert, message: req.query.message });
        }
        
        // Check if the profile belongs to the logged-in user
        // Ensure we're comparing strings to handle ObjectId cases
        const loggedInUserId = req.session.user && req.session.user._id ? req.session.user._id.toString() : '';
        const profileUserId = user[0]._id ? user[0]._id.toString() : '';
        const isOwnProfile = !!req.session.user && loggedInUserId === profileUserId;
        
        console.log("Profile comparison:", {
            loggedInUserId,
            profileUserId,
            isOwnProfile
        });
        
        res.render('user_profile', { 
            user: user[0],
            viewing_user: req.session.user || null,
            logged_in: !!req.session.user,
            show_auth: !req.session.user,
            isOwnProfile: isOwnProfile,
            selected: req.query.selected || 'reviews', // Default selected tab
            alerts: alerts
        });
    } catch (error) {
        console.error("Error fetching user profile:", error);
        res.status(500).render('error', { 
            error: error.message,
            logged_in: !!req.session.user,
            show_auth: !req.session.user,
            alerts: [{ type: 'error', message: error.message }]
        });
    }
};

// ========== EDIT PROFILE DETAILS ==========

// Show edit profile form
const showEditForm = async (req, res) => {
    try {
        const user = await getUserID(req.params.id);
        
        if (!user || !Array.isArray(user) || user.length === 0) {
            return res.status(404).render('404', { 
                message: 'User not found',
                logged_in: !!req.session.user,
                show_auth: !req.session.user,
                alerts: [{ type: 'error', message: 'User not found' }]
            });
        }
        
        // Check if the logged-in user is the owner of this profile
        const loggedInUserId = req.session.user ? (req.session.user._id || '').toString() : '';
        const profileUserId = (user[0]._id || '').toString();
        
        if (loggedInUserId !== profileUserId) {
            return res.status(403).render('error', {
                error: 'You do not have permission to edit this profile',
                logged_in: !!req.session.user,
                show_auth: !req.session.user,
                alerts: [{ type: 'error', message: 'You do not have permission to edit this profile' }]
            });
        }
        
        res.render('edit_profile', { 
            user: user[0],
            logged_in: !!req.session.user,
            show_auth: !req.session.user,
            alerts: []
        });
    } catch (error) {
        console.error("Error fetching user for edit:", error);
        res.status(500).render('error', { 
            error: error.message,
            logged_in: !!req.session.user,
            show_auth: !req.session.user,
            alerts: [{ type: 'error', message: error.message }]
        });
    }
};

// Update user profile
const updateUser = async (req, res) => {
    try {
        // Check if the logged-in user is the owner of this profile
        const loggedInUserId = req.session.user ? (req.session.user._id || '').toString() : '';
        const profileUserId = (req.params.id || '').toString();
        
        if (loggedInUserId !== profileUserId) {
            return res.status(403).render('error', {
                error: 'You do not have permission to update this profile',
                logged_in: !!req.session.user,
                show_auth: !req.session.user,
                alerts: [{ type: 'error', message: 'You do not have permission to update this profile' }]
            });
        }
        
        const { first_name, last_name, username, biography, picture_address } = req.body;
        
        // Validate required fields
        if (!first_name || !last_name || !username) {
            const user = await getUserID(req.params.id);
            return res.render('edit_profile', {
                user: user[0] || { _id: req.params.id, ...req.body },
                logged_in: !!req.session.user,
                show_auth: !req.session.user,
                alerts: [{ type: 'error', message: 'First name, last name, and username are required' }]
            });
        }
        
        const updatedUser = await updateUserID(req.params.id, first_name, last_name, username, biography, picture_address);
        
        if (!updatedUser) {
            return res.status(404).render('404', { 
                message: 'User not found',
                logged_in: !!req.session.user,
                show_auth: !req.session.user,
                alerts: [{ type: 'error', message: 'User not found' }]
            });
        }
        
        // Update the session with the new user data
        if (req.session.user && req.session.user._id === req.params.id) {
            req.session.user = {
                ...req.session.user,
                first_name,
                last_name,
                username,
                biography,
                picture_address: picture_address || req.session.user.picture_address
            };
        }
        
        res.redirect(`/users/${req.params.id}?alert=success&message=` + encodeURIComponent('Profile updated successfully'));
    } catch (error) {
        console.error("Error updating user:", error);
        res.status(500).render('edit_profile', { 
            user: { 
                _id: req.params.id,
                ...req.body
            },
            logged_in: !!req.session.user,
            show_auth: !req.session.user,
            alerts: [{ type: 'error', message: error.message || 'An error occurred while updating the profile' }]
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