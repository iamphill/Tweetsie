(function () {
  var widgetid = '570149068425674752';
  var WIDGETID_ERROR_MSG = 'Must pass in a `widgetid`';
  var NOT_FOUND_MSG = 'Twitter responded with: Widget configuration is not found.';
  var CONTAINER_ID = 'tweetsie-container';
  var NO_CONTAINER = 'No container passed to Tweetsie';
  var TEMPLATE_EMPTY_MATCHES = 'No variables entered into the template';

  test('Tweetsie creation', function (assert) {
    var done = assert.async();

    // Create Tweetsie widget
    new Tweetsie({
      widgetid: widgetid,
      callback: function (tweets) {
        assert.equal(tweets.length, 20, 'Tweets not found!');
        done();
      }
    });
  });

  test('Error with widgetid', function (assert) {
    var done = assert.async();

    new Tweetsie({
      widgetid: '1',
      error: function (msg) {
        assert.equal(msg, NOT_FOUND_MSG, 'No error getting Tweets. Huh?');
        done();
      }
    });
  });

  test('Error no widgetid', function (assert) {
    var done = assert.async();

    new Tweetsie({
      error: function (msg) {
        assert.equal(msg, WIDGETID_ERROR_MSG, 'No widget ID');
        done();
      }
    });
  });

  test('Number of Tweets returned', function (assert) {
    var done = assert.async();

    new Tweetsie({
      widgetid: widgetid,
      count: 1,
      callback: function (tweets) {
        assert.equal(tweets.length, 1, 'Tweets not found!');
        done();
      }
    });
  });

  test('Tweet data', function (assert) {
    var done = assert.async();
    assert.expect(10);

    new Tweetsie({
      widgetid: widgetid,
      count: 1,
      callback: function (tweets) {
        var tweet = tweets[0];

        assert.notEqual(tweet.id, undefined, 'Tweet ID not undefined');
        assert.notEqual(tweet.tweet_url, undefined, 'Tweet URL not undefined');
        assert.notEqual(tweet.date, undefined, 'Tweet date not undefined');
        assert.notEqual(tweet.author.avatar, undefined, 'Tweet avatar not undefined');
        assert.notEqual(tweet.author.name, undefined, 'Tweet name not undefined');
        assert.notEqual(tweet.author.profile_url, undefined, 'Tweet profile URL not undefined');
        assert.notEqual(tweet.author.username, undefined, 'Tweet username not undefined');
        assert.notEqual(tweet.actions.favorite, undefined, 'Tweet favorite URL not undefined');
        assert.notEqual(tweet.actions.reply, undefined, 'Tweet reply URL not undefined');
        assert.notEqual(tweet.actions.retweet, undefined, 'Tweet retweet URL not undefined');

        // Complete!
        done();
      }
    });
  });

  test('Tweet template with empty template', function (assert) {
    var done = assert.async();

    new Tweetsie({
      widgetid: widgetid,
      count: 1,
      template: '',
      error: function (msg) {
        assert.equal(msg, TEMPLATE_EMPTY_MATCHES, 'Template matches found?!');
        done();
      }
    });
  });

  test('Tweet template without container', function (assert) {
    var done = assert.async();

    new Tweetsie({
      widgetid: widgetid,
      count: 1,
      template: '{{ body }}',
      error: function (msg) {
        assert.equal(msg, NO_CONTAINER, 'Somehow found a container?');
        done();
      }
    });
  });

  test('Tweet template with container', function (assert) {
    var done = assert.async();
    var i = 0;

    new Tweetsie({
      container: 'tweetsie-container',
      widgetid: widgetid,
      count: 1,
      template: '<p>{{ body }}</p>',
      callback: function (tweets) {
        if (i === 0) {
          setTimeout(function () {
            var el = document.getElementById(CONTAINER_ID);
            assert.equal(el.getElementsByTagName('p').length, 1, 'Template didn\'t render right!');
            done();
          }, 200);
        }
        i++;
      }
    });
  });
})();
