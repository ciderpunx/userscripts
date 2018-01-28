// ==UserScript==
// @name        DontSpoilTheArchers
// @author      Charlie Harvey
// @copyright   2017, Charlie Harvey https://charlieharvey.org.uk)
// @namespace   ox4
// @description Hides the spoilers on the archers page on iplayer
// @supportURL  https://github.com/ciderpunx/userscripts/issues
// @include     http://www.bbc.co.uk/programmes/b006qpgr/*
// @version     0.1
// @match       http://*/*
// @grant       GM_getResourceText
// @grant       GM_xmlhttpRequest
// @grant       GM_getValue
// @grant       GM_setValue
// @grant       GM_addStyle
// @license     GNU General Public License v3.0; https://www.gnu.org/licenses/gpl-3.0.en.html
// ==/UserScript==

(function() {
    'use strict';
     var spoilers, overlays;
     spoilers = document.getElementsByClassName('programme__synopsis');
     overlays = document.getElementsByClassName('block-link__overlay-link');

     for(i=0; i<spoilers.length;i++){
        var spoiler;
        spoiler = spoilers[i].innerText;
        spoilers[i].innerHTML="Its OK, I hid the spoiler! Select it with your mouse to see it.<br /> <span style=\'background-color:black;color:black'\>"+spoiler+"</span>";
     }
     for(var i=0; i<overlays.length;i++){
        overlays[i].style.display="none";
     }

})();