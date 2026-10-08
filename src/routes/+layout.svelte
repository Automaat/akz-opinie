<script lang="ts">
  import '@smykla-skalski/sui/styles.css';
  import { onMount } from 'svelte';

  let { children } = $props();

  onMount(() => {
    const query = matchMedia('(prefers-color-scheme: dark)');
    const apply = () =>
      document.documentElement.setAttribute('data-sui-theme', query.matches ? 'dark' : 'light');
    apply();
    query.addEventListener('change', apply);
    return () => query.removeEventListener('change', apply);
  });
</script>

<header class="top">
  <a class="brand" href="/">
    <img src="/akz-logo.png" alt="" width="28" height="29" />
    <span>Opinie z rejsu</span>
  </a>
</header>

<main>{@render children()}</main>

<style>
  :global(body) {
    margin: 0;
    background: var(--sui-canvas, #f6f8f7);
    color: var(--sui-foreground, #18211f);
    font-family: var(--sui-font, system-ui, sans-serif);
  }
  :global(*) {
    box-sizing: border-box;
  }
  .top {
    display: flex;
    align-items: center;
    padding: 0.625rem 1.25rem;
    border-bottom: 1px solid var(--sui-border, #c4cec9);
    background: var(--sui-surface, #fff);
  }
  .brand {
    display: inline-flex;
    align-items: center;
    gap: 0.625rem;
    color: inherit;
    font-weight: 700;
    text-decoration: none;
  }
  main {
    padding: 1.25rem;
  }
</style>
