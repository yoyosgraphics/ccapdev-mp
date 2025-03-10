const { 
    createUser, 
    logInUser, 
    getUserID, 
    updateUserID 
} = require("../model/model");
console.log("User Controller");
// ========== REGISTRATION ==========

// Show registration form
const showRegisterForm = (req, res) => {
    // For the initial form display
    res.render('register', {
        formData: {},
        showPage: true,
        showPageTwo: false,
        logged_in: false,
        show_auth: false,
        alerts: []
    });
};

const registerStepOne = async (req, res) => {
    try {
        const { email_address, first_name, last_name, username, password, confirm_password } = req.body;
        
        // Check if any required fields are missing
        if (!email_address || !first_name || !last_name || !username || !password || !confirm_password) {
            return res.render('register', { 
                formData: req.body,
                showPage: true,
                showPageTwo: false,
                logged_in: false,
                show_auth: false,
                alerts: [{ type: 'error', message: 'All fields are required' }]
            });
        }
        
        // Optional: Basic validation
        if (password !== confirm_password) {
            return res.render('register', { 
                formData: req.body,
                showPage: true,
                showPageTwo: false,
                logged_in: false,
                show_auth: false,
                alerts: [{ type: 'error', message: 'Passwords do not match' }]
            });
        }
        
        // If validation passes, show step two with the form data
        res.render('register', { 
            formData: req.body,
            showPage: false,
            showPageTwo: true,
            logged_in: false,
            show_auth: false,
            alerts: []
        });
    } catch (error) {
        console.error("Registration step one error:", error);
        res.render('register', { 
            formData: req.body,
            showPage: true,
            showPageTwo: false,
            logged_in: false,
            show_auth: false,
            alerts: [{ type: 'error', message: 'An error occurred during form processing' }]
        });
    }
};

// Final Registration Handler - Your existing function with minor improvements
const register = async (req, res) => {
    try {
        const { email_address, first_name, last_name, username, password, confirm_password, biography } = req.body;
        console.log("Request body:", req.body);
        console.log("Uploaded file:", req.file);
        
        // Check if any required fields are missing
        if (!email_address || !first_name || !last_name || !username || !password || !confirm_password) {
            return res.render('register', { 
                formData: req.body,
                showPage: false,
                showPageTwo: true,
                logged_in: false,
                show_auth: false,
                alerts: [{ type: 'error', message: 'Missing required information' }]
            });
        }
        
        // Pass the file object directly, not the path
        const result = await createUser(
            email_address, 
            first_name, 
            last_name, 
            username, 
            password, 
            confirm_password, 
            req.file, // Pass the file object, not a path
            biography
        );
        
        if (result.success) {
            res.redirect('/login?alert=success&message=' + encodeURIComponent('Registration successful! Please log in.'));
        } else {
            res.render('register', { 
                formData: req.body,
                showPage: false,
                showPageTwo: true,
                logged_in: false,
                show_auth: false,
                alerts: [{ type: 'error', message: result.message }]
            });
        }
    } catch (error) {
        console.error("Registration error:", error);
        res.render('register', { 
            formData: req.body,
            showPage: false,
            showPageTwo: true,
            logged_in: false,
            show_auth: false,
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
        logged_in: false,
        show_auth: false,
        user: req.session.user || null
    });
};

// Process login
const login = async (req, res) => {
    const { email_address, password } = req.body;
    
    try {
        console.log("Login attempt with:", email_address);
        const result = await logInUser(email_address, password);
        console.log("Login result:", result);
        
        if (result.success && result.user) {
            // Store user in session with consistent ID handling
            const userId = result.user._id || result.user.id;
            
            req.session.user = {
                _id: userId ? userId.toString() : null,
                username: result.user.username,
                email_address: result.user.email_address,
                first_name: result.user.first_name,
                last_name: result.user.last_name,
                picture_address: result.user.picture_address,
                biography: result.user.biography
            };
            
            req.session.isProfileOwner = true;
            
            console.log("User set in session:", req.session.user);
            
            req.session.save((err) => {
                if (err) {
                    console.error("Error saving session:", err);
                    return res.render('login', { 
                        email: email_address,
                        alerts: [{ type: 'error', message: 'Error saving session' }],
                        logged_in: false,
                        show_auth: false,
                        user: null
                    });
                }
                
                console.log("Session saved, redirecting to user profile");
                
                return res.redirect(`/profile/${req.session.user._id}?alert=success&message=` + encodeURIComponent('You are now logged in'));
            });
        } else {
            // Render login page with error
            return res.render('login', { 
                email: email_address,
                alerts: [{ type: 'error', message: result.message || 'Invalid credentials' }],
                logged_in: false,
                show_auth: false,
            });
        }
    } catch (error) {
        console.error("Login error:", error);
        return res.render('login', { 
            email: email_address,
            alerts: [{ type: 'error', message: 'An error occurred during login' }],
            logged_in: false,
            show_auth: false,
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
            isOwnProfile: true, // hardcoded for now
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
    updateUser,
    getUserById
};