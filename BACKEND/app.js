const express = require("express");
const cors = require("cors");
const ApiError = require("./app/api-error"); 
const paymentRoute = require("./app/routes/payment.route");
const productsRouter = require("./app/routes/product.route");
const adminsRouter = require("./app/routes/adminAuth.route");
const usersRouter = require("./app/routes/user.routes");
const cartRouter = require("./app/routes/cart.route"); 
const orderRouter = require("./app/routes/order.route");
const chatbotRoute = require("./app/routes/chatbot.route");
const reviewRoute = require("./app/routes/review.route");
const statisticRouter = require("./app/routes/statistic.route");
const recommendationRouter = require("./app/routes/recommendation.router");

const app = express();

app.use(cors());
app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ limit: "20mb", extended: true }));

app.get("/", (req, res) => {
    res.json({ message: "Welcome to ecommerce application." });
});
app.use("/api/payment", paymentRoute);
app.use("/api/products", productsRouter);
app.use("/api/admins", adminsRouter);
app.use("/api/users", usersRouter);
app.use("/api/cart", cartRouter); 
app.use("/api/orders", orderRouter); 
app.use("/api/chatbot", chatbotRoute);
app.use("/api/products/:productId/reviews", reviewRoute);
app.use("/api/statistics", statisticRouter);
app.use("/api/recommendations", recommendationRouter);

app.use((req, res, next) => {
    return next(new ApiError(404, "Resource not found"));
});

app.use((err, req, res, next) => {
    return res.status(err.statusCode || 500).json({
        message: err.message || "Internal Server Error",
    });
});

module.exports = app;
