Docubricks viewer
===========================

Viewer for [docubricks](http://docubricks.com/) - high quality Open Science Hardware documentation.  Docubricks works like an open-source Instructables, turning easily-interpreted XML files into nicely formatted instructions.

### Building
This viewer is built using React and Webpack, and renders the instructions using client-side code that runs in most modern web browsers.  You'll need to install node.js and npm, and then you can build with:


#### Build
```
$ npm install
$ webpack
```
This produces the ``viewerbundle.js`` script that you can use together with one of the included HTML files to view docubricks XML files in a browser.

#### Devbuild
```
$ npm install -g webpack-dev-server
$ webpack-dev-server --host 0.0.0.0 --port 8080

```
After starting the development server, go to http://localhost:8080/viewertest-xml-github.html to view the OpenFlexure Microscope documentation as an example.  You can view any DocuBricks project that can be retrieved via HTTP requests by specifying its URL in the ``docubricks_xml_url`` ``<div>`` element (in ``viewertest-xml-github.html``).  Security restrictions mean the JavaScript code that renders documentation can't access files on your hard drive - so the easiest way to view files you have locally is to place them in the ``WebContent`` folder in the "project" directory.

### Deploying and using
Using this viewer on your GitHub project is simple; first, switch to your ``gh_pages`` branch, then copy the ``css`` folder, ``viewerbundle.js``, ``node_modules/react``, ``node_modules/react_dom``, and one of the HTML files into a folder in the repository.  Set the URL to point to the raw version of your XML file (i.e. the address you get when you click the "raw" link on GitHub).  Now, when you visit that HTML page, you should see your documentation nicely rendered.  The OpenFlexure Microscope has an example of this - see the [docubricks folder there](https://github.com/rwb27/openflexure_microscope/tree/gh-pages/docubricks) for details.


### Docubricks structure:

```
The following lists define the elements of the DocuBricks XML format

<docubricks> tag for the start of DocuBricks documentation of the project; the brackets are not written in the following definitions

author id(string):
  name (string)
  email (string)
  orcid (string)
  affiliation (string)

part id(string):
  name (string)
  description (string)
  supplier (string)
  supplier_part_num (string)
  manufacturer_part_num (string)
  url (string) link to an internet source of the part
  material_amount (string)
  material_unit (string)
  media: file(s) (url) images, videos, CAD files, and more
  manufacturing_instruction: step(s): step by step instructions
      description (string)
      media: file(s) (url) (NB the url is a property of the file, not a sub-element)

brick id(string):
  name (string)
  abstract (string)
  long_description (string)
  notes (string)
  media: file (url)
  license (string)
  author(s) (id(string))
  function(s) (id(string)):
      description (string) name of the function
      implementation(s) (type(“brick” or “part”), id(string) of brick or part respectively, quantity (string) how many pieces of this implementation are needed)

  assembly_instruction: step(s): step by step instructions
      description (string)
      media: file(s) (url)
      component(s) (id(string) of function) local reference to functions in the brick needed as component in this assembly step

  custom_instruction(s) type(string): step(s): other step by step instructions of custom type e.g. safety, testing, calibration, user_manual, improvement_suggestions, etc.
      description (string)
      media: file(s) (url)
</ docubricks >

```
