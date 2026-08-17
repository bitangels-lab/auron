import "reflect-metadata";
import { NestFactory } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix("v1");
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.enableCors({ origin: process.env.CORS_ORIGIN ?? "http://localhost:3000" });
  const port = Number(process.env.API_PORT ?? 3001);
  await app.listen(port);
  console.log(`AURON API http://localhost:${port}/v1`);
}

bootstrap();
