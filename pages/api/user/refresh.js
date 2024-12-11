import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";
const SECRET_KEY = process.env.SECRET_KEY;
const REFRESH_SECRET_KEY = process.env.REFRESH_SECRET_KEY;
import { ACCESS_TOKEN_EXPIRATION} from "../../../config";

const prisma = new PrismaClient();

/**
 * Handler for refreshing token using a refreshToken.
 * The request body must contain a valid refreshToken.
 * @param {string} req 
 * @param {string} res 
 * @returns {object}
 */
export default async function handler(req, res) {
    if (req.method === "POST") {
        try {
            const { refreshToken } = req.body;

            if (!refreshToken) {
                return res.status(400).json({ error: "Refresh token is required." });
            }

            // verify the refresh token
            let payload;
            try {
                payload = jwt.verify(refreshToken, REFRESH_SECRET_KEY);
            } catch(err) {
                return res.status(401).json({ error: "Invalid refresh token." });
            }

            // check if the refresh token is in the database
            const storedToken = await prisma.refreshToken.findUnique({
                where: { token: refreshToken },
                include: { user: true },
            });

            if (!storedToken || storedToken.expiresAt < new Date()) {
                return res.status(401).json({ error: "Expired refresh token." });
            }

            // generate a new access token
            const newToken = jwt.sign(
                { id: payload.id, username: payload.username, role: payload.role },
                SECRET_KEY,
                { expiresIn: ACCESS_TOKEN_EXPIRATION }
            );

            return res.status(201).json({
                accessToken: newToken,
                accessTokenExpiresIn: ACCESS_TOKEN_EXPIRATION,
            });
        } catch(error) {
            console.error('Error in POST /api/auth/refresh:', error);
            return res.status(500).json({ error: "Internal server error." });
        }
    } else {
        return res.status(405).json({ error: "Method not allowed." });
    }
}
