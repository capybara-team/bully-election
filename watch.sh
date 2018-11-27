for i in {0..9}; do
	./node_modules/nodemon/bin/nodemon.js dist/index.js node-id=$i &
	sleep 5
done
jobs
for i in {1..10}; do
	wait %$i
done
