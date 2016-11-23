/************************************
 *  2016 Exit Poll Data Visualizer
 *  Author: Wes Bradley
 *  Last Modified: 23 Nov 2016
 *  Included elsewhere: var responses, samples, questions
 *  TODO: finish mouseover infobox,
 *      fix style inconsistencies ('/"),
 *      document updateMap and getSet,
 *      rename ambiguous variables,
 *      transfer styles from html to css,
 *      make maxKey object the norm,
 *      stop checking its type and just deal with second element if its there,
 *      deal with johnson/stein not being choices in some wcr questions,
 *      deal with infobox going off screen
 *      find slow computers to test on
 ************************************/

var electoralCollege = {"Hawaii": "D", "New Mexico": "D", "Delaware": "D", "South Dakota": "R", "Michigan": "R", "Utah": "R", "North Carolina": "R", "Illinois": "D", "Kansas": "R", "South Carolina": "R", "Idaho": "R", "Washington": "D", "Mississippi": "R", "Kentucky": "R", "New Hampshire": "D", "Florida": "R", "Pennsylvania": "R", "Oklahoma": "R", "New York": "D", "Montana": "R", "California": "D", "Rhode Island": "D", "Nebraska": "R", "New Jersey": "D", "Wyoming": "R", "Oregon": "D", "Arkansas": "R", "Arizona": "R", "Indiana": "R", "Washington DC": "D", "Wisconsin": "R", "Texas": "R", "Maryland": "D", "Vermont": "D", "Missouri": "R", "Iowa": "R", "Maine": "D", "Georgia": "R", "Virginia": "D", "Colorado": "D", "Nevada": "D", "Alaska": "R", "Massachusetts": "D", "West Virginia": "R", "Alabama": "R", "Ohio": "R", "North Dakota": "R", "Tennessee": "R", "Minnesota": "D", "Louisiana": "R", "Connecticut": "D"},
    partyColors = {"R":"#ea1919", "D":"#001dff", "GR":"#18ce00", "LB":"#ffff00", "O":"#ff00e1"},
    candidates = {"Trump":"R", "Clinton":"D", "Johnson":"LB", "Stein":"GR", "Other/No Answer":"O"},
    styles = ["#cb0028","#2b4ab2","#e68100","#a1069e","#989100","#b5adff","#7c3e60"],
    usSnap = {},
    usMasks = {},
    S = Snap(930, 588);

//necessary anymore?
function getQuestion (data, question) {
    var output = [{},{}];
    Object.keys(data).forEach(function (state) {
        if (data[state].hasOwnProperty(question)) {
            output[0][state] = data[state][question];
            output[1][state] = samples[state][question];
        }
    });
    return output;
}

function getResponseOptions () {
    //select and clear response list
    var sel = document.getElementById('CBRr');
    while (sel.lastChild) {
        sel.removeChild(sel.lastChild);
    }
    //get "question\\response" string, parse responses, repopulate list
    var opts = document.getElementById('CBRq').value.split("\\");
    for (var i = 1; i < opts.length; i++) {
        var opt = document.createElement('option');
        opt.innerHTML = opts[i];
        opt.value = opts[i];
        sel.appendChild(opt);
    }
}

function getIntVal (str) {
    // turns "X%" strings to int X's and catches "N/A" values, returning 0
    try {
        var int = parseInt(str.replace(/^\s+|\s+$/g, ""));
    } catch (e) {
        return 0;
    } finally {
        if (isNaN(int)) {
            return 0;
        } else {
            return int;
        }
    }
}

function styleResponses (q) {
    //takes "question\\responses" string, returns object of responses:colors
    var remainingColors = styles.slice(0),
        rStyles = {},
        arr = q.split("\\");
    for (var i = 1; i < arr.length; i++) {
        var index = Math.floor(Math.random()*remainingColors.length);
        rStyles[arr[i]] = remainingColors[index];
        remainingColors.splice(index, 1);
    }
    return rStyles;
}

function clearState(state) {
    usSnap[state].color = "#d3d3d3";
    usMasks[state].attr({fill: "none"});
    usSnap[state].unhover();
    usMasks[state].unhover();
}

