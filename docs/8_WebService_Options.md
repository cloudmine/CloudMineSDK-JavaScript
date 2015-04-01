# WebService Options

Throughout the JavaScript library, most functions take a final object argument that changes how the WebService calls behave. For brevity, documentation on other pages do not refer to this object directly.

In addition to being passed as a final argument to webservice calls, any of these properties can be set during construction of your WebService instance to be used as the default for all calls.

```js
var ws = new cloudmine.WebService({
  appname: "FirstApp",
  appversion: "1.0",
  appid: "867a2871f0150542562b55d60f8dcd7d",
  apikey: "925d22eb401ddc416c989a71a8f41576",
  applevel: true
});
```

#### Application ID

Override the WebService's stored application id. `{ appid: "A different application id" }`

#### Application Level

Control the behavior when a user is logged in.

* `{ applevel: true }` When a user is logged in, all calls by default act on **application objects**.
* `{ applevel: false }` Whether or not a user is logged in, all calls by default act on **user objects**.
* `{ applevel: null }` If a user is logged in, all calls by default act on **user objects**, otherwise all calls by default act on **application objects**. (Default)

#### Application Name

Set the application name that is send as part of the CloudMine Agent. This is primarily used so you can identify what name and version of your application is in use by customers.

`{ appname: "AlphaNumeric" }`

{{note "You should only use alpha numeric characters as part of the application name. It is recommended to keep the name short, or use an abbreviation as this is sent as part of every request."}}

#### Application Version

Set the application version to send as part of the CloudMine Agent. This is primarily used so you can identify what name and version of your application is in use by customers.

`{ appversion: "1.0" }`

#### API Key

Override the WebService's stored api key.

`{ apikey: "A different api key" }`

#### Code Snippet

Set the code snippet to run with for calls (default is not set).

`{ snippet: "Name Of Code Snippet" }`

#### Code Snippet - Parameters

Set various options to pass to the code snippet, used if Code Snippet is set (default is not set). The value should be an object.

`{ params: {key: "value" } }`

#### Code Snippet - Asynchronous Run

Set if the code snippet should run without waiting for results. This should only be used by code snippets where you do not need the immediate results.

`{ dontwait: true }`

#### Code Snippet - Results Only

Set if the code snippet should only return results of the code snippet, excluding success data that would usually come from the web service call.

`{ resultsonly: true }`

#### Count Results

Include the result count within the response object. This is not enabled by default.

`{ count: true }`

#### Limit Results

Limits the number of results returned to the specfied integer. Use -1 for no limit. Use 0 for no results, and with { count: true } to just get the number of available results.

`{ limit: 50 }`

The default limit is 50.

#### Skip Results

Set the number of results to skip for calls (default is 0).

`{ skip: 0 }`

#### Sort Results

Remotely sort results by the given field name.

`{ sort: 'field name' }`
