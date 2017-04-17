var constant = 0.1;

/**
 * Calculates level-related user info
 * @param  user
 * @return user
 */
var setLevelInfo = function(tutArray) {
    for (i = 0; i < tutArray.length; i++) {
        var tutObj = tutArray[i];
        var exp = tutObj.exp;
        tutObj.level = calculateLevel(exp);
        
		if(tutObj.level!=1) { // If User is Not Level 1
			tutObj.currExp = exp - calculateExp(tutObj.level-1);
		}	
		else { // If User is Level 1
			tutObj.currExp = exp;
		}
	
        tutObj.totalToNext = calculateExp(tutObj.level) - calculateExp(tutObj.level-1);
        tutObj.percentage = Math.floor(tutObj.currExp/tutObj.totalToNext * 100);
    }
    return tutArray;
}


/**
 * Calculates level based on exp
 * @param  {Integer} exp 
 * @return {Integer} level
 625 EXP - Level 3
 */
var calculateLevel = function (exp) {
    // Level = Constant * Sqrt(EXP)
    return Math.floor(constant * Math.sqrt(exp)) + 1;
}

/**
 * Calculates total exp needed to reach this level
 * @param  {Integer} level 
 * @return {Integer}
 Level 1 -> 0 - 100 EXP
 Level 2 -> 101 - 400 EXP
 Level 3 -> 401 - 900 EXP
 */
var calculateExp = function (level) {
    return Math.floor(Math.pow(level/constant, 2));
}

module.exports.setLevelInfo = setLevelInfo;
module.exports.calculateExp = calculateExp;
module.exports.calculateLevel = calculateLevel;