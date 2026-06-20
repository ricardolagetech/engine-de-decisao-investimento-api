import "dotenv/config";
import express from "express";
import swaggerUi from "swagger-ui-express";
import swaggerSpec from "./config/swagger.js";
import authRoutes from "./routes/auth.routes.js";
import cdiRoutes from "./routes/cdi.routes.js";
import simulationRoutes from "./routes/simulation.routes.js";
import savedSimulationRoutes from "./routes/savedSimulation.routes.js";
import { errorMiddleware } from "./middlewares/error.middleware.js";

const app = express();

app.use(express.json());

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use("/auth", authRoutes);
app.use("/cdi", cdiRoutes);
app.use("/simulacoes", simulationRoutes);
app.use("/simulacoes", savedSimulationRoutes);

app.use(errorMiddleware);

export default app;
