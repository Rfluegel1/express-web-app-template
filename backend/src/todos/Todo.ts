import {v4 as uuidv4} from 'uuid'
import {plainToClass} from 'class-transformer'

export default class Todo {
    id: string = uuidv4()
    task: string
    createdBy: string

    constructor(task: string = '', createdBy: string = '') {
        this.task = task
        this.createdBy = createdBy
    }

    updateDefinedFields(task: string, createdBy: string): void {
        if (task !== undefined) {
            this.task = task
        }
        if (createdBy !== undefined) {
            this.createdBy = createdBy
        }
    }

    todoMapper(queryResult: any): Todo {
        const intermediate = {
            id: queryResult?.id,
            task: queryResult?.task,
            createdBy: queryResult?.createdby,
        }
        return plainToClass(Todo, intermediate)
    }
}