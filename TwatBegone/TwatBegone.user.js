// ==UserScript==
// @name        TwatBegone
// @author      Charlie Harvey
// @author      Graham Gillions
// @namespace   ox4
// @description Removes twats and all mentions of them from twitter
// @include     https://twitter.com/*
// @version     0.27
// @grant       GM_getResourceText
// @grant       GM_xmlhttpRequest
// @grant       GM_getValue
// @grant       GM_setValue
// @resource    configPage https://raw.githubusercontent.com/ciderpunx/userscripts/master/TwatBegone/configPage.html
// @resource    kittehs https://raw.githubusercontent.com/ciderpunx/userscripts/master/TwatBegone/kittehs.txt
// ==/UserScript==

var defaultTwats = [ "realDonaldTrump"
               , "Nigel_Farage"
               , "KTHopkins"
               , "piersmorgan"
               ];

var kittehs = GM_getResourceText("kittehs").split("\n");

if(   document.location.href=="https://twitter.com/?twatconf"
   || document.location.href=="https://twitter.com/?twatconf#" ) {
  showConfigPage();
  initTwats();
  initAction();
}
else {
  showIndicator();
  action = GM_getValue("action", "TwatBegone");
  if (action=="TwatBegone") {
    twatBegone();
  }
  else if (action=="Fortune") {
    twatFortune();
  }
  //twatToKitteh();
}

function showConfigPage() {
  document.documentElement.innerHTML = GM_getResourceText("configPage");
  addSubmitListener();
  //addShowUnimplementedListener();
}

function initAction() {
  action = GM_getValue("action", "TwatBegone");
  document.getElementById('action').value = action;
  setAction(action);
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

function setAction(action){
  GM_setValue("action",action);
}

function updateSettings() {
   setTwats(document.getElementById('twats').value);
   setAction(document.getElementById('action').value);
}

// Makes a little fixed div at the bottom left with a link to the config page
function showIndicator() {
  var divv = document.createElement('div');
  divv.innerHTML = '<img style="float:left;height:25px;padding-top:2px" src="https://pbs.twimg.com/profile_images/850405364067688448/3x0b2zmz_normal.jpg" /><a href="https://twitter.com/?twatconf" style="color:#fff">TwatBegone Active</a>';
  divv.style.cssText = 'position:fixed;width:155px;height:2em;text-align:center;z-index:100;background:#f00;line-height:2em;left:0;bottom:0;font-family:freesans, helvetica, arial, sans-serif;';
  document.getElementById('page-outer').appendChild(divv);
}

// Remove twats from twitter feed
function twatBegone() {
  twatProcess( function(tweet) { tweet.parentNode.removeChild(tweet); }, true, true );
}

// Replace tweet with a cat from thecatapi.com
// For some reason images do not work if they originate at a non-twitter domain
function twatToKitteh() {
  twatProcess( function(tweet) {
    mahKitteh = kittehs[Math.floor(Math.random() * kittehs.length)];
    tweet.innerHTML = '<p><em>The URL is <br />"' + mahKitteh + '"</em><br /><img src="' + mahKitteh + '" alt="kitteh"></p>'; 
  }, true);
}

function twatFortune() {
    fortuneServerURL = "https://helloacm.com/api/fortune/";
    twatProcess (function(tweet) {
      fortune = "cannot load fortune";
      console.log(tweet);
      GM_xmlhttpRequest({
        method: "GET",
        url: fortuneServerURL,
        timeout: 800,
        onload: function(response) {
          fortune = response.responseText
                            .replace(/["]/g,'')
                            .replace(/\\n/g,'<br />')
                            .replace(/\\t/g,' &nbsp; &nbsp;')
                            .replace(/\\/g,'');
          tweet.innerHTML = [ '<div style="border-bottom:1px solid #eee;padding:1em 0">'
                            , '<img class="avatar" style="float:left;margin-left:12px" src="https://pbs.twimg.com/profile_images/850405364067688448/3x0b2zmz_bigger.jpg" alt="TBG" />'
                            , '<p style="margin-left:70px"><strong>This tweet was bullshit.</strong> '
                            , '<span style="color:#657786">Here is your fortune instead.</span></p>'
                            , '<p style="margin-left:70px">' + fortune + "</p>"
                            ].join('');
        }
      })
    }, true);
}

// Takes a function and apply it to any tweets that match one of the current twats
function twatProcess(action, firstCall, destructiveUpdate) {
  tweets = document.getElementsByClassName("js-stream-item");

  if(firstCall) { //&& document.location.href=="https://twitter.com/"){
    document.body.onkeydown = function (e) {
      if(e.keyCode==190) { // i.e. '.' for refresh
        twatProcess(action, false );
      }
    }
    delayedCalls(function(){twatProcess(action)}, false);
  }

  for (var i=1; i<=tweets.length; i++) {
   var tc = tweets[i].textContent;
   if (anyMatch(tc)) {
     action(tweets[i]);
     if(destructiveUpdate) {
      i--; // yes, this is disgusting
     }
   }
  }
}

// call a function at some set delays, to catch TL on twitter
// 300ms, 1000.. step 1000
function delayedCalls(fn) {
  setTimeout(fn, 300); // for really fast connections
  setInterval(fn, 1000);
}

// Check text content doesn't contain any mentions of twats
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
