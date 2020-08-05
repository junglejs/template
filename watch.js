const chokidar = require("chokidar");
const { fork } = require("child_process");

const restartProcess = (childProcess) => {
  try {
    childProcess.kill("SIGTERM");
    const [_, command, ...args] = process.argv;
    childProcess = fork("./app.js", args, {
      detached: true,
      stdio: "inherit",
    });
  } catch (err) {
    console.log(err);
  } finally {
    process.exit();
  }
};

const main = async () => {
  let watcher;
  const [_, command, ...args] = process.argv;
  const watchedFiles = args.reduce((arr, arg, i) => {
    if (arg === "--watch" && typeof args[i + 1] === "string") {
      return [...arr, args[i + 1]];
    }
    return arr;
  }, []);
  watcher = chokidar.watch(["src", ...watchedFiles]);
  const childProcess = fork("./app.js", args, {
    detached: true,
    stdio: "inherit",
  });
  await !!childProcess;
  watcher.on("change", (path) => {
    restartProcess(childProcess);
  });
  process.on("SIGINT", function () {
    childProcess.kill("SIGTERM");
  });
};

main();
