# The Marshall Project's Graphics Environment

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

## Setup

- Clone this repo (`themarshallproject/gfx-v2`) into an appropriately named and located folder with this command: `git clone git@github.com:themarshallproject/gfx-v2.git <project name>`
- `cd <project name>`
- Run `bash setup.sh`
- Provide a slug that will uniquely identify this project. You do not need to append the date manually, the setup tool can do that for you. Please do append the date if you are creating a story specific graphic. Only general tools should be left date-less. (In the future it will be impossible to accidentally conflict with the slug of another project, but for now be careful of that!).
- Specify the type of project you are starting.
- Choose whether or not you want to automatically create a new GitHub repo for this project.
- Make stuff!

### Setup for existing projects

- Clone the project repository with `git clone <repo url>`
- Run `bash setup.sh`. (Hint: this is almost the same as just running `npm install`)
- Make stuff!

## Run

- Run `gulp` which will start the local server, and live-reload your changes.
- Edit files only inside of the `src` directory.
- To change post format, edit `config.json` and re-run `gulp`.

## Deploy

- Run `gulp deploy` to send files to S3 and EndRun.
- You will be prompted for credentials if you have not entered them before. You will need an AWS keypair, a Github API token, and an EndRun API key.

## Notes on JavaScript

- Any `.js` file in the `src/` folder will be included automatically. Your code in `graphic.js` will always come last in the concatenated file.
- You can use ES6 by setting the `use_es6` configuration option in `config.json`. This creates a slightly different compilation behavior. Only `graphic.js` will be included automatically, other files should be `import`ed from there. The `src/lib/` folder will be included and concatenated, without being compiled. This provides an easy way to use non-ES6-module code, such as jQuery Mobile.

## Using external data sources in your HTML

