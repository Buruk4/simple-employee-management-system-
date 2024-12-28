import sqlite3 from "sqlite3";
import { open } from "sqlite";

const createTable = async (db) => {
  let query = `
     CREATE TABLE IF NOT EXISTS employees (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        firstName TEXT NOT NULL,
        lastName TEXT NOT NULL,
        email TEXT NOT NULL,
        startDate DATE NOT NULL,
        isActive BOOLEAN NOT NULL,
        salaryUSD INTEGER NOT NULL,
        localCurrency TEXT NOT NULL
        )`;
  await db.run(query);
};

let _db;

const getDB = async () => {
  if (!_db) {
    _db = await open({
      filename: "data.sqlite3",
      driver: sqlite3.Database,
    });
    await createTable(_db);
  }
  return _db;
};

const closeDB = async () => {
  if (_db) {
    await _db.close();
    _db = undefined;
  }
};

export const getAllEmployees = async () => {
  const db = await getDB();
  const rows = await db.all("SELECT * FROM employees");
  const employees = rows.map((r) => {
    r.isActive = Boolean(r.isActive);
    return r;
  });
  await closeDB();
  return employees;
};

export const insertEmployee = async (employee) => {
  const insertQuery = `
    INSERT INTO employees (
   firstName,
    lastName,
     email,
      startDate,
       isActive, 
       salaryUSD,
        localCurrency) VALUES (?,?,?,?,?,?,?)`;

  const values = [
    employee.firstName,
    employee.lastName,
    employee.email,
    String(employee.startDate),
    Number(employee.isActive),
    employee.salaryUSD,
    employee.localCurrency,
  ];
  const db = await getDB();
  await db.run(insertQuery, values);
  await closeDB();
};
