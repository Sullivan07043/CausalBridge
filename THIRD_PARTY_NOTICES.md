# Third-party notices

CausalBridge includes or builds on the components below. Each keeps its own
license. The full license texts ship in the `licenses/` folder of each release.

## Included in the release

| component | use in CausalBridge | license |
|---|---|---|
| causal-learn | structure discovery (vendored source) | MIT |
| causal-get | the C implementation of BOSS (compiled extension) | MIT |

## Model files derived from third-party models

| upstream model | derived CausalBridge files | license of the upstream model |
|---|---|---|
| intfloat/e5-large-v2 | encoder low-rank updates and concept banks of the example profiles | MIT |
| Qwen/Qwen3-4B-Instruct-2507, Qwen/Qwen3-8B | prefix adapters and their low-rank updates, trained for use with these models | Apache License 2.0 |

The upstream models themselves are not redistributed. The sentence encoder
downloads from the Hugging Face hub on first use, and users download any
backbone of their choice themselves.

## Data behind the example profiles

| source | use in CausalBridge | license |
|---|---|---|
| WordNet 3.0, Princeton University | terms of the survey concept bank | WordNet 3.0 license (`licenses/wordnet.txt`) |
| ConceptNet Numberbatch, Luminoso Technologies, Inc. | phrases of the survey concept bank (the terms only; no Numberbatch vectors) | CC BY-SA 4.0 (https://creativecommons.org/licenses/by-sa/4.0/) |

WordNet 3.0 Copyright 2006 by Princeton University. All rights reserved.
This data contains terms from ConceptNet Numberbatch, by Luminoso Technologies,
Inc. You may redistribute or modify the data under the terms of the CC-By-SA
4.0 license.

## Example data in the public repository

| source | file | license |
|---|---|---|
| comma2k19, comma.ai | `examples/vehicle/drive.csv` (one drive, 12 channels, resampled) | MIT (`licenses/comma2k19.txt`) |
| Rosenberg Self-Esteem Scale responses, Open-Source Psychometrics Project | not redistributed; `examples/survey/get_data.sh` downloads them from openpsychometrics.org | terms of the source |

## Installed by the install script, not redistributed

PyTorch, Transformers, Tokenizers, Accelerate, Sentence Transformers, NumPy,
SciPy, scikit-learn, pandas, safetensors, huggingface_hub, cryptography and the
Anthropic Python SDK install from the Python Package Index under their own
licenses.
