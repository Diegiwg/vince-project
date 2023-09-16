import { $User } from "../modules/Prisma.js";

export async function load() {
    return {
        users: (await $User.findAll())?.map((user) => ({
            name: user.name,
            email: user.email,
        })),
    };
}

export async function mount() {
    console.log("mount");
}
