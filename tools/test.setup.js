const jsdom = require('jsdom');
const { JSDOM } = jsdom;
const dom = new JSDOM(`<!DOCTYPE html><p>Hello world</p>`);

global.document = dom.window.document;
global.window = dom.window;
global.navigator = dom.window.navigator;
