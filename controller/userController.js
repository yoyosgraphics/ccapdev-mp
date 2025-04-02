const db = require("../model/model");
console.log("User Controller");

// ========== REGISTRATION ==========
const showRegisterForm = (req, res) => {
    const alerts = [];
    if (req.query.alert && req.query.message) {
        alerts.push({ type: req.query.alert, message: req.query.message });
    }

    res.render('register', {
        layout: 'index',
        title: 'TopNotch - SignUp Page',
        formData: {},
        showPage: true,
        showPageTwo: false,
        logged_in: false,
        show_auth: false,
       });
};

const registerOne = async (req, res) => {
    console.log("FULL REGISTRATION REQUEST:", req.body);
    try {
    const { 
        email_address,
        first_name,
        last_name,
        username,
        password,
        confirm_password,
    } = req.body;   

        // Validate if first page is not empty
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
        // Validate unique username
        const isUsernameAvailable = await db.verifyUsername(username);
        if (!isUsernameAvailable) {
            return res.render('register', { 
                formData: req.body,
                showPage: true,
                showPageTwo: false,
                logged_in: false,
                show_auth: false,
                alerts: [{ type: 'error', message: 'Username is already taken' }]
            });
        }

        // Validate unique email
        const isEmailAvailable = await db.verifyEmail(email_address);
        if (!isEmailAvailable) {
            return res.render('register', { 
                formData: req.body,
                showPage: true,
                showPageTwo: false,
                logged_in: false,
                show_auth: false,
                alerts: [{ type: 'error', message: 'Email is already registered' }]
            });
        }    
        // Validate if password and confirm password matches
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
            //if validations r successful go to page two
            res.render('register', { 
                formData: req.body,
                showPage: false,
                showPageTwo: true,
                logged_in: false,
                show_auth: false,
                alerts: []
            });
            
    } catch (error) {
        console.error('REGISTRATION PROCESS ERROR:', error);
        
        // Handle different types of errors
        return res.render('register', {
            layout: 'index',
            title: 'TopNotch - SignUp Page',
            formData: req.body,
            showPage: true,
            showPageTwo: false,
            logged_in: false,
            show_auth: false,
            alerts: [{ type: 'error', message: 'An error occurred during form processing' }]
        });
    }
};

const register = async (req, res) => {
    try {
        const { email_address, first_name, last_name, username, password, confirm_password, profile_image_path, biography } = req.body;

            await db.createUser(
            email_address,
            first_name,
            last_name,
            username,
            password,
            confirm_password,
            profile_image_path,  
            biography
            );
        
        res.redirect('/users/login?alert=success&message=' + encodeURIComponent('Registration successful! Please log in.'));

    } catch (error) {
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
const showLoginForm = (req, res) => {
    const alerts = [];
    if (req.query.alert && req.query.message) {
        alerts.push({ type: req.query.alert, message: req.query.message });
    }
    
    res.render('login', { 
        layout: 'index',
        title: 'TopNotch - Login Page',
        formData:{},
        alerts: alerts,
        logged_in: false,
        show_auth: false,
        user: req.session.user || null
    });
};

// Process login
const login = async (req, res) => {
    try {
        const { email_address, password, remember } = req.body;
        const existingUser = await db.logInUser(email_address, password);

    if (!existingUser) {
    console.log("Invalid email or missing password in database");
    return res.render('login', { 
        alerts: [{ type: 'error', message: 'Invalid email or password' }],
        isLoggedIn: false,
        logged_in: false,
        show_auth: true,
        user: null
        }); 
    }
        // User session object
        const userForSession = {
            _id: existingUser.user._id.toString(), // Convert _id to a string
            username: existingUser.user.username || '',
            email_address: existingUser.user.email_address || '',
            first_name: existingUser.user.first_name || '',
            last_name: existingUser.user.last_name || '',
            picture_address: existingUser.user.picture_address || '',
            biography: existingUser.user.biography || ''
        };

        // Assign to session
        req.session.user = userForSession;
        req.session.isProfileOwner = await db.checkUserProfileOwner(existingUser.user._id, existingUser.user._id);

        console.log("User set in session:", req.session.user);
        console.log("Is profile owner:", req.session.isProfileOwner);

        // Remember me checkbox
        if (remember) {
            req.session.cookie.maxAge = 14 * 24 * 60 * 60 * 1000; // 14 days
        } else {
            req.session.cookie.maxAge = 60 * 60 * 1000; // 1 hour
            req.session._expires = new Date(Date.now() + 60 * 60 * 1000);
        }

        // Save session
        return new Promise((resolve, reject) => {
            req.session.save((err) => {
                if (err) {
                    console.error("Error saving session:", err);
                    reject(err);
                } else {
                    console.log("Session saved successfully");
                    resolve();
                }
            });
        })
        .then(() => {
            console.log("Redirecting to user profile:", `/users/${existingUser.user._id}`);
            return res.redirect(`/users/${existingUser.user._id}`);
        })
        .catch((saveErr) => {
            console.error("Session save error:", saveErr);
            return res.render('login', { 
                email: email_address,
                alerts: [{ type: 'error', message: 'Error saving session' }],
                isLoggedIn: false,
                logged_in: false,
                show_auth: true,
                user: null
            });
        });

    } catch (error) {
        console.error("Login error:", error);
        return res.render('login', { 
            formData: req.body,
            alerts: [{ type: 'error', message: 'An error occurred during login' }],
            isLoggedIn: false,
            logged_in: false,
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
            return res.redirect('/?alert=error&message=' + encodeURIComponent('Error during logout'));
        }
        res.clearCookie('connect.sid');
        res.redirect('/?logged_in=false&show_auth=true');
    });
};

// ========== VIEW PROFILE ==========

// View user profile by ID
const getUserById = async (req, res) => {
    try {
        console.log("Fetching user with ID:", req.params.id);
        const user = await db.getUserID(req.params.id);
        
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
            selected: req.query.selected || 'reviews', 
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
        const user = await db.getUserID(req.params.id);
        
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
        const { first_name, last_name, username, biography, picture_address } = req.body;
        const user_id = req.params.id;

        if (username !== req.session.user.username) {
            const isUnique = await db.verifyUsername(username);
            if (!isUnique) {
                return res.render('edit_profile', { 
                    user: { _id: user_id, ...req.body },
                    logged_in: !!req.session.user,
                    show_auth: !req.session.user,
                    alerts: [{ type: 'error', message: 'Username already taken. Please choose another one.' }]
                });
            }
        }

        const updatedUser = await db.updateUserID(user_id, first_name, last_name, username, biography, picture_address);
        
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
        
        res.redirect(`/users/${req.params.id}`);
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
    registerOne,
    register,
    showLoginForm,
    login,
    logout,
    getUserById,
    showEditForm,
    updateUser,
};
