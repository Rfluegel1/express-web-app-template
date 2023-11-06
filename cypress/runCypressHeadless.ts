import {spawn} from 'child_process'

let backendServer
let frontendBuild

const startServer = (command: string, args: string[], successMessage: any, workingDirectory: string) => new Promise((resolve, reject) => {
    const server = spawn(command, args, {cwd: workingDirectory})
    server.stdout.on('data', (data: any) => {
        const output = data.toString()
        console.log(`${args[1]} stdout: ${data}`)
        if (output.includes(successMessage)) {
            resolve(server)
        }
    })
    server.stderr.on('data', (data: any) => {
        console.error(`${args[1]} stderr: ${data}`)
    })

    server.on('error', reject)
})

const runCypress = () => new Promise<void>((resolve, reject) => {
    const cypress = spawn('cypress', ['run', '--headless', '--browser', 'chrome'], {stdio: 'inherit'})

    cypress.on('close', (code: any) => {
        if (code !== 0) {
            reject(new Error(`Cypress exited with code ${code}`))
        } else {
            resolve()
        }
    })
})

const killProcess = (process: any) => {
    if (process != undefined) {
        process.kill()
    }
};

(async () => {
    try {
        console.log('Building frontend...')
        frontendBuild = await startServer(
            'npm',
            ['run', 'build'],
            'compiled',
            '../frontend'
        )
        console.log('Build complete\n')

        console.log('Starting backend...')
        backendServer = await startServer(
            'npm',
            ['run', 'backend'],
            'The server is running on port 8080',
            '../backend'
        )
        console.log('Backend started\n')

        console.log('Starting cypress')
        await runCypress()
        console.log('Cypress tests completed successfully')
    } catch (error: any) {
        console.error(`An error occurred: ${error.message}`)
    } finally {
        killProcess(backendServer)
        killProcess(frontendBuild)
        console.log('Servers stopped')
    }
})()
