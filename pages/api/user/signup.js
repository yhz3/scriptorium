import {PrismaClient} from "@prisma/client";
import bcrypt from "bcrypt";
import updateErrorExamine from "../../../utils/updateErrorExamine";
import validator from "validator";
import jwt from "jsonwebtoken";
import ms from "ms";

const prisma = new PrismaClient();

/**
 * Checking the username validity. The username must contain at 
 * least 5 characters in length. Returns an object, with attribute 
 * `status` and `message`.
 * @param {string} username 
 * @returns {object}
 */
export function usernameCheck(username) {
    const isValidLength = username.length >= 5;
    const isValidFormat = /^[a-zA-Z0-9_]+$/.test(username);

    if (!isValidLength) {
        return { status: false, message: "Username must be at least 5 characters long." };
    }
    if (!isValidFormat) {
        return { status: false, message: "Username must contain only letters, numbers and underscores." };
    }
    return { status: true, message: "Username is valid." };
}


/**
 * Checking the password validity. The password must contain least 8 characters 
 * in length, containing at least an upper case letter, 
 * a lower case letter and a special character.
 * @param {string} password 
 * @returns {object}
 */
export function passwordCheck(password) {
    if (password.length < 8) {
        return { status: false, message: "Password must be at least 8 characters long."};
    } 

    if (/\s/.test(password)) {
        return { status: false, message: "Password must not contain whitespace." };
    }

    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasDigit = /[0-9]/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>~`\[\];'\\\-=_\+]/.test(password);

    if (!hasUpperCase) {
        return { status: false, message: "Password must contain at least one uppercase letter." };
    }
    if (!hasLowerCase) {
        return { status: false, message: "Password must contain at least one lowercase letter." };
    }
    if (!hasDigit) {
        return { status: false, message: "Password must contain at least one digit." };
    }
    if (!hasSpecialChar) {
        return { status: false, message: "Password must contain at least one special character." };
    }
    return { status: true, message: "Password is valid." };
}


/**
 * Handler for registering or removing a user. 
 * For registering, the POST request body must have 
 * username, password, firstName, lastName and email.
 * For removing, the DELETE request body must have either
 * username, id or email (or multiple, 
 * as long as they refer to the same entity in database)
 * Note: Only USER role users can be signed up, unless there are no other users in the database.
 * Note: The first user signed up will be assigned the role of ADMIN.
 * at startup.
 * @param {string} req 
 * @param {string} res
 * @returns {object}
 */
export default async function handler(req, res) {
    if (req.method === "POST") {
        try {
            const { username, password, firstName, lastName, email, avatar, phoneNumber } = req.body;

            // username validation
            if (!username) {
                return res.status(400).json({ error: "Username is required." });
            }
            const usernameValidation = usernameCheck(username);
            if (!usernameValidation.status) {
                return res.status(400).json({ error: usernameValidation.message });
            }
            
            // password validation
            if (!password) {
                return res.status(400).json({ error: "Password is required."})
            }
            const passwordValidation = passwordCheck(password);
            if (!passwordValidation.status) {
                return res.status(400).json({ error: passwordValidation.message });
            } 
            
            // first name validation
            if (!firstName || typeof firstName !== "string" || firstName.trim().length === 0) {
                return res.status(400).json({ error: "First name is required." });
            }

            // last name validation
            if (!lastName || typeof lastName !== "string" || lastName.trim().length === 0) {
                return res.status(400).json({ error: "Last name is required." });
            }

            // email validation
            if (!email) {
                return res.status(400).json({ error: "Email is required." });
            } else if (!validator.isEmail(email)) {
                return res.status(400).json({ error: "Invalid email format." });
            }

            // check for existing username
            const existingUsername = await prisma.user.findUnique({ where: { username: username.trim() } });
            if (existingUsername) {
                return res.status(409).json({ error: "Username is already taken." });
            }

            // check for existing email
            const existingEmail = await prisma.user.findUnique({ where: { email: email.trim() } });
            if (existingEmail) {
                return res.status(409).json({ error: "Email is already registered." });
            }

            // Use the .env variable to ensure consistency
            const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS);
            const hashedPassword = await bcrypt.hash(password, saltRounds);

            // check if the user is the first user to be signed up
            const firstUser = await prisma.user.findFirst();
            if (firstUser === null) {
                var role = "ADMIN";
            } else {
                var role = "USER";
            }

            // create the user
            const data = {
                username: username.trim(),
                password: hashedPassword,
                firstName: firstName.trim(),
                lastName: lastName.trim(),
                email: email.trim(),
                role: role,
                avatar: avatar || null,
                phoneNumber: phoneNumber || null,
            };

            // add user to the database
            const newUser = await prisma.user.create({
                data: data
            });

            // generate jwt access token
            const accessToken = jwt.sign(
                { id: newUser.id, username: newUser.username, role: newUser.role },
                process.env.SECRET_KEY,
                { expiresIn: "1h" }
            );

            // generate jwt refresh token
            const refreshToken = jwt.sign(
                { id: newUser.id, username: newUser.username, role: newUser.role },
                process.env.REFRESH_SECRET_KEY,
                { expiresIn: "7d" }
            );

            // store refresh token in database
            await prisma.refreshToken.create({
                data: {
                    token: refreshToken,
                    user: { connect: { id: newUser.id } },
                    expiresAt: new Date(Date.now() + ms("7d")),
                },
            });

            return res.status(201).json({
                message: "User created successfully.", 
                accessToken: accessToken,
                accessTokenExpiresIn: "1h",
                refreshToken: refreshToken,
                refreshTokenExpiresIn: "7d",
                user: { 
                    id: newUser.id,
                    username: newUser.username,
                    email: newUser.email,
                    firstName: newUser.firstName,
                    lastName: newUser.lastName,
                    phoneNumber: newUser.phoneNumber
                },
            });
        } catch(error) {
            const errRes = updateErrorExamine(error);
            return res.status(errRes.code).json({ error: errRes.error}); 
        }
    } else {
        res.status(405).json({error: "Method not allowed."});
    }
}
