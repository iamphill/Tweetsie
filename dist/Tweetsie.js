/**
 * Tweetsie - Twitter plugin built with JS! 'cause I mean why the hello not?!
 * @version v0.4.0
 * @author Phil Hughes <me@iamphill.com>
 * @license MIT
 */
"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

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
      - filters
  **/

  function Tweetsie(opts) {
    var _this = this;

    _classCallCheck(this, Tweetsie);

    this.opts = opts;

    var Prom = typeof ES6Promise !== "undefined" ? ES6Promise.Promise : Promise;

    return new Prom(function (resolve, reject) {
      _this.resolve = resolve;
      _this.reject = reject;

      // No opts error message
      if (_this.opts === undefined) {
        _this.error("No object was passed to Tweetsie");
        return;
      }

      // Not widgetid error message
      if (_this.opts.widgetid === undefined) {
        _this.error("Must pass in a `widgetid`");
        return;
      }

      // Get the current cache and display
      _this.getCurrentCache();

      // Initialize request
      _this.initRequest();
    });
  }

  _createClass(Tweetsie, {
    error: {

      /**
        Outputs an error message
        @param String message to output
      **/

      value: function error(message) {
        // Return error message to error callback
        if (this.reject !== undefined) {
          this.reject(message);
        }
      }
    },
    getCurrentCache: {

      /**
        Get the current value from the cache and then render the body
      **/

      value: function getCurrentCache() {
        if (typeof localStorage !== "undefined") {
          var bodystring = localStorage.getItem("tweetsie-" + this.opts.widgetid);

          if (bodystring !== null && bodystring !== "") {
            // Parse the body
            this.parseBody(bodystring);

            // Testing method
            if (this.opts.__cacheGet !== undefined) {
              this.opts.__cacheGet();
            }
          }
        }
      }
    },
    saveCache: {

      /**
        Store a JSON object into localstorage as a string
        @param String returned body string
      **/

      value: function saveCache(body) {
        if (typeof localStorage !== "undefined") {
          if (body !== "") {
            localStorage.setItem("tweetsie-" + this.opts.widgetid, body);
          }
        }
      }
    },
    initRequest: {

      /**
        Initialize all the data required for the request
      **/

      value: function initRequest() {
        // Create a random callback name
        // Based on const
        this.callbackname = "" + TWITTER_CALLBACK_FUNCTION_NAME + "" + Math.floor(Math.random() * 2000000000);

        // Create the Twitter URL
        this.generateUrl();

        // JSONP callback function
        this.requestCallback();

        // Start up the request!
        this.sendRequest();
      }
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
      }
    },
    generateUrl: {

      /**
        Create Twitter URL
      **/

      value: function generateUrl() {
        this.url = "https://cdn.syndication.twimg.com/widgets/timelines/" + this.opts.widgetid + "?suppress_response_codes=true&callback=" + this.callbackname;
      }
    },
    requestCallback: {

      /**
        JSONP callback function
      **/

      value: function requestCallback() {
        var _this = this;

        window["" + this.callbackname] = function (d) {
          // Is this request a 404?
          if (d.headers !== undefined && d.headers.status === 404) {
            _this.notFoundError(d.headers.message);
          } else {
            // Store in cache
            _this.saveCache(d.body);

            _this.parseBody(d.body);
          }
        };
      }
    },
    notFoundError: {

      /**
        404 error from Twitter
      **/

      value: function notFoundError(message) {
        this.error("Twitter responded with: " + message);
      }
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

        // Should Tweetsie parse the template and then create elements based on that?
        if (this.opts.template !== undefined) {
          this.parseTemplate();
        }

        // Do the callback!
        if (this.resolve !== undefined) {
          this.resolve(this.tweets);
        }
      }
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
      }
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
      }
    },
    getTweetStream: {

      /**
        Get Tweet stream element
      **/

      value: function getTweetStream() {
        this.stream = this.dom.getElementsByClassName("h-feed")[0];
      }
    },
    getAllTweets: {

      /**
        Get all the Tweet elements from the stream
      **/

      value: function getAllTweets() {
        this.alltweets = this.stream.querySelectorAll("li.h-entry");
      }
    },
    getTweetID: {

      /**
        Get Tweet ID from the element
        @param Object HTML Object
        @return String Tweet ID
      **/

      value: function getTweetID(el) {
        return el.getAttribute("data-tweet-id");
      }
    },
    getTweetUrl: {

      /**
        Get Tweet URL from the element
        @param Object HTML Object
        @return String Tweet URL
      **/

      value: function getTweetUrl(el) {
        return el.querySelectorAll(".u-url")[0].getAttribute("href");
      }
    },
    getTweetDate: {

      /**
        Get Tweet date from the element
        @param Object HTML Object
        @return Date Tweet date
      **/

      value: function getTweetDate(el) {
        return new Date(el.querySelectorAll(".u-url .dt-updated")[0].getAttribute("datetime"));
      }
    },
    getAuthorUsername: {

      /**
        Get author username from the element
        @param Object HTML Object
        @return String author username
      **/

      value: function getAuthorUsername(el) {
        return el.querySelectorAll(".p-nickname b")[0].innerHTML;
      }
    },
    getAuthorName: {

      /**
        Get author name from the element
        @param Object HTML Object
        @return String author name
      **/

      value: function getAuthorName(el) {
        return el.querySelectorAll(".full-name .p-name")[0].innerHTML;
      }
    },
    getAuthorUrl: {

      /**
        Get author URL from the element
        @param Object HTML Object
        @return String author URL
      **/

      value: function getAuthorUrl(el) {
        return el.querySelectorAll(".u-url.profile")[0].getAttribute("href");
      }
    },
    getAuthorAvatar: {

      /**
        Get author avatar from the element
        @param Object HTML Object
        @return String author avatar
      **/

      value: function getAuthorAvatar(el) {
        return el.querySelectorAll(".u-photo.avatar")[0].getAttribute("data-src-1x");
      }
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
      }
    },
    getTweetBody: {

      /**
        Get tweet body
        @param Object HTML Object
        @return Object Tweet body
      **/

      value: function getTweetBody(el) {
        return el.querySelectorAll(".e-entry-content .e-entry-title")[0].innerHTML;
      }
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
          favorite: el.querySelectorAll(".like-action")[0].getAttribute("href"),
          retweet: el.querySelectorAll(".retweet-action")[0].getAttribute("href")
        };
      }
    },
    parseTemplate: {

      /**
        Parse the template
      **/

      value: function parseTemplate() {
        var _this = this;

        var outputhtml = "";
        var temp = this.opts.template;

        // Get all the handlebars variables inside the template
        var regex = new RegExp(/{{(.*?)}}/g);
        var bracesRegex = new RegExp(/({{|}})/g);
        var matches = temp.match(regex);

        if (matches === null) {
          this.error("No variables entered into the template");
          return;
        }

        // Loop all tweets
        this.tweets.forEach(function (tweet) {
          var tweethtml = "<div data-tweetsie-id=\"" + tweet.id + "\">" + temp + "</div>";

          // Loop through all the matches
          matches.forEach(function (match) {
            var tmptweet = tweet;

            // Get the variable name from the match
            var varname = match.replace(bracesRegex, "").trim();
            var filters = varname.split("|");

            // Get the variable value from the tweet
            var prefilterval = eval("tweet[\"" + varname.split("|")[0].trim().split(".").join("\"][\"") + "\"]");
            var value = prefilterval;

            if (filters.length > 1) {
              filters.filter(function (filter, i) {
                return i > 0;
              }).forEach(function (filter) {
                var filterfunc = _this["filter_" + filter.trim()];

                // Run the filter!
                if (filterfunc !== undefined) {
                  value = filterfunc.call(_this, prefilterval, false);
                } else if (_this.opts.filters !== undefined && _this.opts.filters["" + filter.trim()] !== undefined) {
                  value = _this.opts.filters["" + filter.trim()].call(_this, prefilterval);
                }
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
      }
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
      }
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

        // Should autodate run?
        if (container.querySelectorAll(".tweetsie-auto-date").length > 0) {
          this.filter_autodate(null, true);
        }

        if (this.opts.callback !== undefined) {
          this.opts.callback(this.tweets);
        }
      }
    },
    filter_autodate: {

      /**
        Below are the filters that can be used inside of the template engine
        Filters MUST be prefixed with `filter_` and then the name of the filter
        case sensitive.
        Remember another person will type this into the template!
         Filters will take a parameter which is the pre-filtered value
      **/

      /**
        Auto date
        @param String val
        @return String HTML Strig
      **/

      value: function filter_autodate(date, run) {
        var _this = this;

        if (!run) {
          var pad = function (number) {
            return number < 10 ? "0" + number : number;
          };

          // Convert date into attributes
          var time = date.getTime();
          var formatteddate = "" + date.getFullYear() + "-" + pad(date.getMonth() + 1) + "-" + pad(date.getDate()) + "T" + pad(date.getHours()) + ":" + pad(date.getMinutes()) + ":" + pad(date.getSeconds()) + "Z";

          // Create the element
          var timeObj = document.createElement("time");
          timeObj.className = "tweetsie-auto-date";
          timeObj.setAttribute("datetime", formatteddate);
          timeObj.setAttribute("data-tweetsie-time", time);
          timeObj.textContent = this.filter_formatdate(date);

          return timeObj.outerHTML;
        } else {
          (function () {
            // Run autodate on an interval
            var elements = _this.getContainer().querySelectorAll(".tweetsie-auto-date");

            setInterval(function () {
              for (var i = 0; i < elements.length; i++) {
                // Get the current element
                var el = elements[i];

                // Get the time
                var _date = new Date(parseInt(el.getAttribute("data-tweetsie-time"), 10));

                // Get the formatted date and only update if any change
                var formatteddate = _this.filter_formatdate(_date);

                if (formatteddate !== el.textContent) {
                  console.log("a");
                  el.textContent = formatteddate;
                }
              }
            }, 1000);
          })();
        }
      }
    },
    filter_formatdate: {

      /**
        Format the date to be relative to current time
        @param String val
        @return String formatted date
      **/

      value: function filter_formatdate(date) {
        // Convert date into attributes
        var time = date.getTime();
        var current = new Date().getTime();
        var diff = (current - time) / 1000;
        var daydiff = Math.floor(diff / 86400);

        // Convert to text
        if (diff < 60) {
          return "just now";
        } else if (diff < 120) {
          return "1 min ago";
        } else if (diff < 3600) {
          return "" + Math.floor(diff / 60) + " mins ago";
        } else if (diff < 7200) {
          return "1 hour ago";
        } else if (diff < 86400) {
          return "" + Math.floor(diff / 3600) + " hours ago";
        } else if (daydiff === 1) {
          return "Yesterday";
        } else if (daydiff < 7) {
          return "" + daydiff + " days ago";
        } else if (daydiff === 7) {
          return "1 week ago";
        } else if (daydiff < 31) {
          return "" + Math.ceil(daydiff / 7) + " weeks ago";
        } else if (daydiff < 365) {
          return "" + Math.ceil(daydiff / 30) + " months ago";
        } else {
          return "A long time ago";
        }
      }
    }
  });

  return Tweetsie;
})();