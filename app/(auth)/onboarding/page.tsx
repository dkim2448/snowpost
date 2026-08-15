import AccountProfile from "@/components/forms/AccountProfile";
import { fetchUser } from "@/lib/actions/user.actions";
import { currentUser } from "@clerk/nextjs";
import { redirect } from "next/navigation";

async function Page() {
	// clerk provides us with currentUser()
	const user = await currentUser();
	if (!user) return null;

	// this one is fetched from the database, not the currently logged in one with `user`
	const userInfo = await fetchUser(user.id);
	if (userInfo?.onboarded) redirect("/");

	// we want to pass this over to AccountProfile. combining info from userInfo and logged in `user`:
	const userData = {
		// id of currently logged in user:
		id: user.id,
		objectId: userInfo?._id,
		username: userInfo?.username || user?.username,
		name: userInfo?.name || user?.firstName || "",
		bio: userInfo?.bio || "",
		image: userInfo?.image || user.imageUrl,
	};

	return (
		<main className="mx-auto flex max-w-3xl flex-col justify-start px-10 py-20">
			<h1 className="head-text">Onboarding</h1>
			<p className="mt-3 text-base-regular text-light-2">
				Complete your profile now to use SnowPost
			</p>

			<section className="mt-9 bg-dark-2 p-10">
				<AccountProfile user={userData} btnTitle="Continue" />
			</section>
		</main>
	);
}

export default Page;
