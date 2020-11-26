BREAKPOINTS = [];
STOPPED_AT = -1;
DEBUG = false;

PROGRAM_RUNNING = false;
RUN_START = 0;

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
  parent.scrollTo(0, parent.scrollHeight);
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
PRINTED_LINE = false;
const formatDuration = (time) => {
  const seconds = moment.duration(time).seconds();
  const minutes = moment.duration(time).minutes();
  const hours = moment.duration(time).hours();
  const millis = moment.duration(time).milliseconds();

  let out = ``;

  if (hours > 0) {
    out += hours + "hours ";
  }
  if (minutes > 0) {
    out += minutes + "min ";
  }
  if (seconds > 0) {
    out += seconds + "s ";
  }
  if (millis > 0) {
    out += millis + "ms ";
  }
  return out;
};

const EXECUTE_PROGRAM = () => {
  PROGRAM_RUNNING = true;
  RM.parentDiv.innerHTML = "";
  RM.memory = [];
  const programCode = document
    .getElementById("code")
    .value.replaceAll(/[^\.\,\<\>\+\-\[\]]/g, "");
  console.log(programCode);
  const STDIN = document.getElementById("STDIN").value.split("");
  //sd
  let MP = 0;
  let IP = 0;
  RM.addAddress(0);

  const callStack = [];
  if (DEBUG) document.getElementById(`mem_${MP}`).className += " MP";

  const interval = setInterval(() => {
    try {
      if (
        ((BREAKPOINTS.indexOf(IP) != -1 && !(IP < STOPPED_AT)) ||
          STOPPED_AT === IP) &&
        DEBUG
      ) {
        //debugger;
        if (STOPPED_AT < IP) STOPPED_AT = IP;

        if (!PRINTED_LINE) {
          const windowSize = 3;
          const snippet = programCode.substring(
            Math.max(IP - windowSize, 0),
            Math.min(IP + windowSize, programCode.length)
          );

          console.log(
            Math.max(IP - windowSize, 0),
            Math.min(IP + windowSize, programCode.length)
          );
          customConsole.write("");
          customConsole.write(snippet);
          let padd = "";

          for (let i = 0; i < Math.min(windowSize, IP); i++) padd += " ";

          customConsole.write(padd + "^");
          customConsole.write(padd + IP);
          customConsole.write("");
          PRINTED_LINE = true;
        }
        customConsole.endOfExecute();
      } else {
        PRINTED_LINE = false;
        if (DEBUG) {
          document.getElementById(
            `mem_${MP}`
          ).className = document
            .getElementById(`mem_${MP}`)
            .className.replace(" MP", "");
        }
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
            const newIP = callStack.pop();
            if (
              RM.getAddress(MP) != 0 &&
              !isNaN(RM.getAddress(MP)) &&
              RM.getAddress(MP) != undefined &&
              RM.getAddress(MP) != "NaN" &&
              RM.getAddress(MP) != "undefined"
            ) {
              if (IP + 1 === STOPPED_AT) {
                STOPPED_AT = newIP;
              }
              IP = newIP - 1; //-1, because loop adds one
            }
        }
        if (DEBUG) {
          document.getElementById(`mem_${MP}`).className += " MP";
          customConsole.endOfExecute();
        }
        IP++;
        if (IP >= programCode.length) {
          console.log(RUN_START);
          clearInterval(interval);
          customConsole.write(
            "Program finished after: " + formatDuration(new Date() - RUN_START)
          );
          customConsole.endOfExecute();
          PROGRAM_RUNNING = false;
        }
      }
    } catch (e) {
      PROGRAM_RUNNING = false;
      clearInterval(interval);
      customConsole.write(e);
      customConsole.endOfExecute();
    }
  }, 0);
};

const CONSOLE_DIV = document.getElementById("consoleDiv");
CONSOLE_BUFFER = "";
IS_EXECUTING = false;

const PROGRAM_ERR = () =>
  customConsole.write("Program not running or not in debug mode");

