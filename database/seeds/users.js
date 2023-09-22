import bcrypt from "bcryptjs";

import { prisma } from "./prisma.js";
const USERS = [
    {
        name: "Alice",
        email: "alice@example.com",
        password: "password123",
    },
    {
        name: "Bob",
        email: "bob@example.com",
        password: "securepass",
    },
    {
        name: "Charlie",
        email: "charlie@example.com",
        password: "mypassword",
    },
    {
        name: "David",
        email: "david@example.com",
        password: "pass1234",
    },
    {
        name: "Eva",
        email: "eva@example.com",
        password: "evapass",
    },
    {
        name: "Frank",
        email: "frank@example.com",
        password: "frankie",
    },
    {
        name: "Grace",
        email: "grace@example.com",
        password: "gracepass",
    },
    {
        name: "Hannah",
        email: "hannah@example.com",
        password: "hannah123",
    },
    {
        name: "Isaac",
        email: "isaac@example.com",
        password: "isaacpass",
    },
    {
        name: "Julia",
        email: "julia@example.com",
        password: "juliapassword",
    },
];

export const UsersSetup = async function () {
    for (const user of USERS) {
        try {
            await prisma.user.create({
                data: {
                    name: user.name,
                    email: user.email,
                    password: bcrypt.hashSync(user.password, 10),
                },
            });

            console.log("\tCreated", user.name, "with password", user.password);
        } catch {
            console.log(
                "\tSkipping",
                user.name,
                "with password",
                user.password
            );
        }
    }
};
