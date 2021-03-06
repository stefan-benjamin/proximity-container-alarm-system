package com.iot.zulu.androidproximitymonitor;

import android.content.Context;
import android.graphics.Color;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ArrayAdapter;
import android.widget.TextView;

import java.util.ArrayList;

public class BleDevicesAdapter extends ArrayAdapter<BleDevice> {
    public BleDevicesAdapter(Context context, ArrayList<BleDevice> devices) {
        super(context, 0, devices);
    }

    @Override
    public View getView(int position, View convertView, ViewGroup parent) {
        BleDevice device = getItem(position);
        if (convertView == null) {
            convertView = LayoutInflater.from(getContext()).inflate(R.layout.item_ble_device, parent, false);
        }

        TextView bName = convertView.findViewById(R.id.bleDeviceName);
        TextView bMAC = convertView.findViewById(R.id.bleDeviceMAC);
        TextView bRSSI = convertView.findViewById(R.id.bleDeviceRSSI);

        bName.setText(device.name);
        bMAC.setText(device.MAC);
        bRSSI.setText(device.RSSI);

        //Set the color of elements
        if(device.name != null) {
            String[] split = device.name.split(";");
            if (split.length > 1 && !split[1].equals("1000")){
                convertView.setBackgroundColor(Color.RED);
            } else if(split.length > 1 && split[1].equals("1000")) {
                convertView.setBackgroundColor(Color.GREEN);
            }
        }
        return convertView;
    }
}
