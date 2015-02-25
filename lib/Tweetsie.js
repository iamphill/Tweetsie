const TWITTER_CALLBACK_FUNCTION_NAME = 'TWEETSIE_CALLBACK';

/**
  Tweetsie class
**/
class Tweetsie {
  /**
    Constructor method

    @param Object opts
      - widgetid
      - count
      - template
      - filters
  **/
  constructor(opts) {
    this.opts = opts;

    let Prom = (typeof ES6Promise !== 'undefined' ? ES6Promise.Promise : Promise);

    return new Prom((resolve, reject) => {
      this.resolve = resolve;
      this.reject = reject;

      // No opts error message
      if (this.opts === undefined) {
        this.error('No object was passed to Tweetsie');
        return;
      }

      // Not widgetid error message
      if (this.opts.widgetid === undefined) {
        this.error('Must pass in a `widgetid`');
        return;
      }

      // Get the current cache and display
      this.getCurrentCache();

      // Initialize request
      this.initRequest();
    });
  }

  /**
    Outputs an error message
    @param String message to output
  **/
  error(message) {
    // Return error message to error callback
    if (this.reject !== undefined) {
      this.reject(message);
    }
  }

  /**
    Get the current value from the cache and then render the body
  **/
  getCurrentCache() {
    if (typeof localStorage !== 'undefined') {
      let bodystring = localStorage.getItem(`tweetsie-${this.opts.widgetid}`);

      if (bodystring !== null && bodystring !== '') {
        // Parse the body
        this.parseBody(bodystring);

        // Testing method
        if (this.opts['__cacheGet'] !== undefined) {
          this.opts['__cacheGet']();
        }
      }
    }
  }

  /**
    Store a JSON object into localstorage as a string
    @param String returned body string
  **/
  saveCache(body) {
    if (typeof localStorage !== 'undefined') {
      if (body !== '') {
        localStorage.setItem(`tweetsie-${this.opts.widgetid}`, body);
      }
    }
  }

  /**
    Initialize all the data required for the request
  **/
  initRequest() {
    // Create a random callback name
    // Based on const
    this.callbackname = `${TWITTER_CALLBACK_FUNCTION_NAME}${(Math.floor(Math.random() * 2000000000))}`;

    // Create the Twitter URL
    this.generateUrl();

    // JSONP callback function
    this.requestCallback();

    // Start up the request!
    this.sendRequest();
  }

  sendRequest() {
    // Create script tag
    let script = document.createElement('script');
    script.async = true;
    script.src = this.url;
    script.onload = () => {
      // Remove script from head
      document.head.removeChild(script);
    };

    // Attach to the head
    document.head.appendChild(script);
  }

  /**
    Create Twitter URL
  **/
  generateUrl() {
    this.url = `https://cdn.syndication.twimg.com/widgets/timelines/${this.opts.widgetid}?suppress_response_codes=true&callback=${this.callbackname}`;
  }

  /**
    JSONP callback function
  **/
  requestCallback() {
    window[`${this.callbackname}`] = (d) => {
      // Is this request a 404?
      if (d.headers !== undefined && d.headers.status === 404) {
        this.notFoundError(d.headers.message);
      } else {
        // Store in cache
        this.saveCache(d.body);

        this.parseBody(d.body);
      }
    };
  }

  /**
    404 error from Twitter
  **/
  notFoundError(message) {
    this.error(`Twitter responded with: ${message}`);
  }

