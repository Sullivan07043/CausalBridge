# Examples

| folder | data | task | profile |
|---|---|---|---|
| [vehicle](vehicle/) | one drive of a car, 12 channels of the vehicle bus and the inertial sensor, 4 unnamed (time series) | observed | `sensor` |
| [survey](survey/) | 5000 responses to the Rosenberg Self-Esteem Scale, 10 items (i.i.d.) | joint | `survey` |

Each folder has a names file that names some of the columns and leaves the
others for CausalBridge. The first run of each example downloads its profile.
