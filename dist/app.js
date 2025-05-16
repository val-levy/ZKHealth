"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
const medrecRoutes_1 = require("./routes/medrecRoutes");
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3000;
// Middleware
app.use(body_parser_1.default.json());
app.use(body_parser_1.default.urlencoded({ extended: true }));
// Routes
(0, medrecRoutes_1.setMedrecRoutes)(app);
// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
