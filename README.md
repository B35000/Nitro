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
npm install mime-types
npm install dotenv
```

[pm2](https://pm2.io) is used for the projects node runtime process management and tracking.

### Running the project

Once all the dependencies are installed, youll need to declare a `.env` file with a backup key named `SECRET_KEY` which looks something like this:

```
SECRET_KEY=eeeeeArPOmnFJlPgAyT2x7IXU4YIMHekKyL0geeeee
```

Also, inside the `.env` file you need to specify the private key and certificate to be uesd by the server to encrypt traffic to and from the server since it uses https exclusively. In the `.env` file, specify a link to the key using a variable called `PRIVATE_KEY_RESOURCE` and a link to the certificate file using a variable called `CERTIFICATE_RESOURCE`:

```
PRIVATE_KEY_RESOURCE=/etc/letsencrypt/live/api.mydomain.com/privkey.pem
CERTIFICATE_RESOURCE=/etc/letsencrypt/live/api.mydomain.com/fullchain.pem
```

These certificates can be obtained using the certbot command. Finally, in the `.env` you also need to declare the port number you will be using for the server. This should be port `443`:

```
HTTPS_PORT=443
```

Once this is done, you can start the node by running `pm2 start server.js --no-daemon` if youre using [pm2](https://pm2.io) or `node server.js` if youre debugging.

### Managing the API

When the node is started, youll need to obtain the nodes backup key to set it up via [E5](https://b35000.github.io/E5UI/) in the Nitro module. When setting up a new Nitro, youll be required to specify the nodes backup key.

### Configuring the API

The node can be directly configured and managed via [E5](https://b35000.github.io/E5UI/). All the necessary enpoints and configuration options have been set up on the client side so if you wish to configure storage options for instance, you can do so via [E5](https://b35000.github.io/E5UI/) directly.

### License

Nitro E5 Content Accelerator Network is released under the terms of the MIT license.
