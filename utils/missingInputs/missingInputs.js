function missingInputs(field, fieldName) {
    if (!field) {
      return {
        status: 422, // You can set a custom status code
        error: true,
        message: `${fieldName} is missing`,
        data: null,
      };
    }
    return null;
  }

  module.exports = missingInputs;