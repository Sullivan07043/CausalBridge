# Vehicle example

`drive.csv` holds one drive from the comma2k19 dataset (comma.ai, MIT license):
1199 time steps of 12 channels, resampled to 10 Hz. `names.csv` names eight
channels. CausalBridge names the other four.

With the graph discovered from the data:

```sh
causalbridge name drive.csv --names names.csv --data timeseries --out result
```

With the given graph `graph.csv` (standard vehicle dynamics):

```sh
causalbridge name drive.csv --names names.csv --graph graph.csv --data timeseries --out result
```

Results with Qwen/Qwen3-4B-Instruct-2507:

| channel | true name | given graph | discovered graph |
|---|---|---|---|
| wheel_fl | front left wheel speed | front left wheel speed | front left wheel speed |
| acc_x | longitudinal acceleration | steering wheel angle | longitudinal acceleration |
| acc_y | lateral acceleration | lateral acceleration | lateral acceleration |
| gyro_z | yaw rate | yaw rate | yaw rate |
