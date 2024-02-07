<script>
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import axios from 'axios';

	let email = '';
	let password = '';
	let error = '';

	// onMount(() => {
	// 	if (pb.authStore.isValid) {
	// 		goto('/');
	// 	}
	// });

	async function handleSubmit() {
		try {
			const data = new URLSearchParams();
			data.append('username', email);
			data.append('password', password);
			await axios.post('/api/login', data, {
					headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
				}
			);
			await goto('/');
		} catch (e) {
			error = 'Invalid email or password.';
			throw e;
		}
	}
</script>

<main>
	<h1>Login</h1>
	<form on:submit|preventDefault={handleSubmit}>
		<div>
			<label for='email'>Email:</label>
			<input type='email' id='email' bind:value={email} required />
		</div>

		<div>
			<label for='password'>Password:</label>
			<input type='password' id='password' bind:value={password} required />
		</div>

		<button type='submit'>Login</button>
	</form>
	<!--	<a href="/register">Create Account</a>-->
	<!--	<a href="/password-reset">Reset Password</a>-->
	{#if error}
		<div class='error' role='alert'>{error}</div>
	{/if}
</main>

<style>
    .error {
        color: red;
    }
</style>
