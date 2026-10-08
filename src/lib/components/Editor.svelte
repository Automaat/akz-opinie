<script lang="ts">
  import { onMount, untrack } from 'svelte';
  import { Badge, Button, Card, Field } from '@smykla-skalski/sui';
  import Combo from '$lib/components/Combo.svelte';
  import DateField from '$lib/components/DateField.svelte';
  import ImagePicker from '$lib/components/ImagePicker.svelte';
  import Textarea from '$lib/components/Textarea.svelte';
  import Toggle from '$lib/components/Toggle.svelte';
  import { fullName, sumHours } from '$lib/format';
  import {
    DUTIES,
    RANKS,
    RESISTANCE,
    ROLES,
    SEASICKNESS,
    SUITABLE_FOR,
    YACHT_TYPES
  } from '$lib/options';
  import { renderDocument } from '$lib/render';
  import { emptyMember, type Cruise, type ImageSlot } from '$lib/types';

  let { initial }: { initial: Cruise } = $props();

  let cruise = $state<Cruise>(untrack(() => structuredClone(initial)));
  let selectedId = $state(cruise.crew[0]?.id ?? '');
  let status = $state<'saved' | 'dirty' | 'saving' | 'error'>('saved');
  let uploading = $state<Record<string, boolean>>({});
  let previewWidth = $state(600);
  let previewHeight = $state(1123);
  let frame: HTMLIFrameElement | undefined = $state();

  const PAGE_PX = 1123;
  const PAGE_WIDTH_PX = 794;

  const selected = $derived(cruise.crew.find((m) => m.id === selectedId) ?? cruise.crew[0]);
  const html = $derived(selected ? renderDocument(cruise, [selected]) : '');
  const scale = $derived(Math.min(1, previewWidth / PAGE_WIDTH_PX));
  const overflow = $derived(previewHeight > PAGE_PX + 4);
  const imageUrl = (slot: ImageSlot) =>
    cruise.images[slot]
      ? `/api/cruises/${cruise.id}/images/${slot}?v=${cruise.images[slot]}`
      : null;

  let lastSaved = untrack(() => JSON.stringify({ ...initial, images: undefined }));
  let timer: ReturnType<typeof setTimeout> | undefined;

  const payload = () => JSON.stringify({ ...cruise, images: undefined });

  async function save(keepalive = false) {
    clearTimeout(timer);
    const body = payload();
    if (body === lastSaved) return;
    status = 'saving';
    try {
      const res = await fetch(`/api/cruises/${cruise.id}`, {
        method: 'PUT',
        headers: { 'content-type': 'application/json' },
        body,
        keepalive: keepalive && body.length < 60_000
      });
      if (!res.ok) throw new Error(String(res.status));
      lastSaved = body;
      status = payload() === body ? 'saved' : 'dirty';
    } catch {
      status = 'error';
    }
  }

  $effect(() => {
    const current = payload();
    if (current === lastSaved) return;
    status = 'dirty';
    clearTimeout(timer);
    timer = setTimeout(() => save(), 700);
    return () => clearTimeout(timer);
  });

  onMount(() => {
    const flush = () => {
      if (payload() !== lastSaved) save(true);
    };
    const onHide = () => document.visibilityState === 'hidden' && flush();
    addEventListener('beforeunload', flush);
    document.addEventListener('visibilitychange', onHide);
    return () => {
      flush();
      removeEventListener('beforeunload', flush);
      document.removeEventListener('visibilitychange', onHide);
    };
  });

  function measure() {
    const sheet = frame?.contentDocument?.querySelector('.sheet');
    previewHeight = Math.max(
      PAGE_PX,
      Math.ceil((sheet as HTMLElement | null)?.scrollHeight ?? PAGE_PX)
    );
  }

  function addMember() {
    const last = cruise.crew.at(-1);
    const member = { ...emptyMember(), ...(last && { suitableFor: last.suitableFor }) };
    cruise.crew.push(member);
    selectedId = member.id;
  }

  function removeMember(id: string) {
    const index = cruise.crew.findIndex((m) => m.id === id);
    if (index < 0 || !confirm(`Usunąć ${fullName(cruise.crew[index]) || 'tego załoganta'}?`))
      return;
    cruise.crew.splice(index, 1);
    if (cruise.crew.length === 0) cruise.crew.push(emptyMember());
    selectedId = cruise.crew[Math.min(index, cruise.crew.length - 1)].id;
  }

  async function upload(slot: ImageSlot, file: File) {
    uploading[slot] = true;
    try {
      const res = await fetch(`/api/cruises/${cruise.id}/images/${slot}`, {
        method: 'PUT',
        headers: { 'content-type': file.type || 'application/octet-stream' },
        body: file
      });
      if (!res.ok) throw new Error((await res.json()).message);
      cruise.images = (await res.json()).images;
    } catch (e) {
      alert(`Nie udało się wgrać zdjęcia: ${(e as Error).message}`);
    } finally {
      uploading[slot] = false;
    }
  }

  async function clearImage(slot: ImageSlot) {
    const res = await fetch(`/api/cruises/${cruise.id}/images/${slot}`, { method: 'DELETE' });
    if (res.ok) cruise.images = (await res.json()).images;
  }

  const pdf = (member: string) => async () => {
    await save();
    location.href = `/api/cruises/${cruise.id}/pdf?member=${member}`;
  };

  const statusText = {
    saved: 'Zapisano',
    dirty: 'Niezapisane zmiany…',
    saving: 'Zapisywanie…',
    error: 'Błąd zapisu'
  };
  const statusTone = {
    saved: 'success',
    dirty: 'neutral',
    saving: 'neutral',
    error: 'danger'
  } as const;
