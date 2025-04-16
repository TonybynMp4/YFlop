<template>
    <main>
		<section>
			<h2>YFlop</h2>
			<p>
				Bienvenue sur YFlop, le réseau social préféré des gens toxiques !
			</p>
			<div class="actions">
				<router-link to="/login">Se connecter</router-link>
				<router-link to="/register">S'inscrire</router-link>
			</div>
		</section>
    </main>
</template>

<style scoped>
    main {
        display: flex;
		flex-direction: column;
        justify-content: center;
        align-items: center;
        height: 80vh;
    }

	.actions {
		display: flex;
		justify-content: center;
		gap: 1rem;
		margin-top: 2rem;
	}

	section {
		transform: translateY(-100%);
	}

	h2 {
		font-size: 2.5rem;
		margin-bottom: 1rem;
		font-weight: bolder;
	}
</style>