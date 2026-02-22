import express from "express";

const app = express();

// Start the server and connect to the database
app.listen(ENV.PORT, () => {
    console.log("Server is running on http://localhost:" + ENV.PORT);
    connectDB();
});