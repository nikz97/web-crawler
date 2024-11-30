
import { Request, Response } from "express";
import { initializeCrawlerJob } from "./crawler.service";

export async function createCrawlerJob(
    req: Request,
    res: Response,
  ): Promise<void> {
    const crawlerRequest = req.body;
    const { url, userName, password ,authRequired } = crawlerRequest;

    const extractionJob = await initializeCrawlerJob(
      url,
      userName,
      password,
      authRequired
    );

    res.status(200);
    res.json({
      message: "Crawler job created successfully",
      extractionJob,
    });
}