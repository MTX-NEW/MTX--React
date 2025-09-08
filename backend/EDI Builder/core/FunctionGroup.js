import { SegmentGS } from '../segments/SegmentGS.js';
import { Transaction } from './Transaction.js';

export class FunctionGroup {
  constructor(functionalIdCode, controlNumber, version) {
    this.controlNumber = controlNumber;
    this.gs = new SegmentGS(controlNumber, new Date());
    this.transactions = [];
  }

  addTransaction(transactionSetControlNumber = 1) {
    const transaction = new Transaction(transactionSetControlNumber);
    this.transactions.push(transaction);
    return transaction;
  }

  createGESegment() {
    const ge = {
      tag: 'GE',
      fields: [this.transactions.length.toString(), this.controlNumber.toString()]
    };
    return ge;
  }

  toString() {
    const transactionStrings = this.transactions.map(t => t.toString()).join('\n');
    return `${this.gs.toString()}\n${transactionStrings}\nGE*${this.transactions.length}*${this.controlNumber}~`;
  }
}
