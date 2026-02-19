import { Database } from "bun:sqlite";

export const db = new Database("data/vocab.db", { create: true });

db.run("PRAGMA journal_mode = WAL"); //uda a forma como o SQLite gerencia escritas no arquivo
db.run("PRAGMA foreign_keys = ON"); //por padrão o SQLite ignora chaves estrangeiras,