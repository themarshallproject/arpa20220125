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

Our toolchain for building and deploying graphics, custom posts, post headers,
and clean data.

View some [examples of common graphics](/examples/), or check out TMP's [Visual
Style
Guide](https://docs.google.com/document/d/1h0O0xyToUZZyrG_sJtf23Z1ej6ZoSjlcx8g0EzNP9Lk/edit)
for some guidelines on how to design charts.

Processing data? See [analysis/README.md](analysis/README.md) to learn about
any custom data processing this project may handle.

<!-- Auto-generated table of contents! -->
<!-- This section will update itself if you make changes to the headers. -->

## Table of Contents

<!-- toc -->

- [Setup](#setup)
  * [Setup for existing projects](#setup-for-existing-projects)
- [Run](#run)
- [Deploy](#deploy)
- [Notes on JavaScript](#notes-on-javascript)
- [Deploying multiple graphics from one repo](#deploying-multiple-graphics-from-one-repo)
    + [Basic use](#basic-use)
    + [Custom headers](#custom-headers)
      - [Using Endrun metadata to develop custom headers](#using-endrun-metadata-to-develop-custom-headers)
    + [Customizing the layout of graphics locally](#customizing-the-layout-of-graphics-locally)
- [Using external data sources in your HTML and JavaScript](#using-external-data-sources-in-your-html-and-javascript)
    + [Example: basic table](#example-basic-table)
    + [CSV data formats](#csv-data-formats)
    + [Accessing the data from JavaScript](#accessing-the-data-from-javascript)
- [Using pre-configured templates](#using-pre-configured-templates)
  * [Chart templates](#chart-templates)
  * [ai2html template](#ai2html-template)
  * [Scrolly template TK](#scrolly-template-tk)
- [Advanced Features](#advanced-features)
    + [Google Sheets Integration](#google-sheets-integration)
- [Examples](#examples)
- [Sharing graphics outside of TMP](#sharing-graphics-outside-of-tmp)
  * [Legacy instructions - embedding as iframe](#legacy-instructions---embedding-as-iframe)
- [Running data analysis](#running-data-analysis)
- [Tips](#tips)
- [Other commands](#other-commands)
- [Running on non-Mac platforms](#running-on-non-mac-platforms)
- [Editing this template](#editing-this-template)
- [Thoughts? Ideas? Issues?](#thoughts-ideas-issues)

<!-- tocstop -->

## Setup

- Clone this repo (`themarshallproject/gfx-v2`) into an appropriately named and
  located folder with this command: `git clone git@github.com:themarshallproject/gfx-v2.git <project name>`

- `cd <project name>`

- Run `bash setup.sh`

- Provide a slug that will uniquely identify this project. You do not need to
  append the date manually, the setup tool can do that for you. Please do
  append the date if you are creating a story specific graphic. Only general
  tools should be left date-less. (In the future it will be impossible to
  accidentally conflict with the slug of another project, but for now be
  careful of that!).

- Specify the type of project you are starting.

- Choose whether or not you want to automatically create a new GitHub repo for
  this project.

- Make stuff!

### Setup for existing projects

- Clone the project repository with `git clone <repo url>`
- Run `bash setup.sh`. (Hint: this is almost the same as just running `npm install`)
- Make stuff!

## Run

- Run `gulp` which will start the local server, and live-reload your changes.
- Edit files only inside of the `src` directory.
- To change post format, run `gulp reset:type` and then re-run `gulp`.

## Deploy

- Run `gulp deploy` to send files to S3 and EndRun.

- You will be prompted for credentials if you have not entered them before. You
  will need an AWS keypair, a Github API token, and an EndRun API key.

## Notes on JavaScript

- The graphics rig uses modern JavaScript imports. Anything
  imported into `graphic.js` will be included in the page.

## Deploying multiple graphics from one repo

You can use a single repo to house multiple graphics and/or a custom header,
and deploy them all at once. This is very useful for a post with multiple
components. Or when you have several similar charts that would benefit from
sharing CSS and/or JS.

#### Basic use

By default, the `src/` folder will contain a single html file: `graphic.html`.
If you have more than one html file in `src/`, each html file will become its
own graphic. The name of the file will be used to identify it in EndRun. The
shortcode will take the form `[graphic slug=<graphicreposlug>:<filename>]`.

When you are ready to deploy, if you are not using a custom hed, you have to
manually add the asset include graphic in the post. This will be slugged
`<yourmainslug>:includes`. Add it to the bottom of the post. The `includes`
graphic allows us to load the project's JS and CSS once despite being shared
across multiple graphics.

#### Custom headers

When you set up a project, you can choose "freeform header" as the graphic
type. This will add a file called `header.mustache` into `src/`, which will be
used to build your header. This mustache filetype will allow you to pull down
actual post data from Endrun, like the post's headline and publish time. [(Read
more on this below.)](#using-endrun-metadata-to-develop-custom-headers) If
you'd prefer to hard-code everything, you can rename the file to `header.html`
and just write standard html in it.

When you deploy, the file named `header.mustache` or `header.html` will
appear at the top of the post. If you have additional graphics in the
post, you do not need to include the `includes` graphic as above. The
assets will be included in the `header` file.

##### Using Endrun metadata to develop custom headers

When we develop custom headers, we often include information that is
normally edited in or generated by Endrun (e.g. post headline, byline,
publish time). To avoid having to manually update this information every
time it changes, you can pull post data down from Endrun.

By default when you setup a project with the freeform header type, a
file called `header.mustache` will be created in `src/`. This uses the
[Mustache templating engine](https://github.com/janl/mustache.js/) to
dynamically render html based on a json of post data. The file includes
some boilerplate code for you to work off of, and pulls example data
from `post-templates/custom-header-data.json`.

To download data from an actual post in Endrun, you'll want to first
deploy your graphic to create a new post, or add the graphic slug to an
existing post's "Internal Slug" field in the advanced post editor. Once
the slug is associated with a specific post in Endrun, you can download
metadata for that post by running `gulp posts:download`.

Take a look at `post-templates/custom-header-data.json` to see what
fields are available to use in developing a custom header.

Some fields (byline, producer byline, social tools) will appear by
default within the sidebar of an Endrun post. If you use those fields in
your custom header and wish to hide the defaults that appear in the
sidebar, you can hide the entire sidebar with `.container article > aside.col4 { display: none; }`
or can choose to hide individual children within that container.

#### Customizing the layout of graphics locally

By default during local development each graphic is concatenated together (with
a placeholder paragraph in between) in the template. You can customize the
layout of the graphics in development by editing `post-templates/localtext.md`.
This file is designed to work with the same stuff you would put into an EndRun
post. You may, in fact, want to just paste in a semi-produced post, graphic
shortcodes and all.

Your graphics will be placed according to where the graphic shortcodes appear
in `localtext.md`. These shortcodes take the form of `[graphic slug=<graphicreposlug>:<filename>]`. So if you had a file named `intro.html` in
a repo with the slug `slugfest`, the shortcode would `[graphic slug=slugfest:intro]`.

Remember that you don't have to use `localtext.md` at all. A normal workflow
might be leaving it empty while you develop prototypes of your various
graphics, and then deploy and put them in a post. Then copy the produced post's
contents back down to `localtext.md`, so that your graphics environment more
closely resembles the real post.

## Using external data sources in your HTML and JavaScript

You may want to use a data file such as a CSV or JSON to populate your HTML.
The graphics rig makes any CSV or JSON files placed in `src/template-files`
available to `graphic.html` to be accessed as JSON through templates written in
the [Nunjucks](https://mozilla.github.io/nunjucks/templating.html) templating
language.

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

#### Accessing the data from JavaScript

The above methods explain how to access data in `src/template-files`
from your HTML. If you need to access that same data file from your JavaScript, you can find it in JSON format in `assets/import-data`.

For example, the file `src/template-files/sports.csv` will be converted
to JSON and written to `src/assets/import-data/sports.json`. You can
load it into your JavaScript however you like from there. For example:

```
fetch('assets/import-data/sports.json')
  .then((response) => response.json())
  .then((data) => {
    // Whatever you want from here
  })
```


## Using pre-configured templates

The `templates` directory houses frequently used graphic formats and
javascript modules for basic d3.js charts.

### Chart templates

Our chart templates are javascript modules that can be used to create
basic d3.js charts with configurable options. Documentation for the
templates, including instructions for setup, can be found in the [Chart
Templates README](templates/charts/README.md).

### ai2html template

If you build a graphic using ai2html, you can do so directly from within this
rig. Copy the `src` folder from `templates/ai2html` into the base directory of
this repo. Or use this command:

```
cp -r templates/ai2html/src .
```

After you've copied over the template, you can find an Illustrator template in
`src/ai2html/base-graphic.ai`. Build your graphic here.

Once you're ready to see it on the page, run the `src/ai2html/ai2html.js`
script and the output will automatically be dropped in the correct location at
`src/template-files/base-graphic.html`. This file will be completely
overwritten every time you run the ai2html script. The background images are
placed in `src/assets`.

The ai2html output is imported into your main `graphic.html` file, so
you can add additional HTML around your graphic without it being
overwritten by the script.

In most cases, you can refer to the [ai2html documentation](http://ai2html.org/)
from the New York Times graphics desk. However, we have one additional
feature: constrained artboard widths.

Our ai2html template defaults to using "dynamic" responsive sizing --
that is, the graphic will always fill 100% of the width of its
container. But sometimes this leads to graphics looking too stretched
out. To constrain an artboard to a maximum width, you can add a
`data-constrain-` attribute to the parent element in `src/graphic.html`.

For example, to constrain an artboard named "small" to stretch no more
than 350px, your code would look like this:

```
  <div class="g-ai2html-wrapper" data-constrain-small="350">
    {% include "template-files/base-graphic.html" %}
  </div>
```

To do away with these constraints altogether, just remove the
data-attributes from the parent.

### Scrolly template TK

Details TK.

## Advanced Features

#### Google Sheets Integration

It is possible to download google spreadsheets into local csv files. This can
be helpful for projects with complex editorial-driven fields that will need to
be frequently edited. Outside of this specific situation, you probably don't
need this and should consider simpler solutions. To set it up, specify a
`spreadsheet_id`, which is the long, alphanumeric string in the url of a google
sheet. Next run `gulp sheets:download`, which will ask you for a series of
credentials with links on where to find them (you'll need to be logged into
your google account and have access to our google cloud console). Follow along
with these instructions.

The `client_secret.json` identifies our 'app' and shouldn't ever change. The
bearer token can expire. If it does, you might see an error like
`invalid_grant` or something similar. To refresh this token you can run `gulp credentials:google`. If for some reason you do need to reset the client app
credentials you should run `gulp credentials:google_client`.

Once you've been properly authorized (which you shouldn't need to do again for
a good long while), the download task will convert each sheet of the
spreadsheet into a separate csv file in `src/template-files`, using the name of
the sheet as the name of the file. You can then import this data into your
templates using the process described in [using external data sources in your
HTML](#using-external-data-sources-in-your-html).

## Examples

- View [examples of common graphics here](/examples/), or check out the
  code in `examples/`.
- To build the example projects, run `gulp build:examples`.
- To add a new example to the page:
  - create a new directory in `examples/` with a directory name that describes the graphic.
  - Place your html, javascript and sass inside. You can also include assets and
    external data, preserving the same folder structure that you'd use
    within `src/`.
  - You're good to go!

## Sharing graphics outside of TMP

We can share graphics with partners by generating a code snippet that
loads a graphic onto a partner's story page. The partner must have the
ability to include inline javascript and html within their article.

To generate a graphic embed code, run `gulp build:embed`, which will set
`generate_external_embeds: true` within your `config.json`. You only
need to run this once. After that, any time you deploy your graphic, it
will publish your assets and html to s3 and upload an embed code to
Endrun. You can then find the embed snippet in the [graphics admin in
Endrun](https://www.themarshallproject.org/admin/graphics).

If you are embedding multiple graphics, you do _not_ need to include a
separate embed for script includes — they will be loaded by the embed
code.

Embeds should not rely on any external javascript or CSS that is
typically loaded on themarshallproject.org. To ensure that you aren't
relying on any external code, you can preview your embeds at
[localhost:3000/embeds/](/embeds).

### Legacy instructions - embedding as iframe

If a partner can't publish inline javascript in their CMS, you can
provide an iframe of a graphic. Getting one to send them can take a
little bit of work, especially for multiple graphics setups, but it's
doable.

1. A deployed graphic will be served to the public from
   `https://www.themarshallproject.org/embed/graphic/<graphic-id>` replacing
   `<graphic-id>` with your graphic's id, which you can find at
   https://www.themarshallproject.org/admin/graphics in the left-most column.
2. If everything works as expected at that url, skip to the last step. If not,
   it may because of some assumptions your code is making about the environment
   (fix these!) or it may be because you are using multiple graphics.
3. In multiple graphics setups the JS and CSS are bundled into a single package
   so they can be shared between all of the graphics. Each embedded graphic
   will need to individually include all of the assets it needs. The easiest
   solution to this is to add any script and style tags to an `embed` version
   of your graphic. Note that this is not as efficient as the way we do it
   within EndRun, so this should be a separate graphic with it's own
   slug/filename that is not included in the post. You can see an example of
   this setup
   [here](https://github.com/themarshallproject/miamioffender20180627/blob/master/src/map-embed.html).
4. You can now send the iframe to the partner with some sample code like this:
   `<iframe width="100%" height="900" src="https://www.themarshallproject.org/embed/graphic/<graphic-id>" frameborder="0"></iframe>`, replacing the graphic id again.

Note that it is up to you to make sure your graphic is responsive, and works
well within an iframe. It is up to the partner to make sure that the iframe is
suitably sized and resizes dynamically, perhaps using a tool like [NPR's
pym](http://blog.apps.npr.org/pym.js/).

## Running data analysis

When a project has data analysis associated with its graphic(s), you can
include code for the source data, analysis, and output data in the `analysis/`
folder. You can also set up workflows to run your analysis from scratch using
the `Makefile`. For example, `make all` would run the analysis workflow; `make clean` would remove all outputs from previous runs of the analysis; `make deploy` would upload data from the `output_data/` folder onto S3 for sharing.
See `Makefile` for more documentation of commands and to create your own
analysis workflows.

## Tips

- You can simplify the setup process a bit by creating a bash function to do
  the rote steps for you. Add this to your `~/.bashrc` or equivalent:

```sh
function newgraphic() {
  git clone git@github.com:themarshallproject/gfx-v2.git $1
  cd $1
  bash setup.sh
}
```

Run `source ~/.bashrc` (or just open a new terminal session). Now you can
create a new graphic with `newgraphic <slug>`, which will create the repo, put
you in it, and then run setup.

- Similarly you can add this function (in the same place), to make the cloning
  of existing graphics a little easier. h/t @tommeagher

```sh
function clonegraphic() {
  git clone git@github.com:themarshallproject/$1.git
  cd $1
  bash setup.sh
}
```

- You can get the most recent version of this tool by running
  `git pull updates master && npm install`.

## Other commands

There are a few other commands available that you might find useful. Especially
when working on developing this template. Review the bottom of `gulpfile.js`
for a full accounting.

1. `gulp reset:type` will allow you to change your initial choices made while
   setting up the repo. Handy if you made a mistake, or are just rearranging
   things.
2. `gulp credentials:endrun` will allow to enter a fresh API token.
3. `gulp credentials:github` will allow you to enter a new [personal Github access token](https://github.com/settings/tokens) when your old one expires.

## Running on non-Mac platforms

Theoretically the graphics rig should be supported by any platform that
supports node. In practice things are not always so simple. The most important
difference is around credential management. We utilize the macOS 'keychain' for
some added security on that platform. On other platforms we revert to plain-old
text files. The graphics rig will create a credentials file for you if it
doesn't already exist (defaults to `.credentials.json` in the project folder).
However to get the mac-style credential memory between projects you need to
take an additional step. To tell the rig where you want to store your
system-wide credentials, set the `CREDENTIALS_PATH` environment variable in
your `.bashrc` or equivalent. For example, I added this line to my bashrc:

`export CREDENTIALS_PATH=~/.ssh/.credentials.json`

(the ssh folder is convenient because it will already have appropriately
restrictive permissions, but you can put it anywhere).

It's possible you may also run into some difficulties with the packages that
require some compiled dependencies (notably node-sass). You're best bet is
google, but feel free to ask around if you do run into trouble!

## Editing this template

- Clone and push to a branch on this repo, then create a pull request.

- The setup process leaves behind a remote called `updates`. You can change
  this template by pushing commits there (`git push updates master`).

- In addition to the commands mentioned above, sometimes it is useful to edit
  this in conjunction with changes to EndRun. You can point deployments at a
  locally hosted EndRun by changing the `endrun_host` config parameter. Note
  that even if you do this, assets will still be uploaded to the real
  production s3 bucket, unless you also change the `bucket` parameter.

## Thoughts? Ideas? Issues?

Make an issue in this repo!
