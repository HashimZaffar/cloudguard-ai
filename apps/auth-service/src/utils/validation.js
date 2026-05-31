function validateRegisterInput({ name, email, password }) {
  const errors = [];

  if (!name) {
    errors.push('Name is required');
  }

  if (!email) {
    errors.push('Email is required');
  } else if (!email.includes('@')) {
    errors.push('Email must be valid');
  }

  if (!password) {
    errors.push('Password is required');
  } else if (password.length < 8) {
    errors.push('Password must be at least 8 characters');
  }

  return errors;
}

function validateLoginInput({ email, password }) {
  const errors = [];

  if (!email) {
    errors.push('Email is required');
  }

  if (!password) {
    errors.push('Password is required');
  }

  return errors;
}

module.exports = {
  validateRegisterInput,
  validateLoginInput,
};
