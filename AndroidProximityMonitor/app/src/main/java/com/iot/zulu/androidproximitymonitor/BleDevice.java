package com.iot.zulu.androidproximitymonitor;

public class BleDevice implements Comparable<BleDevice> {
    public String name;
    public String MAC;
    public String RSSI;

    public BleDevice(String name, String MAC, String RSSI) {
        this.name = name;
        this.MAC = MAC;
        this.RSSI = RSSI;
    }
    public int getRSSI() {
        return Integer.valueOf(RSSI);
    }

    public int compareTo(BleDevice compareBleDevice) {
        int compareRSSI = ((BleDevice) compareBleDevice).getRSSI();

        //ascending order
        return compareRSSI - Integer.valueOf(this.RSSI);

    }
}
