# CloudMine JavaScript SDK

[CloudMine](http://cloudmineinc.com/) is a backend-as-a-service platform for mobile and web developers to rapidly build and quickly scale their apps. Build and scale iOS, Android, Windows Phone, and web apps on our secure and managed backend.

The JavaScript library supports both Node.js and browsers.


## Install

via `npm`

    $ npm install cloudmine

via `git` to get the bleeding edge

    $ npm install git://github.com/cloudmine/cloudmine-js.git

directly link from a browser

```html
<script type="text/javascript" src="https://raw.github.com/cloudmine/cloudmine-js/master/js/cloudmine.js"></script>
```

You may also rebuild and test the CloudMine JavaScript library by using the provided Cakefile.

## Documentation

Detailed documentation, tutorials and code samples are on our developer site: https://cloudmine.io/docs/#/javascript.

Also check out the [examples](https://github.com/cloudmine/cloudmine-js/tree/master/examples) included with the repository.


## Quick Start

The main API class is `cloudmine.WebService`

In node:

```javascript
var cloudmine = require('cloudmine');

var ws = new cloudmine.WebService({
    appid: 'your appid',
    apikey: 'your apikey'
});

ws.set("key", {"hello": "world"});
```

In browsers:

```html
<script type="text/javascript" src="https://ajax.googleapis.com/ajax/libs/jquery/1.7.2/jquery.min.js"></script>
<script type="text/javascript" src="https://raw.github.com/cloudmine/cloudmine-js/master/js/cloudmine.js"></script>
<script>
  var ws = new cloudmine.WebService({
      appid: 'your appid',
      apikey: 'your apikey'
  });

  ws.set("key", {"hello": "world"});
</script>
```

Now check your CloudMine dashboard (https://compass.cloudmine.io/) to see your data saved.

## Contributing

Please feel free to contribute to the SDK if you find any issues or if you have a new feature you think would be cool. Just go ahead and fork the SDK, make your changes locally, and then submit a pull request. In order for a pull request to be accepted, it must meet the following requirements:

* All new code must be tested. Any code changes that do not have a corresponding test change will not be accepted.
* All tests must be passing. Run `make test` to check the tests.
* Pull request must have a clear explanation of your additions.
* Code must meet style guidelines. Run `make lint` to ensure that everything is up to snuff. (Note - we use jslint to run the linting, but this will likely change in the future)
* Pull request must be from the `develop` branch.

Any pull request that does not meet the above requirements will not be accepted. If you have any questions, feel free to reach out to us! And as always, if you find an issue but don't want to fix it, just open an issue in github!

## License

This software is distributed under the MIT License. See the [LICENSE](https://github.com/cloudmine/cloudmine-js/blob/master/LICENSE) file for details.

## Compatibility
This library has been tested to work under the following environments:
* Chrome 22, Stable
* Firefox 15, Stable
* Firefox 3.6
* Safari 5
* Internet Explorer 10

## Known Issues
* Firefox 3.6 will not trigger specific error events (notfound, unauthorized) for invalid application or api key specification.
* Internet Explorer 10 changes location of entire page while downloading files when running locally.

