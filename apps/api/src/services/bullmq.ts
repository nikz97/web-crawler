import CONFIG from "../config/index.js";
import logger from "../utils/logger.js";
import { JOBS, QUEUE, WORKER } from "../config/constants.js";

import { Queue, Worker, WorkerOptions, Job } from "bullmq";
import { Redis } from "ioredis";
import express from "express";
import { ExpressAdapter } from "@bull-board/express";
import { BullMQAdapter } from "@bull-board/api/bullMQAdapter.js";
import { createBullBoard } from "@bull-board/api";
import { initiateCrawlerJob } from "../crawler/crawler.worker.js";

// Redis connection setup
const redisUrl: string =
  CONFIG.NODE_ENV === "local" ? "redis://localhost:6379" : CONFIG.REDIS_URL;
logger.debug(`Redis URL: ${redisUrl}`);

const connection = new Redis(redisUrl, {
  maxRetriesPerRequest: null,
  connectTimeout: 10000,
});

// Add an error listener to handle possible connection errors
connection.on("error", (err) => {
  logger.error(`Redis connection error: ${err}`);
});

/** Result of a worker job processing. */
export interface WorkerResult {
  data?: any;
  error?: {
    message: any;
    type: string;
    rateLimitTimeout?: number;
  };
}

/** Custom options for worker creation, extending WorkerOptions */
type CustomWorkerOptions = WorkerOptions & {
  rateLimitMax?: number;
  rateLimitInterval?: number;
};

/** Creates a new BullMQ queue. */
export const createQueue = (queueName: string): Queue => {
  const queue = new Queue(queueName, { connection });
  logger.debug(`Created queue: ${queueName}`);
  return queue;
};

/** Creates a new BullMQ worker with optional custom options. */
export const createWorker = (
  queueName: string,
  processFunction: (job: Job) => Promise<WorkerResult>,
  workerName: string,
  customOpts?: CustomWorkerOptions,
): Worker => {
  // logger.debug(`Creating worker for queue: ${queueName}`);

  const defaultOpts: CustomWorkerOptions = {
    connection,
    name: workerName,
    rateLimitMax: 1,
    rateLimitInterval: 2000,
  };
  const workerOpts = { ...defaultOpts, ...customOpts };

  const worker = new Worker(
    queueName,
    async (job: Job) => {
      const result = await processFunction(job);

      if (result && result.error) {
        logger.error(
          `Worker ${workerName} failed with error: ${result.error.message}`,
        );
        throw new Error(result.error.message);
      }

      return result;
    },
    workerOpts,
  );

  return worker;
};

// Queue instances
export const crawlerQueue = createQueue(QUEUE.CRAWLER);

const crawlerJobProcessor = async (job: Job): Promise<WorkerResult> => {
  logger.debug(`Processing Crawler job: ${job.name}`);
  switch (job.name) {
    case JOBS.INITIATE_CRAWLER_JOB:
      return initiateCrawlerJob(job);
    default:
      logger.error(`Unknown job type in CRAWLER queue: ${job.name}`);
      throw new Error(`Unknown job type: ${job.name}`);
  }
};

// Worker instances
export const initiateBenefitsVerificationWorker = createWorker(
  QUEUE.CRAWLER,
  crawlerJobProcessor,
  WORKER.CRAWLER_WORKER,
  {
    connection,
    name: WORKER.CRAWLER_WORKER,
    concurrency: 10,
    lockDuration: 2 * 60 * 60 * 1000, // 2 hour lock
  },
);


/** Sets up the Bull Board UI for queue monitoring. */
export const BullBoard = (app: express.Application) => {
  const bullServerAdapter = new ExpressAdapter();
  bullServerAdapter.setBasePath("/admin/queues");

  createBullBoard({
    queues: [
      new BullMQAdapter(crawlerQueue),
    ],
    serverAdapter: bullServerAdapter,
  });

  app.use("/admin/queues", bullServerAdapter.getRouter());
};
