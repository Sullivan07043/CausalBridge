# CausalBridge manual

Version 0.2.2.

## Contents

1. [Concepts](#1-concepts)
2. [Installation](#2-installation)
3. [Commands](#3-commands)
4. [Input files](#4-input-files)
5. [Output files](#5-output-files)
6. [Discovery methods](#6-discovery-methods)
7. [Parameters](#7-parameters)
8. [Language models](#8-language-models)
9. [Hosted APIs](#9-hosted-apis)
10. [Training a profile](#10-training-a-profile)
11. [Files and folders](#11-files-and-folders)
12. [What leaves your machine](#12-what-leaves-your-machine)
13. [Error messages](#13-error-messages)

## 1. Concepts

**Variables.** Each column of your data table is a variable. You name some
columns. CausalBridge names the others. Latent variables are hidden causes
that no column measures directly. CausalBridge finds them in the data and can
name them too.

**Task.** The `observed` task names the unnamed columns. The `joint` task also
names the latent variables. The joint task needs i.i.d. data.

**Data kind.** `iid` means that the rows are independent draws, for example
one row per respondent of a questionnaire. `timeseries` means that the rows
are consecutive time steps, for example a sensor log.

**Graph.** CausalBridge discovers a causal graph from the data (section 6), or
reads a graph that you supply.

**Profile.** A profile holds the trained components for one domain: the
encoder update, the concept bank, the solver components and one adapter per
language model. The example profiles are `survey` (i.i.d. questionnaires) and
`sensor` (robot and vehicle time series). You can train your own (section 10).

**Backbone.** The language model that writes the names. It runs on your GPU.

**Mode.** In `prefix` mode, the profile's adapter gives the backbone the
solved position of each variable directly. The backbone needs an adapter in
the profile. In `text` mode, the model reads the evidence as text. Text mode
works with any chat model, local or hosted.

## 2. Installation

Requirements: Linux on x86_64 and an NVIDIA GPU with its driver.

```sh
curl -fsSL https://raw.githubusercontent.com/Sullivan07043/CausalBridge/main/install.sh | sh
```

| variable | effect |
|---|---|
| `CAUSALBRIDGE_VERSION` | install this release, for example `0.1.0` (default: the latest release) |
| `CAUSALBRIDGE_FROM` | install from a local folder that holds the wheel and `SHA256SUMS` (for a machine without access to GitHub) |

The script creates a private Python 3.12 environment with `uv` and checks the
wheel against the published SHA256 sums. To upgrade, run the script again.
To uninstall, remove `~/.local/lib/causalbridge` and `~/.local/bin/causalbridge`.

## 3. Commands

Run `causalbridge <command> --help` for the full list of options.

### Options common to `discover` and `name`

| option | default | meaning |
|---|---|---|
| `--data iid\|timeseries` | `iid` | kind of data |
| `--profile NAME` | `survey` for iid, `sensor` for timeseries | profile to use |
| `--profile-dir DIR` | `~/.cache/causalbridge/profiles` | folder of trained and downloaded profiles |
| `--cache DIR` | `~/.cache/causalbridge` | working folder |
| `--hf-cache DIR` | the Hugging Face default | Hugging Face cache that holds the backbone |
| `--set SECTION.KEY=VALUE` | | change one parameter for this run (section 7); repeatable |

### `causalbridge check`

Shows the GPU, the state of the example profiles, whether the backbone is on
the machine and compatible, and whether the discovery extension loads.

| option | meaning |
|---|---|
| `--backbone MODEL` | backbone to check (default: Qwen/Qwen3-4B-Instruct-2507) |
| `--profile-dir DIR`, `--hf-cache DIR` | as above |

### `causalbridge discover DATA --out DIR`

Discovers the causal graph of a data table and writes `DIR/graph.json`.

| option | meaning |
|---|---|
| `--method rlcd\|gin\|boss` | discovery method (section 6); the default depends on `--data` |

### `causalbridge name DATA --names NAMES --out DIR`

Names the unnamed columns, and in the joint task the latent variables.

| option | default | meaning |
|---|---|---|
| `--names FILE` | required | the names you know (section 4) |
| `--graph FILE` | discover | your own graph instead of discovery |
| `--method rlcd\|gin\|boss` | by data kind | discovery method |
| `--task observed\|joint` | `observed` | name columns only, or columns and latent variables |
| `--backbone MODEL` | Qwen/Qwen3-4B-Instruct-2507 | local model: a Hugging Face id in the cache, or a local folder |
| `--mode prefix\|text` | `prefix` | section 1 |
| `--api-model MODEL` | | hosted model for text mode (section 9) |
| `--api-base URL` | | endpoint of the OpenAI format |
| `--api-format openai\|anthropic` | from the model and endpoint | request format |
| `--api-key-env VAR` | `OPENAI_API_KEY` or `ANTHROPIC_API_KEY` | environment variable that holds the key |

If a needed file of an example profile is missing, `name` and `discover`
download it first.

### `causalbridge download`

Downloads the model files of the example profiles and checks each file
against its SHA256 sum.

| option | default | meaning |
|---|---|---|
| `--profile survey\|sensor\|all` | `all` | which profile |
| `--backbone MODEL` | all adapters | download only the adapter of this backbone; repeatable |
| `--profile-dir DIR` | `~/.cache/causalbridge/profiles` | target folder |

### `causalbridge train`

Trains a profile, or fits new backbones to a profile. See section 10.

### `causalbridge activate`, `causalbridge gui`, `causalbridge exit`

`activate` starts CausalBridge in the background, a local web page, and opens
it in your browser. The terminal is free again at once.

```sh
causalbridge activate
```

On a desktop, and in a terminal of VS Code connected to the GPU machine, the
page opens in your browser. Over ssh, forward the port from your own computer
first, then open the printed address there. The command prints this line with
your user and machine names:

```sh
ssh -L 8765:127.0.0.1:8765 <user>@<gpu machine>
```

If port 8765 is taken, CausalBridge uses the next free port. Forward the port
in the printed address.

CausalBridge keeps running when you close the browser. `gui` opens it again.
`exit` stops it. If a run is in progress, `exit` asks whether to stop the run
as well.

```sh
causalbridge gui
causalbridge exit
```

| command and option | default | meaning |
|---|---|---|
| `activate --port N` | `8765` | local port; the next free port if it is taken |
| `activate --no-browser`, `gui --no-browser` | | print the address, do not open a browser |
| `activate --profile-dir DIR`, `--cache DIR`, `--hf-cache DIR` | as above | passed to every run |
| `exit --yes` | | stop runs in progress without asking |

The interface has four pages.

- **Name**: choose the data file, type the known names in a table, choose
  discovery or your graph file, the task, the language model or a hosted API,
  the GPU and the output folder. The page shows the equivalent command before
  you start the run.
- **Train**: train a profile from a folder of datasets (section 10), or fit a
  language model to a profile. The page checks the datasets folder first.
- **Runs**: the progress, the log and the command of each run. A finished
  naming run shows each named variable with its causal neighbors, the whole
  graph, a table of all names, and the evidence. You can also open the output
  folder of any earlier run.
- **Setup**: the GPUs, the profiles with a download button for the example
  profiles, and the language models in the Hugging Face cache with a
  compatibility check.

CausalBridge listens on 127.0.0.1 only. The address holds a token that
changes each time `activate` starts it, so other users of a shared machine
cannot use it. Each run is a separate `causalbridge` process and continues
when you close the browser. An API key typed into the Name page is used for
that run only and is not saved.

## 4. Input files

All input files are CSV files with a header row.

### Data table

- The header row holds one id per column. Ids must be unique and not empty.
- Every value is a number. An empty cell is a missing value.
- A row with a missing value is dropped. `run.json` records how many rows
  were dropped.
- A column with one constant value is an error.
- The table needs more rows than columns.
- CausalBridge standardizes each column. You do not need to scale the data.

### Names file

Two columns, `id` and `name`:

```csv
id,name
steer,steering wheel angle
gyro_z,yaw rate
```

- Each `id` is a column id of the data table.
- Name at least one column, and leave at least one column without a name.
- The columns that the names file does not list get names.
- A name is free text. Use the words of your domain. For questionnaires, the
  item text works well.

### Graph file (optional)

Two columns, `source` and `target`, one directed edge per row:

```csv
source,target
steer,gyro_z
speed factor,wheel_fl
```

An id that is not a column of the data table is a latent variable. For the
joint task, the graph needs at least one latent variable.

## 5. Output files

`name` writes three files into the `--out` folder.

**`names.json`**

```json
{
  "columns": {"Q5": {"name": "...", "evidence": "..."}},
  "latents": {"L1": {"name": "...", "evidence": "..."}}
}
```

`evidence` is the text that describes the variable's position in the graph
and its relations to the named variables.

**`graph.json`**: the latent variables and the edges of the graph that the
run used.

**`run.json`**: the version, the task, the data kind, the mode, the backbone
or hosted model, the profile, the source of the graph, the number of dropped
rows, the parameters, the time of each stage, the names you gave, and the
checksum of the profile's encoder update.

## 6. Discovery methods

CausalBridge picks the method from the kind of data. Use `--method` to choose
another method that fits the data, or supply your own graph with `--graph`.

| method | data | finds latent variables | use it when |
|---|---|---|---|
| `rlcd` (default for iid) | iid | yes | groups of columns share hidden causes, as in questionnaires; the joint task |
| `gin` | iid | yes | the data are continuous and non-Gaussian |
| `boss` (default for timeseries) | timeseries | no | rows are time steps; the graph links each channel to the channels of the previous step |

A method that does not fit the data kind stops with an error. Time series
have no joint task.

## 7. Parameters

The file `params.toml` of the installation holds the default values. Change
a value for one run with `--set`, for example `--set rlcd.alpha=0.05`.

| parameter | default | meaning |
|---|---|---|
| `rlcd.alpha` | 0.01 | significance level of the rank tests; a larger value finds more structure |
| `rlcd.maxk` | 3 | largest number of latent variables behind one group of columns |
| `gin.alpha` | 0.05 | significance level of the independence tests |
| `boss.discount` | 16 | penalty of the score; a larger value gives a sparser graph |
| `boss.restarts` | 1 | random restarts of the search |
| `name.max_tokens` | 24 | longest name, in tokens |
| `name.batch` | 24 | names generated at once; lower it when GPU memory is short |

Each profile also records whether its variables can be reverse keyed
(`signed`), as questionnaire items can. `train --signed` sets it (section 10).

## 8. Language models

CausalBridge never downloads a backbone. Download the model yourself, for
example with the `hf` command that comes with CausalBridge:

```sh
~/.local/lib/causalbridge/current/bin/hf download Qwen/Qwen3-4B-Instruct-2507
```

Then pass its id with `--backbone`. A local folder also works.

**Prefix mode** needs a backbone with an adapter in the profile. The example
profiles have adapters for Qwen/Qwen3-4B-Instruct-2507 and Qwen/Qwen3-8B. To
use another model, fit an adapter to it (section 10). The model must:

- be a decoder-only model,
- use full attention in every layer (no sliding-window or linear-attention layers),
- have `q_proj` and `v_proj` projections in every layer,
- not use multi-head latent attention,
- have a chat template.

`causalbridge check --backbone MODEL` tests these conditions.

**Text mode** works with any local chat model, for example
`--mode text --backbone Qwen/Qwen2.5-7B-Instruct`.

## 9. Hosted APIs

Text mode can send the requests to a hosted model. CausalBridge knows two
request formats.

| provider | format | example options | key variable |
|---|---|---|---|
| OpenAI | openai | `--api-base https://api.openai.com/v1 --api-model gpt-4o` | `OPENAI_API_KEY` |
| OpenRouter | openai | `--api-base https://openrouter.ai/api/v1 --api-model openai/gpt-4o --api-key-env OPENROUTER_API_KEY` | your choice |
| DeepSeek | openai | `--api-base https://api.deepseek.com/v1 --api-model deepseek-chat --api-key-env DEEPSEEK_API_KEY` | your choice |
| a local server (vLLM, SGLang, Ollama) | openai | `--api-base http://127.0.0.1:8000/v1 --api-model <served name>` | any value |
| Anthropic | anthropic | `--api-model claude-sonnet-5` | `ANTHROPIC_API_KEY` |

A full command:

```sh
export OPENAI_API_KEY=...
causalbridge name data.csv --names names.csv --mode text \
    --api-base https://api.openai.com/v1 --api-model gpt-4o --out result
```

Rules:

- A model whose id starts with `claude` uses the Anthropic format when you do
  not give `--api-base`. Every other model uses the OpenAI format, which needs
  `--api-base`. `--api-format` overrides the choice.
- The key stays in the environment variable. CausalBridge does not store it.
- When a reasoning model rejects the request settings, CausalBridge repeats
  the request with the settings that such models accept.
- A failed request is repeated up to four times. A variable without a name
  after that stops the run with an error.

## 10. Training a profile

Training needs a GPU. Every stage writes a completion mark, so a stopped run
continues where it stopped when you run the same command again.

### Your own domain

```sh
causalbridge train --profile mine --from survey --data-dir my_datasets \
    --backbone Qwen/Qwen3-4B-Instruct-2507 [--vocab terms.txt] [--signed yes|no]
```

**Training data.** `--data-dir` is a folder with one subfolder per dataset.
Each subfolder holds three files:

| file | content |
|---|---|
| `data.csv` | the data table (section 4) |
| `names.csv` | a name for every column; names for latent variables of the graph are optional |
| `graph.csv` | the causal graph of the dataset (section 4) |

Every column must have a name. More datasets from your domain give a better
profile.

| option | default | meaning |
|---|---|---|
| `--profile NAME` | required | name of the new profile |
| `--from survey\|sensor\|NAME` | required with `--data-dir` | the profile to start from; pick the one closest to your data |
| `--data iid\|timeseries` | `iid` | kind of data |
| `--vocab FILE` | | text file with one domain term per line; the terms join the concept bank |
| `--backbone MODEL` | | backbones to train adapters for; repeatable |
| `--signed yes\|no` | as the starting profile | whether variables can be reverse keyed |
| `--holdout FRACTION` | 0.2 | share of the datasets kept out of training for the report |
| `--only STAGES` | all | comma-separated stages: `encoder,bank,solver,adapter,report` |
| `--profile-dir DIR`, `--cache DIR`, `--hf-cache DIR` | | as in section 3 |

**Stages.**

1. `encoder`: adapts the text encoder to the names of your domain.
2. `bank`: rebuilds the concept bank with the new encoder and your terms.
3. `solver`: trains the solver components on your datasets.
4. `adapter`: builds training examples from your datasets and trains one
   adapter per backbone.
5. `report`: names the columns of the held-out datasets with the new profile
   and with the backbone alone, and records how often the true name ranks
   first (top-1) and its mean reciprocal rank (MRR).

The negation component comes from the starting profile.

The profile goes to `<profile-dir>/mine/`. The progress and the report are in
`<profile-dir>/mine/train_state.json`. Use the profile with `--profile mine`.

### A new backbone for an existing profile

Without `--data-dir`, `train` fits adapters for new backbones to an existing
profile:

```sh
causalbridge train --profile survey --backbone Qwen/Qwen2.5-7B-Instruct
```

For an example profile, this downloads the profile's training examples first.
The new adapter is registered in the profile, and `name --backbone` then
finds it.

## 11. Files and folders

| path | content |
|---|---|
| `~/.local/lib/causalbridge` | the program and its Python environment |
| `~/.local/bin/causalbridge` | the command |
| `~/.cache/causalbridge/profiles/<name>/` | downloaded and trained profiles (`--profile-dir`) |
| `~/.cache/causalbridge` | working files of a run (`--cache`) |
| `~/.cache/causalbridge/gui/` | state of the running interface, and the command, log and exit code of each run started in it |
| `~/.cache/huggingface/hub` | backbones and the sentence encoder (`--hf-cache`) |

The model files of a profile are encrypted. Only CausalBridge reads them.

## 12. What leaves your machine

- `download`, and the first use of a profile: CausalBridge downloads the
  profile files from Hugging Face.
- The first run downloads the sentence encoder `intfloat/e5-large-v2` from
  Hugging Face.
- Prefix mode, and text mode with a local model: nothing else leaves the
  machine.
- Text mode with a hosted model: CausalBridge sends the variable names, the
  neighbor lines and the evidence lines to the provider you select. It does
  not send the data rows. The provider's terms apply to what it receives.

## 13. Error messages

| message | fix |
|---|---|
| `no CUDA device is present` | run on a machine with an NVIDIA GPU and driver |
| `MODEL is not on this machine; download it first ...` | download the backbone (section 8), or pass `--hf-cache` with the folder that holds it |
| `backbone not compatible with prefix mode: ...` | use `--mode text`, or another backbone (section 8) |
| `profile P has no adapter for MODEL` | fit one: `causalbridge train --profile P --backbone MODEL` |
| `joint naming needs iid data` | use `--task observed` for time series |
| `joint naming needs latent variables, and the graph has none` | use `--method rlcd`, or supply a graph with latent variables |
| `method M is not available for time series; use boss` | use `--method boss` |
| `the API key is not set: export VAR=<your key>` | set the key variable (section 9) |
| `a hosted model needs --mode text and --api-model` | add both options |
| `the GPU ran out of memory; ...` | stop the other programs that use the GPU (`nvidia-smi` lists them), or lower `name.batch`, for example `--set name.batch=8` |
| `unknown parameter: KEY` | use a parameter from section 7 |
| `... failed its checksum after download; nothing was kept` | run the command again; check the network |
| input errors (`duplicate column ids`, `is not numeric`, `constant columns`, ...) | correct the file as the message says (section 4) |
