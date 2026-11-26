import express from "express";
import { createServer } from "node:http";
import path from "node:path";
import { Server } from "socket.io";
import { publisher, subscriber , redis} from "./redis-connection"
const main = async () => {
    const app = express()
    app.use(express.static(path.resolve("./public")))
    const server = createServer(app)
    const io = new Server()
    io.attach(server)
    const PORT = process.env.PORT ?? 8080

    const checkboxes_count = 100
    const checkbox_key= "redis_checkbox_state"
    const state = {
        checkboxes: new Array(checkboxes_count).fill(false)
    }

    await subscriber.subscribe("internal-server:checkox:change")
    subscriber.on("message", (channel, message) => {
        if (channel === "internal-server:checkox:change") {
            const { checkbox_status, index } = JSON.parse(message)
            // state.checkboxes[index] = checkbox_status
            io.emit("server:checkbox:change", { index, checkbox_status })
            
        }
    })
    //socket io handlers
    io.on("connection", (socket) => {
        console.log(`socket connected with id : ${socket.id}`)

        socket.on("client:checkbox:change", async (data) => {
            console.log(`socket id: ${socket.id} changed checkbox: ${data.index} to status: ${data.checkbox_status}`)
            await publisher.publish("internal-server:checkox:change",
                JSON.stringify(data)
            )
            // state.checkboxes[data.index] = data.checkbox_status
            const existingState= await redis.get(checkbox_key)
            if(existingState){
                const remoteData= JSON.parse(existingState)
                remoteData[data.index]= data.checkbox_status
                await redis.set(checkbox_key, JSON.stringify(remoteData))
            }else{
                const remoteData=new Array(checkboxes_count).fill(false)
                remoteData[data.index]= data.checkbox_status
                await redis.set(checkbox_key,
                    JSON.stringify(remoteData)
                )
            }
        })
    })

    //express handlers i.e normal routes
    app.get("/health", (req, res) => {
        res.status(200).json("healthy")
    })

    app.get("/checkboxes", async(req, res) => {
        const existingState=await redis.get(checkbox_key)
        if(existingState){
            const remoteData=  JSON.parse(existingState) 
            res.status(200).json({ checkboxes:remoteData})
        }else{
            return res.status(200).json({checkboxes: new Array(checkboxes_count).fill(false)})
        }
    })

    server.listen(PORT, () => {
        console.log(`server is running on port: ${PORT}`)
    })
}

main()