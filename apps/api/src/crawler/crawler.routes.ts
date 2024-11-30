import express from "express";
import { createCrawlerJob } from "./crawler.controller";


const ROUTE_BASE = "/api/v1/crawler";

export const CrawlerRoutes = (app: express.Application) => {
    // TODO: Add routes here
    app.post(`${ROUTE_BASE}/schedule`, createCrawlerJob);
    return app;
}