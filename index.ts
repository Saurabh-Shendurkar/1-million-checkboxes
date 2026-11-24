import express from "express";
import { createServer } from "node:http";
import path from "node:path";
import { Server } from "socket.io";
const main = () => {
    const app = express()
    app.use(express.static(path.resolve("./public")))
    const server = createServer(app)
    const io = new Server()
    io.attach(server)
    const PORT = process.env.PORT ?? 8080

    //socket io handlers
    io.on("connection", (socket) => {
        console.log(`socket connected with id : ${socket.id}`)

        socket.on("client:checkbox:change", (data) => {
            console.log(`socket id: ${socket.id} changed checkbox: ${data.index} to status: ${data.checkbox_status}`)
            io.emit("server:checkbox:change", data)
        })
    })

    server.listen(PORT, () => {
        console.log(`server is running on port: ${PORT}`)
    })
}

main()