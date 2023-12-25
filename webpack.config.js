const path = require('path');
const webpack = require('webpack');
const ejs = require('ejs');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const ChromeExtensionReloader = require('webpack-chrome-extension-reloader');
const { VueLoaderPlugin } = require('vue-loader');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const GenerateJsonPlugin = require('generate-json-webpack-plugin');
const commitHash = require('child_process')
  .execSync('git rev-parse HEAD')
  .toString().trim();
const sass = require('sass');
const genManifest = require('./src/manifest');


const parseBool = val => (val ? JSON.parse(val) : false);
const RUNNING_IN_TESTS = parseBool(process.env.RUNNING_IN_TESTS);

const getConfig = platform => {
  const transformHtml = content =>
    ejs.render(content.toString(), Object.assign({}, process.env, { PLATFORM: platform }));

  return {
    mode: process.env.NODE_ENV,
    context: path.resolve(__dirname, 'src'),
    entry: {
      ...(platform.startsWith('extension-') && {
        'other/background': './background.js',
        'other/inject': './content-scripts/inject.js',
        'other/twitter': './content-scripts/twitter.js',
        'other/youtube': './content-scripts/youtube.js',
        'popup/popup': './popup/popup.js',
        'options/options': './options/options.js',
        'phishing/phishing': './phishing/phishing.js',
        'popup/cameraPermission': './popup/cameraPermission.js',
        'redirect/redirect': './redirect/redirect.js',
      }),
      ...(['web'].includes(platform) && { popup: './popup/popup.js' }),
      ...(platform === 'aepp' && { aepp: '../tests/aepp/aepp.js' }),
    },
    node: { global: true, __dirname: false, __filename: false },
    output: {
      filename: '[name].js',
      publicPath:
        { web: '/', 'extension-chrome': '../', 'extension-firefox': '../' }[platform] || './',
      path: path.resolve(
        __dirname,
        {
          'extension-chrome': 'dist/chrome',
          'extension-firefox': 'dist/firefox',
          web: 'dist/web/root',
          aepp: 'dist/aepp',
        }[platform],
      ),
    },
    resolve: {
      extensions: ['.js', '.vue'],
      fallback: {
        crypto: false, // Avoid overriding the 'fs' module,
        path: false,
        fs: false,
        stream: false,
        timers: false
      },
    },
    ...(platform === 'extension-firefox' && {
      optimization: {
        splitChunks: {
          cacheGroups: {
            vendor: {
              name: 'vendor',
              test: /[\\/]node_modules[\\/]/,
              chunks(chunk) {
                return chunk.name === 'popup/popup';
              },
              maxSize: 3999999,
            },
          },
        },
      },
    }),
    module: {
      rules: [
        {
          test: /\.(png|jpe?g|gif|ico)$/,
          type: 'asset/resource',
          generator: {
            filename: 'assets/[name].[hash][ext]',
          },
          // use: [
          //   {
          //     loader: 'url-loader',
          //     options: {
          //       name: '[name].[contenthash].[ext]',
          //       outputPath: 'assets/', // Specify the output directory for images
          //     },
          //   },
          // ],
        },
        {
          test: /\.vue$/,
          use: ['vue-loader'],
        },
        {
          test: /\.js$/,
          use: ['babel-loader'],
          exclude: /node_modules/,
        },
        {
          test: /\.css$/,
          use: [MiniCssExtractPlugin.loader, 'css-loader'],
        },

        {
          test: /\.(scss|sass)$/,
          use: [
            MiniCssExtractPlugin.loader,
            'css-loader',
            {
              loader: 'sass-loader',
              options: {
                implementation: require('sass'), // Use 'sass' package
              },
            },
          ],
        },

        // {
        //   test: /\.scss$/,
        //   use: [
        //     MiniCssExtractPlugin.loader,
        //     'css-loader',
        //     'sass-loader'
        //   ],
        // },
        // {
        //   test: /\.sass$/,
        //   use: [MiniCssExtractPlugin.loader, 'css-loader', 'sass-loader?indentedSyntax'],
        // },
        {
          test: /\.svg$/i,
          // resourceQuery: /vue-component/,
          type: 'asset/resource',
          generator: {
            filename: 'assets/[name].[hash][ext]',
          },
          // use: ['vue-svg-loader'],
        },
      ],
    },
    plugins: [
      new CleanWebpackPlugin({
        cleanStaleWebpackAssets: false,
      }),
      new VueLoaderPlugin(),
      new MiniCssExtractPlugin({
        filename: '[name].css',
        chunkFilename: '[id].css',
        ignoreOrder: false,
      }),
      new webpack.DefinePlugin({
        global: 'window',
        'process.env': {
          NODE_ENV: JSON.stringify(process.env.NODE_ENV),
          IS_EXTENSION: platform.startsWith('extension-') && !RUNNING_IN_TESTS,
          PLATFORM: JSON.stringify(platform),
          npm_package_version: JSON.stringify(process.env.npm_package_version),
          NETWORK: JSON.stringify(process.env.NETWORK),
          RUNNING_IN_TESTS,
          COMMIT_HASH: JSON.stringify(commitHash)
        },
      }),
      ...(platform.startsWith('extension-')
        ? [
          new CopyWebpackPlugin([
            { from: 'popup/popup.html', to: `popup/popup.html`, transform: transformHtml },
            {
              from: 'options/options.html',
              to: `options/options.html`,
              transform: transformHtml,
            },
            {
              from: 'phishing/phishing.html',
              to: `phishing/phishing.html`,
              transform: transformHtml,
            },
            {
              from: 'popup/CameraRequestPermission.html',
              to: `popup/CameraRequestPermission.html`,
              transform: transformHtml,
            },
            {
              from: 'redirect/redirect.html',
              to: `redirect/index.html`,
              transform: transformHtml,
            },
            { from: 'icons/icon_48.png', to: `icons/icon_48.png` },
            { from: 'icons/icon_128.png', to: `icons/icon_128.png` },
            { from: 'icons/request_permission.jpg', to: `icons/request_permission.jpg` },
            {
              from: path.join(__dirname, 'src/content-scripts/tipButton.scss'),
              to: path.join(
                __dirname,
                {
                  'extension-chrome': 'dist/chrome/other/tipButton.css',
                  'extension-firefox': 'dist/firefox/other/tipButton.css',
                }[platform],
              ),
              transform: (_, f) => sass.renderSync({ file: f }).css.toString(),
            },
          ]),
          new GenerateJsonPlugin(
            'manifest.json',
            genManifest(process.env.NODE_ENV === 'production', platform),
            null,
            2,
          ),
        ]
        : []),
      ...(platform === 'extension-firefox'
        ? [
          new HtmlWebpackPlugin({
            template: path.join(__dirname, 'src', 'popup', 'popup-firefox.html'),
            filename: 'popup/popup.html',
            excludeChunks: [
              'other/background',
              'other/youtube',
              'other/twitter',
              'other/inject',
              'options/options',
              'phishing/phishing',
              'popup/cameraPermission',
            ],
          }),
          new HtmlWebpackPlugin({
            template: path.join(__dirname, 'src', 'options', 'options.html'),
            filename: 'options/options.html',
            chunks: ['options/options'],
          }),
          new HtmlWebpackPlugin({
            template: path.join(__dirname, 'src', 'phishing', 'phishing.html'),
            filename: 'phishing/phishing.html',
            chunks: ['phishing/phishing'],
          }),
        ]
        : []),
      ...(platform === 'extension-chrome' &&
        process.env.HMR === 'true' &&
        !process.env.RUNNING_IN_TESTS
        ? [new ChromeExtensionReloader({ port: 9099 })]
        : []),
      ...(platform === 'web'
        ? [
          new CopyWebpackPlugin([{ from: 'web', to: `../` }]),
          new CopyWebpackPlugin([
            { from: 'popup/popup.html', to: `404.html`, transform: transformHtml },
          ]),
        ]
        : []),
      ...(platform === 'aepp'
        ? [
          new CopyWebpackPlugin([
            { from: '../tests/aepp/aepp.html', to: `aepp.html`, transform: transformHtml },
          ]),
        ]
        : []),
    ],
  };
};

module.exports = (process.env.RUNNING_IN_TESTS
  ? ['extension-chrome', 'aepp']
  : ['extension-chrome', 'extension-firefox', 'web']
).map(p => getConfig(p));
