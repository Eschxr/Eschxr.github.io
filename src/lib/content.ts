import site from "../content/site.json";
import projects from "../content/projects.json";

export type SiteContent = typeof site;
export type Project = (typeof projects)[number];

export { projects, site };
