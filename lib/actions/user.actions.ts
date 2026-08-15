"use server";

import { revalidatePath } from "next/cache";
import User from "../models/user.model";
import { connectToDB } from "../mongoose";
import Thread from "../models/thread.model";
import { FilterQuery, SortOrder } from "mongoose";
import { currentUser } from "@clerk/nextjs";

interface Params {
	userId: string;
	username: string;
	name: string;
	bio: string;
	image: string;
	path: string;
}

export async function updateUser({
	userId,
	username,
	name,
	bio,
	image,
	path,
}: Params): Promise<void> {
	connectToDB();

	try {
		await User.findOneAndUpdate(
			{ id: userId },
			{ username: username.toLowerCase(), name, bio, image, onboarded: true },
			// updates if exists, adds if new:
			{ upsert: true },
		);

		if (path === "/profile/edit") {
			// updating profile? revalidate it:
			revalidatePath(path);
		}
	} catch (error: any) {
		throw new Error(`Failed to create/update user: ${error.message}`);
	}
}

export async function fetchUser(userId: string) {
	try {
		connectToDB();

		// return user from database
		return await User.findOne({ id: userId });
	} catch (error: any) {
		throw new Error(`failed to fetch user: ${error.message}`);
	}
}

export async function fetchUserPosts(userId: string) {
	try {
		connectToDB();

		// find all threads authored by user with the given userId
		const threads = await User.findOne({ id: userId }).populate({
			path: "threads",
			model: Thread,
			populate: {
				path: "children",
				model: Thread,
				populate: {
					path: "author",
					model: User,
					select: "name image id",
				},
			},
		});

		return threads;
	} catch (error: any) {
		throw new Error(`Failed to fetch user posts: ${error.message}`);
	}
}

export async function fetchUsers({
	userId,
	searchString = "",
	pageNumber = 1,
	pageSize = 12,
	sortBy = "desc",
}: {
	userId: string;
	searchString?: string;
	pageNumber?: number;
	pageSize?: number;
	// comes from mongoose:
	sortBy?: SortOrder;
}) {
	try {
		connectToDB();

		// calculate the number of users to skip based on the page number and size:
		const skipAmount = (pageNumber - 1) * pageSize;

		// create case insensitive regex for when we're searching the users:
		const regex = new RegExp(searchString, "i");

		// initial query to get Users
		// FilterQuery is from mongoose, it filters Users:
		const query: FilterQuery<typeof User> = {
			// no equal to userId, so we want to filter out our current user:
			id: { $ne: userId },
		};

		if (searchString.trim() !== "") {
			// if not empty string, proceed with search:
			query["$or"] = [
				// search both by name or username:
				{ username: { $regex: regex } },
				{ name: { $regex: regex } },
			];
		}

		const sortOptions = { createdAt: sortBy };

		// finally get all Users based on searching and filtering:
		const usersQuery = User.find(query)
			.sort(sortOptions)
			.skip(skipAmount)
			.limit(pageSize);

		// use this to know total number of pages:
		const totalUsersCount = await User.countDocuments(query);

		const users = await usersQuery.exec();

		// based on total number of users we can know if there's a next page:
		const isNext = totalUsersCount > skipAmount + users.length;

		return { users, isNext };
	} catch (error: any) {
		throw new Error(`Failed to fetch users: ${error.message}`);
	}
}

export async function getActivity(userId: string) {
	try {
		connectToDB();

		// find all threads created by the user
		const userThreads = await Thread.find({ author: userId });

		// collect all the child thread ids (replies) from the "children" field
		const childThreadIds = userThreads.reduce((acc, userThread) => {
			// will concatenate the child Thread IDs of the current userThread object to the result array "acc"
			return acc.concat(userThread.children);
		}, []);

		// get access of all the replies, including the ones created by the same user
		const replies = await Thread.find({
			_id: { $in: childThreadIds },
			author: { $ne: userId },
		}).populate({
			path: "author",
			model: User,
			select: "name image _id",
		});

		return replies;
	} catch (error: any) {
		throw new Error(`Failed to fetch a activity: ${error.message}`);
	}
}
