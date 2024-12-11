import { PrismaClient } from "@prisma/client";
import authenticate from "../../../utils/authenticate";
import { withAuthentication } from '../../../utils/withAuthentication';

const prisma = new PrismaClient();

/**
 * handler for user logout.
 * invalidates the refresh token provided in the request body.
 * @param {object} req
 * @param {object} res
 */
async function handler(req, res) {
    if (req.method === "POST") {
        try {
            const user = req.user;

            const { refreshToken } = req.body;

            if (!refreshToken) {
                return res.status(400).json({ error: "refreshToken is required." });
            }

            // delete the refresh token from the database 
            const results = await prisma.refreshToken.deleteMany({
                where: {
                    token: refreshToken,
                    userId: user.id
                },
            });
            if (results.count === 0) {
                return res.status(400).json({ error: "Provided refreshToken not valid."});
            }

            return res.status(200).json({ message: "Logout successful" });

        } catch (error) {
            return res.status(500).json({ error: "Internal server error" });
        }
    } else {
        return res.status(405).json({ error: "Method not allowed" });
    }
}

export default withAuthentication(handler, { methods: ['POST'] });
