async function addColumnToTable(
  tableName,
  columnName,
  columnType,
  defaultValue,
  existingValue
) {
  try {
    const db = await connectToDb();

    // Step 1: Check if column already exists
    const checkColumnQuery = `
          SELECT COUNT(*) AS count
          FROM information_schema.columns
          WHERE table_name = ? AND column_name = ?
        `;
    const columnExists = await queryAsync(db, checkColumnQuery, [
      tableName,
      columnName,
    ]);

    if (columnExists[0].count > 0) {
      db.end();
      return {
        status: 409,
        error: true,
        message: `Column '${columnName}' already exists in '${tableName}'.`,
      };
    }

    // Step 2: Alter table to add new column
    const alterTableQuery = `
          ALTER TABLE ${tableName} ADD COLUMN ${columnName} ${columnType} DEFAULT ?
        `;
    await queryAsync(db, alterTableQuery, [defaultValue]);

    // Step 3: Update existing records with the provided value
    const updateExistingQuery = `
          UPDATE ${tableName} SET ${columnName} = ? WHERE ${columnName} IS NULL
        `;
    await queryAsync(db, updateExistingQuery, [existingValue]);

    db.end();
    return {
      status: 200,
      error: false,
      message: `Column '${columnName}' added successfully to '${tableName}' with default '${defaultValue}' and existing value '${existingValue}'.`,
    };
  } catch (error) {
    console.error("Add Column Error", error);
    return {
      status: 500,
      error: true,
      message: "Failed to add column",
    };
  }
}

module.exports = addColumnToTable;
