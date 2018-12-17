# Plattar Configurator

The base configurator for Plattar Scenes is written in AngularJS, using a gulp build process to minify the app code.

## Run and develop locally
You can run a local server by running the following commands. It will watch the code for any changes and trigger a rebuild, and launch a server on `localhost:3000`
```
npm install
npm run dev
```

## Build for production
You can build the minified production version by running the following commands. The process will output the files into the `/dist` folder.
```
npm install
npm run prod
```
Take the files from the `/dist` folder and host them on your web server, and embed that window.
