package com.iot.zulu.androidproximitymonitor;

import android.Manifest;
import android.app.AlertDialog;
import android.bluetooth.BluetoothAdapter;
import android.bluetooth.BluetoothDevice;
import android.bluetooth.BluetoothManager;
import android.bluetooth.le.BluetoothLeScanner;
import android.bluetooth.le.ScanCallback;
import android.bluetooth.le.ScanFilter;
import android.bluetooth.le.ScanResult;
import android.bluetooth.le.ScanSettings;
import android.content.Context;
import android.content.DialogInterface;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.os.Build;
import android.os.Bundle;
import android.os.Handler;
import android.support.v4.app.ActivityCompat;
import android.support.v4.content.ContextCompat;
import android.support.v7.app.AppCompatActivity;
import android.util.Log;
import android.view.View;
import android.widget.AdapterView;
import android.widget.Button;
import android.widget.ListView;
import android.widget.ProgressBar;
import android.widget.Toast;

import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.List;

public class MainActivity extends AppCompatActivity {
    private static int REQUEST_ENABLE_BT = 1;
    private static final long SCAN_PERIOD = 10000;

    private boolean buttonFlag = true;
    private boolean deviceFoundFlag = false;

    private String RSSI, DeviceName, MAC;
    private ArrayList<BleDevice> bleDevices;

    private BluetoothAdapter mBluetoothAdapter;
    private BluetoothLeScanner mLEScanner;
    private ScanSettings settings;
    private List<ScanFilter> filters;
    private BleDevicesAdapter adapter;
    private Handler mHandler;

    private ListView listView;
    private Button button;
    private ProgressBar progressBar;
    private RESTClient restClient;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        //Check for permissions
        if (ContextCompat.checkSelfPermission(this,
                Manifest.permission.ACCESS_FINE_LOCATION)
                != PackageManager.PERMISSION_GRANTED) {

            if (ActivityCompat.shouldShowRequestPermissionRationale(this,
                    Manifest.permission.ACCESS_FINE_LOCATION)) {
            } else {
                ActivityCompat.requestPermissions(this,
                        new String[]{Manifest.permission.ACCESS_FINE_LOCATION}, 1);
            }
        }
        //Make sure device supports BLE
        if (!getPackageManager().hasSystemFeature(PackageManager.FEATURE_BLUETOOTH_LE)) {
            Toast.makeText(getApplicationContext(), "BLE Not Supported", Toast.LENGTH_SHORT).show();
            //finish();
        }

        progressBar = findViewById(R.id.progressBar);
        button = findViewById(R.id.buttonScan);
        listView = findViewById(R.id.listViewBleDevices);

        bleDevices = new ArrayList<>();
        bleDevices.add(new BleDevice("test Name", "00:11:22:33:44:55", "-69"));
        adapter = new BleDevicesAdapter(this, bleDevices);

