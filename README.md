# Tweetsie [![Build Status](https://travis-ci.org/iamphill/Tweetsie.svg?branch=master)](https://travis-ci.org/iamphill/Tweetsie)

Since Twitter removed access to their API through JS it became harder to get Twitter widgets on your website styled up to how you want. It required backend work which sometimes wasn't possible for several reasons.

Twitter offers a widget, which is great and works nicely. However, the styling isn't great and will more than likely stick out like a sore thumb on your website!

However! The Twitter widget simply request a JSON file which contains the body of the widget in. This plugin uses that JSON URL to then allow you to style up how you want!

# Download!

Download now and be awesome! :v:

[Tweetsie.js](dist/Tweetsie.js)

[Tweetsie.min.js](dist/Tweetsie.min.js)

## Usage

Before starting, create a new widget on [Twitter](https://twitter.com/settings/widgets). After creating a new widget, in the URL there should be a ID in the URL after saving the widget. Copy this. This becomes the ID Tweetsie needs!

Include the plugin on the page

```html
<script src="dist/Tweetsie.js"></script>
```

Then simply create a new instance of Tweetsie!

```javascript
new Tweetsie({
  container: '#container',
  widgetid: '570149068425674752',
  count: 5,
  template: ' \
  <div class="author"> \
    <a href="{{author.profile_url}}" target="_blank"> \
      <img src="{{ author.avatar }}" /> \
    </a> \
  </div> \
  <div class="body"> \
    <p>{{body}}</p> \
  </div> \
  '
}).then(function (tweets) {

}).catch(function (error) {

});
```

The above creates a new instance of Tweetsie with all available options being used. However the only required one is `widgetid` which is the ID you got from creating a new widget.

### Options

| Option    | Description  |
|-----------|--------------|
| container | ID or HTML object to render template to |
| widgetid  | ID of the widget created on [Twitter](https://twitter.com/settings/widgets) |
| count     | Number of Tweets to parse. Defaults to all which is 20 |
| template  | String template used to display on the page |

Tweetsie uses ES6 Promises to be super awesome and hip! For older browsers, you will need to use a [Polyfill](https://github.com/jakearchibald/es6-promise).

## Styling

There are two ways to style the widget:

### Callback

Use the callback function which returns an array of all the tweet objects (Data in the object is listed below). You can then do whatever you wish with this array.

### Template

Pass in a string as an option to Tweetsie (See example above).

Tweetsie uses [Handlebar](http://handlebarsjs.com/) style syntax. However, if statements etc. are not supported. It is only used to show where data should be placed.

#### Template filters

Tweetsie makes available a few different filters to make your life easier when working with the template engine. These are:

| Filter Name | Description |
| ------------|-------------|
| formatedate | Use this with the `date` value to format the date to a relative time |
| autodate    | Use this with the `date` value to automatically update the date every 1000ms |

Filers are used in the template engine by doing the following:

```
{{ value | filter }}
```

Multiple filters can be used together. The originally value is then passed to the filter, not the previously filtered value.

```
{{ value | filterone | filtertwo }}
```

## Tweet data

These are the keys used for each tweet object.

- `id` Tweet ID
- `tweet_url` Permalink URL to tweet
- `date` JS date object
- `author.avatar` URL for author profile image
- `author.profile_url` URL to author Twitter page
- `author.name` Full name of the author
- `author.username` Username of the author
- `body` HTML string of the Tweet content
- `actions.reply` URL to reply to Tweet
- `actions.favorite` URL to favorite Tweet
- `actons.retweet` URL to retweet Tweet

# Browser Support

I've run the test on all modern browsers & on IE9.

They all pass :+1:!

# Disclaimer

Whilst I will do my best to keep the plugin updated for any updates Twitter do. This is reliant on Twitter not removing access to Tweet data through the URL used.
