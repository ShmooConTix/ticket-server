import { Job, Queue, Worker } from "bullmq";
import type { Logestic } from "logestic";
import { landingState } from "./landing";

export interface QueueRouteParams {
  logestic: Logestic; // logestic instance
  delayTime: number; // how long to delay, in ms
  duration: number; // how long it will go for, in ms
}

const startQueue = new Queue("mock_server-start_queue", {
  connection: {
    host: "redis",
    port: 6379,
  },
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 1000,
    },
  },
});

new Worker(
  "mock_server-start_queue",
  async (job: Job) => (landingState.ticketMode = job.name === "start"),
  {
    connection: {
      host: "127.0.0.1",
      port: 6379,
    },
  }
);

export async function ticketModeRoute({
  logestic,
  delayTime,
  duration,
}: QueueRouteParams) {
  await startQueue.add("start", { duration: duration }, { delay: delayTime });
  await startQueue.add("end", {}, { delay: delayTime + duration });

  logestic.info(`setup queue with delay ${delayTime} and duration ${duration}`);

  return {
    success: true,
  };
}
