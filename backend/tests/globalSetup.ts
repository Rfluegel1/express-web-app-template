import {spawn} from 'child_process'
import * as path from 'path'
import * as fs from 'fs'

if (process.env.NODE_ENV === 'test') {
    process.env.NODE_ENV = 'development'
}
const env = process.env.NODE_ENV || 'development'
require('dotenv').config({path: `.env.${env}`})

export default async () => {
    const startBackend = () => new Promise((resolve) => {
        const server = spawn('./node_modules/.bin/ts-node', ['./src/server.ts'])
        let pid = server.pid?.toString() ? server.pid?.toString() : 'pid undefined'
        console.log('created pid : ', pid)
        fs.writeFileSync(path.join(__dirname, 'server.pid'), pid)
        server.stdout.on('data', (data) => {
            const output = data.toString()
            if (output.includes('The server is running on port 8080')) {
                resolve(server)
            }
        })
        server.stdout.on('data', (data) => {
            console.log('stdout:', data.toString());
        });
        server.stderr.on('data', (data) => {
            console.error('stderr:', data.toString());
        });
    })
    await startBackend()
};
