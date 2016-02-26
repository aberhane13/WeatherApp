
$(document).ready(function(){

  //Change the cursor of "Click here to show/hide history" text
  document.getElementById("toggle").style.cursor = "pointer";

  //Underline the "Click here to show/hide history" text when hovering over with mouse
  $("#toggle").hover(function(){

    $(this).css("text-decoration", "underline");

}, function(){
    $(this).css("text-decoration", "none");
    });

  //Toggle the search history
  $("#toggle").click(function(){

    $("#history").slideToggle("slow");

  })

  //Render the browser history
  initialRender();
});

//Finding the latitude and longitude using the Google Geocoding api
var latitude;
var longitude;
var size = localStorage.length;
google.load('visualization', '1.0', {'packages':['corechart']});

function findAddress(keyId) {

  geocoder = new google.maps.Geocoder();
  var address;

  //If you search by typing in the text box and pressing enter, use the text from the text box
  if(typeof keyId == "undefined")
  {
    address = document.getElementById("address").value;
  }

  //Or else, you clicked on one of addresses in your search history to search for that address again
  else
  {
    address = $("#"+keyId).text();
  }

  //Set browser history
  setHistory(address);

  //Use Google Geocoder to convert address into latitude and longitude
  geocoder.geocode( {'address': address}, function(results, status) {
  if(status == google.maps.GeocoderStatus.OK) {

    

    //Store latitude and longitude in variables
    latitude = String(results[0].geometry.location.lat());
    longitude = String(results[0].geometry.location.lng());

    //Render your results
    google.setOnLoadCallback(drawVisuals);
    drawVisuals();


    } 
    else {
      //Google couldn't recognize your address
      alert("Geocode was not successful for the following reason: " + status);
    }


    });
  }

function drawVisuals()
{
  
  //Request URL to the Weather api using the latitude and longitude found by the Google Geocoding api
  var myUrl = "https://api.forecast.io/forecast/API Key/"+latitude+","+longitude;

  //Send request to weather api app using ajax
  $.ajax({
    url: myUrl,
    method: "GET",
    dataType: "jsonp",
    async: "false"
  }).done(function(data){

    
    //Get current date using Date object
    var currentSeconds = data.currently.time;
    var currentDate = new Date(currentSeconds * 1000);

    //Current weather information title
    $("#current_title").html("Current Weather Information ");

    //Today's weather information
    var todayInfo = "";

    //Current time
    todayInfo += "<b>Current Time: </b>" + String(currentDate) + "<br>";

    //Current condition
    todayInfo += "<b>Current Condition: </b>" + String(data.currently.icon) + "<br>";

    //Current temperature
    todayInfo += "<b>Apparent Temperature: </b> " + String(data.currently.apparentTemperature)+"<br>";

    //Today's cloud cover
    todayInfo += "<b>Cloud Cover: </b>" + String(data.currently.cloudCover * 100)+"% <br>";

    //Today's humidity
    todayInfo += "<b>Humidity: </b>" + String(data.currently.humidity * 100) + "%<br>";

    //Today's nearest storm distance
    todayInfo += "<b>Nearest Storm Distance: </b>" + String(data.currently.nearestStormDistance) + " miles <br>";

    //Today's summary
    todayInfo += "<b>Summary: </b>" + String(data.currently.summary) + "<br>";

    //Today's visibility
    todayInfo += "<b>Visibility: </b>" + String(data.currently.visibility) + " miles <br>";

    //Today's Windspeed
    todayInfo += "<b>Wind Speed: </b>" + String(data.currently.windSpeed) + " miles per hour <br>";

    //Timezone
    todayInfo += "<b>Timezone: </b>" + String(data.timezone) + "<br>";


    //Enter today's information into the HTML element with the id current_summary
    $("#current_summary").html(todayInfo);

    //Load the data table from Google Visualization api
    var dataTble = new google.visualization.DataTable();
  
    // Set chart options
    var options = {'title':'Temperature',
      'width':400,
      'height':300};


    //Store weather information for the next 7 days for the Google Visualization Data Table
    var maxTemps = [];
    var minTemps = [];
    var dates = [];

    for(i=0; i<data.daily.data.length; i++)
    {
    maxTemps.push(data.daily.data[i].apparentTemperatureMax);
    minTemps.push(data.daily.data[i].apparentTemperatureMin);
    var seconds = data.daily.data[i].time;
    var date = new Date(seconds * 1000);
    dates.push(date);

    }

    //Set columns for the chart
    dataTble.addColumn('date', 'Date');
    dataTble.addColumn('number', 'Max Temperature');
    dataTble.addColumn('number', 'Min Temperature')


    //Store weather information to the data table for the chart
    dataTble.addRows([

      [dates[0], maxTemps[0], minTemps[0]],
      [dates[1], maxTemps[1], minTemps[1]],
      [dates[2], maxTemps[2], minTemps[2]],
      [dates[3], maxTemps[3], minTemps[3]],
      [dates[4], maxTemps[4], minTemps[4]],
      [dates[5], maxTemps[5], minTemps[5]],
      [dates[6], maxTemps[6], minTemps[6]],
      [dates[7], maxTemps[7], minTemps[7]],
    ]);


    //Type 7 day forecast title to the header element with id weather_forecast
    $("#week_forcast").html("7 Day Forecast");


    //Type this week's weather summary to the element with id week_summary
    $("#week_summary").html("<b>Summary: </b>" + String(data.daily.summary));


    //Load chart
    var weeklyChart = new google.visualization.BarChart(document.getElementById('week_chart'));

    //Draw chart
    weeklyChart.draw(dataTble, options);


    //Type 12 Hour Forecast in tag with id day_forecast
    $("#day_forcast").html("12 Hour Forecast");

    //Type the summary of the 12 hour forecast in the tag with id day_summary
    $("#day_summary").html("<b>Summary: </b>"+String(data.hourly.summary));


    //Load second data table from Google Visualization api
    var dataTble2 = new google.visualization.DataTable();

    //Store weather information for the next 12 hours for the Google Visualization data table
    var temps = [];
    var times = [];
    var conditions = [];
    var time;
    var timeDisplay;

    for(i=0; i<12; i++)
    {
      temps.push(data.hourly.data[i].apparentTemperature);

      var seconds = data.hourly.data[i].time;
      var date = new Date(seconds * 1000);
      times.push(date);

      conditions.push(String(data.hourly.data[i].summary));

    }

    //Set columns for the second chart
    dataTble2.addColumn('datetime', 'Time');
    dataTble2.addColumn('number', 'Temperature');


    //Store weather information to the table for the second chart
    dataTble2.addRows([

      [times[0], temps[0]],
      [times[1], temps[1]],
      [times[2], temps[2]],
      [times[3], temps[3]],
      [times[4], temps[4]],
      [times[5], temps[5]],
      [times[6], temps[6]],
      [times[7], temps[7]],
      [times[8], temps[8]],
      [times[9], temps[9]],
      [times[10], temps[10]],
      [times[11], temps[11]],

    ]);

    //Load second chart
    var dailyChart = new google.visualization.BarChart(document.getElementById('day_chart'));

    //Draw second chart
    dailyChart.draw(dataTble2, options);

  });

}


