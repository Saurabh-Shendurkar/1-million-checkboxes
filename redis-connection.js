import Redis from "ioredis"

function createRedisConnection() {
    return new Redis({
        host: "localhost",
        port: 6379,
    })
}

const subscriber = createRedisConnection()

const publisher = createRedisConnection()

const redis =createRedisConnection()

export { subscriber, publisher , redis}