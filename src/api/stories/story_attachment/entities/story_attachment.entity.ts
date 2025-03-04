import mongoose, {Schema} from "mongoose";
import pM from "mongoose-paginate-v2";


export interface IStoryAttachment {
    _id: string
    storyId: string;
    shares: any[];
    reply: any[];
    likes: any[];

}

export const StoryAttachment = new mongoose.Schema(
    {
        storyId: {type: Schema.Types.ObjectId, required: true, ref: "story"},
        shares: {type: [Schema.Types.ObjectId],  default: []},
        reply: {type: [Schema.Types.ObjectId],  default: []},
        likes: {type: [Schema.Types.ObjectId],  default: []},
    },
    {
        timestamps: true
    }
);
StoryAttachment.plugin(pM)


