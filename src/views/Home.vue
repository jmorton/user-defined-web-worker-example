<template>
  <div class="home">
    <div>
      <h2>Code</h2>
      <MonacoEditor
        theme="vs-dark"
        language="javascript"
        v-model="code"
        width="500px"
        height="280px"
        :options="options"
      />
    </div>
    <div>
      <h2>Data</h2>
      <MonacoEditor
        width="500px"
        height="280px"
        theme="vs-dark"
        language="json"
        v-model="input"
        @change="run"
      />
    </div>
    <div>
      <h2>Output</h2>
      {{ output }}
    </div>
  </div>
</template>

<script>
const DEFAULT_CODE = `const parser = P.regexp(/[0-9]+/).map(s => Number(s));

function handler (data) {
    return parser.parse(data);
}
`;

import MonacoEditor from "@/components/MonacoEditor";
export default {
  name: "Home",
  components: {
    MonacoEditor,
  },
  data() {
    return {
      code: DEFAULT_CODE,
      input: null,
      output: null,
      options: {},
    };
  },
  methods: {
    run(data) {
      try {
        const that = this;
        const wrapped = `
          self.importScripts(self.location.origin+"/parsimmon.js");
          const P = Parsimmon;
          ${this.code};
          self.addEventListener('message', (e) => {
            self.postMessage(handler.call(e, e.data));
          }, false);`;
        const blob = new Blob([wrapped]);
        const url = window.URL.createObjectURL(blob);
        const worker = new Worker(url);
        worker.onmessage = function (e) {
          that.output = e.data;
          window.URL.revokeObjectURL(url);
        };
        worker.onerror = function (e) {
          this.output = e;
          window.URL.revokeObjectURL(url);
        };
        worker.postMessage(data);
      } catch (err) {
        this.output = err;
        console.log(err);
      }
    },
  },
};
</script>

<style scoped>
.home {
  display: flex;
}
.home > div {
  margin-right: 1em;
}
.editor {
  width: 400px;
}
</style>
