package com.iot.zulu.androidproximitymonitor;

import android.content.Context;
import android.os.AsyncTask;
import android.util.JsonReader;
import android.util.Log;
import android.widget.Toast;

import java.io.DataOutputStream;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.net.URL;

import javax.net.ssl.HttpsURLConnection;

public class RESTClient extends AsyncTask<String, Void, String> {
    private Context context;
    private String value;
    private URL containerAPIEndpoint;
    private int mode;


    public RESTClient(Context context, int mode){
        this.context = context;
        this.mode = mode;
    }

    @Override
    protected String doInBackground(String... params) {
        if (mode == 0) {
            getMethod();
        }
        else{
            postMethod();
        }
        return null;
    }

    private void getMethod() {
        try {
            containerAPIEndpoint = new URL("https://jsonplaceholder.typicode.com/posts/1");
            HttpsURLConnection myConnection = (HttpsURLConnection) containerAPIEndpoint.openConnection();
            myConnection.setRequestProperty("User-Agent", "AndroidProximityMonitor-v0.1");
            myConnection.setRequestProperty("Content-Type", "application/JSON");

            if (myConnection.getResponseCode() == 200) {
                InputStream responseBody = myConnection.getInputStream();
                InputStreamReader responseBodyReader = new InputStreamReader(responseBody, "UTF-8");
                JsonReader jsonReader = new JsonReader(responseBodyReader);

                jsonReader.beginObject();
                while (jsonReader.hasNext()) {
                    String key = jsonReader.nextName();
                    if (key.equals("title")) {
                        value = jsonReader.nextString();
                        //Log.d("Value", value);
                        break;
                    } else {
                        jsonReader.skipValue();
                    }
                }
                jsonReader.close();
            } else {
                Log.e("Connection Error",myConnection.getResponseCode() + "");
            }

            //Close the connection
            myConnection.disconnect();
        } catch (Exception e) {
            Log.d("GET ERROR", e.toString());
        }
    }

    private void postMethod() {
        try {
            //Making a POST call to test server
            containerAPIEndpoint = new URL("https://reqres.in/api/users");
            HttpsURLConnection myConnection = (HttpsURLConnection) containerAPIEndpoint.openConnection();
            myConnection.setRequestMethod("POST");
            myConnection.setDoOutput(true);

            DataOutputStream wr = new DataOutputStream(myConnection.getOutputStream ());
            wr.writeBytes("name=morpheus" +  "&job=leader");

            if (myConnection.getResponseCode() == 201) {
                InputStream responseBody = myConnection.getInputStream();
                InputStreamReader responseBodyReader = new InputStreamReader(responseBody, "UTF-8");
                JsonReader jsonReader = new JsonReader(responseBodyReader);

                jsonReader.beginObject();
                while (jsonReader.hasNext()) {
                    String key = jsonReader.nextName();
                    if (key.equals("id")) {
                        value = jsonReader.nextString();
                        //Log.d("Value", value);
                        break;
                    } else {
                        jsonReader.skipValue();
                    }
                }
                jsonReader.close();

            } else {
                Log.e("Connection Error",myConnection.getResponseCode() + "");
            }
            myConnection.disconnect();
        }catch (Exception e) {
            Log.e("POST Error", e.toString());
        }
    }

    @Override
    public void onPostExecute(String result) {
        Toast.makeText(context, value, Toast.LENGTH_SHORT).show();
    }
}
