import mongoose, { Schema } from "mongoose";
const userSchema = new Schema({
    clerkId: {
        type: String,
        required: true,
        unique: true,
    },
    name: {
        type: String,
        required: true,
        trim: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },
    image: {
        type: String,
        default: "",
    },
    role: {
        type: String,
        enum: ["user", "admin"],
        default: "user",
    },
}, {
    timestamps: true,
});
const User = mongoose.models.User || mongoose.model("User", userSchema);
export default User;
