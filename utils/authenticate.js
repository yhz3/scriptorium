import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
const SECRET_KEY = process.env.SECRET_KEY;

const prisma = new PrismaClient();

/**
 * Authenticate the request using jwt. Returns the decoded jwt payload or
 * throws an Error if there is an issue
 * @param {object} req - The HTTP request object.
 * @returns {object} - The decoded jwt payload.
 * @throws {Error} - If the authorization header is missing, the token is missing, or the token is invalid.
 */
export default async function authenticate(req) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        throw new Error("Authorization header missing.");
    }

    // break up auth header into scheme and token
    // since auth headers should be in format "Bearer <token>"
    const [scheme,token] = authHeader.split(' ');
    if (scheme !== 'Bearer' || !token) {
        throw new Error("Invalid authorization header format. Expected 'Bearer <token>'.");
    }

    const secretKey = SECRET_KEY;
    if (!secretKey) {
        throw new Error("JWT secret key is not defined in environment variables.");
    }

    try {
        const decoded = jwt.verify(token, secretKey);

        // make sure user hasn't been deleted
        const user = await prisma.user.findUnique({
            where: { id: decoded.id },
        });

        if (!user) {
            throw new Error("User does not exist.");
        }

        return decoded;
    } catch (err) {
        if (err.name === 'TokenExpiredError') {
            throw new Error("Token expired.");
        }
        throw new Error("Invalid token.");
    }
}
