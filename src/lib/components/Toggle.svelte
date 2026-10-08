<script lang="ts">
  let { label, checked = $bindable(false) }: { label: string; checked?: boolean } = $props();
</script>

<label class="toggle">
  <input type="checkbox" bind:checked />
  <span>{label}</span>
</label>

<style>
  .toggle {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.875rem;
    min-height: 2.5rem;
    cursor: pointer;
  }
  input {
    width: 1.125rem;
    height: 1.125rem;
    accent-color: var(--sui-primary, #0f766e);
  }
</style>
