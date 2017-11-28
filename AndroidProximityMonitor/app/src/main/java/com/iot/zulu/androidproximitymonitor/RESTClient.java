package com.iot.zulu.androidproximitymonitor;

import android.app.AlertDialog;
import android.app.ProgressDialog;
import android.content.DialogInterface;
import android.os.AsyncTask;
import android.os.Build;
import android.os.Handler;
import android.util.JsonReader;
import android.util.Log;
import android.widget.Toast;

import java.io.DataOutputStream;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;

public class RESTClient extends AsyncTask<String, Void, String> {
    private String serverAddress;
    private String technicianId;
    private String alarmResolution;
    private String alarmDescription;
    private String sensorId;
    private String statusCode;
    private URL containerAPIEndpoint;
    private MainActivity mainActivity;
    private ProgressDialog progressDialog;


    public RESTClient(MainActivity mainActivity, String sensorId, String statusCode, String serverAddress, String technicianId) {
        this.mainActivity = mainActivity;
        this.sensorId = sensorId;
        this.statusCode = statusCode;
        this.serverAddress = serverAddress;
        this.technicianId = technicianId;
        this.progressDialog = new ProgressDialog(mainActivity);
    }

    @Override
    protected void onPreExecute() {
        super.onPreExecute();
        progressDialog.setMessage("Connecting to server");
        progressDialog.setIndeterminate(false);
        progressDialog.setProgressStyle(ProgressDialog.STYLE_SPINNER);
        progressDialog.setCancelable(false);
        progressDialog.show();
    }

    @Override
    protected String doInBackground(String... params) {
        getAlarmInfo();
        return null;
    }

    private void getAlarmInfo() {
        try {
            containerAPIEndpoint = new URL(serverAddress + "/api/alarmInfo");
            HttpURLConnection myConnection = (HttpURLConnection) containerAPIEndpoint.openConnection();
            myConnection.setConnectTimeout(3000);
            myConnection.setReadTimeout(3000);
            myConnection.setRequestProperty("statusCode", statusCode);

            if (myConnection.getResponseCode() == 200) {
                InputStream responseBody = myConnection.getInputStream();
                InputStreamReader responseBodyReader = new InputStreamReader(responseBody, "UTF-8");
                JsonReader jsonReader = new JsonReader(responseBodyReader);

                jsonReader.beginObject();
                while (jsonReader.hasNext()) {
                    String key = jsonReader.nextName();
                    if (key.equals("alarmResolution")) {
                        alarmResolution = jsonReader.nextString();
                    } else if (key.equals("alarmDescription")) {
                        alarmDescription = jsonReader.nextString();
                        break;
                    } else {
                        jsonReader.skipValue();
                    }
                }
                jsonReader.close();
            } else {
                Log.e("Connection Error", myConnection.getResponseCode() + "");
            }
            myConnection.disconnect();
        } catch (Exception e) {
            Log.e("ERROR getAlarmInfo", e.toString());
            progressDialog.dismiss();
            final Exception ex = e;
            Handler handler =  new Handler(mainActivity.getMainLooper());
            handler.post( new Runnable(){
                public void run(){
                    Toast.makeText(mainActivity, ex.getMessage(),Toast.LENGTH_LONG).show();
                }
            });
        }
    }

    private void resolveAlarm() {
        try {
            containerAPIEndpoint = new URL(serverAddress + "/api/alarmResolution");
            HttpURLConnection myConnection = (HttpURLConnection) containerAPIEndpoint.openConnection();
            myConnection.setRequestMethod("PUT");
            myConnection.setDoOutput(true);
            myConnection.setConnectTimeout(3000);
            myConnection.setReadTimeout(3000);

            DataOutputStream wr = new DataOutputStream(myConnection.getOutputStream());
            wr.writeBytes("sensorId=" + sensorId + "&technicianId=" + technicianId);

            if (myConnection.getResponseCode() == 200) {
                //do nothing
            } else {
                Log.e("Connection Error", myConnection.getResponseCode() + "");
            }
            myConnection.disconnect();
        } catch (Exception e) {
            Log.e("ERROR resolveAlarm", e.toString());
            progressDialog.dismiss();
            final Exception ex = e;
            Handler handler =  new Handler(mainActivity.getMainLooper());
            handler.post( new Runnable(){
                public void run(){
                    Toast.makeText(mainActivity, ex.getMessage(),Toast.LENGTH_LONG).show();
                }
            });
        }
    }

    @Override
    public void onPostExecute(String result) {
        progressDialog.dismiss();
        if (statusCode.equals("1000") && alarmDescription!=null) {
            buildOKDialog();
        } else if(alarmDescription!=null) {
            buildErrorDialog();
        }
    }

    public void buildOKDialog() {
        AlertDialog.Builder builder;
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
            builder = new AlertDialog.Builder(mainActivity, android.R.style.Theme_DeviceDefault_Light_Dialog);
        } else {
            builder = new AlertDialog.Builder(mainActivity);
        }
        builder.setTitle(alarmDescription)
                .setMessage(alarmResolution)
                .setPositiveButton("OK", new DialogInterface.OnClickListener() {
                            public void onClick(DialogInterface dialog, int which) {
                                //do nothing
                            }
                        }
                )
                .setIcon(android.R.drawable.ic_dialog_info)
                .show();
    }

    public void buildErrorDialog() {
        AlertDialog.Builder builder;
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
            builder = new AlertDialog.Builder(mainActivity, android.R.style.Theme_DeviceDefault_Light_Dialog);
        } else {
            builder = new AlertDialog.Builder(mainActivity);
        }
        builder.setTitle(alarmDescription)
                .setMessage(alarmResolution)
                .setPositiveButton("Resolve problem", new DialogInterface.OnClickListener() {
                    public void onClick(DialogInterface dialog, int which) {
                        Thread thread = new Thread() {
                            @Override
                            public void run() {
                                if (!statusCode.equals("1000")) {
                                    resolveAlarm();
                                }
                            }
                        };
                        thread.start();
                        //Toast.makeText(mainActivity, "Resolved", Toast.LENGTH_SHORT).show();
                    }
                })
                .setNegativeButton("Cancel", new DialogInterface.OnClickListener() {
                    public void onClick(DialogInterface dialog, int which) {
                        // do nothing
                    }
                })
                .setIcon(android.R.drawable.ic_dialog_alert)
                .show();
    }
}
