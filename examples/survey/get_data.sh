#!/bin/sh
# Downloads the Rosenberg Self-Esteem Scale responses of the Open-Source Psychometrics
# Project (https://openpsychometrics.org/_rawdata/) and writes data.csv: the ten items
# Q1-Q10 of the first 5000 respondents who answered every item.
set -eu
cd "$(dirname "$0")"
curl -fsSL -o RSE.zip https://openpsychometrics.org/_rawdata/RSE.zip
unzip -o -q RSE.zip
awk -F '\t' '
    { sub(/\r$/, "") }
    NR == 1 { print "Q1,Q2,Q3,Q4,Q5,Q6,Q7,Q8,Q9,Q10"; next }
    { ok = 1; for (i = 1; i <= 10; i++) if ($i < 1) ok = 0 }
    ok && n < 5000 { print $1","$2","$3","$4","$5","$6","$7","$8","$9","$10; n++ }
' RSE/data.csv > data.csv
rm -rf RSE RSE.zip
echo "data.csv: $(($(wc -l < data.csv) - 1)) respondents, 10 items"
