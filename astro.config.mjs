import { defineConfig } from "astro/config";

const repository = process.env.GITHUB_REPOSITORY?.split("/")[1];
const isUserSite = repository?.endsWith(".github.io");
const base = process.env.PUBLIC_BASE_PATH ?? (repository && !isUserSite ? `/${repository}` : undefined);

export default defineConfig({
  base,
  output: "static"
});
