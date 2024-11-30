import { CALL_STATUS, ExtractionJob, IExtractionJob } from "@repo/mongoose-schema";
import { scheduleExtractionJob } from "./crawler.scheduler";

export async function initializeCrawlerJob(
    url: string,
    usernName: string,
    password: string,
    authRequired: boolean
  ) {
  
    // Create a new BVWeinfuseJob document and save it to the database
    await ExtractionJob.create({
      username: usernName,
      password: password,
      startedAt: new Date(),
      status: CALL_STATUS.SCHEDULED,
    });

    await scheduleExtractionJob({
      userName: usernName,
      password: password,
      url: url,
      authRequired: authRequired,
    });

    return ;
  }