</script>

<svelte:head><title>{cruise.title || cruise.series || 'Rejs'} · Opinie z rejsu</title></svelte:head>

<div class="layout">
  <div class="form">
    <div class="bar">
      <a href="/">← Rejsy</a>
      <Badge tone={statusTone[status]}>{statusText[status]}</Badge>
    </div>

    <Card heading="Rejs">
      <div class="cols">
        <Field
          label="Nazwa (tylko w aplikacji)"
          bind:value={cruise.title}
          placeholder="np. NNE 2026"
        />
        <Field label="Rejs z cyklu" bind:value={cruise.series} placeholder="Navigare Necesse Est" />
        <Field label="Port zaokrętowania" bind:value={cruise.embark.port} />
        <DateField label="Data zaokrętowania" bind:value={cruise.embark.date} />
        <Field label="Port wyokrętowania" bind:value={cruise.disembark.port} />
        <DateField label="Data wyokrętowania" bind:value={cruise.disembark.date} />
      </div>
      <Field label="Odwiedzone porty" bind:value={cruise.visitedPorts} hint="Po przecinku" />
      <Toggle label="Rejs na wodach pływowych" bind:checked={cruise.tidal} />
    </Card>

    <Card heading="Jacht">
      <div class="cols">
        <Combo label="Typ jachtu" bind:value={cruise.yacht.type} options={YACHT_TYPES} />
        <Field label="Klasa jachtu" bind:value={cruise.yacht.class} placeholder="Bruceo 43" />
        <Field label="Nazwa jachtu" bind:value={cruise.yacht.name} />
        <Field label="Długość całkowita (m)" bind:value={cruise.yacht.length} inputmode="decimal" />
      </div>
    </Card>

    <Card heading="Zestawienie godzinowe">
      <div class="cols three">
        <Field label="Postój (h)" bind:value={cruise.hours.harbour} inputmode="decimal" />
        <Field label="Żagle (h)" bind:value={cruise.hours.sails} inputmode="decimal" />
        <Field label="Silnik (h)" bind:value={cruise.hours.engine} inputmode="decimal" />
        <Field label="Powyżej 6°B (h)" bind:value={cruise.hours.above6B} inputmode="decimal" />
        <Field label="Przebyto (Nm)" bind:value={cruise.hours.miles} inputmode="decimal" />
        <Field
          label="Suma godzin"
          value={sumHours(cruise.hours.sails, cruise.hours.engine)}
          readonly
          hint="Żagle + silnik"
        />
      </div>
    </Card>

    <Card heading="Kapitan i opis rejsu">
      <div class="cols">
        <Field label="Kapitan" bind:value={cruise.captain.name} />
        <Field label="Numer patentu" bind:value={cruise.captain.patent} placeholder="PU/3843" />
        <Field label="Telefon" bind:value={cruise.captain.phone} type="tel" />
        <Field label="E-mail" bind:value={cruise.captain.email} type="email" />
      </div>
      <Textarea
        label="Uwagi od kapitana o przebiegu rejsu"
        bind:value={cruise.captainRemarks}
        rows={6}
      />
    </Card>

    <Card
      heading="Zdjęcia"
      description="Logo AKŻ jest wstawiane automatycznie. Zdjęcia są wspólne dla wszystkich opinii."
    >
      <ImagePicker
        label="Zdjęcie załogi"
        hint="Prawy górny róg, 4:3"
        src={imageUrl('crew')}
        busy={uploading.crew}
        onpick={(f) => upload('crew', f)}
        onclear={() => clearImage('crew')}
      />
      <ImagePicker
        label="Zdjęcie jachtu lub trasy"
        hint="Obok informacji o jachcie, 3:2"
        src={imageUrl('yacht')}
        busy={uploading.yacht}
        onpick={(f) => upload('yacht', f)}
        onclear={() => clearImage('yacht')}
      />
    </Card>

    <Card heading="Załoga ({cruise.crew.length})">
      <div class="crew">
        {#each cruise.crew as m, i (m.id)}
          <button
            type="button"
            class="chip"
            class:active={m.id === selected?.id}
            onclick={() => (selectedId = m.id)}
          >
            <span class="n">{i + 1}</span>{fullName(m) || 'Nowa osoba'}
          </button>
        {/each}
        <Button size="sm" variant="secondary" onclick={addMember}>+ Dodaj</Button>
      </div>

      {#if selected}
        {#key selected.id}
          <div class="member">
            <div class="cols">
              <Field label="Imię" bind:value={selected.firstName} />
              <Field label="Nazwisko" bind:value={selected.lastName} />
              <Combo label="Stopień żeglarski" bind:value={selected.rank} options={RANKS} />
              <Field label="Numer patentu" bind:value={selected.patent} placeholder="PU/12345" />
              <Combo label="Funkcja na jachcie" bind:value={selected.role} options={ROLES} />
              <label class="select">
                <span>Forma gramatyczna</span>
                <select bind:value={selected.gender}>
                  <option value="m">Męska (załogant, chorował)</option>
                  <option value="f">Żeńska (załogantka, chorowała)</option>
                </select>
              </label>
              <Combo
                label="Z obowiązków wywiązywał/a się"
                bind:value={selected.duty}
                options={DUTIES}
              />
              <Combo
                label="Chorobie morskiej"
                bind:value={selected.seasickness}
                options={SEASICKNESS}
              />
              <Combo
                label="Odporność w trudnych warunkach"
                bind:value={selected.resistance}
                options={RESISTANCE}
              />
              <Combo
                label="Nadaje się do"
                bind:value={selected.suitableFor}
                options={SUITABLE_FOR}
              />
            </div>
            <Textarea label="Uwagi kapitana" bind:value={selected.remarks} rows={4} />
            <div>
              <Button size="sm" variant="danger" onclick={() => removeMember(selected.id)}
                >Usuń z załogi</Button
              >
            </div>
          </div>
        {/key}
      {/if}
    </Card>
  </div>

  <aside class="preview">
    <div class="pbar">
      <select aria-label="Podgląd opinii dla" bind:value={selectedId}>
        {#each cruise.crew as m (m.id)}
          <option value={m.id}>{fullName(m) || 'Nowa osoba'}</option>
        {/each}
      </select>
      <Button size="sm" onclick={pdf(selected?.id ?? 'all')}>PDF</Button>
      <Button size="sm" variant="secondary" onclick={pdf('all')}>Wszystkie PDF</Button>
      <Button size="sm" variant="secondary" onclick={pdf('zip')}>ZIP</Button>
    </div>
    {#if overflow}
      <Badge tone="warning">Opinia nie mieści się na jednej stronie — skróć teksty</Badge>
    {/if}
    <div class="stage" bind:clientWidth={previewWidth}>
      <div class="scaler" style:height="{previewHeight * scale}px">
        <iframe
          bind:this={frame}
          title="Podgląd opinii"
          srcdoc={html}
          onload={measure}
          style:width="{PAGE_WIDTH_PX}px"
          style:height="{previewHeight}px"
          style:transform="scale({scale})"
        ></iframe>
      </div>
    </div>
  </aside>
</div>

<style>
  .layout {
    display: grid;
    grid-template-columns: minmax(0, 40rem) minmax(0, 1fr);
    gap: 1.5rem;
    align-items: start;
    max-width: 100rem;
    margin: 0 auto;
  }
  .form {
    display: grid;
    gap: 1rem;
  }
  .bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .bar a {
    color: var(--sui-primary, #0f766e);
    text-decoration: none;
    font-weight: 600;
  }
  .cols {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 0.75rem;
    margin-bottom: 0.75rem;
  }
  .cols.three {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
  .crew {
    display: flex;
    flex-wrap: wrap;
    gap: 0.375rem;
    margin-bottom: 1rem;
  }
  .chip {
    display: inline-flex;
    align-items: center;
    gap: 0.375rem;
    padding: 0.25rem 0.625rem;
    border: 1px solid var(--sui-border, #c4cec9);
    border-radius: 999px;
    background: var(--sui-surface, #fff);
    color: inherit;
    font: inherit;
    font-size: 0.8125rem;
    cursor: pointer;
  }
  .chip.active {
    border-color: var(--sui-primary, #0f766e);
    background: var(--sui-primary, #0f766e);
    color: var(--sui-primary-foreground, #fff);
  }
  .n {
    opacity: 0.6;
    font-variant-numeric: tabular-nums;
  }
  .member {
    display: grid;
    gap: 0.75rem;
  }
  .select {
    display: grid;
    gap: 0.375rem;
    font-size: 0.8125rem;
    font-weight: 600;
  }
  select {
    min-height: 2.5rem;
    padding: 0.5rem 0.75rem;
    border: 1px solid var(--sui-border, #c4cec9);
    border-radius: var(--sui-radius, 0.5rem);
    background: var(--sui-surface, #fff);
    color: inherit;
    font: inherit;
    font-size: 0.875rem;
  }
  .preview {
    position: sticky;
    top: 1rem;
    display: grid;
    gap: 0.75rem;
  }
  .pbar {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }
  .pbar select {
    flex: 1 1 10rem;
  }
  .stage {
    overflow: auto;
    max-height: calc(100vh - 8rem);
    border: 1px solid var(--sui-border, #c4cec9);
    border-radius: var(--sui-surface-radius, 0.625rem);
    background: var(--sui-subtle, #e8ecea);
  }
  .scaler {
    position: relative;
  }
  iframe {
    display: block;
    border: 0;
    background: #fff;
    transform-origin: top left;
  }
  @media (max-width: 70rem) {
    .layout {
      grid-template-columns: minmax(0, 1fr);
    }
    .preview {
      position: static;
    }
  }
</style>
