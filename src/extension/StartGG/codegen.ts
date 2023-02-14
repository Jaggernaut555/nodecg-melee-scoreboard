import { CodegenConfig } from "@graphql-codegen/cli";
import * as dotenv from "dotenv";

dotenv.config();

const token = process.env.STARTGG_ACCESS_TOKEN;

const config: CodegenConfig = {
  schema: [
    {
      "https://api.start.gg/gql/alpha": {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    },
  ],
  documents: [
    "src/extension/StartGG/**/*.ts",
    "!src/extension/StartGG/gql/**/*",
  ],
  ignoreNoDocuments: true, // for better experience with the watcher
  generates: {
    "./src/extension/StartGG/gql/": {
      preset: "client",
      plugins: [],
    },
  },
};

export default config;

// To update schema (if out of date)
// Set STARTGG_ACCESS_TOKEN in a local .env file
// npm run codegen
// DO NOT COMMIT A TOKEN

// schema info at https://developer.start.gg/reference/query.doc.html
// and tested at https://developer.start.gg/explorer/
