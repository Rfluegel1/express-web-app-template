import winston from 'winston'

const cls = require('cls-hooked')
let namespace = cls.getNamespace('global')

const createLogger = () => {
    return winston.createLogger({
        level: 'info',
        format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
        transports: [new winston.transports.Console()]
    })
}

export const logger = createLogger()

export function getLogger() {
    if (!namespace) {
        namespace = cls.getNamespace('global')
    }
    return namespace.get('logger')
}
