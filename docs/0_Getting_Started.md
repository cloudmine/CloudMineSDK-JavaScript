# Javascript Library

The CloudMine JavaScript library is a simplistic WebService abstraction to make it easier to develop CloudMine applications in FireFox 3.6+, Chrome 13+, Safari 5+, IE 10+ and Node.js . Inspired by RESTLER, the library is event driven with ease of attaching events in mind. You may chain any number of events or none at all if it suits you better.

The recommended method of installing the Javascript library is to install via a package manager - either [npm](https://www.npmjs.com/) or [bower](http://bower.io/search/). This library is under active development, so if you wish to use the cutting edge version, you can also clone it from GitHub.

### Node.js (Current Version: {[{version}]})

Install it through NPM:

```bash
npm install cloudmine --save
```

### Web (Current Version: {[{version}]})
Alternatively, the library can be installed using bower. To install through bower:

```bash
bower install cloudmine --save
```

### Github

We're actively developing and invite you to fork and send pull requests on GitHub.

[cloudmine/cloudmine-js](http://github.com/cloudmine/cloudmine-js)

Before you can begin using the JavaScript Library, you must first [create an application](/dashboard/app/create) in the CloudMine dashboard.

# Starting a New Project

### From a Browser

To start using the Library in your app, simply add jQuery and link to the cloudmine JavaScript library on your website.

```html
<script src="http://code.jquery.com/jquery.min.js"></script>
<script src="http://staticweb.cloudmine.me/cloudmine-0.9.12.min.js"></script>
```

This will give you a global `cloudmine` object. The next step is to initialize it with your CloudMine App ID and API Key. If you don't have these, you need to make a CloudMine account and create a new App in the [dashboard](http://github.com/cloudmine/cloudmine-js).

```js
var ws = new cloudmine.WebService({
  appid: '327a12c8208b4297a07f8f5fb32cfecc',
  apikey: '931734f754651d3c80521024eba8f8ec'
});
```

### From Node.JS

To access the WebService object from within Node.JS, all you need to do is

```js
var cloudmine = require('cloudmine');
var ws = new cloudmine.WebService({
  appid: '327a12c8208b4297a07f8f5fb32cfecc',
  apikey: '931734f754651d3c80521024eba8f8ec'
});
```

{{note "It is recommended that you pass the WebService instance along to other classes where needed."}}

The options passed to the WebService constructor can always be accessed in `ws.options` . That's it! Now you're ready to begin making API Calls using the ws object!

# Sample Apps

Check out a couple sample apps that show what you can really quickly hack together with CloudMine!

* [Live chat app](https://cloudmine.io/sample-apps/chat/index.html)
* [User-specific to-do list](https://cloudmine.io/sample-apps/todo/index.html)
