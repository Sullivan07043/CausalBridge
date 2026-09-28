#!/bin/sh
# CausalBridge installer.
#
# Usage:
#   curl -fsSL https://raw.githubusercontent.com/Sullivan07043/CausalBridge/main/install.sh | sh
#
# Set CAUSALBRIDGE_VERSION (for example 0.1.0) to install one release. The
# default is the latest release.
#
# The script installs CausalBridge into a private environment under
# ~/.local/lib/causalbridge and puts the command at ~/.local/bin/causalbridge.
# It downloads the release into a temporary directory and checks it against
# the published sha256 before it installs anything. It does not download a
# language model: use a model you already have, or a hosted API.
#
# Uninstall: rm -rf ~/.local/lib/causalbridge ~/.local/bin/causalbridge
# Downloaded profiles stay in ~/.cache/causalbridge until you remove them.

set -eu

REPO_URL="https://github.com/Sullivan07043/CausalBridge"
VERSION="${CAUSALBRIDGE_VERSION:-}"
LIB="${HOME}/.local/lib/causalbridge"
BIN_DIR="${HOME}/.local/bin"
PYTHON_VERSION=3.12

fail() {
    echo "causalbridge install failed: $1" >&2
    exit 1
}

[ -n "${HOME:-}" ] || fail "HOME is not set."

OS="$(uname -s)"
MACHINE="$(uname -m)"
if [ "${OS}" != Linux ] || [ "${MACHINE}" != x86_64 ]; then
    fail "this release supports Linux x86_64 only; detected ${OS} ${MACHINE}."
fi

# Every command of CausalBridge runs on a CUDA device.
command -v nvidia-smi >/dev/null 2>&1 ||
    fail "nvidia-smi was not found. CausalBridge needs an NVIDIA GPU with its driver installed."
nvidia-smi -L >/dev/null 2>&1 ||
    fail "nvidia-smi found no working GPU. Check the NVIDIA driver."

for TOOL in curl sha256sum; do
    command -v "${TOOL}" >/dev/null 2>&1 || fail "${TOOL} is needed but was not found."
done

WORK="$(mktemp -d "${TMPDIR:-/tmp}/causalbridge-install.XXXXXXXX")"
cleanup() {
    rm -rf "${WORK}" "${LIB}/.uv-cache"
}
trap cleanup EXIT
trap 'cleanup; exit 130' INT
trap 'cleanup; exit 143' TERM

# CAUSALBRIDGE_FROM names a local folder with the wheel and SHA256SUMS, for a
# machine without access to GitHub.
if [ -n "${CAUSALBRIDGE_FROM:-}" ]; then
    SRC="${CAUSALBRIDGE_FROM}"
    [ -f "${SRC}/SHA256SUMS" ] || fail "${SRC} has no SHA256SUMS."
    cp "${SRC}/SHA256SUMS" "${WORK}/SHA256SUMS"
else
    if [ -n "${VERSION}" ]; then
        DOWNLOAD_URL="${REPO_URL}/releases/download/v${VERSION}"
    else
        DOWNLOAD_URL="${REPO_URL}/releases/latest/download"
    fi
    curl -fsSL -o "${WORK}/SHA256SUMS" "${DOWNLOAD_URL}/SHA256SUMS" ||
        fail "could not download ${DOWNLOAD_URL}/SHA256SUMS"
fi

WHEEL="$(awk '{print $2}' "${WORK}/SHA256SUMS" | grep '^causalbridge-.*-cp312-cp312-linux_x86_64\.whl$' | head -n 1)"
[ -n "${WHEEL}" ] || fail "the release lists no wheel for Linux x86_64."
VER="$(echo "${WHEEL}" | cut -d- -f2)"

echo "Getting ${WHEEL}"
if [ -n "${CAUSALBRIDGE_FROM:-}" ]; then
    cp "${SRC}/${WHEEL}" "${WORK}/${WHEEL}" || fail "${SRC} has no ${WHEEL}."
else
    curl -fSL --progress-bar -o "${WORK}/${WHEEL}" "${DOWNLOAD_URL}/${WHEEL}" ||
        fail "could not download ${DOWNLOAD_URL}/${WHEEL}"
fi

echo "Checking the wheel against the published sha256"
(cd "${WORK}" && grep " ${WHEEL}\$" SHA256SUMS | sha256sum -c -) >/dev/null 2>&1 ||
    fail "the sha256 of ${WHEEL} does not match the published SHA256SUMS."

mkdir -p "${LIB}" "${BIN_DIR}"

# uv builds the environment. Use the one on PATH, or install a private copy.
if command -v uv >/dev/null 2>&1; then
    UV="$(command -v uv)"
else
    UV="${LIB}/uv/uv"
    if [ ! -x "${UV}" ]; then
        echo "Installing uv into ${LIB}/uv"
        curl -fsSL https://astral.sh/uv/install.sh |
            env UV_INSTALL_DIR="${LIB}/uv" UV_NO_MODIFY_PATH=1 INSTALLER_NO_MODIFY_PATH=1 sh >/dev/null ||
            fail "could not install uv."
    fi
fi

# The Python interpreter and the package cache also stay under LIB, so the
# uninstall line above removes everything.
export UV_PYTHON_INSTALL_DIR="${LIB}/python"
export UV_CACHE_DIR="${LIB}/.uv-cache"

DEST="${LIB}/versions/${VER}"
rm -rf "${DEST}"
echo "Creating the environment (Python ${PYTHON_VERSION})"
"${UV}" venv --quiet --python "${PYTHON_VERSION}" --python-preference only-managed "${DEST}" ||
    fail "could not create the Python ${PYTHON_VERSION} environment."

echo "Installing CausalBridge ${VER} and its dependencies (PyTorch is large)"
"${UV}" pip install --quiet --python "${DEST}/bin/python" "${WORK}/${WHEEL}[claude]" ||
    { rm -rf "${DEST}"; fail "could not install the packages."; }

"${DEST}/bin/causalbridge" --version >/dev/null 2>&1 ||
    { rm -rf "${DEST}"; fail "the installed command does not start."; }

ln -sfn "versions/${VER}" "${LIB}/current"
ln -sf "${LIB}/current/bin/causalbridge" "${BIN_DIR}/causalbridge"
for OLD in "${LIB}"/versions/*; do
    [ "${OLD}" = "${DEST}" ] || rm -rf "${OLD}"
done

case ":${PATH}:" in
    *":${BIN_DIR}:"*) ;;
    *) if ! grep -qs 'HOME/.local/bin' "${HOME}/.bashrc"; then
           echo 'export PATH="$HOME/.local/bin:$PATH"' >> "${HOME}/.bashrc"
       fi
       echo "~/.local/bin is on PATH in new shells. For this shell run: . ~/.bashrc" ;;
esac

cat <<EOF

Installed CausalBridge ${VER}: ${BIN_DIR}/causalbridge

Next steps:
  1. Check the installation:       causalbridge check
  2. Get the example profiles:     causalbridge download
  3. Name the columns of a table.
     With a local model (download it yourself, for example Qwen/Qwen3-4B-Instruct-2507):
       causalbridge name data.csv --names names.csv --backbone Qwen/Qwen3-4B-Instruct-2507 --out result
     With a hosted API (text mode):
       export OPENAI_API_KEY=...
       causalbridge name data.csv --names names.csv --mode text --api-model gpt-4o --out result
  Help: causalbridge --help, and causalbridge <command> --help
EOF
