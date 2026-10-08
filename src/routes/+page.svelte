<script lang="ts">
  import { goto, invalidateAll } from '$app/navigation';
  import { Badge, Button, Card } from '@smykla-skalski/sui';
  import { formatDate } from '$lib/format';
  import type { Cruise } from '$lib/types';

  let { data } = $props();
  let busy = $state(false);

  const heading = (c: Cruise) => c.title || c.series || 'Rejs bez nazwy';

  async function create() {
    busy = true;
    const res = await fetch('/api/cruises', { method: 'POST' });
    const cruise: Cruise = await res.json();
    await goto(`/cruise/${cruise.id}`);
  }

  async function duplicate(c: Cruise) {
    busy = true;
    await fetch(`/api/cruises/${c.id}/duplicate`, { method: 'POST' });
    await invalidateAll();
    busy = false;
  }

  async function remove(c: Cruise) {
    if (!confirm(`Usunąć „${heading(c)}” razem ze zdjęciami? Tej operacji nie można cofnąć.`))
      return;
    await fetch(`/api/cruises/${c.id}`, { method: 'DELETE' });
    await invalidateAll();
  }
</script>

<svelte:head><title>Opinie z rejsu</title></svelte:head>

<div class="wrap">
  <div class="head">
    <h1>Rejsy</h1>
    <Button loading={busy} onclick={create}>Nowy rejs</Button>
  </div>

  {#if data.cruises.length === 0}
    <Card
      heading="Brak rejsów"
      description="Dodaj pierwszy rejs, wpisz załogę i pobierz opinie w PDF."
    >
      <Button onclick={create}>Nowy rejs</Button>
    </Card>
  {:else}
    <div class="grid">
      {#each data.cruises as c (c.id)}
        <Card
          heading={heading(c)}
          description={[c.yacht.name, c.embark.date && formatDate(c.embark.date)]
            .filter(Boolean)
            .join(' · ')}
        >
          <div class="meta">
            <Badge>{c.crew.length} os.</Badge>
            {#if c.embark.port || c.disembark.port}
              <span>{c.embark.port} → {c.disembark.port}</span>
            {/if}
          </div>
          {#snippet footer()}
            <Button size="sm" onclick={() => goto(`/cruise/${c.id}`)}>Otwórz</Button>
            <Button size="sm" variant="secondary" onclick={() => duplicate(c)}>Duplikuj</Button>
            <Button size="sm" variant="ghost" onclick={() => remove(c)}>Usuń</Button>
          {/snippet}
        </Card>
      {/each}
    </div>
  {/if}
</div>

<style>
  .wrap {
    max-width: 64rem;
    margin: 0 auto;
  }
  .head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 1rem;
  }
  h1 {
    margin: 0;
    font-size: 1.5rem;
  }
  .grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(18rem, 1fr));
    gap: 1rem;
  }
  .meta {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.8125rem;
    color: var(--sui-muted, #4c5b57);
  }
</style>
