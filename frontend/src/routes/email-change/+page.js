import { redirect } from '@sveltejs/kit';
import axios from 'axios';

/** @type {import('./$types').LayoutServerLoad} */
export async function load() {
	const loggedIn = (await axios.get('/api/session-check')).data.sessionActive
	if (!loggedIn) {
		throw redirect(302, '/login');
	}
}
