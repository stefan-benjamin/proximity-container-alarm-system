INSERT INTO ALARM (Name, Description, Resolution, StatusCode) VALUES ('Lower threshold','Lower temperature threshold exceeded. Container temperature too low.','Reduce the cooling flow by using the valve on the right side of the container.','2001');
INSERT INTO ALARM (Name, Description, Resolution, StatusCode) VALUES ('Upper threshold','Upper temperature threshold exceeded. Container temperature too high.','Increase the cooling flow by using the valve on the right side of the container.','2002');
INSERT INTO ALARM (Name, Description, Resolution, StatusCode) VALUES ('Sensor Error','Sensor has returned error status','Check that the sensor is mounted correctly. Additional wiring checks should be performed.','3001');

INSERT INTO DEVICES (Name, Location, SensorType, MeasureUnit) VALUES ('TempSensor', 'Container2', 'Temperature', 'C');

INSERT INTO USERS (Name, Function) VALUES ('Tomas', 'SuperAdmin');