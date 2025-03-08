const User = require('../model/User');
const bcrypt = require('bcrypt');

const userController = {
    // Show registration page
    getRegisterPageOne: (req, res) => {
        res.render('register/page_one', { error: req.flash('error'), formData: {} });
    },

    // Process registration page one
    processRegisterPageOne: async (req, res) => {
        try {
            const existingUser = await User.findOne({ 
                $or: [
                    { email_address: req.body.email_address },
                    { username: req.body.username }
                ]
            });

            if (existingUser) {
                req.flash('error', 'Email or username already exists');
                return res.redirect('/users/register');
            }

            // Store form data in session
            req.session.registrationData = {
                email_address: req.body.email_address,
                username: req.body.username,
                password: req.body.password,
            };

            res.render('register/page_two', { formData: req.session.registrationData });
        } catch (err) {
            console.error('Registration error:', err);
            req.flash('error', 'Error processing registration');
            return res.redirect('/users/register');
        }
    },

    // Complete registration
    completeRegistration: async (req, res) => {
        try {
            const userData = {
                ...req.session.registrationData,
                first_name: req.body.first_name,
                last_name: req.body.last_name,
                picture_address: req.body.picture_address || '',
                biography: req.body.biography || ''
            };

            // Hash password before saving
            userData.password = await bcrypt.hash(userData.password, 10);

            // Save new user
            const newUser = new User(userData);
            await newUser.save();

            // Clear session data
            delete req.session.registrationData;

            req.flash('success', 'Registration successful. You can now log in.');
            res.redirect('/users/login');
        } catch (err) {
            console.error('Registration error:', err);
            req.flash('error', 'Failed to complete registration');
            res.redirect('/users/register');
        }
    },

    // Show login form
    getLoginPage: (req, res) => {
        res.render('login/form', { error: req.flash('error') });
    },

    // Handle login
    loginUser: async (req, res) => {
        try {
            const user = await User.findOne({ username: req.body.username });

            if (!user || !(await bcrypt.compare(req.body.password, user.password))) {
                req.flash('error', 'Invalid username or password');
                return res.redirect('/users/login');
            }

            // Store user in session
            req.session.user = {
                id: user._id,
                username: user.username,
                isLoggedIn: true
            };

            res.redirect(`/users/profile/${user._id}`);
        } catch (err) {
            console.error('Login error:', err);
            req.flash('error', 'Failed to login');
            res.redirect('/users/login');
        }
    },

    // Show user profile
    getUserProfile: async (req, res) => {
        try {
            const user = await User.findById(req.params.userId);
            if (!user) {
                req.flash('error', 'User not found');
                return res.redirect('/users/login');
            }
            res.render('profile', { user });
        } catch (err) {
            console.error('Profile error:', err);
            res.render('error', { message: 'Could not retrieve profile' });
        }
    },

    // Show edit profile form
    getEditProfilePage: async (req, res) => {
        try {
            const user = await User.findById(req.params.userId);
            if (!user) {
                req.flash('error', 'User not found');
                return res.redirect('/users/login');
            }
            res.render('edit-profile', { user });
        } catch (err) {
            console.error('Profile edit error:', err);
            res.render('error', { message: 'Could not retrieve profile information' });
        }
    },

    // Update user profile
    updateUserProfile: async (req, res) => {
        try {
            const updatedUser = await User.findByIdAndUpdate(
                req.params.userId,
                {
                    first_name: req.body.first_name,
                    last_name: req.body.last_name,
                    biography: req.body.biography,
                    picture_address: req.body.picture_address
                },
                { new: true }
            );

            if (!updatedUser) {
                req.flash('error', 'User not found');
                return res.redirect(`/users/profile/${req.params.userId}/edit`);
            }

            res.redirect(`/users/profile/${updatedUser._id}`);
        } catch (err) {
            console.error('Profile update error:', err);
            req.flash('error', 'Failed to update profile');
            res.redirect(`/users/profile/${req.params.userId}/edit`);
        }
    },

    // Logout user
    logoutUser: (req, res) => {
        req.session.destroy((err) => {
            if (err) {
                console.error('Logout error:', err);
            }
            res.redirect('/users/login');
        });
    }
};

module.exports = userController;
