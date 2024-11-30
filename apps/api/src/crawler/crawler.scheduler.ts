import { JOBS } from "../config/constants";
import { crawlerQueue } from "../services/bullmq";
import logger from "../utils/logger";


export async function scheduleExtractionJob(data: any) {
    // Ensure queue is drained
    await crawlerQueue.drain();
    await crawlerQueue.add(JOBS.INITIATE_CRAWLER_JOB, data, {
      delay: 0,
      attempts: 3,
      backoff: {
        type: "fixed",
        delay: 120000, 
      },
    });
    logger.info("Scheduled extraction job with 3 retires: " + data);
}