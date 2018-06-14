# The Marshall Project's Graphics Environment #

```
                     ________
M               M   /_  __/ /  ___
M M           M M    / / / _ \/ -_)
M M M       M M M   /_/_/_//_/\__/         __        ____
M M M M   M M M M     /  |/  /__ ________ / /  ___ _/ / /
M M M M M M M M M    / /|_/ / _ `/ __(_-</ _ \/ _ `/ / /
M M M M M M M M M   /_/__/_/\_,_/_/ /___/_//_/\_,_/_/_/
M M M M M M M M M     / _ \_______    (_)__ ____/ /_
M M M M M M M M M    / ___/ __/ _ \  / / -_) __/ __/
M M M M M M M M M   /_/  /_/  \___/_/ /\__/\__/\__/
                                 |___/

```

Our toolchain for building and deploying graphics, custom posts, and post headers.

### Setup ###

- Clone this repo (`themarshallproject/gfx-v2`) into an appropriately named and located folder with this command: `git clone git@github.com:themarshallproject/gfx-v2.git <project name>`
- `cd <project name>`
- Run `bash setup.sh`
- Provide a slug that will uniquely identify this project. You do not need to append the date manually, the setup tool can do that for you. Please do append the date if you are creating a story specific graphic. Only general tools should be left date-less. (In the future it will be impossible to accidentally conflict with the slug of another project, but for now be careful of that!).
- Specify the type of project you are starting.
- Choose whether or not you want to automatically create a new GitHub repo for this project.
- Make stuff!

### Setup: for existing projects ###

- Clone the project repository with `git clone <repo url>`
- Run `bash setup.sh`. (Hint: this is almost the same as just running `npm install`)
- Make stuff!

### Run ###

- Run `gulp` which will start the local server, and live-reload your changes.
- Edit files only inside of the `src` directory.
- To change post format, edit `config.json` and re-run `gulp`.

### Deploy ###

- Run `gulp deploy` to send files to S3 and EndRun.
- You will be prompted for credentials if you have not entered them before. You will need an AWS keypair and an EndRun API key.

### Tips ###

You can simplify the setup process a bit by creating a bash function to do the rote steps for you. Add this to your `~/.bashrc` or equivalent:

```sh
function newgraphic() {
  git clone git@github.com:themarshallproject/gfx-v2.git $1
  cd $1
  bash setup.sh
}
```
Run `source ~/.bashrc` (or just open a new terminal session). Now you can create a new graphic with `newgraphic <slug>`, which will create the repo, put you in it, and then run setup.

Similarly you can add this function (in the same place), to make the cloning of existing graphics a little easier. h/t @tommeagher

```sh
function clonegraphic() {
  git clone git@github.com:themarshallproject/$1.git
  cd $1
  bash setup.sh
}
```

### Using external data sources in your HTML

You may want to use a data file such as a CSV or JSON to populate
your HTML. The graphics rig makes any CSV or JSON files placed in
`src/template-files` available to `graphic.html` to be accessed through
templates written in the [Nunjucks](https://mozilla.github.io/nunjucks/templating.html) templating language.

For example, say you want to create a table. Rather than writing each
row of the table HTML by hand, you could create a Nunjucks template for
a table row and loop over a dataset to populate the table.

Let's say you have this CSV:
```
name,date,slogan
"New York","July 26, 1788","The Empire State"
"Florida","March 3, 1845","The Sunshine State"
"Hawaii","August 21, 1959","The Islands of Aloha"
```

### Editing this template ###

- Clone and push to a branch on this repo, then create a pull request.
- The setup process leaves behind a remote called `updates`. You can change this template by pushing commits there (`git push updates master`).
- You can also get the most recent version of the tools by running `git pull updates master && npm install`.

### Special Circumstance: ai2html ###

## ai2html DOES NOT YET WORK ##

If you build a graphic using ai2html, you can do so directly from within this rig. Inside `/project_files` is an Adobe Illustrator template (with presized art boards).

You can build your graphic here, run the script (also in the same folder) and the output of ai2html will automatically be dropped into the correct folders in `/src` — including `app.html` which this script will completely overwrite. You’ve been warned. Run ai2html from inside Illustrator, run `grunt`, run `grunt deploy` and then you should see your graphic show up at `localhost:3000`.

### Thoughts? Ideas? Issues? ###

Send Gabe a note. He likes making things better!

### Further reading ###

[Design Document](https://docs.google.com/document/d/18C_LDshggiozKnZh7Bwn_0Qcq8T6f0TZNvA8Bse2KHg/edit)

