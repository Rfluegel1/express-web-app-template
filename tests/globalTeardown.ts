import fs from 'fs'
import path from 'path'
import {spawn} from 'child_process'

export default async () => new Promise((resolve) => {
    let filepath = path.join(__dirname, 'server.pid')
    const pid = fs.readFileSync(filepath).toString()
    const server = spawn('kill', ['--KILL', pid])
    server.stdout.on('close', () => {
        fs.unlinkSync(filepath)
        resolve(server)
    })
});