# Nitro E5 Content Accelerator Network

This is the official repository for the Nitro E5 Content Accelerator Network. This project is meant to help cache and serve conent such as event data, uploaded files and posts, and serve as an api enpoint for various functions that cannot be done on-chain or on the client side.

### Getting Started

You will need [node](https://nodejs.org/) and [npm](https://www.npmjs.com/) installed on your computer for this to work. After downloading and unzipping the project, run `npm install` to install all the packages that are used. Alternatively, install them individually by running the following commands:

```
npm install express web3 crypto-js
npm install pm2@latest -g
npm installl big-integer
npm install crypto
npm install os
npm install check-disk-space
```

[pm2](https://pm2.io) is used for the projects node runtime process management and tracking.

### Running the project

Once all the dependencies are installed, youll need to configure the port that [express](https://expressjs.com/) will use to host the api inside the `server.js` file:

```
const EXPRESS_PORT = 3000; // <----- change this to whichever port number you wish to use
```

Then youll need to set the server key and certificate that node will use to host the https endpoint:

```
var options = {
  key: fs.readFileSync('/home/ubuntu/client-key.pem'),
  cert: fs.readFileSync('/home/ubuntu/client-cert.pem')
  // set the directory for the keys and cerificates your using here
};
```

Once this is done, you can start the node by running `pm2 start server.js --no-daemon` if youre using [pm2](https://pm2.io) or `node server.js` if youre debugging.

### Managing the API

When the node is started, youll need to obtain the nodes backup key to set it up via [E5](https://b35000.github.io/E5UI/) in the Nitro module. When setting up a new Nitro, youll be required to specify the nodes backup key which looks something like this:

```
eeeeeqnoKLoYcdxdnxqvMafghrpeWQ19B4jTOeeeee
```

You can obtain this as the output when you start the server.

### Configuring the API

The node can be directly configured and managed via [E5](https://b35000.github.io/E5UI/). All the necessary enpoints and configuration options have been set up on the client side so if you wish to configure storage options for instance, you can do so via [E5](https://b35000.github.io/E5UI/) directly.

### License

Nitro E5 Content Accelerator Network is released under the terms of the MIT license.
