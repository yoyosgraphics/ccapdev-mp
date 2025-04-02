
# TopNotch Restaurant Review Application

A web application for discovering, reviewing, and rating restaurants. Users can create accounts, write reviews, and search for restaurants around the campus area.

## Live Demo

Visit our application at: [https://topnotch-b75b.onrender.com](https://topnotch-b75b.onrender.com)

## Features

- **View Establishments**: Browse through featured restaurants with ratings and descriptions
- **View Reviews**: Read detailed reviews with helpful/unhelpful votes
- **User Authentication**: Register, login, and logout functionality
- **User Profiles**: View and edit user profiles with avatars and descriptions
- **Review Management**: Create, edit, and delete reviews with media attachments
- **Comment Management**: Create, edit, and delete comments
- **Rating System**: Rate restaurants and mark reviews as helpful/unhelpful
- **Search Functionality**: Search for establishments or reviews by keywords
- **Establishment Owner Features**: Special accounts for restaurant owners to respond to reviews

## Technology Stack

- **Frontend**: HTML, CSS, JavaScript
- **Backend**: Node.js, Express.js
- **Database**: MongoDB Atlas
- **Templating**: Express Handlebars
- **Deployment**: Render

## Setup and Run Instructions (Local Development)

### Prerequisites
Before you begin, ensure you have the following installed:
- Node.js
- npm (comes with Node.js)
- MongoDB Compass (local installation)

### Installation
1. Clone the repository
   ```
   git clone https://github.com/yoyosgraphics/ccapdev-mp.git
   cd topnotch-restaurant-review
   ```
2. Install dependencies
   ```
   npm install express express-handlebars mongoose bcrypt express-session connect-mongodb-session cookie-parser
   ```

### Database Configuration
1. Create a `.env` file in the root directory with the following variables:
   ```
   MONGODB_URI=mongodb+srv://mrtnandya:QelTswFYEYyKPEVo@topnotch.tqmsmks.mongodb.net/restaurant-review-db
   SESSION_SECRET=your_secret_key
   PORT=3000
   DB_NAME=showcase
   ```

### Running the Application Locally
1. Start the Node.js server
   ```
   node app.js
   ```
   
2. Access the application in your browser at:
   ```
   http://localhost:3000
   ```

## Project Structure
```
├── controller/         # Application logic
├── model/              # Database models and schemas
│   └── data/           # Data for database initialization
├── public/             # Static files (CSS, JavaScript, images)
├── routes/             # Express routes
├── views/              # Handlebars templates
└── app.js              # Main application file
```

## Deployment

The application is deployed using the following services:
- **Web Hosting**: [Render](https://render.com)
- **Database**: [MongoDB Atlas](https://www.mongodb.com/atlas/database)

