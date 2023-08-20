import {spawn} from 'child_process'
import * as path from 'path'
import * as fs from 'fs'

export default async () => {
    const startBackend = () => new Promise((resolve) => {
        const server = spawn('npm', ['run', 'backend'])
        let pid = server.pid?.toString() ? server.pid?.toString() : 'pid undefined'
        fs.writeFileSync(path.join(__dirname, 'server.pid'), pid)
        server.stdout.on('data', (data) => {
            const output = data.toString()
            if (output.includes('The server is running on port 8080')) {
                resolve(server)
            }
        })
    })

    await startBackend()
};
