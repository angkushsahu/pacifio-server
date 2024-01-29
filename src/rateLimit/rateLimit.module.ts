import { ThrottlerModule, seconds } from "@nestjs/throttler";
import { Module } from "@nestjs/common";

const RateLimit = ThrottlerModule.forRoot({
   throttlers: [{ limit: 4, ttl: seconds(1) }],
   errorMessage: "Request limit exceeded, wait for 10 seconds and retry",
});

@Module({
   imports: [RateLimit],
})
export default class RateLimitModule {}
