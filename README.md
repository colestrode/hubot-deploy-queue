# Deploy Queue
Look! It's a deploy queue for Hubot!

Continuous deploymenting? Not sure if there is a deploy happening _right now_? Use this deploy queue to keep track.

## Commands
`deploy me`: Add yourself to the deploy queue. Hubot give you a heads up when it's your turn

`deploy done`: Say this when you're done and then Hubot will tell the next person. Or you could say `deploy complete` or `deploy donzo`.

`deploy forget me`: Removes you from the queue. If you're on there more than once, then just removes your next turn. If you're on there more than once, you might think about slowing down and deploying a little less continuously. Or you could say `deploy forget it` or `deploy nevermind`

`deploy remove <user>`: Removes a user completely from the queue. As my Uncle Ben said, with great power comes great responsibility. Expect angry messages if this isn't what you meant to do. Also works with `deploy kick <user>` and `deploy sayonara <user>`.

`deploy current`: Tells you who's currently deploying. Also works with `deploy who's deploying` and `deploy who's at bat`.

`deploy next`: Sneak peek at the next person in line. Do this if the anticipation is killing you. Also works with `deploy who's next` and `deploy who's on first`.

`deploy list`: Lists the queue. Use wisely, it's going to ping everyone :)

`deploy debug`: Kinda like `deploy list`, but for nerds.
