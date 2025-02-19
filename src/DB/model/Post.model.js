import  mongoose, { model, Schema, Types } from "mongoose";



const postSchema =  new Schema({
    content :{     
        type: String,
        trim: true, 
        required: function () {
            return this?.attachments?.length ? false : true;
        },
        minlength: [2 , `userName minimum  2 characters`],
        maxlength: 20000,
    },

    // attachments
    attachments:[{secure_url: String , public_id: String}],
    likes : [{type: Types.ObjectId , ref: "User" }],
    tags: [{type: Types.ObjectId , ref: "User"}],
    share: [{type: Types.ObjectId , ref: "User"}],

    userId: {type: Types.ObjectId , ref: "User" , required: true},
    // comments: [{type: Types.ObjectId , ref: "Comment"}],
    deletedBy: {type: Types.ObjectId , ref: "User" },
    createdAt: {type: Date , default: Date.now},

    deleted: Date ,
    
},{
    timestamps:true ,
    toObject: {virtuals: true},
    toJSON: {virtuals: true}
});

postSchema.virtual('comments' , {
    localField: '_id',
    foreignField: 'postId',
    ref: 'Comment',
    justOne: true
})


export const postModel = mongoose.models.Post || model("Post" , postSchema);


