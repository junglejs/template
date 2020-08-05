const chokidar = require("chokidar");
const { fork } = require("child_process");

const restartProcess = (childProcess) => {
  try {
    childProcess.kill("SIGHUP");
    const [_, command, ...args] = process.argv;
    childProcess = fork("./app.js", args, {
      detached: true,
      stdio: "inherit",
    }).unref();
  } catch (err) {
    console.log(err);
  } finally {
    process.exit();
  }
};

const main = async () => {
  let watcher;
  console.log(
    `cmd+C will not work! Use 'kill -15 ${process.pid}' to kill this process.`
  );
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
};

main();
