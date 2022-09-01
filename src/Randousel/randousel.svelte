<script>
  import { Card, CardSubtitle, CardTitle, CardText, CardActions, Button, MaterialApp } from 'svelte-materialify';
  import { format } from 'd3';

  export let location;
  export let wtfData;
  let count = 0;
  let data = []; // Initialize data
  let selectedIndex = 0; // Randomly pick an array element
  let selectedWTF;

  const loading = Promise.all([location, wtfData])
    .then( ([locationResponse, wtfResponse]) => {
      data = wtfResponse['data']['requests'].filter(d => d.wtf);
      selectedIndex = data.findIndex(d => d.state === locationResponse.region);
    });

  const amountFormatter = format('.2s');
	
	function handleClick() {
    if (count === 51) {
      count = 1
    } else {
      count += 1
    }
	}

  
  $: if (count === 0) {
    if (data[selectedIndex]) {
      selectedWTF = data[selectedIndex]
    } else {
      selectedWTF = data.filter(d => +d.rank === 1)[0]
    }
  } else {
    selectedWTF = data.filter(d => +d.rank === count)[0]
  }
</script>

{#await loading}
	<p>...Loading examples...</p>
{:then}

<MaterialApp class="arpa-project-example">
  <Card div class="arpa-project-example-card">
    <div class="arpa-project-example-card-content">
      <CardTitle div class="card-location">
        {#if selectedWTF.place.includes("State") | selectedWTF.state === "District Of Columbia"}
        {selectedWTF.place}
        {:else}
        {selectedWTF.place}, {selectedWTF.state}
        {/if}
      </CardTitle>
      <CardTitle div class="card-project-name">
        Project name: {selectedWTF.projectName}
      </CardTitle>
      <CardText div class="card-spending">
        {#if selectedWTF.obligations}
          Obligation: ${amountFormatter(selectedWTF.obligations).toLocaleString("en-US", {maximumSignificantDigits: 0})}
          {:else} Budget: ${amountFormatter(selectedWTF.budget).toLocaleString("en-US", {maximumSignificantDigits: 0})}
        {/if}
      </CardText>
      <CardText div class="card-desciption">
        <span class="card-desciption card-desciption-lead-in">From their report submitted to the Treasury Department:</span> "{selectedWTF.description}"
      </CardText>
      <CardText div class="graphic-source">
        Source: Spending data reported to the
          <a href="https://home.treasury.gov/policy-issues/coronavirus/assistance-for-state-local-and-tribal-governments/state-and-local-fiscal-recovery-funds">
            U.S. Department of Treasury
          </a>
      </CardText>
    </div>
  </Card>

</MaterialApp>
<div class="arpa-project-example-card-action">
  <CardActions>
    <Button size="large" div class="card-button" on:click={handleClick}>Show me another</Button>
  </CardActions>
</div>
  
  
{/await}