function fillState (state, maxKey, style) {
    // determine whether single max or tie, fill appropriately
    if (typeof(maxKey) == "string") {
        usSnap[state].color = style[maxKey];
    } else if (typeof(maxKey) == "object") {
        var pat = S.path("M10-5-10,15M15,0,0,15M0-5-20,15").attr({stroke: style[maxKey[0]], fill: style[maxKey[0]], strokeWidth: 3});
        usMasks[state].attr({fill: pat.toPattern(0,0,10,10)});
        usSnap[state].color = style[maxKey[1]];
    } else {
        throw "maxKey type error: " + maxKey;
    }
}

function updateLegend (styles) {
    //use party colors if no style provided
    if (!styles) {
        var styles = {};
        for (var candidate in candidates) {
            styles[candidate] = partyColors[candidates[candidate]];
        }
    }
    //clear the legend
    var sel = document.getElementById('legend-key');
    while (sel.lastChild) {
        sel.removeChild(sel.lastChild);
    }
    // populate with container div, color key div, and label
    for (var res in styles) {
        var d = document.createElement('div'),
            d2 = document.createElement('div'),
            s = document.createElement('span');
        d2.style.cssText = "height:20px;width:20px;display:inline-block;margin:0 5px;background-color:"+styles[res]+";";
        s.innerHTML = res;
        s.value = styles[res];
        s.style.cssText = "position:relative;top:-4.5px;margin-right:4px;";
        d.appendChild(d2);
        d.appendChild(s);
        sel.appendChild(d);
    }
}

// *********************** mouseover stuff ************************
function createMouseoverHandlers (state, ques, maxKey, data, styles) {
    if (typeof(maxKey) == "string") {
        var s = usSnap[state];
    } else if (typeof(maxKey) == "object") {
        var s = usMasks[state];
    }

    (function (state, ques, maxKey, data, styles, st) {
        function mouseEnter () {//state, ques) {
            //empty/populate infobox div, display it w/ initial x,y of cursor position,
            //      set this.onmousemove to update its position
            //console.log(this);
            var sel = document.getElementById('infobox-data');
            while (sel.lastChild) {
                sel.removeChild(sel.lastChild);
            }
            for (var res in styles) {
                var d = document.createElement('div'),
                    d2 = document.createElement('div'),
                    s = document.createElement('span');
                d2.style.cssText = "height:20px;width:20px;display:inline-block;margin:0 5px;background-color:"+styles[res]+";";
                s.innerHTML = res + ": " + (data[res] || 0) + "%";
                s.value = styles[res];
                s.style.cssText = "position:relative;top:-4.5px;margin-right:4px;";
                d.appendChild(d2);
                d.appendChild(s);
                sel.appendChild(d);
            }
            document.getElementById("infobox-state").innerHTML = state;
            document.getElementById("infobox-sample").innerHTML = "<i>" + samples[state][ques] + "</i>";
            document.getElementsByClassName("infobox-content")[0].style.display = "block";


        }

        function mouseLeave () {
            //call this.unmousemove, set infobox div display to none
            document.getElementsByClassName("infobox-content")[0].style.display = "none";
            //console.log(this);
        }

        st.hover(mouseEnter, mouseLeave);
    })(state, ques, maxKey, data, styles, s);
}
// *********************** mouseover stuff ************************

function getSet (ques, sel) {
    if (Object.values(candidates).indexOf(sel) > -1 || sel == "percent") {
        var col = sel,
            styles = styleResponses(ques);
    } else {
        var res = sel;
    }
    for (var state in usSnap) {
        clearState(state)
        if (responses.hasOwnProperty(state) && responses[state].hasOwnProperty(ques)) {
            var d = responses[state][ques][res] || responses[state][ques],
                maxKey = "",
                maxVal = 0,
                r = {};
            for (var ans in d) {
                if (!col && ans == "percent") {
                    continue;
                }
                var v = getIntVal(d[ans][col] || d[ans]);
                r[ans] = v;
                if (v > maxVal) {
                    maxKey = ans;
                    maxVal = v;
                } else if (v == maxVal) {
                    if (typeof(maxKey) == "string") {
                        maxKey = [maxKey];
                    }
                    maxKey.push(ans);
                }
            }
            if (maxVal > 0) {
                createMouseoverHandlers(state, ques, maxKey, r, styles || partyColors);
                fillState(state, maxKey, styles || partyColors);
            }
        }
        usSnap[state].animate({fill: usSnap[state].color}, 500);
    }
    updateLegend(styles);
}

