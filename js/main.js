/*****************************************************************
File: main.js
Author: Marjan Tropper
Description:

    



Version: 0.1.1
Updated: March 16, 2017
*****************************************************************/
//Declarations
"use strict";

let url = "../json/browsers.json" ;

var values = [12, 53, 46, 67.2, 32, 5, 77];
var total = 0;
//var canvas, context;
for (var i = 0; i < values.length; i++) {
    total += values[i];
}
/******************* fetching json file  **************************************/
let serverData = {
    httpRequest: "GET"
    , getJSON: function () {
        // Add headers and options objects
        // Create an empty Request Headers instance
        let headers = new Headers();
        // Add a header(s)
        // key value pairs sent to the server
        headers.append("Content-Type", "text/plain");
        headers.append("Accept", "application/json; charset=utf-8");
        let options = {
            method: serverData.httpRequest
            , mode: "cors"
            , headers: headers
        };
        let request = new Request(url, options);
        fetch(request).then(function (response) {
            return response.json();
        }).then(function (jsonData) {
            
            /* without the http: is front of the image url it would randomly not show images so http: was added to the url string to solve the bug*/
            
            console.log(jsonData);
            console.log(jsonData.label);
            document.getElementById("chartTitle").innerHTML = jsonData.label;
            drawPie();
            drawArcs();
            return jsonData;
        }).catch(function (err) {
            console.log("Error: " + err.message);

            function reqListener() {
                var data = JSON.parse(this.responseText);
                profiles = profiles.concat(data.profiles);
                imgurl = "http:" + decodeURIComponent(data.imgBaseURL);
                savedListProfiles.url = imgurl;
                if (profiles.length < 7) {
                    showProfile();
                }
            }

            function reqError(err) {
                document.getElementById('myCard').innerHTML = 'Fetch Error :-S', err;
            }
            var oReq = new XMLHttpRequest();
            oReq.onload = reqListener;
            oReq.onerror = reqError;
            oReq.open('get', url, true);
            oReq.send();
        });
    }
};

function jsonError() {
    function reqListener() {
        var data = JSON.parse(this.responseText);
        profiles = profiles.concat(data.profiles);
        imgurl = "http:" + decodeURIComponent(data.imgBaseURL);
        savedListProfiles.url = imgurl;
        if (profiles.length < 7) {
            showProfile();
        }
    }

    function reqError(err) {
        document.getElementById('myCard').innerHTML = 'Fetch Error :-S', err;
    }
    var oReq = new XMLHttpRequest();
    oReq.onload = reqListener;
    oReq.onerror = reqError;
    oReq.open('get', url, true);
    oReq.send();
}
/* the following seems redundent but ipad did not recognize fetch so this was added to fix the issue with Ipad I think it has something to do with Rachet since normally Fetch works fine on chrome on an ipad*/
function getData() {
    try {
        serverData.getJSON();
    }
    catch (err) {
        jsonError();
    }
}
/**************************** Pie Chart ***********************/
function drawPie() {

    let canvas = document.getElementById("pieCanvas");
    
    let context = canvas.getContext("2d");
    //clear the canvas
    context.clearRect(0, 0, canvas.width, canvas.height);
    //set the styles in case others have been set
   // setDefaultStyles(context);
    let cx = canvas.width / 2;
    let cy = canvas.height / 2;
    let radius = 100;
    let currentAngle = 0;
    //the difference for each wedge in the pie is arc along the circumference
    //we use the percentage to determine what percentage of the whole circle
    //the full circle is 2 * Math.PI radians long.
    //start at zero and travelling clockwise around the circle
    //start the center for each pie wedge
    //then draw a straight line out along the radius at the correct angle
    //then draw an arc from the current point along the circumference
    //stopping at the end of the percentage of the circumference
    //finally going back to the center point.
    for (let i = 0; i < values.length; i++) {
        let pct = values[i] / total;
        //create colour 0 - 16777216 (2 ^ 24) based on the percentage
        let intColour = parseInt(pct * 16777216);
        //console.log(intColour);
        let red = ((intColour >> 16) & 255);
        let green = ((intColour >> 8) & 255);
        let blue = (intColour & 255);
        //console.log(red, green, blue);
        let colour = "rgb(" + red + "," + green + "," + blue + ")";
        //console.log(colour);
        //draw the arc
        let endAngle = currentAngle + (pct * (Math.PI * 2));
        context.moveTo(cx, cy);
        context.beginPath();
        context.fillStyle = colour;
        context.arc(cx, cy, radius, currentAngle, endAngle, false);
        context.lineTo(cx, cy);
        context.fill();
        //Now draw the lines that will point to the values
        context.save();
        context.translate(cx, cy); //make the middle of the circle the (0,0) point
        context.strokeStyle = "#0CF";
        context.lineWidth = 1;
        context.beginPath();
        //angle to be used for the lines
        let midAngle = (currentAngle + endAngle) / 2; //middle of two angles
        context.moveTo(0, 0); //this value is to start at the middle of the circle
        //to start further out...
        let dx = Math.cos(midAngle) * (0.8 * radius);
        let dy = Math.sin(midAngle) * (0.8 * radius);
        context.moveTo(dx, dy);
        //ending points for the lines
         dx = Math.cos(midAngle) * (radius + 30); //30px beyond radius
         dy = Math.sin(midAngle) * (radius + 30);
        context.lineTo(dx, dy);
        context.stroke();
        context.font = '16px Helvetica, Calibri';
        context.fillStyle = colour;
        console.log(colour);
        console.log("dy=" + dy)
        console.log("cy=" + cy)
        if (dx > 0) {
            context.textAlign = 'left';
        }
        else {
            context.textAlign = 'right';
        }
        let label = "sample"
        if (dy > 0) {
            context.fillText(label, dx, dy + 15);
            console.log("more");
        }
        else {
            context.fillText(label, dx, dy - 5);
            console.log("less");
        }
        //put the canvas back to the original position
        context.restore();
        //update the currentAngle
        currentAngle = endAngle;
    }
}
/************************* Arc ****************************/

