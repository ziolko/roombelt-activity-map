import { createClient, RedisClient } from "redis";

const redisClientPromise = new Promise<RedisClient>((res, rej) => {
  const client = createClient({
    host: process.env["REDIS_URL"],
    password: process.env["REDIS_PASSWORD"],
    port: parseInt(process.env["REDIS_PORT"]),
    tls: {},
  });

  client.on("ready", () => res(client));
  client.on("error", (err) => rej(err));
});

export async function writeLocation(key: string, location: [2]) {
  const redis = await redisClientPromise;
  return promisify((_) => redis.zadd(key, Date.now(), location.join("/"), _));
}

export async function getLastLocations(key: string, minutes = 30, limit = 100) {
  const redis = await redisClientPromise;
  const items = await promisify<string[]>((_) =>
    redis.zrevrangebyscore(
      key,
      Date.now() - minutes * 60 * 1000,
      "+inf",
      "LIMIT",
      0,
      limit,
      _
    )
  );
  return items.map((item) => item.split("/").map(parseFloat));
}

function promisify<T>(cb: (_: (err: Error | null, reply: T) => void) => void) {
  return new Promise<T>((res, rej) =>
    cb((err, reply) => (err ? rej(err) : res(reply)))
  );
}
