const express = require("express");
const cors = require("cors");
const ApiError = require("./app/api-error"); 

const productsRouter = require("./app/routes/product.route");
const adminsRouter = require("./app/routes/adminAuth.route");
const usersRouter = require("./app/routes/user.routes");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.json({ message: "Welcome to ecommerce application." });
});

app.use("/api/products", productsRouter);
app.use("/api/admins", adminsRouter);
app.use("/api/users", usersRouter);

app.use((req, res, next) => {
    return next(new ApiError(404, "Resource not found"));
});

app.use((err, req, res, next) => {
    return res.status(err.statusCode || 500).json({
        message: err.message || "Internal Server Error",
    });
});

module.exports = app;
