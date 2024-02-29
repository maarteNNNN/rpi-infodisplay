const console = document.getElementById('console');

window.electronAPI.setConsoleText((value) => {
  // const oldValue = Number(counter.innerText)
  // const newValue = oldValue + value
  console.innerText = value;
});
