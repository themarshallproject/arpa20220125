<script>
  export let location;
  export let wtfData;
  let data = []; // Initialize data
  let selectedIndex = 0; // Randomly pick an array element
  
  const loading = Promise.all([location, wtfData])
    .then( ([locationResponse, wtfResponse]) => {
      data = wtfResponse;
      selectedIndex = data.findIndex(d => d.statecode === locationResponse.region_code);
    });

  function randomize() {
    // Get a random index
    const newIndex = Math.floor(Math.random() * data.length);

    if (data.length > 1 && newIndex === selectedIndex) {
      // If new index matches the current index, re-randomize;
      // check array length to avoid infinite recursion
      randomize();
    } else {
      // Else update index
      selectedIndex = newIndex;
    }
  }
  
  $: selectedWTF = data[selectedIndex]
</script>


{#await loading}
	<p>...Loading...</p>
{:then}
  <p>{selectedWTF.name}, {selectedWTF.statecode}</p>
  <button on:click={randomize}>Show me another</button>
{/await}