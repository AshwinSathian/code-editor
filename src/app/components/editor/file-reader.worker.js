addEventListener("message", (event) => {
  const file = event.data;

  if (!file) {
    postMessage({ success: false, error: "No file provided" });
    return;
  }

  const reader = new FileReader();
  reader.onload = () => {
    postMessage({ success: true, code: reader.result });
  };
  reader.onerror = (error) => {
    postMessage({ success: false, error: error.message });
  };

  reader.readAsText(file);
});
