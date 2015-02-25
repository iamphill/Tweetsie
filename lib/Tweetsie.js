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
      - callback
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
    Initialize all the data required for the request
  **/
  initRequest() {
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
    this.url = `https://cdn.syndication.twimg.com/widgets/timelines/${this.opts.widgetid}?suppress_response_codes=true&callback=${TWITTER_CALLBACK_FUNCTION_NAME}`;
  }

  /**
    JSONP callback function
  **/
  requestCallback() {
    window[TWITTER_CALLBACK_FUNCTION_NAME] = (d) => {
      // Is this request a 404?
      if (d.headers !== undefined && d.headers.status === 404) {
        this.notFoundError(d.headers.message);
      } else {
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

        // Get the variable value from the tweet
        let value = eval('tweet["' + varname.split('.').join('"]["') + '"]');

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

    if (this.opts.callback !== undefined) {
      this.opts.callback(this.tweets);
    }
  }
}
