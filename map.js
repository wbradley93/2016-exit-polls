/************************************
 *  2016 Exit Poll Data Visualizer
 *  Author: Wes Bradley
 *  Last Modified: 21 Nov 2016
 *  Included elsewhere: var responses, samples
 *  TODO: mouseover infobox, and there must be some streamlining/optimizing potential
 ************************************/

var electoralCollege = {"Hawaii": "D", "New Mexico": "D", "Delaware": "D", "South Dakota": "R", "Michigan": "R", "Utah": "R", "North Carolina": "R", "Illinois": "D", "Kansas": "R", "South Carolina": "R", "Idaho": "R", "Washington": "D", "Mississippi": "R", "Kentucky": "R", "New Hampshire": "D", "Florida": "R", "Pennsylvania": "R", "Oklahoma": "R", "New York": "D", "Montana": "R", "California": "D", "Rhode Island": "D", "Nebraska": "R", "New Jersey": "D", "Wyoming": "R", "Oregon": "D", "Arkansas": "R", "Arizona": "R", "Indiana": "R", "Washington DC": "D", "Wisconsin": "R", "Texas": "R", "Maryland": "D", "Vermont": "D", "Missouri": "R", "Iowa": "R", "Maine": "D", "Georgia": "R", "Virginia": "D", "Colorado": "D", "Nevada": "D", "Alaska": "R", "Massachusetts": "D", "West Virginia": "R", "Alabama": "R", "Ohio": "R", "North Dakota": "R", "Tennessee": "R", "Minnesota": "D", "Louisiana": "R", "Connecticut": "D"};
var colors = {"R":"#ea1919", "D":"#001dff", "G":"#18ce00", "LB":"#ffff00", "O":"#ff00e1"}
var candidates = {"Trump":"R", "Clinton":"D", "Johnson":"LB", "Stein":"G"};
var styles = ["#1f78b4","#33a02c","#fb9a99","#e31a1c","#ff7f00", "#000000", "#984ea3"];
var usRaphael = {};
var usMasks = {};
var questions = [];
var R = Snap(930, 588);

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
    var sel = document.getElementById('CBRr');
    while (sel.lastChild) {
        sel.removeChild(sel.lastChild);
    }
    opts = document.getElementById('CBRq').value.split("\\");
    for (var i = 1; i < opts.length; i++) {
        var opt = document.createElement('option');
        opt.innerHTML = opts[i];
        opt.value = opts[i];
        sel.appendChild(opt);
    }
}

function getIntVal (str) {
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
    remainingColors = styles.slice(0);
    rStyles = {};
    arr = q.split("\\");
    for (var i = 1; i < arr.length; i++) {
        var index = Math.floor(Math.random()*remainingColors.length);
        rStyles[arr[i]] = remainingColors[index];
        remainingColors.splice(index, 1);
    }
    return rStyles;
}

function updateLegend (styles = {"Trump":"#ea1919", "Clinton":"#001dff", "Johnson":"#e8d01e", "Stein":"#18ce00", "Other/No Answer":"#e130e8"}) {
    var sel = document.getElementById('legendKey');
    while (sel.lastChild) {
        sel.removeChild(sel.lastChild);
    }
    for (res in styles) {
        var d = document.createElement('div');
        var d2 = document.createElement('div');
        d2.style["background-color"] = styles[res];
        d2.style.height = "20px";
        d2.style.width = "20px";
        d2.style.display = "inline-block";
        d2.style.margin = "0 5px";
        var s = document.createElement('span');
        s.innerHTML = res;
        s.value = styles[res];
        s.style.position = "relative";
        s.style.top = "-4.5px";
        s.style["margin-right"] = "4px";
        d.appendChild(d2);
        d.appendChild(s);
        sel.appendChild(d);
    }
}

function clearState(state) {
    usRaphael[state].color = "#d3d3d3";
    usMasks[state].attr({fill: "none"});
}

