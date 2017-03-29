// ==UserScript==
// @name        TwatBegone
// @namespace   ox4
// @description Removes twats and all mentions of them from twitter
// @include     https://twitter.com/*
// @version     1
// @grant       none
// ==/UserScript==

twats = [/fake news/i, /nytimes/i];


tweets=document.getElementsByClassName("stream-item");

// console.debug(tweets.length);

for (var i=1; i<=tweets.length; i++) {
  var tc = tweets[i].textContent;
  // console.debug(i + tc.replace(/\s+/g, ' '));
  if (anyMatch(tc)) {
    // console.debug("Tweet" + i + " will be removed");
    tweets[i].parentNode.removeChild(tweets[i]);
    i--; // yes, this is disgusting
  }
}

function anyMatch(tc) {
  for(var i=0;i<twats.length;i++) {
    if(tc.match(twats[i])!==null) {
      return 1; // tc.match(twats[i]);
    }
  }
  return 0;
}
