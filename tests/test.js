(function () {
  var widgetid = '570149068425674752';
  var WIDGETID_ERROR_MSG = 'Must pass in a `widgetid`';
  var NOT_FOUND_MSG = 'Twitter responded with: Widget configuration is not found.';

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
})();
