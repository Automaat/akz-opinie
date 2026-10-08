<script lang="ts">
  import Editor from '$lib/components/Editor.svelte';

  let { data } = $props();
</script>

{#key data.cruise.id}
  <Editor initial={data.cruise} />
{/key}
