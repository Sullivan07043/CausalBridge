# Questionnaire example

The Rosenberg Self-Esteem Scale has ten items. `names.csv` gives the text of
eight items. CausalBridge names the other two items (Q5 and Q6) and the latent
variables that it finds behind the items.

The responses come from the Open-Source Psychometrics Project and are not part
of this repository. `get_data.sh` downloads them and writes `data.csv`:

```sh
sh get_data.sh
causalbridge name data.csv --names names.csv --task joint --out result
```

Result of one run with Qwen/Qwen3-4B-Instruct-2507 (about 35 seconds on an
A100 after the downloads):

| variable | true text | name from CausalBridge |
|---|---|---|
| Q5 | I feel I do not have much to be proud of. | I feel that I am not good enough compared to others. |
| Q6 | I take a positive attitude toward myself. | I feel that I am a person of worth, at least on an equal plane with others. |
| L1 (behind Q3, Q5) | | Feelings of worthlessness |
| L2 (behind Q6, Q7) | | self-acceptance |
| L3 (behind Q9, Q10) | | Feelings of worthlessness |
| L4 (behind Q1, Q4) | | Self-evaluation |

The discovery search on questionnaires is not fully deterministic, so another
run can find a slightly different graph and give other latent names.
