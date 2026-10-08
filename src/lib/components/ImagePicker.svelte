<script lang="ts">
  import { Button } from '@smykla-skalski/sui';

  let {
    label,
    hint,
    src,
    busy = false,
    onpick,
    onclear
  }: {
    label: string;
    hint: string;
    src: string | null;
    busy?: boolean;
    onpick: (file: File) => void;
    onclear: () => void;
  } = $props();

  let input: HTMLInputElement;
</script>

<div class="picker">
  <div class="thumb">
    {#if src}
      <img {src} alt={label} />
    {:else}
      <span>Brak zdjęcia</span>
    {/if}
  </div>
  <div class="meta">
    <strong>{label}</strong>
    <p>{hint}</p>
    <div class="actions">
      <Button size="sm" variant="secondary" loading={busy} onclick={() => input.click()}>
        {src ? 'Zmień' : 'Dodaj zdjęcie'}
      </Button>
      {#if src}
        <Button size="sm" variant="ghost" onclick={onclear}>Usuń</Button>
      {/if}
    </div>
    <input
      bind:this={input}
      type="file"
      accept="image/jpeg,image/png,image/webp"
      hidden
      onchange={(e) => {
        const file = e.currentTarget.files?.[0];
        if (file) onpick(file);
        e.currentTarget.value = '';
      }}
    />
  </div>
</div>

<style>
  .picker {
    display: grid;
    grid-template-columns: 8rem 1fr;
    gap: 1rem;
    align-items: center;
  }
  .thumb {
    aspect-ratio: 4 / 3;
    display: grid;
    place-items: center;
    overflow: hidden;
    border: 1px dashed var(--sui-border, #c4cec9);
    border-radius: var(--sui-radius, 0.5rem);
    background: var(--sui-subtle, #f1f4f3);
    color: var(--sui-muted, #4c5b57);
    font-size: 0.75rem;
  }
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  p {
    margin: 0.125rem 0 0.5rem;
    font-size: 0.75rem;
    color: var(--sui-muted, #4c5b57);
  }
  .actions {
    display: flex;
    gap: 0.5rem;
  }
</style>
