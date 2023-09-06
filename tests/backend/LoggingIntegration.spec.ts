import path from 'path'
import fs from 'fs'
import axios from 'axios'
import {UUID_REG_EXP} from '../../src/backend/contants'

beforeAll(() => {
    if (process.env.NODE_ENV !== 'development') {
        throw new Error('cannot run integration test outside of development')
    }
    let combinedFilepath = path.join(__dirname, '../../development.combined.log')
    let errorFilepath = path.join(__dirname, '../../development.error.log')
    fs.truncate(combinedFilepath, 0, function (err) {
        if (err) console.log(err)
    })
    fs.truncate(errorFilepath, 0, function (err) {
        if (err) console.log(err)
    })


})
describe('Logging', () => {
    it('logs that the server starts up', () => {
        // given
        let filepath = path.join(__dirname, '../../development.combined.log')
        const combinedLogs = fs.readFileSync(filepath).toString()

        //expect
        expect(combinedLogs).toContain(`The server is running on port 8080`)
    })

    it('logs that a request was made to get all with a request id', async () => {
        const checkLogs = async () => {
            let filepath = path.join(__dirname, '../../development.combined.log')
            const combinedLogs = fs.readFileSync(filepath).toString()
            const logLines = combinedLogs.split('\n')

            for (const line of logLines) {
                if (line.includes('Received get all posts request')) {
                    const requestIdMatch = line.match(new RegExp(`"requestId":"(${UUID_REG_EXP.source})"`))
                    if (requestIdMatch) {
                        return
                    }
                }
            }

            throw new Error('Log with requestId not found')
        }

        await axios.get('http://127.0.0.1:8080/api/posts')

        let retries = 30
        while (retries > 0) {
            try {
                await checkLogs()
                return
            } catch (e) {
                retries--
                await new Promise(r => setTimeout(r, 100))
            }
        }

        throw new Error('Log with requestId not found after 30 retries')
    })
})