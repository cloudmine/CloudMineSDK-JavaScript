[![build status](https://secure.travis-ci.org/cloudmine/cloudmine-js.png)](http://travis-ci.org/cloudmine/cloudmine-js)
# CloudMine JavaScript SDK

[CloudMine](https://cloudmine.me) is a backend-as-a-service platform for mobile and web developers to rapidly build and quickly scale their apps. Build and scale iOS, Android, Windows Phone, and web apps on our secure and managed backend.

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

## Documentation

Detailed documentation, tutorials and code samples are on our developer site: https://cloudmine.me/docs/javascript.

Direct link to API reference documentation: https://cloudmine.me/js-docs/symbols/WebService.html.

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

Now check your CloudMine dashboard (https://cloudmine.me/dashboard/) to see your data saved.


## License

This software is distributed under the MIT License. See the [LICENSE](https://github.com/cloudmine/cloudmine-js/blob/master/LICENSE) file for details.
