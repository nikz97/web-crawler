import express, { Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import CONFIG from "./config/index.js";
import logger from "./utils/logger.js";
import getDb  from "./services/mongodb.js";
import { CrawlerRoutes } from "./crawler/crawler.routes.js";
import { BullBoard } from "./services/bullmq.js";
dotenv.config();

const app = express(); 

// Body Parser middleware
app.use(express.json({ limit: "5mb" }));
app.use(
  express.urlencoded({
    extended: true,
    limit: "5mb",
  }),
);

// Cors
const whitelist: string[] = CONFIG.WHITELIST.split(",");
app.use(
  cors({
    origin: function (
      origin: string | undefined,
      callback: (err: Error | null, allow?: boolean) => void,
    ) {
    //   logger.debug(`Origin for request: ${origin}`);
      if (!origin || whitelist.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`Not allowed by CORS: ${origin}`));
      }
    },
  }),
);

CrawlerRoutes(app);

BullBoard(app);

// Will be removed later. Kept for testing.
app.get("/", (req: Request, res: Response) => {
    res.send("Hey! How you doing"); // Placeholder
  });

(async () => {
    // Initialise Mongo
    await getDb();
    app.listen(CONFIG.PORT || 3000, () =>
      logger.log("info", `Started listening on port:${CONFIG.PORT || 3000}`),
    );
  })();