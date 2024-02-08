const isStaging = process.env.NODE_ENV === 'staging';
import dotenv from 'dotenv';

dotenv.config({ path: `.env.${process.env.NODE_ENV || 'development'}` });

const config = {
	webServer: isStaging ? undefined : {
		command: 'npm run build && cd ../backend && npm run backend',
		port: 8090
	},
	use: {
		baseURL: isStaging ? 'https://express-web-app-template.fly.dev' : 'http://localhost:8090',
		screenshot: 'only-on-failure',
		video: 'retain-on-failure'
	},
	testDir: 'tests',
	testMatch: /(.+\.)?(test|spec)\.[jt]s/,
	timeout: 15000,
};

export default config;
