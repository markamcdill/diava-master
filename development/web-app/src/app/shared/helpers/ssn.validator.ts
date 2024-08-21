export class SSNValidator{

    ssnPattern = "^(?!666|000|9\\d{2})\\d{3}-(?!00)\\d{2}-(?!0{4})\\d{4}$";
      //   ^ represents the starting of the string.
      // (?!666|000|9\\d{2})\\d{3} represents the first 3 digits should not start with 000, 666, or between 900 and 999.
      // – represents the string followed by a hyphen (-).
      // (?!00)\\d{2} represents the next 2 digits should not start with 00 and it should be any from 01-99.
      // – represents the string followed by a hyphen (-).
      // (?!0{4})\\d{4} represents the next 4 digits can’t 0000 and it should be any from 0001-9999.
      // $ represents the ending of the string.

    constructor() { }
}