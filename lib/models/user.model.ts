import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
	id: { type: String, required: true },
	username: { type: String, required: true, unique: true },
	name: { type: String, required: true },
	image: String,
	bio: String,
	threads: [
		{
			type: mongoose.Schema.Types.ObjectId,
			// one user can have multiple references to specific threads stored in the database:
			ref: "Thread",
		},
	],
	onboarded: {
		type: Boolean,
		// once we create an account we have to go through onboarding to choose pfp, bio, username:
		default: false,
	},
});

// for the first time mongoose.models.User doesn't exist, so fallback to creating "User" with userSchema:
const User = mongoose.models.User || mongoose.model("User", userSchema);

export default User;
