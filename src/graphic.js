import Randousel from './Randousel/Randousel.svelte';
const cacheSlug = 'arpa-categories-geoip-location';

// Provide our components with promises
const location = getGeoIpData();

const randouselElement = document.getElementById('arpa-categories-randousel');

window.addEventListener('load', (event) => {
  trackVisibility();
});

// Set up randousel component
const randouselApp = new Randousel({
  target: randouselElement,
  props: {
    location,
  },
});

function trackVisibility() {
  const observer = new IntersectionObserver(reportInitialVisibility, {
    threshold: 1,
  });

  observer.observe(randouselElement);

  function reportInitialVisibility(entries) {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        window.TMPAnalytics.trackEvent(
          '#arpa-categories-randousel',
          'activated',
          'true'
        );
        observer.disconnect();
      }
    });
  }
}

// Helper to get GeoIP response
function getGeoIpResponse() {
  try {
    return fetch(
      'https://api.ipdata.co/?api-key=57e784ed96304ebca711fd1e634274478813c8463abf89fec086b8ae'
    );
  } catch (err) {
    console.log(err);
  }
}

// Helper that wraps all methods of getting or specifying a location in a promise
function getGeoIpData() {
  // Check local cache
  const location = JSON.parse(window.localStorage.getItem(cacheSlug));
  const params = new URLSearchParams(window.location.search);

  if (params.get('statecode')) {
    // Querystring overrides all other options
    return Promise.resolve().then(() => ({
      region: params.get('statecode'),
    }));
  } else if (location) {
    // Wrap local storage response in a promise and return if it exists
    return Promise.resolve().then(() => location);
  } else {
    // Otherwise fetch from the geoip service
    return getGeoIpResponse()
      .then((response) => response.json())
      .then((data) => {
        if (data.country_code === 'US' && data.region) {
          window.localStorage.setItem(cacheSlug, JSON.stringify(data));
          return data;
        }
      });
  }
}
