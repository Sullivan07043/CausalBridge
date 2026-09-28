# Big Five example

The Big Five personality test of the International Personality Item Pool (IPIP)
has 50 items, ten for each of five factors. `names.csv` gives the text of 40
items. `graph.csv` gives the scoring key as the graph: each factor (E, N, A, C,
O) causes its ten items, and the names of the factors are not given.
CausalBridge names the other ten items and the five factors.

The responses come from the Open-Source Psychometrics Project and are not part
of this repository. `get_data.sh` downloads them and writes `data.csv` with the
3000 respondents that `rows.txt` lists:

```sh
sh get_data.sh
causalbridge name data.csv --names names.csv --graph graph.csv --task joint --out result
```

Result with Qwen/Qwen3-4B-Instruct-2507 (about 90 seconds on an A100 after the
downloads):

| variable | true name | name from CausalBridge |
|---|---|---|
| E | extraversion | Social talk |
| N | neuroticism | mood instability |
| A | agreeableness | Empathetic concern |
| C | conscientiousness | Attention to detail |
| O | openness | Verbal ability |
| E1 | I am the life of the party. | I enjoy being the center of attention. |
| A5 | I am not interested in other people's problems. | I rarely think about others' needs. |
| A8 | I take time out for others. | I care about what others think. |
| C3 | I pay attention to details. | I keep my room neat and organized. |
| C4 | I make a mess of things. | I tend to lose things easily. |
| C7 | I like order. | I keep my room neat and organized. |
| O3 | I have a vivid imagination. | I can think of many different ways to solve a problem. |
| O4 | I am not interested in abstract ideas. | I can easily imagine things that are not real. |
| O8 | I use difficult words. | I can easily grasp complex ideas. |
| O10 | I am full of ideas. | I can think of many different ways to solve a problem. |

Names of some items can differ slightly on another GPU.