//Funtion to render previous browser history
function initialRender()
{

  //If local storage isn't empty, display the history
  if(localStorage.length > 0)
  {
    for(i=0; i<localStorage.length; i++)
    {
      var myKey = "entry"+i;
      $("a").append("<div " + "id=" + myKey + ">"+localStorage.getItem(myKey)+"</div>");

      //Change the cursor of "Click here to show/hide history" text
      document.getElementById(myKey).style.cursor = "pointer";


      //Underline text of search element when hovering mouse over it
      $("#"+myKey).hover(function(){
    

        $(this).css("text-decoration", "underline");

        }, function(){
        $(this).css("text-decoration", "none");
      });

      //If one of the search elements is clicked on, search it's address and render the results
       $("#"+myKey).click(function(){
      findAddress($(this).attr('id'));
      });
    }
    //Change the cursor of when hovering over the text of each search element
    document.getElementById(myKey).style.cursor = "pointer";

  
  }
}


//Set search history function
function setHistory(myHistory)
{
  //Create key for localStorage
  var myKey = "entry"+String(size);
  
    
  //Use window.localStorage property to store history from browser searches
  localStorage.setItem(myKey, myHistory);
  var historyString = localStorage.getItem(myKey);
  

  //Render the new entry onto the search history
  $("a").append("<div " + "id=" + myKey + ">"+localStorage.getItem(myKey)+"</div>")

  //Change the cursor of when hovering over the text of each search element
  document.getElementById(myKey).style.cursor = "pointer";

  //Underline text of search element when hovering mouse over it
  $("#"+myKey).hover(function(){

  $(this).css("text-decoration", "underline");

  } , function(){
        $(this).css("text-decoration", "none");
  });

  //If one of the search elements is clicked on, search it's address and render the results
  $("#"+myKey).click(function(){
    findAddress(myKey);
  });

  //Increase the counter for total size of localStorage
  size++;

}