function updateMap() {
    switch (document.getElementsByClassName("open")[0].id) {
        case "candidateByResponse":
            var ques = document.getElementById('CBRq').value;
            var res = document.getElementById('CBRr').value;

            for (var state in usRaphael) {
                clearState(state)
                if (responses.hasOwnProperty(state) && responses[state].hasOwnProperty(ques)) {
                    var d = responses[state][ques][res];
                    var maxKey = "g";
                    var maxVal = 0;
                    for (var elt in d) {
                        var v = getIntVal(d[elt])
                        if (elt != "percent") {
                            if (v > maxVal) {
                                maxKey = elt;
                                maxVal = v;
                            } else if (v == maxVal) {
                                if (typeof(maxKey) == "string") {
                                    maxKey = [maxKey];
                                }
                                maxKey.push(elt);
                            }
                        }
                    }
                    if (maxVal > 0) {
                        if (typeof(maxKey) == "string") {
                            usRaphael[state].color = colors[maxKey];
                            usRaphael[state].animate({fill: usRaphael[state].color}, 500);
                        } else if (typeof(maxKey) == "object") {
                            var pat = R.path("M10-5-10,15M15,0,0,15M0-5-20,15").attr({stroke: colors[maxKey[0]], fill: colors[maxKey[0]], strokeWidth: 3})
                            usMasks[state].attr({fill: pat.toPattern(0,0,10,10)});
                            usRaphael[state].attr({fill: colors[maxKey[1]]});
                        } else {
                            console.log(maxKey);
                            throw "color fill error";
                        }
                    }
                } else {
                    usRaphael[state].animate({fill: usRaphael[state].color}, 500);
                }
            }
            updateLegend();
            break;
        case "electoralCollege":
            for (var state in usRaphael) {
                clearState(state)
                usRaphael[state].color = colors[electoralCollege[state]]
                usRaphael[state].animate({fill: usRaphael[state].color}, 500);
            }
            updateLegend();
            break;
        case "shareOfRespondents":
            var ques = document.getElementById('SORq').value;
            var rStyles = styleResponses(ques);
            for (var state in usRaphael) {
                clearState(state)
                if (responses.hasOwnProperty(state) && responses[state].hasOwnProperty(ques)) {
                    var d = responses[state][ques];
                    var maxKey = "";
                    var maxVal = 0
                    for (var ans in d) {
                        var v = getIntVal(d[ans]["percent"])
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
                        if (typeof(maxKey) == "string") {
                            usRaphael[state].color = rStyles[maxKey];
                            usRaphael[state].animate({fill: usRaphael[state].color}, 500);
                        } else if (typeof(maxKey) == "object") {
                            var pat = R.path("M10-5-10,15M15,0,0,15M0-5-20,15").attr({stroke: rStyles[maxKey[0]], fill: rStyles[maxKey[0]], strokeWidth: 3})
                            usMasks[state].attr({fill: pat.toPattern(0,0,10,10)});
                            usRaphael[state].attr({fill: rStyles[maxKey[1]]});
                        } else {
                            throw "color fill error";
                        }
                    }
                } else {
                    usRaphael[state].animate({fill: usRaphael[state].color}, 500);
                }
            }
            updateLegend(rStyles);
            break;
        case "responseByCandidate":
            var ques = document.getElementById('RBCq').value;
            var cand = document.getElementById('RBCc').value;
            var rStyles = styleResponses(ques);
            for (var state in usRaphael) {
                clearState(state)
                if (responses.hasOwnProperty(state) && responses[state].hasOwnProperty(ques)) {
                    var d = responses[state][ques];
                    var maxKey = "";
                    var maxVal = 0
                    for (var ans in d) {
                        v = getIntVal(d[ans][cand])
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
                        if (typeof(maxKey) == "string") {
                            usRaphael[state].color = rStyles[maxKey];
                            usRaphael[state].animate({fill: usRaphael[state].color}, 500);
                        } else if (typeof(maxKey) == "object") {
                            var pat = R.path("M10-5-10,15M15,0,0,15M0-5-20,15").attr({stroke: rStyles[maxKey[0]], fill: rStyles[maxKey[0]], strokeWidth: 3})
                            usMasks[state].attr({fill: pat.toPattern(0,0,10,10)});
                            usRaphael[state].attr({fill: rStyles[maxKey[1]]});
                        } else {
                            throw "color fill error";
                        }
                    }
                } else {
                    usRaphael[state].animate({fill: usRaphael[state].color}, 500);
                }
            }
            updateLegend(rStyles);
            break;
    }
    R.safari();
}

// source: http://www.w3schools.com/howto/howto_css_modals.asp
// Get the modal
var modal = document.getElementById('myModal');

// Get the button that opens the modal
var btn = document.getElementById("myBtn");

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
    var i, tabcontent, tablinks;

    if (document.getElementsByClassName("open").length > 0) {
        document.getElementsByClassName("open")[0].className =
            document.getElementsByClassName("open")[0].className.replace(" open", "");
    }

    // Get all elements with class="tabcontent" and hide them
    tabcontent = document.getElementsByClassName("tabContent");
    for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
    }

    // Get all elements with class="tablinks" and remove the class "active"
    tablinks = document.getElementsByClassName("tab");
    for (i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(" active", "");
    }

    // Show the current tab, and add an "active" class to the link that opened the tab
    document.getElementById(tabName).style.display = "block";
    document.getElementById(tabName).className += " open";
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

    //Draw Map and store Raphael paths
    for (var state in usMap) {
      usRaphael[state] = R.path(usMap[state]).attr(attr);
      usMasks[state] = R.path(usMap[state]).attr({fill: "none"});
    }

    Object.keys(responses).forEach(function (state) {
        Object.keys(responses[state]).forEach(function (question) {
            if (questions.indexOf(question) == -1) {
                questions.push(question);
            }
        });
    });
    questions.sort();

    var qSel = document.getElementsByClassName('questionSel');
    for (var i = 0; i < questions.length; i++) {
        var opt = document.createElement('option');
        s = questions[i].split("\\");
        opt.innerHTML = s[0] + " (" + s[1];
        for (var j = 2; j < s.length; j++){
            opt.innerHTML = opt.innerHTML + ", " + s[j];
        }
        opt.innerHTML = opt.innerHTML + ")";
        opt.value = questions[i];
        qSel[0].appendChild(opt);
    }
    for (var j = 1; j < qSel.length; j++){
        qSel[j].innerHTML = qSel[0].innerHTML;
    }
    getResponseOptions();

    var cSel = document.getElementById('RBCc');
    for (candidate in candidates){
        var opt = document.createElement('option');
        opt.innerHTML = candidate;
        opt.value = candidates[candidate];
        cSel.appendChild(opt);
    }
    updateMap();
};
