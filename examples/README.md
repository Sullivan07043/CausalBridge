# Examples

| folder | data | task | profile |
|---|---|---|---|
| [vehicle](vehicle/) | one drive of a car, 12 channels of the vehicle bus and the inertial sensor, 2 unnamed (time series) | observed | `sensor` |
| [bigfive](bigfive/) | 3000 responses to the Big Five personality test, 50 items (10 unnamed) and 5 unnamed factors (i.i.d.) | joint | `survey` |

Each folder has a names file that names some of the columns and leaves the
others for CausalBridge, and a graph file with the known causal graph. The
first run of each example downloads its profile. The project page shows both
examples: https://sullivan07043.github.io/CausalBridge/examples.html
