// ==UserScript==
// @name        TwatBegone
// @author      Charlie Harvey
// @author      Graham Gillions
// @namespace   ox4
// @description Removes twats and all mentions of them from twitter
// @include     https://twitter.com/*
// @version     0.24
// @grant       GM_getResourceText
// @grant       GM_getValue
// @grant       GM_setValue
// @resource    configPage https://raw.githubusercontent.com/ciderpunx/userscripts/master/TwatBegone/configPage.html
// ==/UserScript==

defaultTwats = [ "realDonaldTrump"
               , "Nigel_Farage"
               , "KTHopkins"
               , "piersmorgan"
               ];

if(   document.location.href=="https://twitter.com/?twatconf"
   || document.location.href=="https://twitter.com/?twatconf#" ) {
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
  addShowUnimplementedListener();
}

function initTwats() {
  twats = GM_getValue("twats", defaultTwats.join("\n"));
  document.getElementById('twats').value = twats; 
  setTwats(twats);
}

function addSubmitListener() {
  document.getElementById("submit").addEventListener('click',updateSettings,false);
}

function addShowUnimplementedListener() {
  document.getElementById("showUnimplemented").addEventListener(
      'click'
      , function() { document.getElementById('unimplemented').style.display = 'inline'; }
      , false
  );
}

function setTwats(twats){
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
  twatProcess( function(tweet) { tweet.parentNode.removeChild(tweet); }, true );
}

// Replace tweet with a cat from thecatapi.com
// TODO: waiting to see if this will work as I'd like
function twatToKitteh() {
  twatProcess( function(tweet) { 
    tweet.innerHTML = '<p>YES?<a href="http://thecatapi.com"><img src="http://thecatapi.com/api/images/get?format=src&type=gif"></a></p>'; 
  }, true);
  //console.log("ttk");
}

// get current fortune server preference.
// get template tweet text
// get fortune using xhttprequest?
// populate fortune with content of request
// replace tweet with newly constructed one
function fortune() {}

// Takes a function and apply it to any tweets that match one of the current twats
function twatProcess(action, firstCall) {
  tweets = document.getElementsByClassName("js-stream-item");

  if(firstCall) { //&& document.location.href=="https://twitter.com/"){
    document.body.onkeydown = function (e) {
      if(e.keyCode==190) { // i.e. '.' for refresh
        twatProcess(action, false );
      }
    }
    delayedCalls(function(){twatProcess(action)}, false);
  }

  for (var i=0; i<=tweets.length; i++) {
   var tc = tweets[i].textContent;
   if (anyMatch(tc)) {
     action(tweets[i]);
     i--; // yes, this is disgusting
   }
  }
}

// call a function at some set delays, to catch TL on twitter
// 300ms, 1000.. step 1000
function delayedCalls(fn) {
  setTimeout(fn, 300); // for really fast connections
  setInterval(fn, 1000);
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
