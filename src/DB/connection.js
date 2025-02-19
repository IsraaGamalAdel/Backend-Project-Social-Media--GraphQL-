import mongoose from "mongoose";

const connectDB = async () =>{
    // try{
    //     await mongoose.connect(`mongodb://localhost:27017/mongooseSarah` , {
    //         serverSelectionTimeoutMS : 5000
    //     })

    //     console.log("Connected to MongoDB", mongoose.connection.db.databaseName );
    // }
    // catch(error){
    //     console.error(" Error connecting to MongoDB ", error);
    // }

    //********************************************************************************************************** */
    // OR

    await mongoose.connect(process.env.DB_URI , {
        serverSelectionTimeoutMS : 5000
    }).then((res) => {  //then, catch method of promise  (returns a promise)
        console.log("Connected to Mongo DB", res.connection.db.databaseName );
    }).catch((err) => {
        console.error(" Error connecting to Mongo DB ", err);
    })
};


export default connectDB