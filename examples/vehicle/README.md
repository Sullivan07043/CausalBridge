# Vehicle example

`drive.csv` holds one drive from the comma2k19 dataset (comma.ai, MIT license):
2400 time steps of 12 channels, resampled to 10 Hz. `names.csv` names ten
channels. `graph.csv` gives the causal graph of standard vehicle dynamics.
CausalBridge names the other two channels.

```sh
causalbridge name drive.csv --names names.csv --graph graph.csv --data timeseries --out result
```

Result with Qwen/Qwen3-4B-Instruct-2507:

| channel | true name | name from CausalBridge |
|---|---|---|
| wheel_fl | front left wheel speed | front left wheel speed |
| acc_x | longitudinal acceleration | longitudinal acceleration |

Without `--graph`, CausalBridge discovers the graph from the data.
