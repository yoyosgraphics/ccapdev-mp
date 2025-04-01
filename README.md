# TopNotch Restaurant Review Application

A web application for discovering, reviewing, and rating restaurants. Users can create accounts, write reviews, leave comments, and search for restaurants.

## Setup and Run Instructions

### Prerequisites

Before you begin, ensure you have the following installed:

- Node.js
- npm (comes with Node.js)
- MongoDB (local installation)

### Installation

1. Clone the repository

   ```
   git clone https://github.com/yoyosgraphics/ccapdev-mp.git
   cd topnotch-restaurant-review
   ```

2. Install dependencies

   ```
   npm install express express-handlebars mongoose bcrypt express-session fs path connect-mongodb-session cookie-parser
   ```
### Database Set-Up

1. Make sure MongoDB is running on your machine

2. Using MongoDB Compass and its default connection settings, connect and create a new database `restaurant-review-db`

3. Under this database, import the JSON files found under the `model/data` folder and rename the collections with respect to the given file names

### Running the Application

1. Start the Node.js server

   ```
   node app.js
   ```

2. Access the application in your browser at:
   ```
   http://localhost:3000
   ```

## Features

- User Authentication
- Restaurant Listings
- Restaurant Search
- Reviews
- Comments
- User Profiles

## Project Structure

```
├── controller/         # Application logic
├── model/              # Database models
├── public/             # Static files
├── routes/             # Express routes
├── views/              # Templates
└── app.js              # Main application file
```
