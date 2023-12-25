# Hypersign Wallet


## Build

Tested on version
```
Node version: v18.17.0
NPM version : v16.14.13
```

### Build locally

```
$ npm install
$ npm run build
$ npm run build:Testnet # build for Testnet
$ npm run build:Mainnet # build for Mainnet
$ npm run gen:cordova-resources
$ npx cordova build/run android/ios # to build Cordova application
```

### Develop locally

```
$ npm install
$ npm run watch:dev
$ npm run watch:dev:Testnet
$ npm run watch:dev:Mainnet
```

### Running tests

```
$ npm install
$ npm run test
```

### Adding to browser via local build or release zip

- Chromium based (Chrome, Brave, Opera)

1. Open chrome/brave browser `Preferences -> More tools > Extensions`
2. Make sure `Developer mode` is `On` in the right corner.
3. Click `Load unpacked` button and select the generated `dist` folder in the cloned repo or the unacrhived release folder.

- Firefox

1. Open the Firefox menu and select `Add-ons` section.
2. Click the `Tools for all add-ons` button and select `Debug Add-ons`
3. Click `Load a temorary add-on` navigate to the generated `dist` folder in the cloned repo or the unacrhived release folder and select the `manifest.json` file.

### Build Cordova version for production

#### iOS

- create Xcode project by `cordova prepare ios`
- open created project in Xcode
- open Signing & Capabilities
- enable signing by the corresponding development team
- ensure that `applinks:wallet.superhero.com` is in Associated domains feature
- open Build Settings
- switch "Code Signing Identity => Release" and "Code Signing Identity => Release => Any iOS SDK" from "iOS Distribution" to "iOS Developer"
- choose Product => Archive and follow the instructions

#### Android

build a production version signed by the [corresponding key](https://cordova.apache.org/docs/en/latest/guide/platforms/android/#using-buildjson):

```bash
cordova build android --release --buildConfig=build.json
```

## Security

If you discover a security vulnerability within this application, please get in touch with us. All security vulnerabilities will be promptly addressed.

## Contribution

Contributions are more than welcome.

If you spot an issue while testing/using the extension - [submit an issue](https://github.com/aeternity/superhero-wallet/issues)

If you want to help us with building this amazing project submit your PR!

## Steps to build the apk

1. Clone the repo

   ```
   git clone https://github.com/hypersign-protocol/hypersign-identity-wallet.git
   cd hypersign-identity-wallet
   ```

2. Run the following commands
   ```
   npm install
   npm run build
   npm run gen:cordova-resources
   ```

If you face dimensions error in the last command, replace image files in /resources/ directory with [these files](https://drive.google.com/file/d/1OZzAJ_GHOk34SpqBg0ArmZG-Dcml5EbY/view?usp=sharing)

3. Run

   ```
   npx cordova platform add android
   ```

If you face problem in adding android into the project, due to jdk ,
download the JDK version 1.8 from [this link](https://www.oracle.com/java/technologies/javase-jdk16-downloads.html)

4. Follow either of the below steps to get an apk

- Place your build.json and hypersign.keystore file in the root directory and run
  ```
  npx cordova build android
  ```

### OR

- Open up the android folder in your android studio, and run it in a emulator
- Go to Build, and click on Build APK(s), to build the apk


## Troubleshoot


If you are getting the error  while running command `npm run watch:dev`, run these command from the project root:

```bash
node node_modules/node-sass/scripts/install.js
npm rebuild node-sass
```

Then the dev server app should run on  