import {PrismaClient} from "@prisma/client";

const prisma = new PrismaClient();


// Creates server's sole admin
async function main() {
    await prisma.user.create({
        data: {
            username: "admin",
            password: "admin",
            firstName: "admin",
            lastName: "admin",
            email: "admin",
            role: "ADMIN"
        }
    })
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    });