You may want to use a data file such as a CSV or JSON to populate
your HTML. The graphics rig makes any CSV or JSON files placed in
`src/template-files` available to `graphic.html` to be accessed as JSON through
templates written in the [Nunjucks](https://mozilla.github.io/nunjucks/templating.html) templating language.

#### Example: basic table

For example, say you want to create a table. Rather than writing each
row of the table HTML by hand, you could create a Nunjucks template for
a table row and loop over a dataset to populate the table.

Let's say you have this CSV:
```
name,date,nickname
"New York","July 26, 1788","The Empire State"
"Florida","March 3, 1845","The Sunshine State"
"Hawaii","August 21, 1959","The Islands of Aloha"
```

To access it from the HTML, first save it to `src/template-files`. Let's
say we save it down as `src/template-files/states.csv`.

In the graphic HTML, you can now reference a `data` object, where any
files you've saved to `src/template-files` are now accessible as keys
corresponding to their filename. So our states data can be accessed as
`data.states`.

To build a table, you might write templating markup somewhat like this:
```
<table>
  <thead>
    <tr>
      <th>State</th>
      <th>Date admitted</th>
      <th>Nickname</th>
    </tr>
  </thead>
  <tbody>
    {% for row in data.states %}
    <tr>
      <td>{{ row.name }}</td>
      <td>{{ row.date }}</td>
      <td>{{ row.nickname }}</td>
    </tr>
    {% endfor %}
  </tbody>
</table>
```

The result should appear like this:

<table>
  <tbody><tr>
    <th>State</th>
    <th>Date admitted</th>
    <th>Nickname</th>
  </tr>
  <tr>
    <td>New York</td>
    <td>July 26, 1788</td>
    <td>The Empire State</td>
  </tr>
  <tr>
    <td>Florida</td>
    <td>March 3, 1845</td>
    <td>The Sunshine State</td>
  </tr>
  <tr>
    <td>Hawaii</td>
    <td>August 21, 1959</td>
    <td>The Islands of Aloha</td>
  </tr>
</tbody></table>

#### Example: writing to JavaScript variable

This templating also allows us make data accessible to the JavaScript by writing it directly to the page as a global variable. Here's an example:

```
<script type="text/javascript">var statesData = {{ data.states|dump|safe }};</script>
```
We use two Nunjucks filters, [dump](https://mozilla.github.io/nunjucks/templating.html#dump) and [safe](https://mozilla.github.io/nunjucks/templating.html#safe) to print the data as JSON and prevent the template engine from escaping the values.

#### CSV data formats

CSV files added to `src/template-files` are converted to JSON before
being passed to the HTML template. There are three formatting options,
depending on how your data is structured.

**Array of objects**

By default, data will be formatted as an array of objects, where each
object corresponds to a row in the CSV and the object keys correspond
to the CSV's column headers. For example, the `states.csv` file above
would appear as:
```
[
  {
    "name": "New York",
    "date": "July 26, 1788",
    "nickname": "The Empire State"
  },
  {
    "name": "Florida",
    "date": "March 3, 1845",
    "nickname": "The Sunshine State"
  },
  {
    "name": "Hawaii",
    "date": "August 21, 1959",
    "nickname": "The Islands of Aloha"
  }
]
```

**Keyed lookup**

If you wish to access your data by key rather than as an array, just
name the first column of your CSV `key` and use a unique value for each
row.

A CSV formatted like this:
```
key,value,char_count
"Headline","Dewey defeats Truman",20
"Deck","G.O.P. Sweep Indicated in State",31
"Description","This is the text from the erroneous early edition of the Chicago Daily Tribune from Nov. 3, 1948.",97
```
will output like this:
```
{
  Headline: {
    key: "Headline",
    value: "Dewey defeats Truman",
    char_count: "20"
  },
  Deck: {
    key: "Deck",
    value: "G.O.P. Sweep Indicated in State",
    char_count: "31"
  },
  Description: {
    key: "Description",
    value: "This is the text from the erroneous early edition of the Chicago Daily Tribune from Nov. 3, 1948.",
    char_count: "97"
  }
}
```

**Key-value pairs**

Datasets that begin with a `key` column but only have two columns
overall will be returned as an object of key-value pairs for ease of
reference.

For example, removing the `char_count` column from our previous example
CSV:
```
key,value
"Headline","Dewey defeats Truman"
"Deck","G.O.P. Sweep Indicated in State"
"Description","This is the text from the erroneous early edition of the Chicago Daily Tribune from Nov. 3, 1948."
```

would return a JSON like this:
```
{
  "Headline": "Dewey defeats Truman",
  "Deck": "G.O.P. Sweep Indicated in State",
  "Description": "This is the text from the erroneous early edition of the Chicago Daily Tribune from Nov. 3, 1948."
}
```



## Deploying multiple graphics from one repo

You can use a single repo to house multiple graphics and/or a custom header, and deploy them all at once. This is very useful for a post with multiple components. Or when you have several similar charts that would benefit from sharing CSS and/or JS.

1. Set the `multiple_graphics` option in `config.json` to `true`.
2. Now each html file in `src/` will become it's own graphic. The name of the file will be used to identify it in EndRun.
3. By default during local development each graphic is concatenated together (with a placeholder paragraph in between) in the template.
4. You can customize the layout of the graphics in development by editing `post-templates/localtext.md`. This file is designed to work with the same stuff you would put into an EndRun post. You may, in fact, want to just paste in a semi-produced post, graphic shortcodes and all.
5. Your graphics will be placed according to where the graphic shortcodes appear in `localtext.md`. These shortcodes take the form of `[graphic slug=<graphicreposlug>:<filename>]`. So if you had a file named `intro.html` in a repo with the slug `slugfest`, the shortcode would `[graphic slug=slugfest:intro]`.
6. Remember that you don't have to use `localtext.md` at all. A normal workflow might be leaving it empty while you develop prototypes of your various graphics, and then deploy and put them in a post. Then copy the produced post's contents back down to `localtext.md`, so that your graphics environment more closely resembles the real post.
7. When you are ready to deploy, if you are not using a custom hed, you have to manually add the asset include graphic in the post. This will be slugged `<yourmainslug>:includes`. Add it to the bottom of the post.

#### Using custom heds and other graphics

To incorporate a custom hed with multiple graphics:

1. Choose freeform header as the graphic type.
2. Create a file called `src/header.html`. Your header lives in here. The name is all that identifies it.
3. Your other graphics can go in other html files, as above.
4. You do not need to manually include the header in `localtext.md`, and you do not need to include the `includes` graphic in the post, as above. The assets will be included with `header.html`.

## Tips

- You can simplify the setup process a bit by creating a bash function to do the rote steps for you. Add this to your `~/.bashrc` or equivalent:

```sh
function newgraphic() {
  git clone git@github.com:themarshallproject/gfx-v2.git $1
  cd $1
  bash setup.sh
}
```
Run `source ~/.bashrc` (or just open a new terminal session). Now you can create a new graphic with `newgraphic <slug>`, which will create the repo, put you in it, and then run setup.

- Similarly you can add this function (in the same place), to make the cloning of existing graphics a little easier. h/t @tommeagher

```sh
function clonegraphic() {
  git clone git@github.com:themarshallproject/$1.git
  cd $1
  bash setup.sh
}
```
- You can get the most recent version of this tool by running `git pull updates master && npm install`.

## Other commands

There are a few other commands available that you might find useful. Especially when working on developing this template. Review the bottom of `gulpfile.js` for a full accounting.

1. `gulp reset:type` will allow you to change your initial choices made while setting up the repo. Handy if you made a mistake, or are just rearranging things.
2. `gulp credentials:endrun` will allow to enter a fresh API token.

## Editing this template

- Clone and push to a branch on this repo, then create a pull request.
- The setup process leaves behind a remote called `updates`. You can change this template by pushing commits there (`git push updates master`).
- In addition to the commands mentioned above, sometimes it is useful to edit this in conjunction with changes to EndRun. You can point deployments at a locally hosted EndRun by changing the `endrun_host` config parameter. Note that even if you do this, assets will still be uploaded to the real production s3 bucket, unless you also change the `bucket` parameter.

## Special Circumstance: ai2html

### ai2html DOES NOT YET WORK

If you build a graphic using ai2html, you can do so directly from within this rig. Inside `/project_files` is an Adobe Illustrator template (with presized art boards).

You can build your graphic here, run the script (also in the same folder) and the output of ai2html will automatically be dropped into the correct folders in `/src` — including `app.html` which this script will completely overwrite. You’ve been warned. Run ai2html from inside Illustrator, run `grunt`, run `grunt deploy` and then you should see your graphic show up at `localhost:3000`.

## Thoughts? Ideas? Issues?

Make an issue in this repo!

## Further reading

[Design Document](https://docs.google.com/document/d/18C_LDshggiozKnZh7Bwn_0Qcq8T6f0TZNvA8Bse2KHg/edit)

