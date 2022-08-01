<!--#
VERSION=0.5.
$-->
<p align="center">
  <img width="100px" src="./logo/lucid.svg" align="center"/>
  <h1 align="center">Lucid</h1>
  <p align="center">Lucid is a library, which allows you to create Cardano transactions and off-chain code for your Plutus contracts in JavaScript, Deno and Node.js.</p>

<p align="center">
    <img src="https://img.shields.io/github/commit-activity/m/berry-pool/lucid?style=for-the-badge" />
    <a href="https://www.npmjs.com/package/lucid-cardano">
      <img src="https://img.shields.io/npm/v/lucid-cardano?style=for-the-badge" />
    </a>
    <img src="https://img.shields.io/github/commit-activity/m/berry-pool/lucid?style=for-the-badge" />
     <a href="https://doc.deno.land/https://deno.land/x/lucid/mod.ts">
      <img src="https://img.shields.io/readthedocs/cardano-lucid?style=for-the-badge" />
    </a>
    <a href="https://www.npmjs.com/package/lucid-cardano">
      <img src="https://img.shields.io/npm/dw/lucid-cardano?style=for-the-badge" />
    </a>
    <img src="https://img.shields.io/npm/l/lucid-cardano?style=for-the-badge" />
    <a href="https://twitter.com/berry_ales">
      <img src="https://img.shields.io/twitter/follow/berry_ales?style=for-the-badge&logo=twitter" />
    </a>
  </p>

</p>

### Current Problem:
deno.land std.node module imports - 
```
To load an ES module, set "type": "module" in the package.json or use the .mjs extension.
error: Uncaught (in promise) SyntaxError: Cannot use import statement outside a module.
```

Using "type: module" in package.json creates new error. 

Documentation also says types do not work.

### Get started

#### NPM

```
npm install lucid-cardano@vasil
```

#### Deno 🦕

For JavaScript and TypeScript

```js
import { Lucid } from "https://deno.land/x/lucid@0.5.0/mod.ts";
```

#### Web

```html
<script type="module">
import { Lucid } from "https://unpkg.com/lucid-cardano@0.5.0/web/mod.js"
// ...
</script>
```

### 

### Build from source

Build NPM and Web target

```
deno task build
```

Outputs a `dist` folder

### Examples

[View examples](./src/examples/)

See [sample-ada-transfer](./src/examples/sample-ada-transfer) for end-to-end
browser integration usage.

### Basic usage

```js
import { Blockfrost, Lucid } from "lucid-cardano"; // NPM
// import { Blockfrost, Lucid } from "https://deno.land/x/lucid@0.5.0/mod.ts"; Deno

const lucid = await Lucid.new(
  new Blockfrost("https://cardano-testnet.blockfrost.io/api/v0", "<projectId>"),
  "Testnet",
);

// Assumes you are in a browser environment
const api = await window.cardano.nami.enable();
lucid.selectWallet(api);

const tx = await lucid.newTx()
  .payToAddress("addr...", { lovelace: 5000000n })
  .complete();

const signedTx = await tx.sign().complete();

const txHash = await signedTx.submit();

console.log(txHash);
```

### Test

```
deno task test
```

### Docs

[View docs](https://doc.deno.land/https://deno.land/x/lucid/mod.ts) 📖

You can generate documentation with:

```
deno doc
```

### Compatibilty

Lucid is an ES Module, so to run it in the browser any bundler which allows for
top level await and WebAssembly is recommended. If you use Webpack 5 enable in
the `webpack.config.js`:

```
experiments: {
    asyncWebAssembly: true,
    topLevelAwait: true,
    layers: true // optional, with some bundlers/frameworks it doesn't work without
  }
```

To run the library in Node.js you need to set `{"type" : "module"}` in your
project's `package.json`. Otherwise you will get import issues.

<br />
This library is built on top of a customized version of the serialization-lib (cardano-multiplatform-lib).

Link: https://github.com/Berry-Pool/cardano-multiplatform-lib/tree/vasil

Branch: **vasil**

Commit hash: **9891966de6cbd82ff509c80e6440586af64a2278**
