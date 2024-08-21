export class LatLongValidator{

    //valid latitude: +/- 0-90, up to 6 decimal
    lat_regex = /^[-+]?((90(\.0{1,6})?)|([0-8]?\d(\.\d{1,6})?))$/
    // PLAY BY PLAY
    //  Expression to match is between the first and last '/'
    //  ^ == beginning, $ == end (of a single expression within the total expression -- between '/')
    //  ? == optional
    //  [-+]? == optional plus/minus sign
    //  First '(' and last ')' == the whole group of valid digits; this particular group has two sub groups separated by an or '|' symbol
    //  Group One: (90(\.0{1,6})?)
    //  (90(\.0{1,6})?) == matches the number 90 with an optional six zeros after a '.' (decimal)
    //      this is 'like' a max number setting in that it 'may' match 90.000000
    //      it is not an actual 'max evalution' comparing two numbers; it's merely looking at a pattern and evaluating true/false
    //      Sub-Group One: (90) == match on the number 90
    //      Sub-Group Two: (\.0{1,6})? == optional (?) six zeros after a literal '.'
    //                  \.0 == a literal dot (decimal) with a zero after it
    //                  {1,6} == up to six characters/digits
    //                  \.0{1,6} == up to six zeros after a literal dot
    //                  NOTE: replace '.0' with '.\d' and it now allows any digit (not just zeros)
    //      Sub-Group One and Two (90(\.0{1,6})?) == match the number 90 with optional six zeros after decimal

    //  | == or (match on Group One or Group Two)

    //  Group Two: ([0-8]?\d(\.\d{1,6})?)
    //  ([0-8]?\d(\.\d{1,6})?) == may match any number with one or two digits with six optional decimal points;
    //      Sub-Group One: ([0-8]?\d) == optional (?) digit within range 0-8
    //      Sub-Group Two: (\.\d{1,6})? == optional (?) six digits after a literal '.'
    // 
    //  Total Pattern: match the number 90 (exactly) with the option of up to six 'zeros' after decimal point
    //                  OR
    //                 match a one or two digit number in range 0 to 89 with the option of up to six 'digits' after the decimal point
    //  VALID:      90, 90.000000, 89.123456, -0
    //                  the first two match (90(\.0{1,6})?), the second two match ([1-8]?\d(\.\d{1,6})?)
    //  INVALID:    91, 90.000001, 89.1234567
    //                  the first two fail (90(\.0{1,6})?) -- either does not match 90 or one of the decimals is not a zero
    //                  the second one fails ([1-8]?\d(\.\d{1,6})?) -- too many decimal places
    

    //valid longitude: +/- 0-180, up to 6 decimal
    long_regex = /^[-+]?(180(\.0{1,6})?|((1[0-7]\d)|([1-9]?\d))(\.\d{1,6})?)$/
    // long_regex follows the same pattern as lat_regex with some variances in the second pattern (after the '|') -- it has more '|'s
    //  Group One: (180(\.0{1,6})?
    //  (180(\.0{1,6})? == matches the number 180 (exactly) with optional (?) six zeros after the decimal point
    //      Sub-Group One: (180): match the number 180 exactly
    //      Sub-Group Two: (\.0{1,6})?: optional (?) six zeros after the decimal
    //  Group Two: ((1[0-7]\d)|([1-9]?\d))(\.\d{1,6})?)
    //      Sub-Group One: ((1[0-7]\d)|([1-9]?\d)) -- involves up to three digits; two of which 'may' follow the number '1'
    //          1[0-7]\d): match any digit in range 1-7 following the number '1'
    //          OR ('|')
    //          ([1-9]?\d): optionally (?) match any digit in range 1-9
    //      Sub-Group Two: (\.\d{1,6})? -- Sub Group One may have (?) up to six 'digits' after a literal '.'
    //          
    //  Total Pattern: match the number 180 (exactly) with the option of up to six 'zeros' after decimal point
    //                  OR
    //                 match a one,two, or three digit number in range 0 to 179 with the option of up to six 'digits' after the decimal point

    //  VALID:      180, 180.000000, 179.123456, -0
    //                  the first two match (180(\.0{1,6})?), the second two match ((1[0-7]\d)|([1-9]?\d))(\.\d{1,6})?)
    //  INVALID:    181, 180.000001, 179.1234567
    //                  the first two fail (180(\.0{1,6})?) -- either does not match 180 or one of the decimals is not a zero
    //                  the second one fails ((1[0-7]\d)|([1-9]?\d))(\.\d{1,6})?) -- too many decimal places

    constructor() { }
}