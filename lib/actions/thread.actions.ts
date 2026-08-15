"use server";

import { revalidatePath } from "next/cache";
import User from "../models/user.model";
import { connectToDB } from "../mongoose";
import Thread from "../models/thread.model";

interface Params {
	text: string;
	author: string;
	path: string;
}

export async function createThread({
	text,
	author,
	path,
}: Params): Promise<void> {
	try {
		connectToDB();

		const createdThread = await Thread.create({ text, author });

		// update user model
		await User.findByIdAndUpdate(author, {
			$push: { threads: createdThread._id },
		});

		revalidatePath(path);
	} catch (error: any) {
		throw new Error(`Error creating thread: ${error.message}`);
	}
}

export async function fetchPosts(pageNumber = 1, pageSize = 20) {
	connectToDB();

	// calculate the number of posts to skip
	const skipAmount = (pageNumber - 1) * pageSize;

	// fetch the posts that have no parents (top-level threads...)
	const postsQuery = Thread.find({ parentId: { $in: [null, undefined] } })
		.sort({ createdAt: "desc" })
		.skip(skipAmount)
		.limit(pageSize)
		.populate({ path: "author", model: User })
		// this is a comment:
		.populate({
			path: "children",
			populate: {
				path: "author",
				model: User,
				select: "_id name parentId image",
			},
		});

	const totalPostsCount = await Thread.countDocuments({
		parentId: { $in: [null, undefined] },
	});

	const posts = await postsQuery.exec();

	const isNext = totalPostsCount > skipAmount + posts.length;

	return { posts, isNext };
}

export async function fetchThreadById(id: string) {
	connectToDB();

	try {
		const thread = await Thread.findById(id)
			.populate({
				path: "author",
				model: User,
				select: "_id id name image",
			})
			.populate({
				path: "children",
				populate: [
					{
						path: "author",
						model: User,
						select: "_id id name parentId image",
					},
					{
						path: "children",
						model: Thread,
						populate: {
							path: "author",
							model: User,
							select: "_id id name parentId image",
						},
					},
				],
			})
			.exec();

		return thread;
	} catch (error: any) {
		throw new Error(`error fetching thread: ${error.message}`);
	}
}

export async function addCommentToThread(
	threadId: string,
	commentText: string,
	userId: string,
	path: string,
) {
	connectToDB();
	try {
		// find the original thread by its Id
		const originalThread = await Thread.findById(threadId);

		if (!originalThread) {
			throw new Error("Thread not found");
		}

		// create a new Thread with comment text
		const commentThread = new Thread({
			text: commentText,
			author: userId,
			// original thread we're commenting on:
			parentId: threadId,
		});

		// save the new Thread
		const savedCommentThread = await commentThread.save();

		// update the original Thread to include the new comment
		originalThread.children.push(savedCommentThread._id);

		// save the original Thread
		await originalThread.save();

		revalidatePath(path);
	} catch (error: any) {
		throw new Error(`Error adding comment to thread: ${error.message}`);
	}
}
