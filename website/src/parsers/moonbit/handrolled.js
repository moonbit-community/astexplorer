import defaultParserInterface from '../utils/defaultParserInterface'
import astserde from './astserde.wasm.js';

const ID = 'mbt';

export default {
  ...defaultParserInterface,

  id: ID,
  displayName: "handrolled",
  version: "0.1.0",
  homepage: `https://www.moonbitlang.com/`,
  _ignoredProperties: new Set(['']),
  locationProps: new Set(['loc']),

  loadParser(callback) {
    WebAssembly.instantiate(astserde, {},
      { builtins: ["js-string"], importedStringConstants: "_", })
      .then(({ instance }) => {
        console.log(instance.exports)
        callback(instance.exports)
      });
  },

  parse(parser, code) {
    this.lineOffsets = [];
    let index = 0;
    do {
      this.lineOffsets.push(index);
    } while ((index = code.indexOf('\n', index) + 1)); // eslint-disable-line no-cond-assign
    const result = parser.parse(code, "handparser")
    return JSON.parse(result)
  },

  getNodeName(node) {
    return node._type;
  },

  nodeToRange(node) {
    if (node.loc) {
      return [node.loc.start, node.loc.end].map(
        ({ line, column }) => this.lineOffsets[line - 1] + column - 1,
      );
    }
    if (node.start && node.end) {
      return [node.start, node.end].map(
        ({ line, column }) => this.lineOffsets[line - 1] + column - 1,
      );
    }
  },
};
