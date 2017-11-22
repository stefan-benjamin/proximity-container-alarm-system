var globals = require('./globals');
var RestClient = require('node-rest-client').Client;
var restClient = new RestClient();

exports.reportStatus = function (ipAddress, portNumber, sensorData, statusCode, callback, errorCallback) {

   console.log("REST_CLIENT: Reporting " + statusCode + " status code to: " + ipAddress + " on port " + portNumber);

   var args = {
      data: { sensorId: globals.sensorId, sensorData: sensorData, statusCode: statusCode },
      headers: { "Content-Type": "application/json" }
   };

   var req = restClient.put("http://" + ipAddress + ":" + portNumber + "/api/sensorStatus", args, function (data, response) {
      // parsed response body as js object. Maybe we need to add the body-parser?
      console.log("REST_CLIENT: Callback received from " + ipAddress + " on port " + portNumber);

      //to access the data: data.serverId
      callback({ requestedIpAddress: ipAddress, requestedPort: portNumber });
   }
   );

   req.on('error', function (err) {
      console.log("REST_CLIENT: Error while reporting status " + ipAddress + " on port " + portNumber + ". " + err);

      errorCallback({ error: err, requestedIpAddress: ipAddress, requestedPort: portNumber });
   });
};