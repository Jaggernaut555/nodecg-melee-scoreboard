import { NodeCG } from "nodecg-types/types/server";

let nodecg: NodeCG;

export default {
  get nodecg() {
    return nodecg;
  },

  set nodecg(node) {
    nodecg = node;
  },
};
