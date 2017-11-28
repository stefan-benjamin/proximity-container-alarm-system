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
import android.support.v4.app.ActivityCompat;
import android.support.v4.content.ContextCompat;
import android.support.v7.app.AppCompatActivity;
import android.text.InputType;
import android.util.Log;
import android.view.Menu;
import android.view.MenuInflater;
import android.view.MenuItem;
import android.view.View;
import android.widget.AdapterView;
import android.widget.Button;
import android.widget.EditText;
import android.widget.ListView;
import android.widget.ProgressBar;
import android.widget.Toast;

import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.List;

public class MainActivity extends AppCompatActivity {
    private static int REQUEST_ENABLE_BT = 1;

    private boolean buttonFlag = true;
    private boolean deviceFoundFlag = false;

    private String RSSI, DeviceName, MAC;
    private ArrayList<BleDevice> bleDevices;

    private BluetoothAdapter mBluetoothAdapter;
    private BluetoothLeScanner mLEScanner;
    private ScanSettings settings;
    private List<ScanFilter> filters;
    private BleDevicesAdapter adapter;
    private String serverAddress = "http://192.168.43.250:8080";
    private String technicianId = "1";

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
        bleDevices.add(new BleDevice("Test dummy devices", "Scan for actual results", ""));
        bleDevices.add(new BleDevice("test1;1000", "00:11:22:33:44:55", "-69"));
        bleDevices.add(new BleDevice("test2;2001", "00:11:22:33:44:66", "-69"));
        adapter = new BleDevicesAdapter(this, bleDevices);

        listView.setAdapter(adapter);
        listView.setOnItemClickListener(new AdapterView.OnItemClickListener() {
            @Override
            public void onItemClick(AdapterView<?> parent, View view, int position, long id) {
                if (!buttonFlag) {
                    buttonFlag = false;
                    toggleBLEScanning();
                }
                String[] splitName = bleDevices.get(position).name.split(";");
                if (splitName.length > 1) {
                    restClient = new RESTClient(MainActivity.this, splitName[0], splitName[1], serverAddress, technicianId);
                    restClient.execute();
                } else {
                    Toast.makeText(getApplicationContext(), "Not a valid sensor", Toast.LENGTH_SHORT).show();
                }
            }
        });

        final BluetoothManager bluetoothManager =
                (BluetoothManager) getSystemService(Context.BLUETOOTH_SERVICE);
        mBluetoothAdapter = bluetoothManager.getAdapter();

        button.setOnClickListener(new View.OnClickListener() {
            public void onClick(View v) {
                toggleBLEScanning();
            }
        });
    }

    public void toggleBLEScanning() {
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
        }
    }

    @Override
    protected void onPause() {
        super.onPause();
        if (mBluetoothAdapter != null && mBluetoothAdapter.isEnabled()) {
            if (!buttonFlag) {
                buttonFlag = false;
                toggleBLEScanning();
            }
        }
    }

    private void scanLeDevice(final boolean enable) {
        if (enable) {
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
            if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.LOLLIPOP) {
                BluetoothDevice btDevice = result.getDevice();
                RSSI = String.valueOf(result.getRssi());
                DeviceName = btDevice.getName();
                MAC = btDevice.getAddress();

                //Check if the name is not empty
                if (DeviceName != null) {
                    BleDevice btDeviceAdd = new BleDevice(DeviceName, MAC, RSSI);
                    deviceFoundFlag = false;
                    int index = 0;
                    //Add only new devices(new MAC) and update the rest
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
            }
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
                            //Log.i("onLeScan", device.toString());
                        }
                    });
                }
            };

    @Override
    public boolean onCreateOptionsMenu(Menu menu) {
        MenuInflater inflater = getMenuInflater();
        inflater.inflate(R.menu.menu, menu);
        return true;
    }

    @Override
    public boolean onOptionsItemSelected(MenuItem item) {
        // Handle menu items selection
        switch (item.getItemId()) {
            case R.id.server_address:
                AlertDialog.Builder builder = new AlertDialog.Builder(this, android.R.style.Theme_DeviceDefault_Light_Dialog);
                builder.setTitle("Change server address");

                final EditText input = new EditText(this);
                input.setInputType(InputType.TYPE_CLASS_TEXT);
                builder.setView(input);
                input.setText(serverAddress);

                builder.setPositiveButton("OK", new DialogInterface.OnClickListener() {
                    @Override
                    public void onClick(DialogInterface dialog, int which) {
                        serverAddress = input.getText().toString();
                    }
                });
                builder.setNegativeButton("Cancel", new DialogInterface.OnClickListener() {
                    @Override
                    public void onClick(DialogInterface dialog, int which) {
                        dialog.cancel();
                    }
                });

                builder.show();
                return true;

            case R.id.technician_Id:
                AlertDialog.Builder builder2 = new AlertDialog.Builder(this, android.R.style.Theme_DeviceDefault_Light_Dialog);
                builder2.setTitle("Change technician ID");

                final EditText input2 = new EditText(this);
                input2.setInputType(InputType.TYPE_CLASS_TEXT);
                builder2.setView(input2);
                input2.setText(technicianId);

                builder2.setPositiveButton("OK", new DialogInterface.OnClickListener() {
                    @Override
                    public void onClick(DialogInterface dialog, int which) {
                        technicianId = input2.getText().toString();
                    }
                });
                builder2.setNegativeButton("Cancel", new DialogInterface.OnClickListener() {
                    @Override
                    public void onClick(DialogInterface dialog, int which) {
                        dialog.cancel();
                    }
                });

                builder2.show();
                return true;
            default:
                return super.onOptionsItemSelected(item);
        }
    }
}
