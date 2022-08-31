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
      console.log(data)
      selectedIndex = data.findIndex(d => d.state === locationResponse.region);
    });

  const amountFormatter = format('.2s');

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

	function handleClick() {
    // Report the interaction to GA
    window.TMPAnalytics.trackEvent(
      '#arpa-categories-randousel',
      'clicked',
      String(count)
    );

    if (count == 51) {
      count = 1
    } else {
      count += 1
    }
	}


  $: if (count == 0) {
    selectedWTF = data[selectedIndex]
  } else {
    selectedWTF = data.filter(d => +d.rank == count)[0]
  }
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
      <CardText div class="card-spending">
        {#if selectedWTF.obligations}
          Obligation: ${amountFormatter(selectedWTF.obligations).toLocaleString("en-US", {maximumSignificantDigits: 0})}
          {:else} Budget: ${amountFormatter(selectedWTF.budget).toLocaleString("en-US", {maximumSignificantDigits: 0})}
        {/if}
      </CardText>
      <CardText div class="card-desciption">
        "{selectedWTF.description}"
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
    <Button div class="card-button" on:click={handleClick}>Show me another</Button>
  </CardActions>
</div>


{/await}
