<script lang="ts">
  import { Field } from '@smykla-skalski/sui';

  let {
    label,
    value = $bindable(''),
    options,
    hint
  }: { label: string; value?: string; options: string[]; hint?: string } = $props();

  const listId = $props.id();
</script>

<Field {label} {hint} bind:value list={listId} autocomplete="off" />
<datalist id={listId}>
  {#each options as option (option)}
    <option value={option}></option>
  {/each}
</datalist>
