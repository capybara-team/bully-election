for i in {0..9}; do
	nodejs dist/index.js node-id=$i &
	sleep 5
done
jobs
for i in {1..10}; do
	wait %$i
done