function drawArcs() {
    
    let canvas = document.getElementById("arcCanvas");
    let context = canvas.getContext("2d");
    //copy the array so we can work with a sorted version
    let values_copy = values;
    values_copy.sort(function (a, b) {
        return a - b
    });
    //clear the canvas
    context.clearRect(0, 0, canvas.width, canvas.height);
    //set the styles in case others have been set
   // setDefaultStyles(context);
    let cx = canvas.width / 2;
    let cy = canvas.height / 2;
    let radius = 25;
    let gap = 20
    let startAngle = 0;
    for (let i = 0; i < values_copy.length; i++) {
        //find the percentage of the total for each value
        //var pct = values_copy[i]/total;
        //just use each value as a percentage
        let pct = values_copy[i] / 100;
        //create colour 0 - 16777216 (2 ^ 24) based on the percentage
        let intColour = parseInt(pct * 16777216);
        let red = ((intColour >> 16) & 255);
        let green = ((intColour >> 8) & 255);
        let blue = (intColour & 255);
        let colour = "rgb(" + red + "," + green + "," + blue + ")";
        //they will all start at zero degrees (zero radians)
        let endAngle = startAngle + (pct * (Math.PI * 2));
        console.log(values_copy[i], total, pct, endAngle);
        context.moveTo(cx + radius, cy);
        context.beginPath();
        context.strokeStyle = colour;
        context.lineWidth = 10;
        context.arc(cx, cy, radius, startAngle, endAngle, false);
        context.stroke();
        context.closePath();
        
        
        
        

  
  context.rotate(+Math.PI/2);
  context.font = '16px Helvetica, Calibri';
  context.textAlign = 'right';
  context.fillStyle = colour;

  context.fillText("sample", cx, -cy-radius+5);
context.rotate(-Math.PI/2);
        radius += 20;
  context.restore();
        
    }
}
/**************** helper functions ********************/
function setDefaultStyles(context) {
    //set default styles for canvas
    context.strokeStyle = "#333"; //colour of the lines
    context.lineWidth = 3;
    context.font = "bold 16pt Arial";
    context.fillStyle = "#900"; //colour of the text
    context.textAlign = "left";
}

function highlightButton(btn) {
    var btns = document.querySelectorAll(".btn");
    for (var i = 0; i < btns.length; i++) {
        btns[i].style.fontWeight = 'normal';
    }
    btn.style.fontWeight = 'bold';
}
/***************** hide canvas *************/
function showArcs(ev) {
    document.getElementById("btnPie").className="tab-item";
    document.getElementById("btnArc").className="tab-item active";
    document.getElementById("pieCanvas").style.display="none";
    document.getElementById("arcCanvas").style.display="inline-flex";
    
}
function showPie(ev) {
    document.getElementById("btnArc").className="tab-item";
    document.getElementById("btnPie").className="tab-item active";
    document.getElementById("pieCanvas").style.display="inline-flex";
    document.getElementById("arcCanvas").style.display="none";
    
}

/************* page load events *****************/

function init(ev) {
    //initiate page
    getData();
    
    
    document.getElementById("pieCanvas").style.display="inline-flex";
    document.getElementById("btnPie").addEventListener("click", showPie);
    document.getElementById("btnArc").addEventListener("click", showArcs);
}
/**************************** Initialising ********************************/
window.addEventListener('push', init);
document.addEventListener("DOMContentLoaded", init);