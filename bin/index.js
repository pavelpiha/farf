#! /usr/bin/env node

const yargs = require("yargs");
const fs = require("fs");
const { number } = require("yargs");
yargs
  .showHelpOnFail()
  .version()
  .alias("version", "v")
  .describe("version", "Show version information")
  .help()
  .alias("help", "h");

const options = yargs
  .usage("Usage: -d <depth> -f <old-file-name> -n <new-file-name> ")
  .option("d", {
    alias: "depth",
    describe: "depth to search",
    type: "number",
  })
  .option("f", {
    alias: "old-file-name",
    describe: "New file name",
    type: "string",
  })
  .option("n", {
    alias: "new-file-name",
    describe: "Your name",
    type: "string",
  })
  .example(
    "$0 -d 5 -f file1 -n file2",
    "rename all files containing 'file1' into 'file2' in 5 dirs deep"
  )
  .example(
    "$0 5 file1 file2",
    "rename all files containing 'file1' into 'file2' in 5 dirs deep"
  ).argv;

const [, , depth, oldFileName, newFileName] = process.argv;

const corePath = "./examples";
let currentPath = "";
let currentDepth = 0;
const checkIfFileContainsSubName = (fileName) => fileName.includes(oldFileName);

const goThroughEachPath = (upperPath, paths, currentDepth, maxDepth) => {
  paths.forEach((path) => {
    const fileContainsSubName = checkIfFileContainsSubName(path);
    let newPath = path;
    let oldLongPath = upperPath.concat("/", path);
    if (fileContainsSubName === true) {
      newPath = path.replace(oldFileName, newFileName);
      let newLongPath = upperPath.concat("/", newPath);
      fs.renameSync(oldLongPath, newLongPath);
      oldLongPath = newLongPath;
    }
    if (fs.lstatSync(oldLongPath).isDirectory()) {
      readDir(newPath, currentDepth, maxDepth);
    }
  });
};

const readDir = (path, depth, maxDepth) => {
  if (path) {
    currentPath = currentPath.concat("/", path);
  } else {
    currentPath = corePath;
  }
  currentDepth = depth;
  if (typeof +maxDepth === "number" && currentDepth <= maxDepth) {
    currentDepth++;
    const paths = fs.readdirSync(currentPath);
    goThroughEachPath(currentPath, paths, currentDepth, maxDepth);
  }
};

if (
  (options.f && options.d && options.n) ||
  (depth && oldFileName && newFileName)
) {
  readDir("", 0, depth);
} else {
  yargs.showHelp();
}

process
  .on("unhandledRejection", (reason, p) => {
    console.error(reason, "Unhandled Rejection at Promise", p);
  })
  .on("uncaughtException", (err) => {
    console.error(err, "Uncaught Exception thrown");
    process.exit(1);
  });
