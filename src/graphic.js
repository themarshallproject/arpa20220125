import Randousel from './Randousel/randousel.svelte';

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

// Mock data
function getWTFData() {
  return Promise.resolve().then(() => [
    {
      id: "1",
      name: "Example 1",
      statecode: "IL"
    },
    {
      id: "2",
      name: "Example 2",
      statecode: "CA"
    },
    {
      id: "3",
      name: "Example 3",
      statecode: "NY"
    },
    {
      id: "4",
      name: "Example 4",
      statecode: "DC"
    }
  ])
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
        region_code: params.get('statecode')
      }));
  } else if (location) { // Wrap local storage response in a promise and return if it exists 
    return Promise.resolve()
      .then(() => location);
  } else { // Otherwise fetch from the geoip service
    return getGeoIpResponse()
      .then(response => response.json())
      .then(data => {
        if (data.country_code === 'US' && data.region_code) {
          window.localStorage.setItem(cacheSlug, JSON.stringify(data));
          return data;
        }
      });  
  }
}
