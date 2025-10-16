import defaultParserInterface from '../utils/defaultParserInterface'
import parser from './astserde.wasm.js';

const ID = 'lexer';

export default {
  ...defaultParserInterface,

  id: ID,
  displayName: ID,
  version: parser.version,
  homepage: `https://www.moonbitlang.com/`,
  _ignoredProperties: new Set(['']),
  locationProps: new Set(['loc']),

  loadParser(callback) {
    WebAssembly.instantiate(parser.binary, {},
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
    const result = parser.parse(code, "lexer")
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
