const validateForm = (data, formType) => {
    const emailRegExp = /^[A-Za-z0-9+\-_~]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

    const regExp = formType === "emailForm" ? emailRegExp : passwordRegex;
    const isValid = regExp.test(data);

    return isValid;
};

const validateName = (name) => {
    //validates names and surnames
    const nameRegExp = /^[A-Za-z]+$/;

    const isValidName = nameRegExp.test(name);

    return isValidName;
};

const validatePhone = (phone) => {
    //validates phone number
    const phoneRegExp = /^[+]?[\d|\s]+$/; //can begin with +, can contain only numbers and spaces

    const isValidPhone = phoneRegExp.test(phone);

    return isValidPhone;
};

const validateAddress = (address) => {
    const addressRegExp = /^[A-Za-z0-9\s.,'-]+$/i; //can contain only letters, numbers, spaces, dots, commas, dashes and apostrophes

    const isValidAddress = addressRegExp.test(address);
    return isValidAddress;
};

const validateNumbers = (numbers) => {
    const numbersRegExp = /^[0-9]+$/;

    const isValidNumbers = numbersRegExp.test(numbers);
    return isValidNumbers;
};

export { validateForm, validateName, validatePhone, validateAddress, validateNumbers };
