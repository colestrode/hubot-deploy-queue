# Deploy Queue
Look! It's a deploy queue for Hubot!

Continuous deploymenting? Not sure if there is a deploy happening _right now_? Use this deploy queue to keep track.

## Commands
`deploy add`: Add yourself to the deploy queue. Hubot give you a heads up when it's your turn. Anything after `add` will be included in messages about what you're deploying, if you're into that sort of thing. Something like `hubot deploy add my_api`.

`deploy done`: Say this when you're done and then Hubot will tell the next person. Or you could say `deploy complete` or `deploy donzo`.

`deploy remove <user>`: Removes a user completely from the queue. Use `remove me` to remove yourself. As my Uncle Ben said, with great power comes great responsibility. Expect angry messages if this isn't you remove someone else who isn\'t expecting it. Also works with `deploy kick <user>`.

`deploy current`: Tells you who's currently deploying. Also works with `deploy who's deploying` and `deploy who's at bat`.

`deploy next`: Sneak peek at the next person in line. Do this if the anticipation is killing you. Also works with `deploy who's next` and `deploy who's on first`.

`deploy list`: Lists the queue. Use wisely, it's going to ping everyone :)

`deploy debug`: Kinda like `deploy list`, but for nerds.
