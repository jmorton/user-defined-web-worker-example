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
      <button @click="run">Do It.</button>
    </div>
    <div>
      <h2>Output</h2>
      {{ output }}
    </div>
  </div>
</template>

<script>
import MonacoEditor from "@/components/MonacoEditor";
export default {
  name: "Home",
  components: {
    MonacoEditor,
  },
  data() {
    return {
      code: `function handler (data) { return data; }`,
      input: null,
      output: null,
      options: {},
    };
  },
  methods: {
    run(data) {
      try {
        const that = this;
        const wrapped = `${this.code};
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
