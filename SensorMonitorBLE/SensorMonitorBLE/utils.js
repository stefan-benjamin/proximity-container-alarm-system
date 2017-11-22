exports.sensorDataObjectsEquals = function (object1, object2) {
   if ((!object1) && (!object2)) {
      return true; //they are equal, this should also handle null reference
   }

   if (object1 && object2) {
      if (object1.temperature === object2.temperature && object1.humidity === object2.humidity) {
         return true;
      }
   }
   return false;
};