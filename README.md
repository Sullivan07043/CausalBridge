# CausalBridge

**Causality bridges the semantic gap.** CausalBridge is a framework that
discovers the causal graph from measurements and expresses the unnamed
variables as names.

Given the measurements of a system and a few known names, it discovers the
causal graph, solves for the embedding of every unnamed variable under the
relations the graph implies, and expresses the embeddings as names through a
frozen language model.

- **Observed task**: name the unnamed columns of the table.
- **Joint task**: name the unnamed columns and the hidden (latent) variables
  behind groups of columns. The joint task needs i.i.d. data.
- **Two kinds of data**: i.i.d. rows, such as questionnaire responses, and
  time series, such as sensor logs.
- **Any compatible language model** on your GPU, or a hosted model through the
  OpenAI or Anthropic API format (OpenAI, OpenRouter, DeepSeek, Claude, or a
  local server).
- **Your own domain**: train a profile from your own datasets.

Project page: https://sullivan07043.github.io/CausalBridge/

## Requirements

- Linux on x86_64.
- An NVIDIA GPU with its driver. Every command runs on the GPU.
- About 8 GB of disk space for the environment, plus the profiles and the
  language model.
- A language model that you download yourself, or an API key of a hosted model.

## Install

```sh
curl -fsSL https://raw.githubusercontent.com/Sullivan07043/CausalBridge/main/install.sh | sh
```

The script installs CausalBridge into its own environment under
`~/.local/lib/causalbridge` and puts the `causalbridge` command in
`~/.local/bin`. It checks the release against the published SHA256 sums. It
does not download a language model.

To install one release, set `CAUSALBRIDGE_VERSION`, for example
`curl -fsSL .../install.sh | CAUSALBRIDGE_VERSION=0.1.0 sh`.

To uninstall, remove `~/.local/lib/causalbridge` and
`~/.local/bin/causalbridge`. Downloaded profiles are in
`~/.cache/causalbridge`.

## Quick start

1. Download a language model, for example Qwen3-4B-Instruct-2507, with the
   `hf` command that comes with CausalBridge. Or skip this step and use a
   hosted API.

   ```sh
   ~/.local/lib/causalbridge/current/bin/hf download Qwen/Qwen3-4B-Instruct-2507
   ```

2. Start CausalBridge:

   ```sh
   causalbridge activate
   ```

   On a desktop or in a VS Code terminal, CausalBridge opens in your browser.
   Over ssh, forward the port from your computer first, then open the address
   that the command prints: `ssh -L 8765:127.0.0.1:8765 <user>@<gpu machine>`.
   If you close the browser, `causalbridge gui` opens it again.
   `causalbridge exit` stops CausalBridge.

3. Name the two unnamed channels of the vehicle example. Clone this
   repository, then on the Name page choose `examples/vehicle/drive.csv`,
   load `names.csv`, choose "Use my graph file" with `graph.csv`, and run.

   ```sh
   git clone https://github.com/Sullivan07043/CausalBridge
   ```

   The first run downloads the `sensor` example profile (233 MB) and the
   sentence encoder.

The [examples](examples/) folder also has a Big Five personality test example
for the joint task. The [project page](https://sullivan07043.github.io/CausalBridge/examples.html)
shows both examples.

### Command line

Every page of the interface shows the equivalent command. The same run from
the command line:

```sh
cd CausalBridge/examples/vehicle
causalbridge name drive.csv --names names.csv --graph graph.csv --data timeseries --out result
```

With a hosted model instead of a local one:

```sh
export OPENAI_API_KEY=...
causalbridge name drive.csv --names names.csv --graph graph.csv --data timeseries \
    --mode text --api-base https://api.openai.com/v1 --api-model gpt-4o --out result
```

## Inputs and outputs

| file | content |
|---|---|
| data table (`.csv`) | one column per variable, a header row of column ids, numeric values |
| names (`.csv`) | columns `id,name`: a name for each column you know; the other columns get names |
| graph (`.csv`, optional) | columns `source,target`: your own causal graph instead of the discovered one |
| `names.json` | a name and its evidence for each unnamed column and each latent variable |
| `graph.json` | the graph that the run used |
| `run.json` | settings, profile, timing and parameters of the run |

## Profiles

A profile holds the trained components for one domain. Two example profiles
are available:

| profile | data | adapters for |
|---|---|---|
| `survey` | questionnaires (i.i.d.) | Qwen/Qwen3-4B-Instruct-2507, Qwen/Qwen3-8B |
| `sensor` | sensor logs of robots and vehicles (time series) | Qwen/Qwen3-4B-Instruct-2507, Qwen/Qwen3-8B |

The example profiles are defaults. For your own domain, train a profile from
your datasets, and fit it to the language model you want to use:

```sh
causalbridge train --profile mine --from survey --data-dir my_datasets --backbone Qwen/Qwen3-4B-Instruct-2507
causalbridge train --profile survey --backbone <another model>      # fit a new model to a profile
```

## Documentation

The [manual](docs/manual.md) describes every command, the interface, the input formats, the
discovery methods, the parameters, the API formats, training, and what data
leaves your machine.

## License

CausalBridge is proprietary software. The [license](LICENSE) permits use for
research and evaluation. Commercial use needs a separate written license from
the CausalBridge Team; ask through the issue tracker of this repository.
Third-party components keep their own licenses, listed in
[THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).

## Citation

If you publish results obtained with CausalBridge, cite the CausalBridge
paper. The reference will appear here when the paper is public.
