import mongoose from "mongoose";
export interface IUser {
    name: string;
}

const UserEntity = {
    name: {
        type: String,
        required: true,
    },
};

export const User = mongoose.model("user", new mongoose.Schema(UserEntity));
