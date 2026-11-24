import express from "express";
import { createServer } from "node:http";
import path from "node:path";
const main = () => {
    const app = express()
    app.use(express.static(path.resolve("./public")))
    const server = createServer(app)

    const PORT = process.env.PORT ?? 8080

    server.listen(PORT, () => {
        console.log(`server is running on port: ${PORT}`)
    })
}

main()