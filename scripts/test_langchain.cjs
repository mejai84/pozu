const { PromptTemplate } = require('@langchain/core/prompts');
try {
  PromptTemplate.fromTemplate('{ "detalle": "hola" }');
} catch (e) {
  console.log(e.message);
}
