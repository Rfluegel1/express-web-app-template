import DataSourceService from '../src/DataSourceService';

let dataSourceService = new DataSourceService()
describe('DataSourceService', () => {
	beforeEach(() => {
		dataSourceService.dataSource.initialize = jest.fn();
		dataSourceService.dataSource.destroy = jest.fn();
	});
	it('initialize should initialize userDataSource', async () => {
		//when
		await dataSourceService.initialize();
		//then
		expect(dataSourceService.dataSource.initialize).toHaveBeenCalled();
	});
	it('initialize should throw db error', async () => {
		// given
		let error = new Error('DB Error');
		(dataSourceService.dataSource.initialize as jest.Mock).mockRejectedValue(error);
		// expect
		await expect(dataSourceService.initialize()).rejects.toThrow('Error interacting with the database');
	});
	it('destroy should destroy dataSource', async () => {
		//when
		await dataSourceService.destroy();
		//then
		expect(dataSourceService.dataSource.destroy).toHaveBeenCalled();
	});
	it('destroy should throws db error', async () => {
		// given
		let error = new Error('DB Error');
		(dataSourceService.dataSource.destroy as jest.Mock).mockRejectedValue(error);
		//expect
		await expect(dataSourceService.destroy()).rejects.toThrow('Error interacting with the database');
	});
});