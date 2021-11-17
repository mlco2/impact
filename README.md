*This repository is passively maintained: issues will be addressed -- especially if they come with a suggested solution -- but there is no active updates to the data or code. Contributions are welcome.*

# Machine Learning's CO2 Impact

Checkout the [**online GPU emissions calculator**](https://mlco2.github.io/impact)!

[![](https://i.postimg.cc/pTqVSx7N/Capture-d-e-cran-2019-11-07-a-12-41-58.png)](https://mlco2.github.io/impact)

By A. Lacoste, A. Luccioni, V. Schmidt

Read our paper on [**Quantifying Carbon Emissions of Machine Learning**](https://arxiv.org/pdf/1910.09700) (NeurIPS 2019, Climate Change AI Workshop)

Use our **generated latex template** which automatically includes the Calculator's output for you to easily report your procedure's CO2 eq. emissions

[![](https://raw.githubusercontent.com/mlco2/impact/master/img/template.png)](https://mlco2.github.io/impact#publish)

## Contributing

### Setup

1. [Install `npm`](https://www.npmjs.com/get-npm): Node's package manager
2. [Install `gulp`](https://gulpjs.com/): a build tool
3. Install dependencies: from the root of this repo `$ npm install`
4. Run the local server: `$ gulp watch`
5. Edit files! Gulp will watch for changes, build the differences and reload the browser

### Content

`html` files are split by section in the `html/` folder, and then built into the `index.html` file.

After editing content, if `gulp watch` was running, you're good ; otherwise, run `gulp build` to apply your changes.
### Data

Anything to say or add? See [`data/`](https://github.com/mlco2/impact/tree/master/data)

## Acknowledgements

Special thanks to

* https://sharingbuttons.io/
* [prism.js](https://prismjs.com/)
* https://unsplash.com/
