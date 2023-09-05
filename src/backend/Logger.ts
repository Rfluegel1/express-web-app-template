import winston from 'winston'

const cls = require('cls-hooked')
let namespace = cls.getNamespace('global')

const createLogger = () => {
    const isDevelopment = process.env.NODE_ENV === 'development'
    const combinedName = isDevelopment ? 'development.combined.log' : 'combined.log'
    const errorName = isDevelopment ? 'development.error.log' : 'error.log'
    return winston.createLogger({
        level: 'info',
        format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
        transports: [
            new winston.transports.File({filename: errorName, level: 'error'}),
            new winston.transports.File({filename: combinedName})
        ]
    })
}

export const logger = createLogger()

export function getLogger() {
    if (!namespace) {
        namespace = cls.getNamespace('global')
    }
    const logger = namespace.get('logger')
    return logger
}
