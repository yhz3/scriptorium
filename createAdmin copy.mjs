// createAdmin.ts

import { PrismaClient, Prisma } from "@prisma/client";

// Initialize Prisma Client
const prisma: PrismaClient = new PrismaClient();

// Defines the structure of the admin data
interface AdminData extends Prisma.UserCreateInput {
    username: string;
    password: string;
    firstName: string;
    lastName: string;
    email: string;
    role: "ADMIN";
}

// Creates server's sole admin
async function main(): Promise<void> {
    const admin: AdminData = {
        username: "admin",
        password: "admin",
        firstName: "admin",
        lastName: "admin",
        email: "admin@example.com", // It's good practice to use a valid email format
        role: "ADMIN",
    };

    try {
        const createdAdmin = await prisma.user.create({
            data: admin,
        });
        console.log("Admin user created successfully:", createdAdmin);
    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            // Handle known Prisma errors
            console.error("Prisma error:", error.message);
        } else {
            // Handle generic errors
            console.error("Unexpected error:", error);
        }
        process.exit(1);
    }
}

// Execute the main function
main()
    .finally(async () => {
        // Disconnect Prisma Client at the end
        await prisma.$disconnect();
    });