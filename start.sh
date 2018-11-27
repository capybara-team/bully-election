# Start 10 servers script

for i in {0..9}; do
	nodejs dist/index.js node-id=$i &
done
jobs
for i in {1..10}; do
	wait %$i
done
