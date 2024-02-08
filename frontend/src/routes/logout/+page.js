import { redirect } from '@sveltejs/kit';
import axios from 'axios';

/** @type {import('./$types').LayoutServerLoad} */
export async function load() {
	await axios.post('/api/logout')

	throw redirect(302, '/login');
}