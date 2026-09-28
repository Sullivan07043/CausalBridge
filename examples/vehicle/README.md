# Vehicle example

`drive.csv` holds one drive from the comma2k19 dataset (comma.ai, MIT license):
2400 time steps of 12 channels, resampled to 10 Hz. `names.csv` names six
channels. CausalBridge names the other six.

```sh
causalbridge name drive.csv --names names.csv --data timeseries --out result
```

Result of one run with Qwen/Qwen3-4B-Instruct-2507 (about 25 seconds on an
A100 after the downloads):

| channel | true name | name from CausalBridge |
|---|---|---|
| can_speed | vehicle speed | rear left wheel speed |
| wheel_fl | front left wheel speed | rear left wheel speed |
| wheel_rl | rear left wheel speed | rear right wheel speed |
| wheel_rr | rear right wheel speed | rear right wheel speed |
| acc_x | longitudinal acceleration | longitudinal acceleration |
| acc_y | lateral acceleration | longitudinal acceleration |
