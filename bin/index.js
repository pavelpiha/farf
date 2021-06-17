#! /usr/bin/env node

const yargs = require("yargs");
const fs = require("fs");
var readlineSync = require("readline-sync");

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
    describe: "depth for search",
    type: "number",
  })
  .option("f", {
    alias: "old-file-name",
    describe: "Old name",
    type: "string",
  })
  .option("n", {
    alias: "new-file-name",
    describe: "New name",
    type: "string",
  })
  .example(
    "farf -d 5 -f old -n new",
    "Change all files and directories containing 'old' string in the name into 'new' in 5 directories deep"
  )
  .example(
    "farf 5 old new",
    "Change all files and directories containing 'old' string in the name into 'new' in 5 directories deep"
  ).argv;

const [, , depth, oldFileName, newFileName] = process.argv;

const corePath = "./";
let currentPath = "";
let currentDepth = 0;

const checkIfFileContainsSubName = (fileName) => fileName.includes(oldFileName);

const goThroughEachPath = (upperPath, paths, currentDepth, maxDepth) => {
  paths.forEach((path) => {
    const fileContainsSubName = checkIfFileContainsSubName(path);
    let newPath = path;
    let oldLongPath = upperPath.concat("/", path);
    if (fileContainsSubName) {
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
  currentPath = path ? currentPath.concat("/", path) : corePath;
  currentDepth = depth;
  if (typeof +maxDepth === "number" && currentDepth <= maxDepth) {
    currentDepth++;
    let paths = [];
    try {
      paths = fs.readdirSync(currentPath);
    } catch (err) {
      process.stdout.write(
        `\n Renaming failed!\n Error: no such file or directory\n`
      );
      process.exit();
    }
    goThroughEachPath(currentPath, paths, currentDepth, maxDepth);
  }
};

const getConfirmation = () => {
  let answer = readlineSync.question(
    " Are you sure to continue with such depth? (YES/NO): "
  );
  answer = answer.toString().trim().toLocaleLowerCase();
  if (answer === "yes" || answer === "y") {
    return true;
  } else {
    return false;
  }
};

const checkSearchDepth = () => {
  if (depth > 10 && depth <= 15) {
    return getConfirmation();
  } else if (depth > 15) {
    process.stdout.write(" The depth is too big. Max value is 15\n");
    return false;
  } else {
    return true;
  }
};

const runRenaming = () => {
  setTimeout(() => {
    let isDepthCorrect = checkSearchDepth();
    if (isDepthCorrect) {
      let promise = new Promise((resolve) => {
        setTimeout(() => {
          readDir("", 0, depth);
          resolve();
        }, 0);
      });
      promise
        .then(() => {
          process.stdout.write("\n Renaming finished\n");
          process.exit();
        })
        .catch((error) => {
          process.stdout.write(`\n Renaming failed!\n ${error}`);
        });
    }
  }, 0);
};

if (
  (options.f && options.d && options.n) ||
  (depth && oldFileName && newFileName)
) {
  runRenaming(depth);
} else {
  yargs.showHelp();
  process.exit();
}
