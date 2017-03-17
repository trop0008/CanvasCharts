/*****************************************************************
File: main.js
Author: Marjan Tropper
Description:
Pie Charts and Infographics
*   dynamically load JSON data file - browsers.json
*   two Canvas elements should be 400px by 400px
*   first Canvas element needs to display the data as a PIE Chart including labels
*   The largest should be 120% of the standard radius and the smallest value should be 80% the standard radius.
*   The SECOND Canvas element displays the same data and labels in an arc format
*   JSON file there is also a label that should use as a title for both charts.
    



Version: 0.1.1
Updated: March 16, 2017
*****************************************************************/
//Declarations
"use strict";
let url = "http://trop0008.edumedia.ca/mad9022/canvas/json/browsers.json";
let sortable;
let values = [];
let labels = [];
let total = 0;
let smallest = 0;
let largest = 0;
//var canvas, context;
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
            //console.log(jsonData);
            //console.log(jsonData.label);
            document.getElementById("chartTitle").innerHTML = jsonData.label;
            calculateTotal(jsonData.segments);
            drawPie();
            drawArcs();
            return jsonData;
        }).catch(function (err) {
            //console.log("Error: " + err.message);
            function reqListener() {
                console.log(err)
                var jsonData = JSON.parse(this.responseText);
                document.getElementById("chartTitle").innerHTML = jsonData.label;
                calculateTotal(jsonData.segments);
                drawPie();
                drawArcs();
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
        var jsonData = JSON.parse(this.responseText);
        document.getElementById("chartTitle").innerHTML = jsonData.label;
        calculateTotal(jsonData.segments);
        drawPie();
        drawArcs();
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
/********************** setting values **********************/
function calculateTotal(segmentdata) {
    /*
        using the json data we calculate the smallest larges and total and create a sortable array from the object
    */
    smallest = segmentdata[0].value;
    largest = segmentdata[0].value;
    if (Array.isArray(segmentdata)) {
        segmentdata.forEach(function (item, index) {
            if (smallest > item.value) {
                smallest = item.value;
            }
            if (largest < item.value) {
                largest = item.value;
            }
            values.push([item.color, item.label, item.value]);
            total += item.value;
            
        });
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
        //setting radius based on largest and smallest
        if (smallest == values[i][2]) {
            radius = radius * 0.80;
        }
        else if (largest == values[i][2]) {
            radius = radius * 1.20;
        }
        else {
            radius = 100;
        }
        let pct = values[i][2] / total;
        //create colour 0 - 16777216 (2 ^ 24) based on the percentage
        let colour = values[i][0];
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
        context.strokeStyle = colour;
        context.lineWidth = 1;
        context.beginPath();
        //angle to be used for the lines
        let midAngle = (currentAngle + endAngle) / 2; //middle of two angles
        context.moveTo(0, 0); //this value is to start at the middle of the circle
        //to start further out...
        radius = 100;
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
        if (dx > 0) {
            context.textAlign = 'left';
        }
        else {
            context.textAlign = 'right';
        }
        let label = values[i][1];
        if (dy > 0) {
            context.fillText(label, dx, dy + 15);
        }
        else {
            context.fillText(label, dx, dy - 5);
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
        return a[2] - b[2]
    });
    
    //clear the canvas
    context.clearRect(0, 0, canvas.width, canvas.height);
    let cx = canvas.width / 2;
    let cy = canvas.height / 2;
    let radius = 25;
    let gap = 20
    let startAngle = 0;
    for (let i = 0; i < values_copy.length; i++) {
        //find the percentage of the total for each value
        let pct = values_copy[i][2] / total;
        //set colour
        let colour = values[i][0];
        //they will all start at zero degrees (zero radians)
        let endAngle = startAngle + (pct * (Math.PI * 2));
        context.moveTo(cx + radius, cy);
        context.beginPath();
        context.strokeStyle = colour;
        context.lineWidth = 10;
        context.arc(cx, cy, radius, startAngle, endAngle, false);
        context.stroke();
        context.closePath();
        // rotating context to create vertical text
        context.rotate(+Math.PI / 2);
        context.font = '16px Helvetica, Calibri';
        context.textAlign = 'right';
        context.fillStyle = colour;
        context.fillText(values[i][1], cx - 2, -cy - radius + 5);
        // rotating context back to original orientation after creating vertical text
        context.rotate(-Math.PI / 2);
        radius += 20;
        context.restore();
    }
}
/***************** button functions *************/
function showArcs(ev) {
    document.getElementById("btnPie").className = "tab-item";
    document.getElementById("btnArc").className = "tab-item active";
    document.getElementById("pieCanvas").style.display = "none";
    document.getElementById("arcCanvas").style.display = "inline-flex";
}

function showPie(ev) {
    document.getElementById("btnArc").className = "tab-item";
    document.getElementById("btnPie").className = "tab-item active";
    document.getElementById("pieCanvas").style.display = "inline-flex";
    document.getElementById("arcCanvas").style.display = "none";
}
/************* page load events *****************/
function init(ev) {
    //initiate page
    getData();
    document.getElementById("pieCanvas").style.display = "inline-flex";
    document.getElementById("btnPie").addEventListener("click", showPie);
    document.getElementById("btnArc").addEventListener("click", showArcs);
}
/**************************** Initialising ********************************/
window.addEventListener('push', init);
document.addEventListener("DOMContentLoaded", init);