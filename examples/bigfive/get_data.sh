#!/bin/sh
# Downloads the Big Five (IPIP) responses of the Open-Source Psychometrics Project
# (https://openpsychometrics.org/_rawdata/) and writes data.csv: the 50 items E1-O10 of
# the 3000 respondents whose line numbers in the source file are listed in rows.txt.
set -eu
cd "$(dirname "$0")"
curl -fsSL -o BIG5.zip https://openpsychometrics.org/_rawdata/BIG5.zip
unzip -o -q BIG5.zip
awk -F '\t' '
    NR == FNR { want[++n] = $1; next }
    { sub(/\r$/, "") }
    FNR == 1 { head = $8; for (i = 9; i <= 57; i++) head = head "," $i; next }
    { row = $8; for (i = 9; i <= 57; i++) row = row "," $i; line[FNR] = row }
    END { print head; for (k = 1; k <= n; k++) print line[want[k]] }
' rows.txt BIG5/data.csv > data.csv
rm -rf BIG5 BIG5.zip
echo "data.csv: $(($(wc -l < data.csv) - 1)) respondents, 50 items"
