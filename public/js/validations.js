var phoneRegEx = /^[0-9]{3}\-[0-9]{3}\-[0-9]{4}$/;
let positiveNumRegex = /^[\d]{10}?$/;
function validatePhone(userPhone) {
    if (!phoneRegEx.test(userPhone)) {
        throw new Error("Please enter the phone number in the format XXX-XXX-XXXX");
    }
    return true;
}
function validateNumber(number) {
    if (number > "") {
        if (!(parseInt(number) >= 0)) {
            throw new Error("Please enter a valid number");
        }
    }
    return true;
}
module.exports = { validatePhone, validateNumber }