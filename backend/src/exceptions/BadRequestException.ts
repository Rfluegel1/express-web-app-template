export class BadRequestException extends Error {
    constructor(id: string | undefined = undefined) {
        if (!id) {
            super('Password and passwordConfirm do not match')
        } else {
            super(`Parameter id not of type UUID for id=${id}`)
        }
        this.name = 'BadRequestException'
    }
}