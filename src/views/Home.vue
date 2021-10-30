<template>
  <div class="container">
    <div class="code">
      <MonacoEditor
        theme="vs-dark"
        language="javascript"
        v-model="code"
        width="100%"
        height="100%"
        :options="options"
      />
    </div>
    <div class="data">
      <MonacoEditor
        width="100%"
        height="100%"
        theme="vs-dark"
        language="json"
        v-model="input"
        @change="run"
      />
    </div>
    <div class="result">
      <MonacoEditor
        width="100%"
        height="100%"
        theme="vs-dark"
        language="json"
        :value="result"
      />
      <button @click="test">Refresh</button>
    </div>
  </div>
</template>

<script>
const DEFAULT_CODE = `const P = Parsimmon;
const parser = P.regexp(/[0-9]+/).map(s => Number(s));
return parser.parse(this);`;

import MonacoEditor from "@/components/MonacoEditor";
export default {
  name: "Home",
  components: {
    MonacoEditor,
  },
  data() {
    return {
      code: DEFAULT_CODE,
      input: "123",
      output: null,
      options: {},
      worker: null,
    };
  },
  mounted() {
    this.test();
  },
  computed: {
    result() {
      return JSON.stringify(this.output, null, 2);
    },
  },
  methods: {
    rework() {
      if (this.worker) {
        this.worker?.terminate();
      }
      const component = this;
      this.worker = new Worker("/eval-web-worker.js");
      this.worker.onmessage = function (e) {
        component.output = e.data;
      };
      this.worker.postMessage({
        code: this.code,
        imports: [
          "https://cdnjs.cloudflare.com/ajax/libs/parsimmon/1.18.0/parsimmon.umd.min.js",
        ],
      });
    },
    run(data) {
      try {
        this.worker.postMessage({ data });
      } catch (err) {
        this.output = err;
        console.log(err);
      }
    },
    test() {
      this.rework();
      this.worker.postMessage({ data: this.input });
    },
  },
};
</script>

<style scoped>
.container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: 1fr 1fr;
  gap: 12px 12px;
  grid-auto-flow: row;
  grid-template-areas:
    "code code"
    "data result";
  width: 100%;
  height: 90%;
}

.code {
  grid-area: code;
}

.data {
  grid-area: data;
}

.result {
  grid-area: result;
}
</style>
