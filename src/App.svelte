<script lang="ts">
  import mockTables from "./mock.ts";
  import {displayIndex, formatTable} from './utils.ts'
  import {
    MakeNumericOnlyCommand,
    RemoveColumnCommand,
    TransformationCommand
  } from "./transformation.ts";
  import {range} from 'ramda';
  import Papa from 'papaparse';
  import Clipboard from 'svelte-clipboard';
  import {SvelteToast, toast} from "@zerodevx/svelte-toast";

  let loading: boolean = false;
  let tables: Array<Array<Array<string>>>;
  let renderedTable: Array<Array<string>>;
  let selectedTable = 0;
  let tableTransformations: Array<TransformationCommand> = [];

  let columnIndexes

  const loadTestData = () => {
    tables = mockTables;
  }
  const clearTables = () => {
    if (confirm("Clear current tables?")) {
      tables = undefined;
      tableTransformations = [];
    }
  }
  const clearModifications = () => {
    tableTransformations = []
  }
  const removeColumn = (i: number) => {
    tableTransformations = [...tableTransformations, new RemoveColumnCommand(i)]
    renderedTable = renderTable()
  }

  const makeColumnNumeric = (i: number) => {
    tableTransformations = [...tableTransformations, new MakeNumericOnlyCommand(i)]
  }
  const applyMakeColumnNumericOnly = (row) => {
    const columnsToApply = tableTransformations.map(t => t.numericOnly).filter(Number.isInteger);
    return row.map((cellValue, i) => columnsToApply.includes(i) ? cellValue.replace(/[^0-9.]/g, '') : cellValue)
  }

  const filterRemovedColumns = (row) => {
    const columnsToRemove = tableTransformations.map(t => t.removedColumn).filter(Number.isInteger);
    return row.filter((value, index) => columnsToRemove.indexOf(index) === -1)
  }
  $: {
    renderedTable
    columnIndexes = tables
      ? filterRemovedColumns(range(0, tables[selectedTable][0].length))
      : []
  }
  const skipHeader = func => (row: string[], index: number) => index === 0 ? row : func(row)
  const renderTable = () => {
    if (!tables) {
      return []
    }
    return tables[selectedTable]
      .map(skipHeader(applyMakeColumnNumericOnly))
      .map(filterRemovedColumns);
  }
  $: if (tables) {
    renderedTable = renderTable()
  }
  $: {
    tableTransformations;
    renderedTable = renderTable();
  }

  const handleFileSubmitted = async (event: InputEvent) => {
    loading = true
    const input = event.currentTarget as HTMLInputElement
    const files: FileList = input.files
    if (files.length !== 1) {
      throw new Error("Bad file upload")
    }
    const file: File = files[0];
    try {
      const res: Response = await fetch(
        "https://ruwx1zuhy6.execute-api.us-east-1.amazonaws.com/",
        {
          method: "POST",
          body: file,
          mode: "cors",
        }
      )
      const stream = await res.json()
      tables = stream.data.tables.map(formatTable)
    } catch (e) {
      console.error("Could not process", e)
    } finally {
      loading = false
    }
  }
</script>

<main>
  {#if !tables}
    {#if !loading}
      <h3>
        Upload an image to begin
      </h3>
      <input type="file" on:input|preventDefault={handleFileSubmitted}>
      <button on:click={loadTestData}>load test data</button>
    {:else }
      loading...
    {/if}
  {:else}
    <label for="table-select">Table:</label>
    <select name="" id="table-select" bind:value={selectedTable}>
      {#each tables as _, index}
        <option value={index}>{displayIndex(index)}</option>
      {/each}
    </select>

    <button on:click={clearTables}>Clear Table</button>
    <button on:click={clearModifications}>Start Over</button>
    <Clipboard
      text={Papa.unparse(renderedTable)}
      let:copy
      on:copy={() => { toast.push("Copied to clipboard"); }}
    >
      <button on:click={copy}>Copy to clipboard</button>
    </Clipboard>

    <div class="table-section">
      <table>
        {#each columnIndexes as index}
          <th>
            <button on:click={removeColumn.bind(undefined, index)}>
              Remove Column {index + 1}
            </button>
            <button on:click={makeColumnNumeric.bind(undefined, index)}>numeric only</button>
          </th>
        {/each}
        {#each renderedTable as row}
          <tr>
            {#each row as col}
              <td>{col}</td>
            {/each}
          </tr>
        {/each}
      </table>
    </div>
  {/if}

  <SvelteToast options={{duration: 500, initial: -1}}/>
</main>

<style lang="scss">
  main {
    text-align: center;
    padding: 1em;
    max-width: 240px;
    margin: 0 auto;

    table {
      margin: auto
    }
  }

  @media (min-width: 640px) {
    main {
      max-width: none;
    }
  }

  table, th, td {
    border: 1px solid black;
  }
</style>