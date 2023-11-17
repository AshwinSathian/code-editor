addEventListener("message", ({ data }) => {
  try {
    let logs = [];
    const originalConsoleLog = console.log;
    console.log = (...args) => {
      logs.push(args.join(" "));
    };

    eval(data.code);

    console.log = originalConsoleLog;

    postMessage({ success: true, result: logs.join("\n") });
  } catch (error) {
    postMessage({ success: false, error: error.message });
  }
});
