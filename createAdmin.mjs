import {PrismaClient} from "@prisma/client";

const prisma = new PrismaClient();


// Creates server's sole admin
async function main() {
    const admin = await prisma.user.findUnique({
        where: { username: "admin" },
    });

    if (!admin) {
        await prisma.user.create({
            data: {
                username: "admin",
                password: "admin",
                firstName: "admin",
                lastName: "admin",
                email: "admin",
                role: "ADMIN"
            }
        });
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    });