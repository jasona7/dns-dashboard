# Script that will cycle through an array of urls and perform a 'dig' command on it.

# the array of urls
urls=( "www.google.com" "www.yahoo.com" "www.bing.com" "twitter.com" "www.delta.com" "www.newspress.com" )

# the loop should run 10 times with a sleep of 1 second between each loop choosing a random url from the array each time
for i in {1..10}
do
  # choose a random url from the array
  url=${urls[$RANDOM % ${#urls[@]} ]}
  # perform the dig command on the url
  dig $url
  # sleep for 1 second
  sleep 1
done
```