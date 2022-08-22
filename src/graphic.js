import Randousel from './Randousel/randousel.svelte';
import wtfDataRaw from './assets/data/arpa_wtfs.json'
const cacheSlug = 'arpa-categories-geoip-location';

// Provide our components with promises
const location = getGeoIpData();
const wtfData = getWTFData();

// Set up randousel component
const randouselApp = new Randousel({
  target: document.getElementById('arpa-categories-randousel'),
  props: {
    location,
    wtfData
  }
});

// Read in data from Airtable
// You can make this with `make graphics_data`
function getWTFData() {
  try {
    return fetch("https://api.baseql.com/airtable/graphql/appjNDCHFduMTVuRA", {
      "headers": {
        "accept": "application/json",
        "accept-language": "en-US,en;q=0.9",
        "authorization": "Bearer MTJhNGIzNjgtZmRkZS00MWJiLWIxMjAtYzU4NzVkNDM2YTI5",
        "cache-control": "no-cache",
        "content-type": "application/json",
        "pragma": "no-cache",
      },
      "referrer": "https://app.baseql.com/",
      "referrerPolicy": "strict-origin-when-cross-origin",
      "body": "{\"query\":\"query MyQuery {\\n  requests {\\n    budget\\n    category\\n    description\\n    obligations\\n    place\\n    projectName\\n    state\\n    wtf\\n  }\\n}\\n\",\"variables\":null,\"operationName\":\"MyQuery\"}",
      "method": "POST",
      "mode": "cors",
      // "credentials": "include"
    })
    .then(r => r.json());
  } catch(err) {
    console.log("fetching error while getting data:", err);
  }
}

// Helper to get GeoIP response
function getGeoIpResponse() {
  try {
    return fetch("https://api.ipdata.co/?api-key=57e784ed96304ebca711fd1e634274478813c8463abf89fec086b8ae");
  } catch(err) {
    console.log(err);
  }
}

// Helper that wraps all methods of getting or specifying a location in a promise
function getGeoIpData() {
  // Check local cache
  const location = JSON.parse(window.localStorage.getItem(cacheSlug));
  const params = new URLSearchParams(window.location.search);

  if (params.get('statecode')) { // Querystring overrides all other options
    return Promise.resolve()
      .then(() => ({
        region: params.get('statecode')
      }));
  } else if (location) { // Wrap local storage response in a promise and return if it exists 
    return Promise.resolve()
      .then(() => location);
  } else { // Otherwise fetch from the geoip service
    return getGeoIpResponse()
      .then(response => response.json())
      .then(data => {
        if (data.country_code === 'US' && data.region) {
          window.localStorage.setItem(cacheSlug, JSON.stringify(data));
          return data;
        }
      });  
  }
}
