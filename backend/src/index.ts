import { doGet } from "./doGet";
import { doPost } from "./doPost";

Object.assign(globalThis, { doGet, doPost });