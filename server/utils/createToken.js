import jwt from 'jsonwebtoken'

export const generateToken = async (userId) => {
    const token = await jwt.sign({ userId }, process.env.JWT_SECRET)
    if (!token) {
        console.log("Error while generating jwt token");
        return;
    }
    return token;
}