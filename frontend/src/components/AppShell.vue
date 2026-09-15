<template>
  <div class="app-shell">
    <header class="topbar">
      <RouterLink to="/" class="brand" aria-label="Reminderly home">
        <span class="brand-mark">✓</span>
        <span>Reminderly</span>
      </RouterLink>
      <RouterLink to="/reminders/new" class="button button-primary button-small"
        >+ Create</RouterLink
      >
    </header>

    <main class="app-content">
      <RouterView />
    </main>

    <nav class="bottom-nav" aria-label="Main navigation">
      <RouterLink to="/" exact-active-class="active"
        ><span>⌂</span>Home</RouterLink
      >
      <RouterLink to="/reminders" active-class="active"
        ><span>☷</span>Reminders</RouterLink
      >
      <RouterLink to="/settings" active-class="active"
        ><span>⚙</span>Settings</RouterLink
      >
    </nav>
  </div>
</template>
