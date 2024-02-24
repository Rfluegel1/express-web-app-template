import { DataSource } from 'typeorm';
import { dataSource } from './dataSource';
import { getLogger } from './Logger';
import { DatabaseException } from './exceptions/DatabaseException';

export default class DataSourceService {
	dataSource: DataSource = dataSource

	async initialize(): Promise<void> {
		await this.executeWithCatch(() => this.dataSource.initialize())
	}

	async destroy(): Promise<void> {
		await this.executeWithCatch(() => this.dataSource.destroy())
	}

	async executeWithCatch(action: () => Promise<any>): Promise<any> {
		try {
			return await action()
		} catch (error) {
			getLogger().error(error)
			throw new DatabaseException()
		}
	}
}