const rp = require('request-promise');

/*
 * Function to turn json object to URL params
 */
function jsonToQueryString(json) {
    return '?' +
        Object
        .keys(json)
        .map(function (key) {
            if (json[key] !== null) {
                return encodeURIComponent(key) + '=' +
                    encodeURIComponent(json[key]);
            }
        })
        .join('&');
}

/*
 * Standard errors
 */
function ResponseError(e) {
    return e.code >= 400;
}

class SonarrAPI {
    constructor(options) {
        // Gather constructor parameters
        this.hostname = options.hostname;
        this.port = options.port || 8989;
        this.apiKey = options.apiKey;
        this.urlBase = options.urlBase;
        this.ssl = options.ssl || false;
        this.username = options.username || null;
        this.password = options.password || null;
        this.auth = false;

        // `http_auth` requested
        if (this.username && this.password) {
            this.auth = true;
        }

        // `hostname` in valid
        if (!this.hostname) {
            throw new TypeError('Hostname is empty');
        }

        // Sanitize `hostname`
        this.hostname = this.hostname.replace(/^https?:\/\//, '');

        // Validate `port`
        if ((!this.port) || (typeof this.port !== 'number')) {
            try {
                this.port = parseInt(this.port);
            } catch (e) {
                throw new TypeError('Port is not a number');
            }
        }

        // Valid characters in API key
        if (this.apiKey.search(/[^a-z0-9]{32}/) !== -1) {
            throw new TypeError('API Key is an invalid');
        }

        // URL Base exists && is valid
        if ((this.urlBase) && (this.urlBase.charAt(0) !== '/')) {
            this.urlBase = '/' + this.urlBase;
        }

        // Construct the URL
        var serverUrl = 'http' + (this.ssl !== false ? 's' : '') + '://' + this.hostname + ':' + this.port;

        // Add in the base URL if present
        if (this.urlBase) {
            serverUrl = serverUrl + this.urlBase;
        }

        // Completed API URL
        this.serverApi = serverUrl + '/api/';
    }

    /*
     * sends request to Sonarr API
     */
    _request(actions) {
        // Append the server URL, api, and relative url and - if GET params those too
        var apiUrl = this.serverApi + actions.relativeUrl;

        if ((actions.parameters) && (actions.method === 'GET')) {
            apiUrl = apiUrl + jsonToQueryString(actions.parameters);
        }

        // Build the HTTP request headers
        var headers = {
            'X-API-KEY': this.apiKey
        };

        // append the type
        if (actions.method === 'GET') {
            Object.assign(headers, {
                'Accept': 'application/json'
            });
        } else {
            Object.assign(headers, {
                'Content-Type': 'application/json'
            });
        }

        // append auth to headers
        if (this.auth) {
            var buffer = new Buffer(this.username + ':' + this.password);

            Object.assign(headers, {
                'Authorization': 'Basic ' + buffer.toString('base64')
            });
        }

        // request options
        var options = {
            'url': apiUrl,
            'headers': headers
        };

        // Usually we don't have valid ssl certs, so ignore it
        if (this.ssl) {
            Object.assign(options, {
                'strictSSL': false
            });
        }

        // Append the method parameter to the request
        Object.assign(options, {
            'method': actions.method
        });

        if (['POST', 'PUT', 'DELETE'].includes(actions.method)) {
            Object.assign(options, {
                'json': actions.parameters
            });
        } else {
            Object.assign(options, {
                'json': true
            });
        }

        // Issue request-promise and return
        return rp(options)
            .then(response => {
                console.log(response);
                return response;
            })
            .catch(e => {
                // API key is invalid
                if ((e.response.body.error) && (e.response.body.error === 'Unauthorized')) {
                    return e.response.body;
                }

                return e;
            });
    }

    /*
     * retrieve from API via GET
     */
    get(relativeUrl, parameters = {}) {
        // no Relative url was passed
        if (relativeUrl === undefined) {
            throw new TypeError('Relative URL is not set');
        }

        // parameters isn't an object
        if (typeof parameters !== 'object') {
            throw new TypeError('Parameters must be type object');
        }

        var actions = {
            'relativeUrl': relativeUrl,
            'method': 'GET',
            'parameters': parameters
        };

        return this._request(actions)
            .then(function (data) {
                return data;
            });
    }

    /*
     * perform an action via POST
     */
    post(relativeUrl, parameters = {}) {
        // no Relative url was passed
        if (relativeUrl === undefined) {
            throw new TypeError('Relative URL is not set');
        }

        // parameters isn't an object
        if (typeof parameters !== 'object') {
            throw new TypeError('Parameters must be type object');
        }

        var actions = {
            'relativeUrl': relativeUrl,
            'method': 'POST',
            'parameters': parameters
        };

        return this._request(actions)
            .then(function (data) {
                return data;
            });
    }

    /*
     * perform an action via PUT
     */
    put(relativeUrl, parameters = {}) {
        // no Relative url was passed
        if (relativeUrl === undefined) {
            throw new TypeError('Relative URL is not set');
        }

        // parameters isn't an object
        if (typeof parameters !== 'object') {
            throw new TypeError('Parameters must be type object');
        }

        var actions = {
            'relativeUrl': relativeUrl,
            'method': 'PUT',
            'parameters': parameters
        };

        return this._request(actions)
            .then(function (data) {
                return data;
            });
    }

    /*
     * perform an action via PUT
     */
    delete(relativeUrl, parameters = {}) {
        // no Relative url was passed
        if (relativeUrl === undefined) {
            throw new TypeError('Relative URL is not set');
        }

        // parameters isn't an object
        if (typeof parameters !== 'object') {
            throw new TypeError('Parameters must be type object');
        }

        var actions = {
            'relativeUrl': relativeUrl,
            'method': 'DELETE',
            'parameters': parameters
        };

        return this._request(actions)
            .then(function (data) {
                return data;
            });
    }
}

module.exports = SonarrAPI;
