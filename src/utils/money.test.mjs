import test from "node:test";
import assert from "node:assert/strict";
import {parseMoney,formatMoney,compactMoney,MAX_MONEY} from "./money.js";
test("int64 values never pass through Number",()=>{assert.equal(parseMoney("9223372036854775807"),MAX_MONEY);assert.equal(compactMoney("9223372036854775807"),"35184372088831O 63A 63B 63F");});
test("legacy safe values and zero remain readable",()=>{assert.equal(formatMoney(70),"1 bronze 6 fer");assert.equal(compactMoney(0),"0F");});
test("invalid, fractional and lossy values are not silently converted to zero",()=>{for(const x of [null,undefined,NaN,-1,1.5,true,"01","1e3","9223372036854775808",Number.MAX_SAFE_INTEGER+1]){assert.equal(parseMoney(x),null);assert.equal(compactMoney(x),"—");}});
