import path from 'path'
import fs from 'fs'
import axios from 'axios'

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

    it('logs that a request was made to get all with a request id', (done) => {
        let checks = 0
        const checkLogs = () => {
            let filepath = path.join(__dirname, '../../development.combined.log')
            const combinedLogs = fs.readFileSync(filepath).toString()
            const logLines = combinedLogs.split('\n')

            for (const line of logLines) {
                if (line.includes('Starting getAll request')) {
                    const requestIdMatch = line.match(/"requestId":"([a-fA-F0-9\-]+)"/)
                    if (requestIdMatch) {
                        done()
                        return
                    }
                }
            }

            checks++
            if (checks > 30) {
                done(new Error('Log with requestId not found'))
            }
            setTimeout(checkLogs, 100)
        }


        axios.get('http://127.0.0.1:8080/api/posts').then(() => {
            checkLogs()
        })


    })
})