const PROGRAM_RUN_ERR = () => customConsole.write("Program already running");

const commands = {
  run: () => {
    commands.r();
  },
  r: (debug) => {
    if (!PROGRAM_RUNNING) {
      RUN_START = new Date();
      DEBUG = debug;
      EXECUTE_PROGRAM();
    } else {
      PROGRAM_RUN_ERR();
      customConsole.endOfExecute();
    }
  },
  help: () => commands.h(),
  h: () => {
    customConsole.write("This is a brainfuck debugger");
    customConsole.write("Basic commands:");
    customConsole.write("   run - runs the program (r)");
    customConsole.write(
      "   breakpoint <bp1> <bp2> ... <bpN> - sets a breakpoint (b)"
    );
    customConsole.write(
      "   debug - runs the program in debug mode - will stop at breakpoints (d)"
    );
    customConsole.write(
      "   step - executes the current command and stops at the next (s)"
    );
    customConsole.write(
      "   continue - continues code execution(will not work if you are located on a breakpoint) (c)"
    );
    customConsole.write("Here is a full list of commands:");
    customConsole.write(Object.keys(commands));
    customConsole.endOfExecute();
  },
  breakpoint: (...br) => {
    commands.b(...br);
  },
  b: (...br) => {
    if (br.length === 0) {
      customConsole.write(BREAKPOINTS);
    } else {
      BREAKPOINTS.push(...br.map((c) => parseInt(c)).filter((d) => d >= 0));
    }
    customConsole.endOfExecute();
  },
  step: () => {
    commands.s();
  },
  s: () => {
    if (PROGRAM_RUNNING || DEBUG) {
      STOPPED_AT++;
    } else {
      PROGRAM_ERR();
    }
    //customConsole.endOfExecute();
  },
  debug: () => {
    commands.d();
  },
  d: () => {
    if (!PROGRAM_RUNNING) {
      STOPPED_AT = -1;
      commands.r(true);
    } else {
      PROGRAM_RUN_ERR();
    }
    customConsole.endOfExecute();
  },
  continue: () => {
    commands.c();
  },
  c: () => {
    if (PROGRAM_RUNNING || DEBUG) {
      STOPPED_AT = -1;
    } else {
      PROGRAM_ERR();
    }
    customConsole.endOfExecute();
  },
  consoleLog: (...d) => {
    console.log(...d);
    customConsole.endOfExecute();
  },
  eval: (...data) => {
    eval(data.join(" "));
    customConsole.endOfExecute();
  },
};

let endsWithBuffer = false;

const customConsole = {
  getConsoleState: () => {
    const indexOfEnd = CONSOLE_DIV.value.lastIndexOf(">");
    let out = "";
    if (!endsWithBuffer || indexOfEnd == -1) out = CONSOLE_DIV.value;
    else out = CONSOLE_DIV.value.slice(0, indexOfEnd);

    return out;
  },
  appendToConsoleRaw: (data, isBuffer) => {
    //debugger;
    CONSOLE_DIV.value = customConsole.getConsoleState() + data;
    endsWithBuffer = isBuffer;
    CONSOLE_DIV.scrollTo(0, CONSOLE_DIV.scrollHeight);
  },
  REFRESH_CONSOLE: () => {
    //debugger;
    customConsole.appendToConsoleRaw(
      IS_EXECUTING ? "" : "> " + CONSOLE_BUFFER,
      !IS_EXECUTING
    );
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
    try {
      customConsole.write("$ " + command);
      cmd_split = command.split(" ");
      if (cmd_split[0] in commands) {
        commands[cmd_split[0]](...(cmd_split.slice(1) || []));
      } else {
        customConsole.write(
          `Unknown command: ${cmd_split[0]}, write h to get list of commands`
        );
        customConsole.endOfExecute();
      }
    } catch (e) {
      customConsole.write(`Err:${e}`);
      customConsole.endOfExecute();
    }
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
