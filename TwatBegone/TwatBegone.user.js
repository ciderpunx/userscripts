// ==UserScript==
// @name        TwatBegone
// @author      Charlie Harvey and Graham Gillions
// @namespace   ox4
// @description Removes twats and all mentions of them from twitter
// @include     https://twitter.com/*
// @version     0.32
// @grant       GM_getResourceText
// @grant       GM_xmlhttpRequest
// @grant       GM_getValue
// @grant       GM_setValue
// @resource    configPage https://raw.githubusercontent.com/ciderpunx/userscripts/master/TwatBegone/configPage.html
// @resource    kittehs https://raw.githubusercontent.com/ciderpunx/userscripts/master/TwatBegone/kittehs.txt
// @resource    haiku https://raw.githubusercontent.com/herval/haikuzao/master/inputs/haiku.txt
// ==/UserScript==

var defaultTwats = [ "realDonaldTrump"
               , "Nigel_Farage"
               , "KTHopkins"
               , "piersmorgan"
               ];

var kittehs = GM_getResourceText("kittehs").split("\n");

var haikuWords = GM_getResourceText("haiku").split(/\s+/);

var fortuneServerURL = "https://helloacm.com/api/fortune/";

var fortuneServerTimeout = 800;

if(   document.location.href=="https://twitter.com/?twatconf"
   || document.location.href=="https://twitter.com/?twatconf#" ) {
  showConfigPage();
  initTwats();
  initAction();
}
else {
  showIndicator();
  var action = GM_getValue("action", "TwatBegone");
  if (action=="TwatBegone") {
    twatBegone();
  }
  else if (action=="Fortune") {
    twatFortune();
  }
  else if (action=="Haiku") {
    twatHaiku();
  }
  //twatToKitteh();
}

function showConfigPage() {
  document.documentElement.innerHTML = GM_getResourceText("configPage");
  addSubmitListener();
  //addShowUnimplementedListener();
}

function initAction() {
  document.getElementById('action').value = GM_getValue("action", "TwatBegone");
  setAction(action);
}

function initTwats() {
  document.getElementById('twats').value = cleanTwats(GM_getValue("twats", defaultTwats.join("\n")));
  setTwats(twats);
}

function addSubmitListener() {
  document.getElementById("submit").addEventListener('click',updateSettings,false);
}

function setTwats(twats){
  GM_setValue("twats",cleanTwats(twats));
}

function cleanTwats(twats) {
  return twats.split("\n").filter(nonempty).join("\n")
}

function setAction(action){
  GM_setValue("action",action);
}

// Called when user clicks updateSettings button on config page
function updateSettings() {
   setTwats(document.getElementById('twats').value);
   setAction(document.getElementById('action').value);
   var d = new Date();
   var info = document.getElementById('info');
   info.innerHTML = "Settings updated at: " + d.toTimeString().replace(/\s.*/,'');
   info.style.display="inline";
}

// Makes a little fixed div at the bottom right with a link to the config page, so ppl know TwatBegone is running
function showIndicator() {
  var divv = document.createElement('div');
  divv.innerHTML = '<img style="float:left;height:25px;padding-top:2px" src="https://pbs.twimg.com/profile_images/850405364067688448/3x0b2zmz_normal.jpg" /><a href="https://twitter.com/?twatconf" style="color:#fff">TwatBegone Active</a>';
  divv.style.cssText = 'position:fixed;width:155px;height:2em;text-align:center;z-index:100;background:#f00;line-height:2em;right:0;bottom:0;font-family:freesans, helvetica, arial, sans-serif;';
  document.getElementById('page-outer').appendChild(divv);
}

// Action: Remove all mention of twats from twitter feed
function twatBegone() {
  twatProcess( function(tweet) { tweet.parentNode.removeChild(tweet); }, true, true );
}

// Action: Replace tweet with a cat from thecatapi.com
// TODO: For some reason images do not work if they originate at a non-twitter domain
function twatToKitteh() {
  twatProcess( function(tweet) {
    var mahKitteh = kittehs[Math.floor(Math.random() * kittehs.length)];
    tweet.innerHTML = '<p><em>The URL is <br />"' + mahKitteh + '"</em><br /><img src="' + mahKitteh + '" alt="kitteh"></p>'; 
  }, true);
}