        listView.setAdapter(adapter);
        listView.setOnItemClickListener(new AdapterView.OnItemClickListener() {
            @Override
            public void onItemClick(AdapterView<?> parent, View view, int position, long id) {
                //Toast.makeText(getApplicationContext(), "MAC: " + bleDevices.get(position).MAC, Toast.LENGTH_SHORT).show();
                //restClient = new RESTClient(getApplicationContext(),0);
                //restClient.execute();
                final int l = position;
                AlertDialog.Builder builder;
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
                    builder = new AlertDialog.Builder(MainActivity.this, android.R.style.Theme_DeviceDefault_Light_Dialog);
                } else {
                    builder = new AlertDialog.Builder(MainActivity.this);
                }
                builder.setTitle("Possible leakage")
                        .setMessage("Open the container and check the boxes for the leakage")
                        .setPositiveButton("Resolve problem", new DialogInterface.OnClickListener() {
                            public void onClick(DialogInterface dialog, int which) {
                                Toast.makeText(getApplicationContext(), "MAC: " + bleDevices.get(l).MAC, Toast.LENGTH_SHORT).show();
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
        });

        final BluetoothManager bluetoothManager =
                (BluetoothManager) getSystemService(Context.BLUETOOTH_SERVICE);
        mBluetoothAdapter = bluetoothManager.getAdapter();
        mHandler = new Handler();

        button.setOnClickListener(new View.OnClickListener() {
            public void onClick(View v) {
                if (buttonFlag) {
                    bleDevices.clear();
                    button.setText("Stop scan");
                    progressBar.setVisibility(View.VISIBLE);
                    scanLeDevice(true);
                } else {
                    button.setText("Scan");
                    progressBar.setVisibility(View.INVISIBLE);
                    scanLeDevice(false);
                }
                buttonFlag = !buttonFlag;
            }
        });
    }

    @Override
    protected void onResume() {
        super.onResume();
        if (mBluetoothAdapter == null || !mBluetoothAdapter.isEnabled()) {
            Intent enableBtIntent = new Intent(BluetoothAdapter.ACTION_REQUEST_ENABLE);
            startActivityForResult(enableBtIntent, REQUEST_ENABLE_BT);
        } else {
            if (Build.VERSION.SDK_INT >= 21) {
                mLEScanner = mBluetoothAdapter.getBluetoothLeScanner();
                settings = new ScanSettings.Builder()
                        .setScanMode(ScanSettings.SCAN_MODE_LOW_LATENCY)
                        .build();
                filters = new ArrayList<ScanFilter>();
            }
            //scanLeDevice(true);
        }
    }

    @Override
    protected void onPause() {
        super.onPause();
        if (mBluetoothAdapter != null && mBluetoothAdapter.isEnabled()) {
            scanLeDevice(false);
        }
    }

    private void scanLeDevice(final boolean enable) {
        if (enable) {
            //Stop scanning after some time
//            mHandler.postDelayed(new Runnable() {
//                @Override
//                public void run() {
//                    if (Build.VERSION.SDK_INT < 21) {
//                        mBluetoothAdapter.stopLeScan(mLeScanCallback);
//                    } else {
//                        mLEScanner.stopScan(mScanCallback);
//                    }
//                }
//            }, SCAN_PERIOD);
            if (Build.VERSION.SDK_INT < 21) {
                mBluetoothAdapter.startLeScan(mLeScanCallback);
            } else {
                mLEScanner.startScan(filters, settings, mScanCallback);
            }
        } else {
            if (Build.VERSION.SDK_INT < 21) {
                mBluetoothAdapter.stopLeScan(mLeScanCallback);
            } else {
                mLEScanner.stopScan(mScanCallback);
            }
        }
    }

    private ScanCallback mScanCallback = new ScanCallback() {
        @Override
        public void onScanResult(int callbackType, ScanResult result) {
            //Log.i("callbackType", String.valueOf(callbackType));
            Log.i("result", result.toString());
            if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.LOLLIPOP) {
                BluetoothDevice btDevice = result.getDevice();
                RSSI = String.valueOf(result.getRssi());
                DeviceName = btDevice.getName();
                MAC = btDevice.getAddress();

                BleDevice btDeviceAdd = new BleDevice(DeviceName, MAC, RSSI);

                deviceFoundFlag = false;
                int index = 0;
                for (BleDevice curVal : bleDevices) {
                    if (curVal.MAC.contains(MAC)) {
                        deviceFoundFlag = true;
                        index = bleDevices.indexOf(curVal);
                        break;
                    }
                }
                if (!deviceFoundFlag) {
                    bleDevices.add(btDeviceAdd);

                } else {
                    bleDevices.set(index, btDeviceAdd);
                }
                Collections.sort(bleDevices, new Comparator<BleDevice>() {
                    @Override
                    public int compare(BleDevice o1, BleDevice o2) {
                        return o1.compareTo(o2);
                    }
                });
                adapter = new BleDevicesAdapter(getApplicationContext(), bleDevices);
                listView.setAdapter(adapter);
                adapter.notifyDataSetChanged();
            }
            //connectToDevice(btDevice);
        }

        @Override
        public void onBatchScanResults(List<ScanResult> results) {
            for (ScanResult sr : results) {
                Log.i("ScanResult - Results", sr.toString());
            }
        }

        @Override
        public void onScanFailed(int errorCode) {
            Log.e("Scan Failed", "Error Code: " + errorCode);
        }
    };

    private BluetoothAdapter.LeScanCallback mLeScanCallback =
            new BluetoothAdapter.LeScanCallback() {
                @Override
                public void onLeScan(final BluetoothDevice device, int rssi,
                                     byte[] scanRecord) {
                    runOnUiThread(new Runnable() {
                        @Override
                        public void run() {
                            Log.i("onLeScan", device.toString());
                            //connectToDevice(device);
                        }
                    });
                }
            };
}
