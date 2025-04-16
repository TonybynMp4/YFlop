<script setup lang="ts">
    import { reactive } from 'vue';
    import FormComponent from '@/components/FormComponent.vue';
    import type { ButtonComponentProps, FieldComponentProps } from '@/types/components';
    import useAuthStore from '@/stores/auth-store';
	import { ref } from 'vue';
	const error = ref<string | null>(null);

    const formData = reactive<{
        formLegend: string;
        fields: FieldComponentProps[];
        actions: ButtonComponentProps[];
    }>({
        formLegend: 'Login',
        fields: [
            { id: 'email', label: 'Email', placeholder: 'Email', type: 'email', required: true },
            { id: 'password', label: 'Password', placeholder: 'Password', type: 'password', minLength: 8, required: true }
        ],
        actions: [
            { id: 'login', label: 'Login' },
            { id: 'reset', label: 'Reset', type: 'reset' }
        ]
    });

    const onSubmit = async (event: Event) => {
        event.preventDefault();
        const authStore = useAuthStore();

		const [success, loginError] = await authStore.login({
            email: (event.target as HTMLFormElement).email.value,
            password: (event.target as HTMLFormElement).password.value
        });

        if (!success) {
			if (loginError) {
					error.value = loginError.error ?? loginError;
			}
        }
    }
</script>

<template>
    <main>
		<div class="errors" v-if="error">
			<p>{{ error }}</p>
		</div>
        <FormComponent
            :formLegend="formData.formLegend"
            :fields="formData.fields"
            :actions="formData.actions"
            :onSubmit="onSubmit"
        />
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