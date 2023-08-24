import fs from 'fs'
import path from 'path'
import {spawn} from 'child_process'

export default async () => new Promise((resolve) => {
    let filepath = path.join(__dirname, 'server.pid')
    const pid = fs.readFileSync(filepath).toString()
    console.log('killing pid: ', pid)
    const server = spawn('kill', ['--KILL', pid])
    server.stdout.on('close', () => {
        console.log('killed')
        fs.unlinkSync(filepath)
        resolve(server)
    })
});