import log from 'loglevel';
import axios from 'axios';

export const csisClient = axios.create({ credentials: 'include' });
csisClient.defaults.headers.common['Accept'] = 'application/vnd.api+json';
csisClient.defaults.headers.common['Content-Type'] = 'application/vnd.api+json';

/**
 * Get the X-CSRF Token from the CSIS API. Usually needed only for PUT, POST and PATCH requests.
 * 
 * @param {String} csisBaseUrl 
 */
  export const getXCsrfToken = async function (csisBaseUrl = 'https://csis.myclimateservice.eu') {
    const apiResponse = await csisClient.get(csisBaseUrl + "/rest/session/token");
    // introduce ugly side effect:
    csisClient.defaults.headers.post['X-CSRF-Token'] = apiResponse.data;
    return apiResponse.data;
  }

    /**
   * Gets EMIKAT Credentials from Drupal JSON API and return a headers object
   * ready to be used with axios.
   * 
   * @param {String} csisBaseUrl 
   * @return {Object}
   */
  export const getEmikatCredentialsFromCsis = async function(csisBaseUrl = 'https://csis.myclimateservice.eu') {

    try {
      const apiResponse = await csisClient.get(csisBaseUrl + "/jsonapi", { credentials: 'include' });
      const userResponse = await csisClient.get(apiResponse.data.meta.links.me.href, { credentials: 'include' });

      if(userResponse.data.data.attributes.field_basic_auth_credentials) {
        //const header = {'Authorization' : 'Basic ' + btoa(userResponse.data.data.attributes.field_basic_auth_credentials)};
        //return header;
        return 'Basic ' + btoa(userResponse.data.data.attributes.field_basic_auth_credentials);
      } else {
        log.error('no field field_basic_auth_credentials in user profile ' + userResponse.data.data.attributes.name);
        return null;
      }
    }
    catch(error) {
      console.error(`could not fetch emikat credentials from $csisBaseUrl`, error);
      return null;
    }
  }