function updateMap() {
    switch (document.getElementsByClassName("open")[0].id) {
        case "candidateByResponse":
            var ques = document.getElementById('CBRq').value,
                res = document.getElementById('CBRr').value;
            getSet(ques, res);
            break;
        case "electoralCollege":
            for (var state in usSnap) {
                clearState(state);
                var st = usSnap[state];
                st.color = partyColors[electoralCollege[state]];
                st.animate({fill: usSnap[state].color}, 500);
            }
            updateLegend();
            break;
        case "shareOfRespondents":
            var ques = document.getElementById('SORq').value;
            getSet(ques, "percent");
            break;
        case "responseByCandidate":
            var ques = document.getElementById('RBCq').value,
                cand = document.getElementById('RBCc').value;
            getSet(ques, cand);
            break;
        default:
            throw "updateMap error: " + document.getElementsByClassName("open")[0].id;
    }
}

// source: http://www.w3schools.com/howto/howto_css_modals.asp
// Get the modal
var modal = document.getElementById('modal-container');
// Get the button that opens the modal
var btn = document.getElementById("modal-btn");
// Get the <span> element that closes the modal
var span = document.getElementsByClassName("close")[0];
// When the user clicks on the button, open the modal
btn.onclick = function() {
    modal.style.display = "block";
}
// When the user clicks on <span> (x), close the modal
span.onclick = function() {
    modal.style.display = "none";
}
// When the user clicks anywhere outside of the modal, close it
window.onclick = function(event) {
    if (event.target == modal) {
        modal.style.display = "none";
    }
}

// modified from: http://www.w3schools.com/howto/howto_js_tabs.asp
function openTab(evt, tabName) {
    // Declare all variables
    var i, tabcontent, tablinks, o = document.getElementsByClassName("open");
    if (o.length > 0) {
        o[0].className = o[0].className.replace(" open", "");
    }
    // Get all elements with class="tabcontent" and hide them
    tabcontent = document.getElementsByClassName("tab-content");
    for (var i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
    }
    // Get all elements with class="tablinks" and remove the class "active"
    tablinks = document.getElementsByClassName("tab");
    for (var i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(" active", "");
    }
    // Show the current tab, and add an "active" class to the link that opened the tab
    var c = document.getElementById(tabName);
    c.style.display = "block";
    c.className += " open";
    evt.currentTarget.className += " active";
    updateMap();
}

window.onload = function () {
    document.getElementById("defaultOpen").click();
    attr = {
      "fill": "#d3d3d3",
      "stroke": "#fff",
      "stroke-opacity": "1",
      "stroke-linejoin": "round",
      "stroke-miterlimit": "4",
      "stroke-width": "0.75",
      "stroke-dasharray": "none"
    };

    //draw map and store snap paths
    for (var state in usMap) {
      usSnap[state] = S.path(usMap[state]).attr(attr);
      usMasks[state] = S.path(usMap[state]).attr({fill: "none"});
    }

    // collect questions, parse to remove responses, append to question select div
    var qSel = document.getElementsByClassName('question-sel');
    for (var i = 0; i < questions.length; i++) {
        var opt = document.createElement('option'),
            s = questions[i].split("\\");
        opt.innerHTML = s[0] + " (" + s[1];
        for (var j = 2; j < s.length; j++) {
            opt.innerHTML = opt.innerHTML + ", " + s[j];
        }
        opt.innerHTML = opt.innerHTML + ")";
        opt.value = questions[i];
        qSel[0].appendChild(opt);
    }
    for (var j = 1; j < qSel.length; j++) {
        qSel[j].innerHTML = qSel[0].innerHTML;
    }
    getResponseOptions();

    //build list of candidates, append to candidate select div
    var cSel = document.getElementById('RBCc');
    for (var candidate in candidates) {
        var opt = document.createElement('option');
        opt.innerHTML = candidate;
        opt.value = candidates[candidate];
        cSel.appendChild(opt);
    }
    updateMap();

    window.onmousemove = function (e) {
        //pageX/Y or clientX/Y
        var m = document.getElementsByClassName("infobox-content")[0],
            o = getIntVal(window.getComputedStyle(document.getElementsByTagName("body")[0]).marginLeft);
        m.style.left = (e.pageX - o + 10)+ "px";
        m.style.top = e.pageY + "px";
    }
};
