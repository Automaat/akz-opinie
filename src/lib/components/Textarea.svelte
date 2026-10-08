<script lang="ts">
  let {
    label,
    value = $bindable(''),
    rows = 4,
    hint
  }: { label: string; value?: string; rows?: number; hint?: string } = $props();

  const id = $props.id();
</script>

<div class="control">
  <label for={id}>{label}</label>
  <textarea {id} {rows} bind:value></textarea>
  {#if hint}<p>{hint}</p>{/if}
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
  textarea {
    width: 100%;
    padding: 0.5rem 0.75rem;
    border: 1px solid var(--sui-border, #c4cec9);
    border-radius: var(--sui-radius, 0.5rem);
    background: var(--sui-surface, #fff);
    color: var(--sui-foreground, #18211f);
    font: inherit;
    font-size: 0.875rem;
    line-height: 1.45;
    resize: vertical;
    box-sizing: border-box;
  }
  textarea:focus-visible {
    outline: 2px solid var(--sui-focus, #0f766e);
    outline-offset: 2px;
  }
  p {
    margin: 0;
    font-size: 0.75rem;
    color: var(--sui-muted, #4c5b57);
  }
</style>
