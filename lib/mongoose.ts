import mongoose from "mongoose";

let isConnected = false;

export const connectToDB = async () => {
	mongoose.set("strictQuery", true);

	if (!process.env.MONGODB_URL) {
		console.error("MONGODB_URL not found in environment");
		return;
	}
	if (isConnected) return;

	try {
		await mongoose.connect(process.env.MONGODB_URL);
		isConnected = true;
		console.log("connected to mongoDB");
	} catch (error: any) {
		console.error("MONGODB CONNECTION ERROR:", error.message);
		throw error;
	}
};
