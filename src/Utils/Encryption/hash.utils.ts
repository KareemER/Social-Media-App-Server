import { compareSync, hashSync } from "bcrypt"

// ===================================================== Generating Hash =====================================================

export const generatHash = (plainText: string, saltRounds: number = parseInt(process.env.SALT_ROUNDS as string)): string => {
    return hashSync(plainText, saltRounds)
}

// ===================================================== comparing hashed =====================================================

export const compareHash = (plainText: string, hashedText: string): boolean => {
    return compareSync(plainText, hashedText)
}