  /**
    Parse returned body
  **/
  parseBody(body) {
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

  /**
    Loop all the tweets found
    This then creates an object with the Tweet details
    The object is then added into an array and sent to the callback function

    If there is a template string, parse it!
  **/
  loopTweets() {
    this.tweets = [];

    // Loop through all the tweet elements
    let count = this.getTweetCountToReturn(this.alltweets);
    for (let i = 0; i < count; i++) {
      let el = this.alltweets[i];

      // Generate the tweet object
      let tweetobject = {
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

  /**
    Get number of Tweets to return
    @param Array Tweet object array
    @return Integer
  **/
  getTweetCountToReturn(els) {
    if (this.opts.count !== undefined) {
      return (this.opts.count > els.length ? els.length : this.opts.count);
    } else {
      return els.length;
    }
  }

  /**
    Get Tweet stream element
  **/
  getTweetStream() {
    this.stream = this.dom.getElementsByClassName('h-feed')[0];
  }

  /**
    Get all the Tweet elements from the stream
  **/
  getAllTweets() {
    this.alltweets = this.stream.querySelectorAll('li.h-entry');
  }

  /**
    Get Tweet ID from the element
    @param Object HTML Object
    @return String Tweet ID
  **/
  getTweetID(el) {
    return el.getAttribute('data-tweet-id');
  }

  /**
    Get Tweet URL from the element
    @param Object HTML Object
    @return String Tweet URL
  **/
  getTweetUrl(el) {
    return el.querySelectorAll('.u-url')[0].getAttribute('href');
  }

  /**
    Get Tweet date from the element
    @param Object HTML Object
    @return Date Tweet date
  **/
  getTweetDate(el) {
    return new Date(el.querySelectorAll('.u-url .dt-updated')[0].getAttribute('datetime'));
  }

  /**
    Get author username from the element
    @param Object HTML Object
    @return String author username
  **/
  getAuthorUsername(el) {
    return el.querySelectorAll('.p-nickname b')[0].innerHTML;
  }

  /**
    Get author name from the element
    @param Object HTML Object
    @return String author name
  **/
  getAuthorName(el) {
    return el.querySelectorAll('.full-name .p-name')[0].innerHTML;
  }

  /**
    Get author URL from the element
    @param Object HTML Object
    @return String author URL
  **/
  getAuthorUrl(el) {
    return el.querySelectorAll('.u-url.profile')[0].getAttribute('href');
  }

  /**
    Get author avatar from the element
    @param Object HTML Object
    @return String author avatar
  **/
  getAuthorAvatar(el) {
    return el.querySelectorAll('.u-url.profile .avatar')[0].getAttribute('src');
  }

  /**
    Get all author data
    @param Object HTML Object
    @return Object Tweet author data
  **/
  getTweetAuthorObject(el) {
    return {
      avatar: this.getAuthorAvatar(el),
      profile_url: this.getAuthorUrl(el),
      name: this.getAuthorName(el),
      username: this.getAuthorUsername(el)
    };
  }

  /**
    Get tweet body
    @param Object HTML Object
    @return Object Tweet body
  **/
  getTweetBody(el) {
    return el.querySelectorAll('.e-entry-content .e-entry-title')[0].innerHTML;
  }

  /**
    Get tweet actions
    @param Object HTML Object
    @return Object Tweet actions
  **/
  getTweetActions(el) {
    return {
      reply: el.querySelectorAll('.reply-action')[0].getAttribute('href'),
      favorite: el.querySelectorAll('.favorite-action')[0].getAttribute('href'),
      retweet: el.querySelectorAll('.retweet-action')[0].getAttribute('href')
    };
  }

  /**
    Parse the template
  **/
  parseTemplate() {
    let outputhtml = '';
    let temp = this.opts.template;

    // Get all the handlebars variables inside the template
    let regex = new RegExp(/{{(.*?)}}/g);
    let bracesRegex = new RegExp(/({{|}})/g);
    let matches = temp.match(regex);

    if (matches === null) {
      this.error('No variables entered into the template');
      return;
    }

    // Loop all tweets
    this.tweets.forEach((tweet) => {
      let tweethtml = `<div data-tweetsie-id="${tweet.id}">${temp}</div>`;

      // Loop through all the matches
      matches.forEach((match) => {
        let tmptweet = tweet;

        // Get the variable name from the match
        let varname = match.replace(bracesRegex, '').trim();
        let filters = varname.split('|');

        // Get the variable value from the tweet
        let prefilterval = eval(`tweet["${varname.split('|')[0].trim().split('.').join('"]["')}"]`);
        let value = prefilterval;

        if (filters.length > 1) {
          filters.filter(function (filter, i) {
            return (i > 0);
          }).forEach((filter) => {
            let filterfunc = this[`filter_${filter.trim()}`];

            // Run the filter!
            if (filterfunc !== undefined) {
              value = filterfunc.call(this, prefilterval, false);
            } else if (this.opts.filters !== undefined && this.opts.filters[`${filter.trim()}`] !== undefined) {
              value = this.opts.filters[`${filter.trim()}`].call(this, prefilterval);
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

  /**
    Get the container element
    @return Object container element
  **/
  getContainer() {
    if (typeof this.opts.container === 'string') {
      let containerstr = this.opts.container;

      // If first char is hash, remove it!
      if (containerstr.indexOf('#') === 0) {
        containerstr = containerstr.substring(1, containerstr.length);
      }

      return document.getElementById(containerstr);
    } else {
      return this.opts.container;
    }
  }

  /**
    Append the output HTML to the body
    @param String HTML string
  **/
  appendOutputToContainer(html) {
    if (this.opts.container === undefined) {
      this.error(`No container passed to Tweetsie`);
      return;
    }

    // Get container
    let container = this.getContainer();
    container.innerHTML = html;

    // Should autodate run?
    if (container.querySelectorAll('.tweetsie-auto-date').length > 0) {
      this.filter_autodate(null, true);
    }

    if (this.opts.callback !== undefined) {
      this.opts.callback(this.tweets);
    }
  }

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
  filter_autodate(date, run) {
    if (!run) {
      let pad = (number) => {
        return (number < 10) ? `0${number}` : number;
      }

      // Convert date into attributes
      let time = date.getTime();
      let formatteddate = `${date.getFullYear()}-${pad(date.getMonth()+1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}Z`;

      // Create the element
      let timeObj = document.createElement('time');
      timeObj.className = 'tweetsie-auto-date';
      timeObj.setAttribute('datetime', formatteddate);
      timeObj.setAttribute('data-tweetsie-time', time);
      timeObj.textContent = this.filter_formatdate(date);

      return timeObj.outerHTML;
    } else {
      // Run autodate on an interval
      let elements = this.getContainer().querySelectorAll('.tweetsie-auto-date');

      setInterval(() => {
        for (let i = 0; i < elements.length; i++) {
          // Get the current element
          let el = elements[i];

          // Get the time
          let date = new Date(parseInt(el.getAttribute('data-tweetsie-time'), 10));

          // Get the formatted date and only update if any change
          let formatteddate = this.filter_formatdate(date);

          if (formatteddate !== el.textContent) {
            console.log('a');
            el.textContent = formatteddate;
          }
        }
      }, 1000);
    }
  }

  /**
    Format the date to be relative to current time
    @param String val
    @return String formatted date
  **/
  filter_formatdate(date) {
    // Convert date into attributes
    let time = date.getTime();
    let current = (new Date()).getTime();
    let diff = ((current - time) / 1000);
    let daydiff = Math.floor(diff / 86400);

    // Convert to text
    if (diff < 60) { return 'just now';
    } else if (diff < 120) { return '1 min ago';
    } else if (diff < 3600) { return `${Math.floor(diff / 60)} mins ago`;
    } else if (diff < 7200) { return '1 hour ago';
    } else if (diff < 86400) { return `${Math.floor(diff / 3600)} hours ago`;
    } else if (daydiff === 1) { return 'Yesterday';
    } else if (daydiff < 7) { return `${daydiff} days ago`;
    } else if (daydiff === 7) { return '1 week ago';
    } else if (daydiff < 31) { return `${Math.ceil(daydiff / 7)} weeks ago`;
    } else if (daydiff < 365) { return `${Math.ceil(daydiff / 30)} months ago`;
    } else { return 'A long time ago'; }
  }
}
