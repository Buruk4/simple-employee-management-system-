// import employees from "./data.json" assert { type: "json" };

import { getAllEmployees, insertEmployee } from "./database.js";

import { getCurrency, getSalary } from "./currency.js";
// import { loadData, writeData } from "./data.js";

let employees = [];
let currencyData;

// loading data and writing data to file system

import createPrompt from "prompt-sync";
let prompt = createPrompt();

let logEmployee = (employee) => {
  Object.entries(employee).forEach((entry) => {
    if (entry[0] !== "salaryUSD" || entry[0] !== "localCurrency") {
      console.log(`${entry[0]}: ${entry[1]}`);
    }
  });
  console.log(`Salary USD ${getSalary(employee.salaryUSD, "USD")}`);
  console.log(
    `Local salary ${getSalary(
      employee.salaryUSD,
      employee.localCurrency,
      currencyData
    )}`
  );
};

function getInput(promptText, validator, transformer) {
  let value = prompt(promptText);

  if (validator && !validator(value)) {
    console.error("invalid input");
    return getInput(promptText, validator, transformer);
  }
  if (transformer) {
    return transformer(value);
  }
  return value;
}

const getNextEmployee = () => {
  if (employees.length === 0) {
    return 1;
  }
  const maxId = Math.max(...employees.map((e) => e.id));
  return maxId + 1;
};

const isCurrencyvalid = (codes) => {
  const currencyCodes = Object.keys(currencyData.rates);
  return currencyCodes.indexOf(codes) > -1;
};

const myvalidator = (min, max) => {
  return (input) => {
    let numValue = Number(input);
    if (!Number.isInteger(numValue) || numValue < min || numValue > max) {
      return false;
    }
    return true;
  };
};

const isStringInputValid = (input) => {
  return input ? true : false;
};

const isBooleanVaild = (input) => {
  return input === "yes" || input == "no";
};

// application commands
function listEmployee() {
  console.log("List of Employees:--------------------------------------");

  employees.forEach((e) => {
    logEmployee(e);
    console.log("");
    prompt("press enter to continue...");
  });
  console.log("employee list is ended");
}

async function addEmployee() {
  console.log("Add a new employee--------------------------------------");
  console.log("");
  let employee = {};

  employee.id = getNextEmployee();
  employee.firstName = getInput("first Name :", isStringInputValid);
  employee.lastName = getInput("last name :", isStringInputValid);
  employee.email = getInput("email :", isStringInputValid);
  let startDateYear = getInput("started year :", myvalidator(1990, 2022));
  let startDateMonth = getInput("started month(1-12) : ", myvalidator(1, 12));
  let startDateDay = getInput("started day (1-30): ", myvalidator(1, 30));

  employee.startDate = new Date(startDateYear, startDateMonth, startDateDay);
  employee.isActive = getInput(
    "is active (YES OR NO) :",
    isBooleanVaild,
    (i) => i == "yes"
  );
  employee.salaryUSD = getInput(
    "Annual salary in USD : ",
    myvalidator(10000, 100000)
  );
  employee.localCurrency = getInput(
    "Local currency (3 letter code): ",
    isCurrencyvalid
  );
  await insertEmployee(employee);
  console.log("New Employee Added:", JSON.stringify(employee, null, 2));
}

const serachById = () => {
  const id = getInput("EmployeeId : ", null, Number);
  const result = employees.find((e) => e.id === id);
  if (result) {
    console.log("");
    logEmployee(result);
  } else {
    console.log("no result");
  }
};

const searchByName = () => {
  const firstNameSearch = getInput("First name : ")?.toLowerCase();
  const lastNameSearch = getInput("Last name : ")?.toLowerCase();

  const result = employees.filter((e) => {
    if (
      firstNameSearch &&
      !e.firstName?.toLowerCase().includes(firstNameSearch)
    ) {
      return false;
    }
    if (lastNameSearch && !e.lastName?.toLowerCase().includes(lastNameSearch)) {
      return false;
    }
    return true;
  });

  if (result.length === 0) {
    console.log("No employees found with the given criteria.");
    return;
  }

  result.forEach((e, index) => {
    console.log("");
    console.log(`Search result ${index + 1}`);
    logEmployee(e);
  });
};

const main = async () => {
  const command = process.argv[2]?.toLowerCase(); // Ensure command is valid
  switch (command) {
    case "list":
      listEmployee();
      break;
    case "add":
      addEmployee();
      break;
    case "search-by-id":
      serachById();
      break;
    case "search-by-name":
      searchByName();
      break;
    default:
      console.log("Unsupported command. Use 'list' or 'add'.");
      process.exit(1);
  }
};

Promise.all([getAllEmployees(), getCurrency()])
  .then((results) => {
    employees = results[0];
    currencyData = results[1];
    return main();
  })
  .catch((error) => {
    console.error("cannot complete");
    throw error;
  });
