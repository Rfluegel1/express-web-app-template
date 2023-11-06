export class BadRequestException extends Error {
    constructor(id: string) {
        super(`Parameter id not of type UUID for id=${id}`)
        this.name = 'BadRequestException'
    }
}