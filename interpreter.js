DATA_PARSER = (data) => parseInt(data);

const createMemoryDiv = (idx, parent) => {
  const newE = document.createElement("div");
  newE.className = "mem_div";
  newE.id = `mem_${idx}`;

  const idx_div = document.createElement("div");
  idx_div.innerText = idx;
  idx_div.className = "mem_div_idx";
  newE.appendChild(idx_div);

  const mem_value = document.createElement("div");
  mem_value.id = `mem_${idx}_value`;
  mem_value.className = "mem_div_value";
  mem_value.innerText = 0;
  newE.appendChild(mem_value);

  parent.appendChild(newE);
};

const RM = {
  parentDiv: document.getElementById("memory"),
  memory: [],
  addAddress: (index) => {
    RM.memory[index] = 0;
    createMemoryDiv(index, RM.parentDiv);
  },
  setAddress: (index, value) => {
    RM.memory[index] = parseInt(value);
    document.getElementById(`mem_${index}_value`).innerText = DATA_PARSER(
      value
    );
  },
  getAddress: (index) => (index < 0 ? 0 : RM.memory[index]),
  incAddress: (index) => {
    RM.setAddress(index, DATA_PARSER(RM.memory[index] + 1));
  },
  decAddress: (index) => {
    RM.setAddress(index, DATA_PARSER(RM.memory[index] - 1));
  },
};
//ss
const EXECUTE_PROGRAM = () => {
  RM.parentDiv.innerHTML = "";
  RM.memory = [];
  const programCode = document.getElementById("code").value;
  const STDIN = document.getElementById("STDIN").value.split("");
  //sd
  let MP = 0;
  RM.addAddress(0);

  const callStack = [];

  for (let IP = 0; IP < programCode.length; IP++) {
    const instruction = programCode.charAt(IP);
    switch (instruction) {
      case ">":
        MP++;
        if (RM.memory.length <= MP) RM.addAddress(MP);
        break;
      case "<":
        MP--;
        break;
      case "+":
        RM.incAddress(MP);
        break;
      case "-":
        RM.decAddress(MP);
        break;
      case ".":
        customConsole.write(DATA_PARSER(RM.getAddress(MP)));
        break;
      case ",":
        RM.setAddress(MP, STDIN.shift());
        break;
      case "[":
        callStack.push(IP);
        break;
      case "]":
        if (
          RM.getAddress(MP) != 0 &&
          !isNaN(RM.getAddress(MP)) &&
          RM.getAddress(MP) != undefined &&
          RM.getAddress(MP) != "NaN" &&
          RM.getAddress(MP) != "undefined"
        )
          IP = callStack.pop() - 1; //-1, because loop adds one
    }
  }
};

const CONSOLE_DIV = document.getElementById("consoleDiv");
CONSOLE_BUFFER = "";
IS_EXECUTING = false;

const commands = {
  run: () => {
    EXECUTE_PROGRAM();
    customConsole.endOfExecute();
  },
  r: () => {
    commands.run();
  },
  h: () => {
    customConsole.write(Object.keys(commands));
  },
  consoleLog: console.log,
  eval: (...data) => {
    eval(data.join(" "));
  },
};
const customConsole = {
  getConsoleState: () => {
    const indexOfEnd = CONSOLE_DIV.value.lastIndexOf(">");
    if (indexOfEnd == -1) return CONSOLE_DIV.value;
    else return CONSOLE_DIV.value.slice(0, indexOfEnd);
  },
  appendToConsoleRaw: (data) => {
    CONSOLE_DIV.value = customConsole.getConsoleState() + data;
    CONSOLE_DIV.scrollTo(0, CONSOLE_DIV.scrollHeight);
  },
  REFRESH_CONSOLE: () => {
    customConsole.appendToConsoleRaw(IS_EXECUTING ? "" : "> " + CONSOLE_BUFFER);
  },
  write: (data) => {
    customConsole.appendToConsoleRaw(data + "\n");
    customConsole.REFRESH_CONSOLE();
  },
  endOfExecute: () => {
    IS_EXECUTING = false;
    customConsole.REFRESH_CONSOLE();
  },
  onExecute: (command) => {
    customConsole.write("$ " + command);
    cmd_split = command.split(" ");
    if (cmd_split[0] in commands) {
      commands[cmd_split[0]](...(cmd_split.slice(1) || []));
    } else {
      customConsole.write(
        `Unknown command: ${cmd_split[0]}, write h to get list of commands`
      );
    }
    customConsole.endOfExecute();
  },
};

CONSOLE_DIV.addEventListener("keydown", (e) => {
  //console.log(e);
  if (IS_EXECUTING) {
    //handle input
  } else {
    if (e.key.length == 1) {
      console.log(e);
      CONSOLE_BUFFER += e.key;
      customConsole.REFRESH_CONSOLE();
    } else {
      switch (e.key) {
        case "Enter":
          IS_EXECUTING = true;
          customConsole.onExecute && customConsole.onExecute(CONSOLE_BUFFER);
          CONSOLE_BUFFER = "";
          customConsole.REFRESH_CONSOLE();
          break;
        case "Backspace":
          CONSOLE_BUFFER = CONSOLE_BUFFER.slice(0, CONSOLE_BUFFER.length - 1);
          customConsole.REFRESH_CONSOLE();
      }
    }
  }
});
customConsole.REFRESH_CONSOLE();
