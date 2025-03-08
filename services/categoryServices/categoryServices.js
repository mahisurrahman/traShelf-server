const connectToDb = require("../../database/db");
const missingInputs = require("../../utils/missingInputs/missingInputs");
const queryAsync = require("../../utils/queryAysncFunction/queryAsync");

module.exports = {
  async createCategoryService(data) {
    try {
      const db = await connectToDb();

      const { categoryName, categoryCode } = data.body;

      // Validate required fields
      const requiredFields = { categoryName, categoryCode };
      for (const [fieldName, fieldValue] of Object.entries(requiredFields)) {
        const missing = missingInputs(fieldValue, fieldName);
        if (missing) {
          return missing;
        }
      }

      // Ensure the categories table exists
      const createTableQuery = `
            CREATE TABLE IF NOT EXISTS categories (
              id INT AUTO_INCREMENT PRIMARY KEY,
              categoryName VARCHAR(255) NOT NULL UNIQUE,
              categoryCode VARCHAR(50) NOT NULL UNIQUE,
              created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
              is_active BOOLEAN DEFAULT TRUE,
              is_deleted BOOLEAN DEFAULT FALSE
            )
          `;
      await queryAsync(db, createTableQuery);

      // Check if category already exists
      const checkCategoryQuery =
        "SELECT * FROM categories WHERE categoryName = ? OR categoryCode = ?";
      const existingCategory = await queryAsync(db, checkCategoryQuery, [
        categoryName,
        categoryCode,
      ]);

      if (existingCategory.length > 0) {
        db.end();
        return {
          status: 409,
          error: false,
          message: "Category Name or Code Already Exists",
          data: null,
        };
      }

      // Insert new category
      const insertQuery =
        "INSERT INTO categories (categoryName, categoryCode) VALUES (?, ?)";
      const values = [categoryName, categoryCode];

      const insertResult = await queryAsync(db, insertQuery, values);

      if (!insertResult.insertId) {
        return {
          status: 400,
          error: true,
          message: "Failed to insert the Category",
          data: null,
        };
      }

      // Fetch the newly created category
      const fetchCategoryQuery = "SELECT * FROM categories WHERE id = ?";
      const newCategoryResult = await queryAsync(db, fetchCategoryQuery, [
        insertResult.insertId,
      ]);

      const newCategory = newCategoryResult[0];
      return {
        status: 201,
        error: false,
        message: "Category created successfully",
        data: newCategory,
      };
    } catch (error) {
      console.log(error, "Create Category Failed");
      return {
        status: 500,
        error: true,
        message: "Create Category Failed",
      };
    }
  },

  async getAllCategoryService() {
    try {
      const db = await connectToDb();

      const fetchCategoriesQuery =
        "SELECT * FROM categories WHERE is_deleted = FALSE";
      const categories = await queryAsync(db, fetchCategoriesQuery);

      return {
        status: 200,
        error: false,
        message: "Categories retrieved successfully",
        data: categories,
      };
    } catch (error) {
      console.log(error, "Get All Categories Failed");
      return {
        status: 500,
        error: true,
        message: "Get All Categories Failed",
      };
    }
  },

  async getCategoryByIdService(id) {
    try {
      const db = await connectToDb();

      const fetchCategoryQuery =
        "SELECT * FROM categories WHERE id = ? AND is_deleted = FALSE";
      const categoryResult = await queryAsync(db, fetchCategoryQuery, [id]);

      if (categoryResult.length === 0) {
        return {
          status: 404,
          error: true,
          message: "Category not found",
          data: null,
        };
      }

      return {
        status: 200,
        error: false,
        message: "Category retrieved successfully",
        data: categoryResult[0],
      };
    } catch (error) {
      console.log(error, "Get Category by Code Failed");
      return {
        status: 500,
        error: true,
        message: "Get Category by Code Failed",
      };
    }
  },

  async removeCategoryService(id) {
    try {
      const db = await connectToDb();

      // Check if category exists and is not already deleted
      const checkCategoryQuery =
        "SELECT * FROM categories WHERE id = ? AND is_deleted = FALSE";
      const categoryResult = await queryAsync(db, checkCategoryQuery, [id]);

      if (categoryResult.length === 0) {
        return {
          status: 404,
          error: true,
          message: "Category not found or already deleted",
          data: null,
        };
      }

      // Soft delete the category by setting is_deleted = TRUE
      const deleteQuery =
        "UPDATE categories SET is_deleted = TRUE WHERE id = ?";
      await queryAsync(db, deleteQuery, [id]);

      return {
        status: 200,
        error: false,
        message: "Category removed successfully",
        data: null,
      };
    } catch (error) {
      console.log(error, "Remove Category Failed");
      return {
        status: 500,
        error: true,
        message: "Remove Category Failed",
      };
    }
  },

  async updateCategoryService(categoryId, data) {
    try {
      const db = await connectToDb();

      const { categoryName, categoryCode } = data.body;

      // Validate if at least one field is provided for update
      if (!categoryName && !categoryCode) {
        return {
          status: 400,
          error: true,
          message:
            "At least one field (categoryName or categoryCode) must be provided",
          data: null,
        };
      }

      // Check if the category exists and is not deleted
      const checkCategoryQuery =
        "SELECT * FROM categories WHERE id = ? AND is_deleted = FALSE";
      const categoryResult = await queryAsync(db, checkCategoryQuery, [
        categoryId,
      ]);

      if (categoryResult.length === 0) {
        return {
          status: 404,
          error: true,
          message: "Category not found",
          data: null,
        };
      }

      // Check if categoryName or categoryCode is already taken by another category
      if (categoryName || categoryCode) {
        const checkDuplicateQuery = `
          SELECT * FROM categories 
          WHERE (categoryName = ? OR categoryCode = ?) 
          AND id != ? 
          AND is_deleted = FALSE
        `;
        const duplicateCategory = await queryAsync(db, checkDuplicateQuery, [
          categoryName || categoryResult[0].categoryName,
          categoryCode || categoryResult[0].categoryCode,
          categoryId,
        ]);

        if (duplicateCategory.length > 0) {
          return {
            status: 409,
            error: true,
            message: "Category Name or Code already exists",
            data: null,
          };
        }
      }

      // Update category
      const updateQuery = `
        UPDATE categories 
        SET categoryName = COALESCE(?, categoryName), 
            categoryCode = COALESCE(?, categoryCode) 
        WHERE id = ?
      `;
      await queryAsync(db, updateQuery, [
        categoryName,
        categoryCode,
        categoryId,
      ]);

      // Fetch updated category
      const fetchUpdatedQuery = "SELECT * FROM categories WHERE id = ?";
      const updatedCategory = await queryAsync(db, fetchUpdatedQuery, [
        categoryId,
      ]);

      return {
        status: 200,
        error: false,
        message: "Category updated successfully",
        data: updatedCategory[0],
      };
    } catch (error) {
      console.log(error, "Update Category Failed");
      return {
        status: 500,
        error: true,
        message: "Update Category Failed",
      };
    }
  },
};
