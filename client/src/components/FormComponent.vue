<script setup lang="ts">
import ButtonComponent from './ButtonComponent.vue';
import FieldComponent from './FieldComponent.vue';
import type { FormComponentProps } from '../types/components';

defineProps<FormComponentProps>();
</script>

<template>
    <form v-on:submit="onSubmit">
        <fieldset>
            <legend>{{ formLegend }}</legend>

            <FieldComponent v-for="field in fields" :key="field.id" :id="field.id" :label="field.label"
            :placeholder="field.placeholder" :type="field.type" :required="field.required" :defaultValue="field.defaultValue" />

            <section class="actions">
                <ButtonComponent v-for="action in actions" :key="action.id" :id="action.id" :label="action.label"
                    :type="action.type" />
            </section>
        </fieldset>
    </form>
</template>

<style scoped>
form {
    width: 80%;
}

fieldset {
    display: flex;
    flex-direction: column;
    gap: 1rem;
	border-radius: 1rem;
	padding: 2rem;
	border: 1px solid #a5a5a5;
}

.actions {
	display: flex;
    flex-direction: row;
    gap: 1rem;
}

.actions button {
    flex: 1 1 auto;
	padding: 0.5rem;
}

#reset {
	background-color: darkred;
	color: white;
    flex: 0 1 auto;
}

#reset:hover {
	background-color: red;
}
</style>