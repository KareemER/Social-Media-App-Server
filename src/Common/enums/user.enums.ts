

enum GenderEnum {
    FEMALE = "female",
    MALE = "male",
    RATHER_NOT_SAY = "rather_not_say"
}

enum RolesEnum {
    USER = "user",
    ADMIN = "admin",
    SUPER_ADMIN = "super_admin"
}

enum ProviderEnum {
    LOCAL = "local",
    GOOGLE = "google",
    FACEBOOK = "facebook"
}

enum OtpTypesEnum {
    CONFIRMATION = 'confirmation',
    RESET_PASSWORD = 'reset-password'
}

export { GenderEnum, RolesEnum, ProviderEnum, OtpTypesEnum }