import { socketConnection } from "../../../DB/model/User.model.js";
import { authenticationSocket } from "../../../middleware/auth.socket.middleware.js";



export const registerSocketEvents = async (socket) => {

    const {data} = await authenticationSocket({ socket });

    if(!data.valid){
        return  socket.emit("socketErrorResponse", data);
    }

    socketConnection.set(data.user._id.toString(), socket.id);
    console.log( "registerSocketEvents" , socketConnection);
    

    return "Done";
};


export const logOutSocket = async (socket) => {

    return socket.on("disconnect", async () => {
        
        console.log("Socket Disconnected");
        
        const {data} = await authenticationSocket({ socket });

        if(!data.valid){
            return  socket.emit("socketErrorResponse", data);
        }

        socketConnection.delete(data.user._id.toString(), socket.id);
        console.log(socketConnection);
        

        return "Done";
    })
};


