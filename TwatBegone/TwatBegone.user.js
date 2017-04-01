// ==UserScript==
// @name        TwatBegone
// @namespace   ox4
// @description Removes twats and all mentions of them from twitter
// @include     https://twitter.com/*
// @version     0.1
// @grant       GM_getResourceText
// @grant       GM_getValue
// @grant       GM_setValue
// @resource    configPage https://raw.githubusercontent.com/ciderpunx/userscripts/master/TwatBegone/configPage.html
// ==/UserScript==

defaultTwats = ["realDonaldTrump","Nigel_Farage"];

if(document.location.href=="https://twitter.com/?twatconf") {
  showConfigPage();
}
else {
  showIndicator();
  twatBegone();
  //twatToKitteh();
}

function showConfigPage() {
  document.documentElement.innerHTML = GM_getResourceText("configPage");
  initTwats();
  addSubmitListener();
}

function initTwats() {
  twats = GM_getValue("twats", defaultTwats.join("\n"));
  document.getElementById('twats').value = twats; 
  setTwats(twats);
}

function addSubmitListener() {
  document.getElementById("submit").addEventListener('click',updateSettings,false);
}

function setTwats(twats){
  console.log("attempt to set twats to" + twats);
  GM_setValue("twats",twats);
}

function updateSettings() {
   setTwats(document.getElementById('twats').value);
}

// Makes a little fixed div at the bottom left with a link to the config page
function showIndicator() {
  var divv = document.createElement('div');
  divv.innerHTML = '<a href="https://twitter.com/?twatconf" style="color:#fff">TwatBegone Active</a>';
  divv.style.cssText = 'position:fixed;width:10em;height:2em;text-align:center;z-index:100;background:#f00;line-height:2em;left:0;bottom:0;font-family:freesans, helvetica, arial, sans-serif;';
  document.getElementById('page-outer').appendChild(divv);
}

// Remove twats from twitter feed
function twatBegone() {
  twatProcess( function(tweet) { tweet.parentNode.removeChild(tweet); });
}

// Replace tweet with a cat from thecatapi.com
// TODO: waiting to see if this will work as I'd like
function twatToKitteh() {
  twatProcess( function(tweet) { 
    tweet.innerHTML = '<p>YES?<a href="http://thecatapi.com"><img src="http://thecatapi.com/api/images/get?format=src&type=gif"></a></p>'; 
  });
  console.log("ttk");

}

// Takes a function and apply it to any tweets that match one of the current twats
function twatProcess(action) {
  tweets = document.getElementsByClassName("stream-item");

  for (var i=1; i<=tweets.length; i++) {
   var tc = tweets[i].textContent;
   if (anyMatch(tc)) {
     action(tweets[i]);
     i--; // yes, this is disgusting
   }
  } 
}


function anyMatch(tc) {
  twats = GM_getValue("twats", defaultTwats.join("\n")).split("\n");
  for(var i=0;i<twats.length;i++) {
    t = new RegExp(twats[i],'i');
    if(tc.match(t)!==null) {
      return 1;
    }
  }
  return 0;
}