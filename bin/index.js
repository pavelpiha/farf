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

const checkDepth = (options) => {
  if (Number.isInteger(options.d)) {
    return true;
  }
  throw new Error("Error: Depth value is wrong");
};

const checkName = (options) => {
  if (options.o.length > 32) {
    throw new Error(`Error: Old name value is wrong`);
  } else if (options.n.length > 32) {
    throw new Error(`Error: New name value is wrong`);
  } else {
    return true;
  }
};

const checkOptions = (options) => {
  if (checkDepth(options) && checkName(options)) {
    return true;
  }
};

const options = yargs
  .usage("Usage: -d <depth> -o <old> -n <new> ")
  .option("d", {
    alias: "depth",
    describe: "depth for search",
    type: "number",
  })
  .option("o", {
    alias: "old",
    describe: "Old name",
    type: "string",
  })
  .option("n", {
    alias: "new",
    describe: "New name",
    type: "string",
  })
  .check((options) => checkOptions(options))
  .example(
    "farf -d 5 -o old -n new",
    "Change all files and directories containing 'old' string in the name into 'new' in 5 directories deep"
  ).argv;

let [, , depth, oldFileName, newFileName] = process.argv;

const corePath = "./";
// const corePath = "./examples";
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
const isOptionsAvailable = () =>
  options.o && Number.isInteger(options.d) && options.n;

const checkFlagParameters = () => {
  return new Promise((resolve) => {
    resolve(isOptionsAvailable());
  });
};

const initValues = (isArgsAvailable) => {
  if (isArgsAvailable) {
    depth = options.d;
    oldFileName = options.o;
    newFileName = options.n;
  }
};

const getInitValues = (isArgsAvailable) => {
  return new Promise((resolve) => {
    resolve(initValues(isArgsAvailable));
  });
};

const main = async () => {
  try {
    const isFlagParametersAvailable = await checkFlagParameters();
    if (isFlagParametersAvailable) {
      await getInitValues(true);
      runRenaming();
    } else {
      yargs.showHelp();
      process.exit();
    }
  } catch (err) {
    process.stdout.write(err);
    process.exit();
  }
};

main();
