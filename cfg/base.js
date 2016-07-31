var path = require('path');
var port = process.env.port || 8000;
var srcPath = path.join(__dirname, '/../src');
var publicPath = '/assets/';
var HtmlWebpackPlugin = require("html-webpack-plugin")

module.exports = {
  port: port,
  debug: true,
  context: path.join(__dirname, '..'),
  output: {
    path: path.join(__dirname, '/../dist/assets'),
    filename: '[name].js',
    publicPath: publicPath
  },
  devServer: {
    contentBase: './dist/',
    historyApiFallback: true,
    hot: true,
    port: port,
    inline: true,
    publicPath: publicPath,
    info: true,
    watchOptions: {
      poll: 1000,
    },
  },
  resolve: {
    extensions: [
      '',
      '.js',
      '.jsx'
    ],
    alias: {
      actions: srcPath + '/actions/',
      components: srcPath + '/components/',
      sources: srcPath + '/sources/',
      stores: srcPath + '/stores/',
      styles: srcPath + '/styles/',
      config: srcPath + '/config/' + process.env.REACT_WEBPACK_ENV
    },
    root: srcPath,
  },
  module: {
    preLoaders: [{
      test: /\.(js|jsx)$/,
      include: path.join(__dirname, 'src'),
      loader: 'eslint-loader'
    }],
    loaders: [
      {
        test: /\.css$/,
        loader: 'style-loader!css-loader!postcss-loader'
      },
      {
        test: /\.sass/,
        loader: 'style-loader!css-loader!postcss-loader!sass-loader?outputStyle=expanded&indentedSyntax'
      },
      {
        test: /\.scss/,
        loader: 'style-loader!css-loader!postcss-loader!sass-loader?outputStyle=expanded'
      },
      {
        test: /\.less/,
        loader: 'style-loader!css-loader!postcss-loader!less-loader'
      },
      {
        test: /\.styl/,
        loader: 'style-loader!css-loader!postcss-loader!stylus-loader'
      },
      {
        test: /\.(png|jpg|gif|woff|woff2)$/,
        loader: 'url-loader?limit=8192'
      },

      // Needed for the css-loenader when [bootstrap-webpack](https://github.com/bline/bootstrap-webpack)
      // loads bootstrap's css.
      {test: /\.woff(\?v=\d+\.\d+\.\d+)?$/, loader: "url?limit=10000&mimetype=application/font-woff"},
      {test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/, loader: "url?limit=10000&mimetype=application/octet-stream"},
      {test: /\.eot(\?v=\d+\.\d+\.\d+)?$/, loader: "file"},
      {test: /\.svg(\?v=\d+\.\d+\.\d+)?$/, loader: "url?limit=10000&mimetype=image/svg+xml"}
      , {
        test: /\.(json|spj)$/,
        loader: 'json-loader'
      }
    ]
  },
  postcss: function () {
    return [];
  },
  plugins: [new HtmlWebpackPlugin(
      {
        template: path.join(__dirname, '../src/', 'index.html'),
        filename: '../index.html',
        excludeChunks: ['presentation']
      }
    ),
    new HtmlWebpackPlugin(
      {
        template: path.join(__dirname, '../src/', 'presentation.html'),
        filename: '../presentation.html',
        excludeChunks: ['app']
      }
    )
  ]
};
