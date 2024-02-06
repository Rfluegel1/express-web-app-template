import type { PlaywrightTestConfig } from '@playwright/test';

const isStaging = process.env.NODE_ENV === 'staging';
import dotenv from 'dotenv';

dotenv.config({ path: `.env.${process.env.NODE_ENV}` });

const config: PlaywrightTestConfig = {
	webServer: isStaging ? undefined : {
		command: 'npm run build && cd ../backend && npm run backend',
	},
	use: {
		baseURL: isStaging ? 'https://express-web-app-template.fly.dev' : 'http://localhost:8080',
		screenshot: 'only-on-failure',
		video: 'retain-on-failure'
	},
	testDir: 'tests',
	testMatch: /(.+\.)?(test|spec)\.[jt]s/,

};

export default config;