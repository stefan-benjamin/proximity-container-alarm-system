$(document).ready(function () {

   //setTimeout(function () {
   //   window.location.reload(1);
   //}, 3000);

   var host = window.document.location.host.replace(/:.*/, '');
   var ws = new WebSocket('ws://' + host + ':8081');
   ws.onmessage = function (event) {
      //alert("Message received.");
      //console.log(event);

      var data = JSON.parse(event.data);

      var prefix;
      if (data.type === 'sensor')
      {
         prefix = 's';
      }
      else
      {
         prefix = 'a';
      }

      //get element
      var element = document.getElementById(prefix + data.sensorId);

      if (element) {
         delete data.sensorId;
         delete data.type;

         //set element text

         element.innerText = JSON.stringify(data.data);
         console.log("Updated");
      }
      else
      {
         //create a new element and add it to the list.
         var list, entry;
         entry = document.createElement('li');
         if (data.type === 'sensor')
         {
            list = document.getElementById('sensors-list');
            entry.innerHTML = "Sensor: " + data.sensorId + " <a id=" + prefix + data.sensorId + ">" + JSON.stringify(data.data) + "</a>";
         }
         else
         {
            list = document.getElementById('alarms-list');
            entry.innerHTML = "Alarm: " + data.sensorId + " <a id=" + prefix + data.sensorId + ">" + JSON.stringify(data.data) + "</a>";
         }
         
         list.appendChild(entry);
      }
   };
});

