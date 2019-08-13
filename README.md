# Machine Learning's CO2 Impact

This repository is currently kept anonymous as it will be submitted with a research paper to a peer-review process.

## Contributing

### Stay anonymous for now 

For safety, disable the credential helper:

```
~/path/to/mlco2/impact $ git config --local credential.helper ""
```

To **commit** chose a random username and password:

```
~/path/to/mlco2/impact $ git -c user.name='Jahne Doe' -c user.email='my@email.org' commit -am 'some commit message'
```

Then `git push origin master` as usual with the credentials you have been given

### Setup

1. [Install `npm`](https://www.npmjs.com/get-npm): Node's package manager
2. [Install `gulp`](https://gulpjs.com/): a build tool
3. Install dependencies: from the root of this repo `$ npm install`
4. Run the local server: `$ gulp watch`
5. Edit files! Gulp will watch for changes, build the differences and reload the browser

### Content

`html` files are split by section in the `html/` folder, and then built into the `index.html` file.

After editing content, if `gulp watch` was running, you're good ; otherwise, run `gulp build` to apply your changes. Then commit and push **safely** (see [previous section](#stay-anonymous-for-now)).

