import {PrismaClient} from "@prisma/client";
import updateErrorExamine from "../../../utils/updateErrorExamine";
import { withAuthentication } from "../../../utils/withAuthentication";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

/**
 * DELETE -> Delete the account from database 
 * @param {object} req 
 * @param {object} res
 */
async function handler(req, res) {
    if (req.method === "DELETE") {
        try {
            // authenticate the user
            const user = req.user;

            // get the password from the request body before deleting the user
            const { password } = req.body;
            if (!password) {
                return res.status(400).json({ error: "Password is required to delete the account." });
            }

            // check if the password is correct
            const userData = await prisma.user.findUnique({ where: { id: user.id } });
            const passwordMatch = await bcrypt.compare(password, userData.password);
            if (!passwordMatch) {
                return res.status(401).json({ error: "Incorrect password." });
            }

            // delete the user
            await prisma.user.delete({ where: { id: user.id } });

            // note prisma automatically deletes the user's refresh tokens and templates
    
            return res.status(200).json({ message: "User account deleted." });
        } catch (error) {
            console.error('Error in DELETE /api/user/delete:', error);
            const errRes = updateErrorExamine(error);
            return res.status(errRes.code).json({ error: errRes.error}); 
        }
    } else {
        res.status(405).json({error: "Method not allowed."});
    }
}

export default withAuthentication(handler, { methods: ['DELETE'] });
