# Social Graph Queries

{{note 'You will need to configure each social network you plan on using in your app using each network\'s website.'}}

In addition to logging in through social networks, queries can also be run on the networks through the API. Any query you can run on a social network directly can be made through the CloudMine API. This allows for a single point of access for networking calls, as well as letting the CloudMine SDK handle the creation, delivery, and response of the call. This requires a user to be logged in through any social network you want to send queries to.

Let's say we have a user logged in through Twitter, and we want to get the home timeline of the user. The [Twitter Docs](https://dev.twitter.com/docs/api/1.1/get/statuses/home_timeline) for the timeline explain the call that needs to be made.

```js
var api = ws.socialQuery({
  network: "twitter",
  endpoint: "statuses/update.json",
  method: "POST",
  params: null,
  data: "status=Posting.",
}).setContentType("application/x-www-form-urlencoded").on('success', function(data) {
  //Work with 'data'
});
```

{{warning "OAuth 1.x providers (such as Twitter), have certain caveats. Because of how the OAuth 1.x protocol works, if the service provider is expecting 'application/x-www-form-urlencoded' as a content-type, you must set that as a content-type on the request to CloudMine. You do not need to do this for other content types."}}

Any extra parameters you want included in the query should be passed in through the parameters, these will be encoded as JSON and passed through to the service you're targeting. In the 'success' handler, the result of the query will be returned directly as a string, as the framework cannot make any assumptions of the type of data returning.

Headers are a tricky business. CloudMine tries hard to pass back appropriate headers from the target service, but not all are passed back. Information about the request (content-type, content-length) should always be passed back, but information about the target services (server, cache-control, x-powered-by) will reflect CloudMine, not the target service.

{{jsEvents 'success.ok.created' 'error.unauthorized.notfound' 'complete'}}
