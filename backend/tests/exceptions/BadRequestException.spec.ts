import {BadRequestException} from '../../src/exceptions/BadRequestException'

describe('custom bad request exception', () => {
    it('constructor sets message and name', async () => {
        const id = '1234'
        // when
        const dummyFunction = () => {
            throw new BadRequestException(id)
        }
        // then
        expect(dummyFunction).toThrow('Parameter id not of type UUID for id=1234')
    })
})