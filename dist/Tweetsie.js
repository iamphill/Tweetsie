"use strict";

var _prototypeProperties = function (child, staticProps, instanceProps) { if (staticProps) Object.defineProperties(child, staticProps); if (instanceProps) Object.defineProperties(child.prototype, instanceProps); };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

var TWITTER_CALLBACK_FUNCTION_NAME = "TWEETSIE_CALLBACK";

/**
  Tweetsie class
**/

var Tweetsie = (function () {
  /**
    Constructor method
     @param Object opts
      - widgetid
      - count
      - template
      - callback
  **/

  function Tweetsie(opts) {
    _classCallCheck(this, Tweetsie);

    this.opts = opts;

    // No opts error message
    if (this.opts === undefined) {
      this.error("No object was passed to Tweetsie");
      return;
    }

    // Not widgetid error message
    if (this.opts.widgetid === undefined) {
      this.error("Must pass in a `widgetid`");
      return;
    }

    // Initialize request
    this.initRequest();
  }

  _prototypeProperties(Tweetsie, null, {
    error: {

      /**
        Outputs an error message
        @param String message to output
      **/

      value: function error(message) {
        console.log("Tweetsie: " + message);

        // Return error message to error callback
        if (this.opts.error !== undefined) {
          this.opts.error(message);
        }
      },
      writable: true,
      configurable: true
    },
    initRequest: {

      /**
        Initialize all the data required for the request
      **/

      value: function initRequest() {
        // Create the Twitter URL
        this.generateUrl();

        // JSONP callback function
        this.requestCallback();

        // Start up the request!
        this.sendRequest();
      },
      writable: true,
      configurable: true
    },
    sendRequest: {
      value: function sendRequest() {
        // Create script tag
        var script = document.createElement("script");
        script.async = true;
        script.src = this.url;
        script.onload = function () {
          // Remove script from head
          document.head.removeChild(script);
        };

        // Attach to the head
        document.head.appendChild(script);
      },
      writable: true,
      configurable: true
    },
    generateUrl: {

      /**
        Create Twitter URL
      **/

      value: function generateUrl() {
        this.url = "https://cdn.syndication.twimg.com/widgets/timelines/" + this.opts.widgetid + "?suppress_response_codes=true&callback=" + TWITTER_CALLBACK_FUNCTION_NAME;
      },
      writable: true,
      configurable: true
    },
    requestCallback: {

      /**
        JSONP callback function
      **/

      value: function requestCallback() {
        var _this = this;

        window[TWITTER_CALLBACK_FUNCTION_NAME] = function (d) {
          // Is this request a 404?
          if (d.headers !== undefined && d.headers.status === 404) {
            _this.notFoundError(d.headers.message);
          } else {
            _this.parseBody(d.body);
          }
        };
      },
      writable: true,
      configurable: true
    },
    notFoundError: {

      /**
        404 error from Twitter
      **/

      value: function notFoundError(message) {
        this.error("Twitter responded with: " + message);
      },
      writable: true,
      configurable: true
    },
    parseBody: {

      /**
        Parse returned body
      **/

      value: function parseBody(body) {
        this.dom = document.implementation.createHTMLDocument("");
        this.dom.body.innerHTML = body;

        // Get the stream of tweets
        this.getTweetStream();
        this.getAllTweets();

        // Loop all the tweets
        this.loopTweets();

        // Do the callback!
        if (this.opts.callback !== undefined) {
          this.opts.callback(this.tweets);
        }

        // Should Tweetsie parse the template and then create elements based on that?
        if (this.opts.template !== undefined) {
          this.parseTemplate();
        }
      },
      writable: true,
      configurable: true
    },
    loopTweets: {

      /**
        Loop all the tweets found
        This then creates an object with the Tweet details
        The object is then added into an array and sent to the callback function
         If there is a template string, parse it!
      **/

      value: function loopTweets() {
        this.tweets = [];

        // Loop through all the tweet elements
        var count = this.getTweetCountToReturn(this.alltweets);
        for (var i = 0; i < count; i++) {
          var el = this.alltweets[i];

          // Generate the tweet object
          var tweetobject = {
            id: this.getTweetID(el),
            tweet_url: this.getTweetUrl(el),
            date: this.getTweetDate(el),
            author: this.getTweetAuthorObject(el),
            body: this.getTweetBody(el),
            actions: this.getTweetActions(el)
          };
          this.tweets.push(tweetobject);
        }
      },
      writable: true,
      configurable: true
    },
    getTweetCountToReturn: {

      /**
        Get number of Tweets to return
        @param Array Tweet object array
        @return Integer
      **/

      value: function getTweetCountToReturn(els) {
        if (this.opts.count !== undefined) {
          return this.opts.count > els.length ? els.length : this.opts.count;
        } else {
          return els.length;
        }
      },
      writable: true,
      configurable: true
    },
    getTweetStream: {

      /**
        Get Tweet stream element
      **/

      value: function getTweetStream() {
        this.stream = this.dom.getElementsByClassName("h-feed")[0];
      },
      writable: true,
      configurable: true
    },
    getAllTweets: {

      /**
        Get all the Tweet elements from the stream
      **/

      value: function getAllTweets() {
        this.alltweets = this.stream.querySelectorAll("li.h-entry");
      },
      writable: true,
      configurable: true
    },
    getTweetID: {

      /**
        Get Tweet ID from the element
        @param Object HTML Object
        @return String Tweet ID
      **/

      value: function getTweetID(el) {
        return el.getAttribute("data-tweet-id");
      },
      writable: true,
      configurable: true
    },
    getTweetUrl: {

      /**
        Get Tweet URL from the element
        @param Object HTML Object
        @return String Tweet URL
      **/

      value: function getTweetUrl(el) {
        return el.querySelectorAll(".u-url")[0].getAttribute("href");
      },
      writable: true,
      configurable: true
    },
    getTweetDate: {

      /**
        Get Tweet date from the element
        @param Object HTML Object
        @return Date Tweet date
      **/

      value: function getTweetDate(el) {
        return new Date(el.querySelectorAll(".u-url .dt-updated")[0].getAttribute("datetime"));
      },
      writable: true,
      configurable: true
    },
    getAuthorUsername: {

      /**
        Get author username from the element
        @param Object HTML Object
        @return String author username
      **/

      value: function getAuthorUsername(el) {
        return el.querySelectorAll(".p-nickname b")[0].innerHTML;
      },
      writable: true,
      configurable: true
    },
    getAuthorName: {

      /**
        Get author name from the element
        @param Object HTML Object
        @return String author name
      **/

      value: function getAuthorName(el) {
        return el.querySelectorAll(".full-name .p-name")[0].innerHTML;
      },
      writable: true,
      configurable: true
    },
    getAuthorUrl: {

      /**
        Get author URL from the element
        @param Object HTML Object
        @return String author URL
      **/

      value: function getAuthorUrl(el) {
        return el.querySelectorAll(".u-url.profile")[0].getAttribute("href");
      },
      writable: true,
      configurable: true
    },
    getAuthorAvatar: {

      /**
        Get author avatar from the element
        @param Object HTML Object
        @return String author avatar
      **/

      value: function getAuthorAvatar(el) {
        return el.querySelectorAll(".u-url.profile .avatar")[0].getAttribute("src");
      },
      writable: true,
      configurable: true
    },
    getTweetAuthorObject: {

      /**
        Get all author data
        @param Object HTML Object
        @return Object Tweet author data
      **/

      value: function getTweetAuthorObject(el) {
        return {
          avatar: this.getAuthorAvatar(el),
          profile_url: this.getAuthorUrl(el),
          name: this.getAuthorName(el),
          username: this.getAuthorUsername(el)
        };
      },
      writable: true,
      configurable: true
    },
    getTweetBody: {

      /**
        Get tweet body
        @param Object HTML Object
        @return Object Tweet body
      **/

      value: function getTweetBody(el) {
        return el.querySelectorAll(".e-entry-content .e-entry-title")[0].innerHTML;
      },
      writable: true,
      configurable: true
    },
    getTweetActions: {

      /**
        Get tweet actions
        @param Object HTML Object
        @return Object Tweet actions
      **/

      value: function getTweetActions(el) {
        return {
          reply: el.querySelectorAll(".reply-action")[0].getAttribute("href"),
          favorite: el.querySelectorAll(".favorite-action")[0].getAttribute("href"),
          retweet: el.querySelectorAll(".retweet-action")[0].getAttribute("href")
        };
      },
      writable: true,
      configurable: true
    },
    parseTemplate: {

      /**
        Parse the template
      **/

      value: function parseTemplate() {
        var outputhtml = "";
        var temp = this.opts.template;

        // Get all the handlebars variables inside the template
        var regex = new RegExp(/{{(.*?)}}/g);
        var matches = temp.match(regex);

        // Loop all tweets
        this.tweets.forEach(function (tweet) {
          var tweethtml = "<div data-tweetsie-id=\"" + tweet.id + "\">" + temp + "</div>";

          // Loop through all the matches
          matches.forEach(function (match) {
            var tmptweet = tweet;

            // Get the variable name from the match
            var varname = match.replace("{{", "");
            varname = varname.replace("}}", "");
            varname = varname.trim();

            // Get the variable value from the tweet
            var value = tmptweet[varname];

            // If this is an object inside an object, split on period
            // Loop through variable names until get value
            if (varname.split(".").length > 1) {
              varname.split(".").forEach(function (name) {
                value = tmptweet[name];

                tmptweet = tmptweet[name];
              });
            }

            if (value !== undefined) {
              // Replace in html
              tweethtml = tweethtml.replace(match, value);
            }
          });

          // Add to output HTML
          outputhtml += tweethtml;
        });

        this.appendOutputToContainer(outputhtml);
      },
      writable: true,
      configurable: true
    },
    getContainer: {

      /**
        Get the container element
        @return Object container element
      **/

      value: function getContainer() {
        if (typeof this.opts.container === "string") {
          var containerstr = this.opts.container;

          // If first char is hash, remove it!
          if (containerstr.indexOf("#") === 0) {
            containerstr = containerstr.substring(1, containerstr.length);
          }

          return document.getElementById(containerstr);
        } else {
          return this.opts.container;
        }
      },
      writable: true,
      configurable: true
    },
    appendOutputToContainer: {

      /**
        Append the output HTML to the body
        @param String HTML string
      **/

      value: function appendOutputToContainer(html) {
        if (this.opts.container === undefined) {
          this.error("No container passed to Tweetsie");
          return;
        }

        // Get container
        var container = this.getContainer();
        container.innerHTML = html;
      },
      writable: true,
      configurable: true
    }
  });

  return Tweetsie;
})();