// Action: replace with fortune from the server
function twatFortune() {
    twatProcess (function(tweet) {
      var fortune = "cannot load fortune";
      GM_xmlhttpRequest({
        method: "GET",
        url: fortuneServerURL,
        timeout: fortuneServerTimeout,
        onload: function(response) {
          fortune = response.responseText
                            .replace(/["]/g,'')
                            .replace(/\\n/g,'<br />')
                            .replace(/\\t/g,' &nbsp; &nbsp;')
                            .replace(/\\/g,'');
          tweet.innerHTML = textTweet('Here is your fortune instead.', fortune)
        }
      })
    }, true);
}

// Action: replace with Haiku
function twatHaiku() {
    twatProcess (function(tweet) {
      var haiku = "cannot compose haiku";
      haiku = makeHaiku();
      tweet.innerHTML =
          textTweet( 'Here&#8217;s a haiku made of words from <a href="https://raw.githubusercontent.com/herval/haikuzao/master/inputs/haiku.txt">these ones</a>.'
                   , haiku
                   );
    }, true);
}

// Given a title and a text, return something that can be used as a tweet, at least on desktop.
function textTweet(title, txt) {
      return [ '<div style="border-bottom:1px solid #eee;padding:1em 0">'
             , '<img class="avatar" style="float:left;margin-left:12px" src="https://pbs.twimg.com/profile_images/850405364067688448/3x0b2zmz_bigger.jpg" alt="TBG" />'
             , '<p style="margin-left:70px"><strong>This tweet was bullshit.</strong> '
             , '<span style="color:#657786">' + title + '</span></p>'
             , '<p style="margin-left:70px">' + txt + "</p>"
             ].join('');
}

// Take a function and apply it to any tweets that match one of the current twats
function twatProcess(action, firstCall, destructiveUpdate) {
  var tweets = document.getElementsByClassName("js-stream-item");

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
     if(destructiveUpdate) {
      i--; // yes, this is disgusting
     }
   }
  }
}

// Call a function at some set delays, to catch TL on twitter
// 300ms, 1000.. step 1000
function delayedCalls(fn) {
  setTimeout(fn, 300); // for really fast connections
  setInterval(fn, 1000);
}

// Check text content doesn't contain any mentions of twats
function anyMatch(tc) {
  var twats = GM_getValue("twats", defaultTwats.join("\n")).split("\n").filter(nonempty);
  for(var i=0;i<twats.length;i++) {
    var t = new RegExp(twats[i],'i');
    if(tc.match(t)!==null) {
      return true;
    }
  }
  return false;
}

// false if a string is empty, true otherwise
function nonempty(xs) {
  return !(/^\s*$/.test(xs));
}

// Syllable counting machinery based on Perl's Lingua::EN:Syllable
// Far from entirely accurate.
function syllable(word) {
    var scrugg = [];
    var syl = 0;
    var subSyl = [ 'cial'
                 , 'tia'
                 , 'cius'
                 , 'cious'
                 , 'giu'  // belgium!
                 , 'ion'
                 , 'iou'
                 , 'sia$'
                 , '.ely$' // absolutely! (but not ely!)
                 ];
    var addSyl = [ 'ia'
                 , 'riet'
                 , 'dien'
                 , 'iu'
                 , 'io'
                 , 'ii'
                 , '[aeiouym]bl$'    // -Vble, plus -mble
                 , '[aeiou]{3}'      // agreeable
                 , '^mc'
                 , 'ism$'            // -isms
                 , '([^aeiouy])\1l$' // middle twiddle battle bottle, etc.
                 , '[^l]lien'        // alien, salient [1]
                 ,'^coa[dglx].'      // [2]
                 , '[^gq]ua[^auieo]' // i think this fixes more than it breaks
                 , 'dnt$'            // couldn't
                 ];

    word = word.toLowerCase();
    word = word.replace(/\'/g,''); // fold contractions.  not very effective.
    word = word.replace(/e$/,'');  // trailing e
    scrugg = word.split(/[^aeiouy]+/); // '-' should perhaps be added?
    //shift(@scrugg) unless ($scrugg[0]);
    if (scrugg.length > 1) {
      scrugg.shift();
    }
    for (var i=0; i<subSyl.length; i++) {
      if(word.match(new RegExp(subSyl[i]))) { syl--; }
    }
    for(var i=0; i<addSyl.length; i++) {
      if(word.match(new RegExp(addSyl[i]))) { syl++; }
    }
    if (word.length==1) { syl++ }
    // count vowel groupings
    syl += scrugg.length;
    if (syl==0) { syl=1; }
    return syl;
}


// find a word with x syllables in it
function getWordOfSyllables(x) {
  var offset = Math.floor(Math.random() * haikuWords.length);
  while(haikuWords[offset]!="" && syllable(haikuWords[offset])!=x) {
    offset++;
    if(offset>haikuWords.length-1) {offset=0}
  }
  return haikuWords[offset];
}

// make a line of n syllables
function makeLine(n) {
  if(n<1) {return '';}
  var m = 1 + Math.floor(Math.random() * (n-1));
  var word = getWordOfSyllables(m);
  ws = [];
  if((n-m)>0) {
    ws = makeLine(n-m);
  }
  return word + " " + ws;
}

// make a 5-7-5 syllable(ish) haiku
function makeHaiku() {
  return makeLine(5) + "<br />\n" + makeLine(7) + "<br />\n" + makeLine(5);
}
