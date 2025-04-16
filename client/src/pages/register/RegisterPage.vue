<script setup lang="ts">
	import { reactive } from 'vue';
	import FormComponent from '@/components/FormComponent.vue';
	import type { ButtonComponentProps, FieldComponentProps } from '@/types/components';
	import baseURL from '@/baseUrl';
	import { useRouter } from 'vue-router';
	import { ref } from 'vue';
	import { onMounted } from 'vue';
	const router = useRouter()
	const error = ref<string | {msg:string} |null>(null);

	onMounted(() => {
		setTimeout(() => {
			confirm('PAR PITIEE UTILISEZ PAS DE VRAI DONNEES PERSONNELLES!!!\n(et retenez le MDP pour pouvoir vous connecter derrière..)');
		}, 100);
	});

	const formData = reactive<{
		formLegend: string;
		fields: FieldComponentProps[];
		actions: ButtonComponentProps[];
	}>({
		formLegend: 'Créer un compte',
		fields: [
			{ id: 'username', label: 'Handle @', placeholder: 'john_68', type: 'text', required: true },
			{ id: 'displayname', label: 'Nom d\'utilisateur', placeholder: 'John Doe', type: 'text', required: true },
			{ id: 'email', label: 'Email', placeholder: 'Email', type: 'email', required: true },
			{ id: 'password', label: 'Password', placeholder: 'Password', type: 'password', minLength: 8, required: true }
		],
		actions: [
			{ id: 'register', label: 'Créer un compte' },
			{ id: 'reset', label: 'Reset', type: 'reset' }
		]
	});

	function onsubmit(event: Event) {
		event.preventDefault();
		const data = JSON.stringify({
			email: (event.target as HTMLFormElement).email.value,
			username: (event.target as HTMLFormElement).username.value.trim().toLowerCase(),
			displayname: (event.target as HTMLFormElement).displayname.value,
			password: (event.target as HTMLFormElement).password.value
		})

		fetch(baseURL + '/api/user', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: data
		})
		.then(response => {
			return response.json()
		})
		.then(response => {
			if (!response.ok || response.errors) {
				console.error('Custom errors:', response.errors, "Server error:", response.error);
				error.value = response.errors ? response.errors : response.error;
				return;
			}

			router.push('/login');
			alert('Registration successful! You can now log in.');
		})
		.catch(error => {
			console.error('Error:', error);
			error.value = error;
		});
	}
</script>

<template>
	<main>
		<div class="errors" v-if="error">
			<p v-if="typeof error === 'string'">{{ error }}</p>
			<ul v-else-if="Array.isArray(error)">
				<li v-for="(err, index) in error" :key="index">{{ err.msg }}</li>
			</ul>
			<p v-else>{{ error.msg ?? error }}</p>
		</div>
		<FormComponent :formLegend="formData.formLegend" :fields="formData.fields" :actions="formData.actions"
			:onSubmit="onsubmit" />
	</main>
</template>

<style scoped>
main {
	display: flex;
	flex-direction: column;
	justify-content: center;
	align-items: center;
	width: 50%;
	margin: 3rem auto;
}

.errors {
	color: red;
	font-size: 1.2rem;
	margin-bottom: 1rem;
	border: 1px solid red;
	border-radius: 1rem;
	padding: 1rem;
}

.errors ul {
	list-style-type: disc;
	padding-left: 1.5rem;
}
</style>