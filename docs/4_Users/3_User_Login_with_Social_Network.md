# User Login with Social Network

{{note 'You will need to configure each social network you plan on using in your app using each network\'s website.'}}

In addition to logging in as a CloudMine user with an email address and password, you can also allow your users to login via a social network such as Facebook or Twitter. This can either be the primary way a user logs into your application, or a user may link their existing CloudMine user account to a social service. This method returns a session token that you can store locally and use to automatically maintain their session later.

Once the login is complete, you can access the `session_token as ws.options.session_token`.

To login a user, use `ws.loginSocial(network)`. This will open a popup window with the login page for the network you specified where the user can login with his or her credentials. The callback will be invoked automatically when the login flow has completed and the popup window has closed.

{{warning "All of these login methods go through a web view, which may save cookies to the browser that will automatically log the user in on any subsequent social login attempts."}}

An array of all the social networks supported can be found in `WebService.SocialNetworks`. Currently that list is the following:

* Facebook (`facebook` in code)
* Twitter (`twitter` in code)
* Foursquare (`foursquare` in code)
* Instagram (`instagram`in code)
* Tumblr (`tumblr` in code)
* Dropbox (`dropbox` in code)
* Flickr (`flickr` in code)
* FitBit (`fitbit` in code)
* GitHub (`github` in code)
* Google (`google` in code)
* LinkedIn (`linkedin` in code)
* Meetup (`meetup` in code)
* Withings (`withings` in code)
* WordPress.com (`wordpress` in code)
* Yammer (`yammer` in code)
* Jawbone (`jawbone` in code)
* iHealth (`ihealth` in code)
* MapMyFitness (`mapmyfitness` in code)
* RunKeeper (`runkeeper` in code)

```js
ws.loginSocial('twitter').on('success', function(data, response) {
  console.log(data);
  //    {
  //      expires: 'Fri, 31 Aug 2012 19:08:37 GMT',
  //      profile: {
  //        __id__: '52e882fb088747668af4a1670b1d46fb',
  //        __type__: 'user',
  //        __services__: ['twitter']
  //      },
  //      session_token: 'ffcc32dc93c94c7d8045c77e5122a89d'
  //    }
 
  // Now you can save the session token using localStorage
  localStorage.setItem('cm_session', response.session_token);
});
```

{{warning "Calls to Objects and Files functions after a successful login will automatically operate within the scope of the logged in user.<br /><br />For more information on how to control this behavior, see WebService Options."}}

{{caution "To protect users' privacy, never publicly share their session_token anywhere in your app."}}

{{jsEvents 'success.ok.created' 'error.unauthorized.notfound' 'complete'}}
