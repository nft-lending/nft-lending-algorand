#!/bin/bash
cd contracts
for file in *.py
do
    python3 $file
done
cd ../build
for file in *.teal
do
    echo -n "const TealCode = \`" > ../webapp/src/teal/$file.js
    cat $file >> ../webapp/src/teal/$file.js
    echo "\`;" >> ../webapp/src/teal/$file.js
    echo "export default TealCode;" >> ../webapp/src/teal/$file.js
done