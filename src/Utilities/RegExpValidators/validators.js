const validateForm = (data, formType) => {
    //validnost email-a i password-a
    const emailRegExp = /^[A-Za-z0-9+\-_~]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

    const regExp = formType === "emailForm" ? emailRegExp : passwordRegex;
    const isValid = regExp.test(data);

    return isValid;
};

const validateName = (name) => {
    //validnost imena i prezimena (samo slova + ŠĐŽĆČšđžćč)
    const nameRegExp = /^[A-Za-ŠšĐđŽžĆćČč]+$/;

    const isValidName = nameRegExp.test(name);

    return isValidName;
};

const validatePhone = (phone) => {
    //validnost broja telefona (može početi sa +, može sadržavati samo brojeve i razmake)
    const phoneRegExp = /^[+]?[\d|\s]+$/;

    const isValidPhone = phoneRegExp.test(phone);

    return isValidPhone;
};

const validateAddress = (address) => {
    //validnost adrese (slova, brojevi, razmaci, tačke, zarezi, crtice i apostrofi)
    const addressRegExp = /^[A-Za-z0-9\s.,'-]+$/i; 

    const isValidAddress = addressRegExp.test(address);
    return isValidAddress;
};

const validateNumbers = (numbers) => {
    //validnost brojeva (samo brojevi)
    const numbersRegExp = /^[0-9]+$/;

    const isValidNumbers = numbersRegExp.test(numbers);
    return isValidNumbers;
};

export { validateForm, validateName, validatePhone, validateAddress, validateNumbers };
