export const generatePassword = (length = 9) => {
  // Declare all characters
  const charset =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let password = "";
  // Loop through the length and pick a random character from the charset
  for (let i = 0; i < length; i++) {
    // Append the character to the password
    password += charset[Math.floor(Math.random() * charset.length)];
  }
  // Return the generated password
  return password;
};
