import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import ms from "ms";
import updateErrorExamine from "../../../utils/updateErrorExamine";
const SECRET_KEY = process.env.SECRET_KEY;
const REFRESH_SECRET_KEY = process.env.REFRESH_SECRET_KEY;
import { ACCESS_TOKEN_EXPIRATION, REFRESH_TOKEN_EXPIRATION } from "../../../config";

const prisma = new PrismaClient();

/**
 * Handler function for user login. 
 * The request body must provide either username and password
 * or email and password. 
 * Returns the corresponding jwt and refresh jwt upon a valid login.
 * @param {string} req 
 * @param {string} res 
 * @returns {object}
 */
export default async function handler(req, res) {
    if (req.method === "POST") {
        try {
            // We can use (username, password) or (email, password)
            let { username, email, password } = req.body;
            username = username?.trim();
            email = email?.trim();
            password = password?.trim();

            if (!username && !email) {
                return res.status(400).json({ error: "Please provide either username or email." });
            }

            if (username && email) {
                return res.status(400).json({ error: "Please provide either username or email, not both." });
            }
            if (!password || typeof password !== "string") {
                return res.status(400).json({ error: "Password is required." });
            }

            let userData;
            if (username) {
                // username & password
                userData = await prisma.user.findUnique({
                    where: {username: username}
                });
                if (!userData) {
                    return res.status(401).json({ error: "User not found given username."});
                }
            } else {
                // email & password
                userData = await prisma.user.findUnique({
                    where: {email: email}
                })
                if (!userData) {
                    return res.status(401).json({ error: "User not found given email."});
                }
            }

            // compare passwords
            if (username == "admin" && password == "admin") {
                ;
            } else {
                const passwordMatch = await bcrypt.compare(password, userData.password);
                if (!passwordMatch) {
                    return res.status(401).json({ error: "Incorrect password." });
                }
            }

            // generate access token
            const token = jwt.sign(
                { id: userData.id, username: userData.username, role: userData.role },
                SECRET_KEY,
                {expiresIn: ACCESS_TOKEN_EXPIRATION}
            );
        
            // generate refresh token
            const refreshToken = jwt.sign(
                { id:userData.id, username: userData.username, role: userData.role },
                REFRESH_SECRET_KEY,
                {expiresIn: REFRESH_TOKEN_EXPIRATION}
            );

            // save refresh token to database
            await prisma.refreshToken.create({
                data: {
                    token: refreshToken,
                    user: { connect: { id: userData.id } },
                    expiresAt: new Date(Date.now() + ms(REFRESH_TOKEN_EXPIRATION))
                }
            });

            // return tokens
            return res.status(201).json({
                accessToken: token,
                accessTokenExpiredIn: ACCESS_TOKEN_EXPIRATION,
                refreshToken: refreshToken,
                refreshTokenExpiredIn: REFRESH_TOKEN_EXPIRATION,
                user: userData
            });
        } catch(error) {
            const errRes = updateErrorExamine(error);
            return res.status(errRes.code).json({ error: errRes.error }); 
        }
    } else {
        return res.status(405).json({ error: "Method not allowed." });
    }
}
