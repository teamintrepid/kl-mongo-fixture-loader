# kal-dep-fixtures-bau

## Installation

This module is installed via npm:

``` bash
npm install kl-mongo-fixture-loader
```

## Usage

Requires a mongoose or a native mongodb connection
You must deal with the connection lifecycle externally in your app (i.e. open/close connection)
``` js
import { FixturesUtil } from 'kl-mongo-fixture-loader';
const fixtures = new FixturesUtil(connection);
```

To refresh the data (both remove and seed)
``` js
await fixtures.refresh();
```

To refresh the data (promise based)
``` js
fixtures.refresh().then(() => { console.log('refreshed!') });
```

To seed the data
``` js
await fixtures.seed();
```

To remove the data
``` js
await fixtures.remove();
```

To inspect the data
``` js
console.log(fixtures.cachedBson.User[0]._id) // prints some _id
```
