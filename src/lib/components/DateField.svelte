<script lang="ts">
  let { label, value = $bindable('') }: { label: string; value?: string } = $props();

  const id = $props.id();
</script>

<div class="control">
  <label for={id}>{label}</label>
  <input {id} type="date" bind:value />
</div>

<style>
  .control {
    display: grid;
    gap: 0.375rem;
  }
  label {
    font-size: 0.8125rem;
    font-weight: 600;
  }
  input {
    width: 100%;
    min-height: 2.5rem;
    padding: 0.5rem 0.75rem;
    border: 1px solid var(--sui-border, #c4cec9);
    border-radius: var(--sui-radius, 0.5rem);
    background: var(--sui-surface, #fff);
    color: var(--sui-foreground, #18211f);
    font: inherit;
    font-size: 0.875rem;
    box-sizing: border-box;
  }
  input:focus-visible {
    outline: 2px solid var(--sui-focus, #0f766e);
    outline-offset: 2px;
  }
</style>
