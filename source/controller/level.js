/**
 * Calculates level-related user info
 * @param  user
 * @return user
 */
var setLevelInfo = function(tutArray) {
    var constant = 0.1;
    for (i = 0; i < tutArray.length; i++) {
        var tutObj = tutArray[i];
        var exp = tutObj.exp;
        tutObj.level = calculateLevel(exp);
        tutObj.currExp = exp - calculateExp(tutObj.level - 2);
        tutObj.totalToNext = calculateExp(tutObj.level); - calculateExp(tutObj.level-1);
        tutObj.percentage = Math.floor(tutObj.currExp/tutObj.totalToNext * 100);
    }
    return tutArray;
}

var constant = 0.1;

/**
 * Calculates level based on exp
 * @param  {Integer} exp 
 * @return {Integer} level
 */
var calculateLevel = function (exp) {
    // Level = Constant * Sqrt(EXP)
    return Math.floor(constant * Math.sqrt(exp)) + 1;
}

/**
 * Calculates total exp needed to reach this level
 * @param  {Integer} level 
 * @return {Integer}       
 */
var calculateExp = function (level) {
    return Math.floor(Math.pow(level/constant, 2));
}

module.exports.setLevelInfo = setLevelInfo;
module.exports.calculateExp = calculateExp;
module.exports.calculateLevel = calculateLevel;