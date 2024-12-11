import { PrismaClient } from "@prisma/client";
import { withAuthentication } from '../../../../utils/withAuthentication';
import validator from 'validator';
import bcrypt from 'bcrypt';
import { saltOrRound } from '../../../../config';

const prisma = new PrismaClient();
/**
 * Handler for retrieving user profile information
 * @param {object} req
 * @param {object} res
 */
async function handler(req, res) {
    try {
        if (req.method === 'GET') {
            // fetch user data using the decoded jwt
            const userData = await prisma.user.findUnique({
                where: { id: req.user.id },
                select: {
                    id: true,
                    username: true,
                    firstName: true,
                    lastName: true,
                    email: true,
                    avatar: true,
                    phoneNumber: true,
                    role: true,
                    createdAt: true
                },
            });

            if (!userData) {
                return res.status(404).json({ error: 'User not found' });
            }

            return res.status(200).json({ user: userData });
        } else if (req.method === 'PUT') {
            // update the authenticated user's profile
            const {
                firstName,
                lastName,
                email,
                password,
                avatar,
                phoneNumber,
            } = req.body;

            const updateData = {};

            // validate first name
            if (firstName) {
                if (typeof firstName !== 'string' || firstName.trim() === '') {
                    return res.status(400).json({ error: 'First name must be a non-empty string' });
                }
                updateData.firstName = firstName;
            }

            // validate last name
            if (lastName) {
                if (typeof lastName !== 'string' || lastName.trim() === '') {
                    return res.status(400).json({ error: 'Last name must be a non-empty string' });
                }
                updateData.lastName = lastName;
            }

            // validate email
            if (email) {
                if (!validator.isEmail(email)) {
                    return res.status(400).json({ error: 'Invalid email format' });
                }
                // check if email is already in use by another user
                const existingEmailUser = await prisma.user.findUnique({
                    where: { email: email.trim() },
                });
                if (existingEmailUser && existingEmailUser.id !== req.user.id) {
                    return res.status(409).json({ error: 'Email already in use by another user' });
                }
                updateData.email = email.trim();
            }

            // validate avatar, should probably be a valid URL
            if (avatar) {
                if (typeof avatar !== 'string' || avatar.trim() === '') {
                    return res.status(400).json({ error: 'Avatar must be a valid URL or data string.' });
                }
                updateData.avatar = avatar.trim();
            }
            
            if (phoneNumber) { // If there is a phone number
                if (phoneNumber.length > 0) { // If the phone number is not reset to empty
                    if (!validator.isMobilePhone(phoneNumber)) { // Verify the phone number
                        return res.status(400).json({ error: 'Invalid phone number format' }); 
                    }
                }
            }
            updateData.phoneNumber = phoneNumber;

            // password validation
            if (password) {
                // validate new password
                const passwordValidation = passwordCheck(password);
                if (!passwordValidation.status) {
                    return res.status(400).json({ error: passwordValidation.message });
                }

                const saltRounds = saltOrRound || 10;
                const hashedPassword = await bcrypt.hash(password, saltRounds);
                updateData.password = hashedPassword;
            }

            // update user data
            const updatedUser = await prisma.user.update({
                where: { id: req.user.id },
                data: updateData,
                // select: {
                //     id: true,
                //     username: true,
                //     firstName: true,
                //     lastName: true,
                //     email: true,
                //     avatar: true,
                //     phoneNumber: true,
                //     role: true,
                //     createdAt: true
                // },
            });
            return res.status(200).json({ user: updatedUser });
        } else {
            return res.status(405).json({ error: 'Method Not Allowed' });
        }
    } catch (error) {
        console.error('Error in /api/user/me:', error);
        if (error.message === 'Authorization header missing.' ||
           error.message === 'Invalid token.' ||
           error.message === 'Token expired.' ||
           error.message === 'User does not exist.') {
            return res.status(401).json({ error: error.message });
        }
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}

function passwordCheck(password) {
    if (password.length < 8) {
        return { status: false, message: 'Password must be at least 8 characters long.' };
    }

    if (/\s/.test(password)) {
        return { status: false, message: 'Password must not contain whitespace.' };
    }

    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasDigit = /[0-9]/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>~`\[\];'\\\-=_\+]/.test(password);


    if (!hasUpperCase) {
        return { status: false, message: 'Password must contain at least one uppercase letter.' };
    }
    if (!hasLowerCase) {
        return { status: false, message: 'Password must contain at least one lowercase letter.' };
    }
    if (!hasDigit) {
        return { status: false, message: 'Password must contain at least one digit.' };
    }
    if (!hasSpecialChar) {
        return { status: false, message: 'Password must contain at least one special character.' };
    }
    return { status: true, message: "Password is valid." };
}
export default withAuthentication(handler, { methods: ['GET', 'PUT'] });
