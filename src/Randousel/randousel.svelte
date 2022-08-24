<script>
  import { Card, CardSubtitle, CardTitle, CardText, CardActions, Button, MaterialApp } from 'svelte-materialify';

  export let location;
  export let wtfData;
  let data = []; // Initialize data
  let selectedIndex = 0; // Randomly pick an array element
  
  const loading = Promise.all([location, wtfData])
    .then( ([locationResponse, wtfResponse]) => {
      data = wtfResponse['data']['requests'].filter(d => d.wtf);

      selectedIndex = data.findIndex(d => d.state === locationResponse.region);
    });

  function titleCase(str) {
    str = str.toLowerCase().split(' ');
    for (var i = 0; i < str.length; i++) {
      str[i] = str[i].charAt(0).toUpperCase() + str[i].slice(1); 
    }
    return str.join(' ');
  }

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

<p>Here's an example of how local government spent the federal COVID-19 relief fund on the criminal justice system.</p>
{#await loading}
	<p>...Loading examples...</p>
{:then}

<MaterialApp class="arpa-project-example">
  <Card div class="arpa-project-example-card">
    <div class="arpa-project-example-card-content">
      <CardTitle div class="card-location">
        {titleCase(selectedWTF.place)}, {titleCase(selectedWTF.state)}
      </CardTitle>
      <CardTitle div class="card-project-name">
        Project name: {titleCase(selectedWTF.projectName)}
      </CardTitle>
      <CardTitle div class="card-spending">
        {#if selectedWTF.obligations > 0} Obligation: ${selectedWTF.obligations.toLocaleString("en-US")}
        {:else if selectedWTF.budget > 0} Budget: ${selectedWTF.budget.toLocaleString("en-US")}
        {/if} 
      </CardTitle>
      <CardTitle div class="card-category">
        Project category: {selectedWTF.category.split("-")[1]}
      </CardTitle>


      <CardText div class="card-desciption">
        "{selectedWTF.description}"
      </CardText>
    </div>
  </Card>

  <div class="arpa-project-example-card-action">
    <CardActions>
      <Button div class="card-button" on:click={randomize}>Show me another</Button>
    </CardActions>
  </div>


</MaterialApp>
<div class="graphic-source">
  Source: State and local governments are required to report how they are spending the American Resecue Plan funds to <a href="https://home.treasury.gov/policy-issues/coronavirus/assistance-for-state-local-and-tribal-governments/state-and-local-fiscal-recovery-funds">
      the U.S. Department of Treasury
    </a>. While the federal government does not specifically track criminal justice-related spending, The Marshall Project selected a sample of ARPA spending on criminal justice by conducting keyword searches on the project descriptions that local government wrote.
  <br><br>
  Hi
</div>

  
  
{/await}