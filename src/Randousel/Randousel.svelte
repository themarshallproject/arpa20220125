<script>
  import { Card, CardSubtitle, CardTitle, CardText, CardActions, Button, MaterialAppMin } from 'svelte-materialify';
  import { format } from 'd3';
  import wtfDataRaw from '../assets/data/arpa_wtfs.json';

  export let location;
  let theme = 'light';
  let count = 0;
  let data = wtfDataRaw; // Initialize data
  let selectedIndex = 0; // Randomly pick an array element
  let selectedWTF;
  let timeBeforeClick;

  const loading = Promise.all([location])
    .then( ([locationResponse]) => {
      selectedIndex = data.findIndex(d => d.state === locationResponse.region);
    });

  const amountFormatter = format('.2s');

	function handleClick() {
    // Report the interaction to GA
    const currentTime = Date.now()

    if (timeBeforeClick) {
      const clickDelta = currentTime - timeBeforeClick;
      const clickDeltaSecond = Math.ceil(clickDelta/1000);

      window.TMPAnalytics.trackEvent(
        '#arpa-categories-randousel',
        'timeOnCard',
        String(clickDeltaSecond), 
      );
    }

    timeBeforeClick = currentTime;

    window.TMPAnalytics.trackEvent(
      '#arpa-categories-randousel',
      'clicked',
      String(count), 
    );

 

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

<MaterialAppMin {theme} class="arpa-project-example">
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

    </div>
  </Card>

</MaterialAppMin>
<div class="arpa-project-example-card-action">
  <CardActions>
    <Button size="large" div class="card-button" on:click={handleClick}>Show me another</Button>
  </CardActions>

  <CardText div class="graphic-source">
    Source: Spending data reported to the
      <a href="https://home.treasury.gov/policy-issues/coronavirus/assistance-for-state-local-and-tribal-governments/state-and-local-fiscal-recovery-funds">
        U.S. Department of Treasury
      </a>.

    <p>While the federal government does not specifically track criminal justice-related spending, The Marshall Project selected a sample of ARPA spending on criminal justice by conducting keyword searches on the project descriptions that local government wrote.
    </p>
    <p>
      Each project reported to the Treasury has multiple spending columns attached, including total cumulative expenditures (how much money was already spent), total cumulative obligations (how much money the government promised to spend) and adopted budget (only reported by large cities and states at this point). Experts The Marshall Project interviewed recommended using obligation as the most accurate way to show how much was spent on each project, and use budget when obligation is not available.
    </p>
  </CardText>
</div>


{/await}
