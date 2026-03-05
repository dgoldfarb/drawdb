import { describe, it, expect } from 'vitest';
import {
  defaultTypes,
  mysqlTypes,
  postgresTypes,
  sqliteTypes,
  mssqlTypes,
  oraclesqlTypes,
  mariadbTypes,
  dbToTypes,
} from './datatypes';
import { DB } from './constants';

describe('Regex Validators and Helper Functions', () => {
  describe('INT regex validation', () => {
    it('should validate positive integers', () => {
      const field = { default: '123' };
      expect(defaultTypes.INT.checkDefault(field)).toBe(true);
    });

    it('should validate negative integers', () => {
      const field = { default: '-456' };
      expect(defaultTypes.INT.checkDefault(field)).toBe(true);
    });

    it('should validate zero', () => {
      const field = { default: '0' };
      expect(defaultTypes.INT.checkDefault(field)).toBe(true);
    });

    it('should reject decimals', () => {
      const field = { default: '123.45' };
      expect(defaultTypes.INT.checkDefault(field)).toBe(false);
    });

    it('should reject non-numeric strings', () => {
      const field = { default: 'abc' };
      expect(defaultTypes.INT.checkDefault(field)).toBe(false);
    });

    it('should accept empty string (edge case)', () => {
      const field = { default: '' };
      expect(defaultTypes.INT.checkDefault(field)).toBe(true);
    });
  });

  describe('DECIMAL/DOUBLE regex validation', () => {
    it('should validate positive decimals', () => {
      const field = { default: '123.45' };
      expect(defaultTypes.DECIMAL.checkDefault(field)).toBe(true);
    });

    it('should validate negative decimals', () => {
      const field = { default: '-123.45' };
      expect(defaultTypes.DECIMAL.checkDefault(field)).toBe(true);
    });

    it('should validate integers as decimals', () => {
      const field = { default: '123' };
      expect(defaultTypes.DECIMAL.checkDefault(field)).toBe(true);
    });

    it('should validate decimals with leading dot', () => {
      const field = { default: '.5' };
      expect(defaultTypes.DECIMAL.checkDefault(field)).toBe(true);
    });

    it('should reject decimals with trailing dot (no digits after)', () => {
      const field = { default: '5.' };
      expect(defaultTypes.DECIMAL.checkDefault(field)).toBe(false);
    });

    it('should reject multiple dots', () => {
      const field = { default: '1.2.3' };
      expect(defaultTypes.DECIMAL.checkDefault(field)).toBe(false);
    });
  });

  describe('NUMBER type validation', () => {
    it('should validate integer format', () => {
      const field = { default: '42' };
      expect(defaultTypes.NUMBER.checkDefault(field)).toBe(true);
    });

    it('should validate decimal format', () => {
      const field = { default: '3.14' };
      expect(defaultTypes.NUMBER.checkDefault(field)).toBe(true);
    });

    it('should validate negative numbers', () => {
      const field = { default: '-99.9' };
      expect(defaultTypes.NUMBER.checkDefault(field)).toBe(true);
    });

    it('should reject numbers without digits after dot', () => {
      const field = { default: '5.' };
      expect(defaultTypes.NUMBER.checkDefault(field)).toBe(false);
    });
  });

  describe('BINARY regex validation', () => {
    it('should validate binary strings', () => {
      const field = { default: '101010', size: 10 };
      expect(defaultTypes.BINARY.checkDefault(field)).toBe(true);
    });

    it('should reject binary strings exceeding size', () => {
      const field = { default: '101010', size: 5 };
      expect(defaultTypes.BINARY.checkDefault(field)).toBe(false);
    });

    it('should reject non-binary characters', () => {
      const field = { default: '102', size: 5 };
      expect(defaultTypes.BINARY.checkDefault(field)).toBe(false);
    });

    it('should reject empty binary string', () => {
      const field = { default: '', size: 5 };
      expect(defaultTypes.BINARY.checkDefault(field)).toBe(false);
    });
  });

  describe('MYPRIMETYPE (custom type)', () => {
    it('should validate odd positive integers', () => {
      const field = { default: '5' };
      expect(defaultTypes.MYPRIMETYPE.checkDefault(field)).toBe(true);
    });

    it('should validate larger odd positive integers', () => {
      const field = { default: '101' };
      expect(defaultTypes.MYPRIMETYPE.checkDefault(field)).toBe(true);
    });

    it('should reject even positive integers', () => {
      const field = { default: '4' };
      expect(defaultTypes.MYPRIMETYPE.checkDefault(field)).toBe(false);
    });

    it('should reject zero', () => {
      const field = { default: '0' };
      expect(defaultTypes.MYPRIMETYPE.checkDefault(field)).toBe(false);
    });

    it('should reject negative numbers', () => {
      const field = { default: '-5' };
      expect(defaultTypes.MYPRIMETYPE.checkDefault(field)).toBe(false);
    });

    it('should reject non-numeric strings', () => {
      const field = { default: 'abc' };
      expect(defaultTypes.MYPRIMETYPE.checkDefault(field)).toBe(false);
    });
  });
});

describe('String Types', () => {
  describe('CHAR type', () => {
    it('should validate string within size limit', () => {
      const field = { default: 'abc', size: 5 };
      expect(defaultTypes.CHAR.checkDefault(field)).toBe(true);
    });

    it('should validate string with quotes within size limit', () => {
      const field = { default: "'abc'", size: 5 };
      expect(defaultTypes.CHAR.checkDefault(field)).toBe(true);
    });

    it('should reject string exceeding size limit', () => {
      const field = { default: 'abcdef', size: 5 };
      expect(defaultTypes.CHAR.checkDefault(field)).toBe(false);
    });

    it('should reject quoted string exceeding size (accounting for quotes)', () => {
      const field = { default: "'abcdef'", size: 5 };
      expect(defaultTypes.CHAR.checkDefault(field)).toBe(false);
    });

    it('should validate empty string', () => {
      const field = { default: '', size: 5 };
      expect(defaultTypes.CHAR.checkDefault(field)).toBe(true);
    });

    it('should handle double quotes', () => {
      const field = { default: '"ab"', size: 5 };
      expect(defaultTypes.CHAR.checkDefault(field)).toBe(true);
    });

    it('should handle backticks', () => {
      const field = { default: '`ab`', size: 5 };
      expect(defaultTypes.CHAR.checkDefault(field)).toBe(true);
    });
  });

  describe('VARCHAR type', () => {
    it('should validate string within size limit', () => {
      const field = { default: 'hello', size: 10 };
      expect(defaultTypes.VARCHAR.checkDefault(field)).toBe(true);
    });

    it('should validate string with quotes', () => {
      const field = { default: "'hello world'", size: 15 };
      expect(defaultTypes.VARCHAR.checkDefault(field)).toBe(true);
    });

    it('should reject string exceeding size', () => {
      const field = { default: 'hello world', size: 5 };
      expect(defaultTypes.VARCHAR.checkDefault(field)).toBe(false);
    });
  });

  describe('TEXT type', () => {
    it('should always validate (no size check)', () => {
      const field = { default: 'any text here' };
      expect(defaultTypes.TEXT.checkDefault(field)).toBe(true);
    });

    it('should validate very long text', () => {
      const field = { default: 'a'.repeat(100000) };
      expect(defaultTypes.TEXT.checkDefault(field)).toBe(true);
    });
  });
});

describe('Date and Time Types', () => {
  describe('DATE type', () => {
    it('should validate valid date format', () => {
      const field = { default: '2024-01-15' };
      expect(defaultTypes.DATE.checkDefault(field)).toBe(true);
    });

    it('should reject invalid date format', () => {
      const field = { default: '01-15-2024' };
      expect(defaultTypes.DATE.checkDefault(field)).toBe(false);
    });

    it('should reject date with time', () => {
      const field = { default: '2024-01-15 12:30:00' };
      expect(defaultTypes.DATE.checkDefault(field)).toBe(false);
    });
  });

  describe('TIME type', () => {
    it('should validate valid time format', () => {
      const field = { default: '12:30:45' };
      expect(defaultTypes.TIME.checkDefault(field)).toBe(true);
    });

    it('should validate time with single digit hours', () => {
      const field = { default: '9:30:45' };
      expect(defaultTypes.TIME.checkDefault(field)).toBe(true);
    });

    it('should reject invalid time format', () => {
      const field = { default: '25:00:00' };
      expect(defaultTypes.TIME.checkDefault(field)).toBe(false);
    });

    it('should reject time without seconds', () => {
      const field = { default: '12:30' };
      expect(defaultTypes.TIME.checkDefault(field)).toBe(false);
    });
  });

  describe('TIMESTAMP type', () => {
    it('should validate CURRENT_TIMESTAMP keyword', () => {
      const field = { default: 'CURRENT_TIMESTAMP' };
      expect(defaultTypes.TIMESTAMP.checkDefault(field)).toBe(true);
    });

    it('should validate current_timestamp in lowercase', () => {
      const field = { default: 'current_timestamp' };
      expect(defaultTypes.TIMESTAMP.checkDefault(field)).toBe(true);
    });

    it('should validate valid timestamp within range', () => {
      const field = { default: '2024-01-15 12:30:45' };
      expect(defaultTypes.TIMESTAMP.checkDefault(field)).toBe(true);
    });

    it('should reject timestamp outside valid range (before 1970)', () => {
      const field = { default: '1969-01-15 12:30:45' };
      expect(defaultTypes.TIMESTAMP.checkDefault(field)).toBe(false);
    });

    it('should reject timestamp outside valid range (after 2038)', () => {
      const field = { default: '2039-01-15 12:30:45' };
      expect(defaultTypes.TIMESTAMP.checkDefault(field)).toBe(false);
    });

    it('should validate timestamp at boundary (1970)', () => {
      const field = { default: '1970-01-01 00:00:00' };
      expect(defaultTypes.TIMESTAMP.checkDefault(field)).toBe(true);
    });

    it('should validate timestamp at boundary (2038)', () => {
      const field = { default: '2038-12-31 23:59:59' };
      expect(defaultTypes.TIMESTAMP.checkDefault(field)).toBe(true);
    });
  });

  describe('DATETIME type', () => {
    it('should validate CURRENT_TIMESTAMP keyword', () => {
      const field = { default: 'CURRENT_TIMESTAMP' };
      expect(defaultTypes.DATETIME.checkDefault(field)).toBe(true);
    });

    it('should validate valid datetime', () => {
      const field = { default: '2024-01-15 12:30:45' };
      expect(defaultTypes.DATETIME.checkDefault(field)).toBe(true);
    });

    it('should validate datetime at year boundary (1000)', () => {
      const field = { default: '1000-01-01 00:00:00' };
      expect(defaultTypes.DATETIME.checkDefault(field)).toBe(true);
    });

    it('should validate datetime at year boundary (9999)', () => {
      const field = { default: '9999-12-31 23:59:59' };
      expect(defaultTypes.DATETIME.checkDefault(field)).toBe(true);
    });

    it('should reject datetime outside range', () => {
      const field = { default: '999-12-31 23:59:59' };
      expect(defaultTypes.DATETIME.checkDefault(field)).toBe(false);
    });
  });
});

describe('Boolean Type', () => {
  it('should validate "true" string', () => {
    const field = { default: 'true' };
    expect(defaultTypes.BOOLEAN.checkDefault(field)).toBe(true);
  });

  it('should validate "false" string', () => {
    const field = { default: 'false' };
    expect(defaultTypes.BOOLEAN.checkDefault(field)).toBe(true);
  });

  it('should validate uppercase "TRUE"', () => {
    const field = { default: 'TRUE' };
    expect(defaultTypes.BOOLEAN.checkDefault(field)).toBe(true);
  });

  it('should validate uppercase "FALSE"', () => {
    const field = { default: 'FALSE' };
    expect(defaultTypes.BOOLEAN.checkDefault(field)).toBe(true);
  });

  it('should validate "1"', () => {
    const field = { default: '1' };
    expect(defaultTypes.BOOLEAN.checkDefault(field)).toBe(true);
  });

  it('should validate "0"', () => {
    const field = { default: '0' };
    expect(defaultTypes.BOOLEAN.checkDefault(field)).toBe(true);
  });

  it('should reject other numbers', () => {
    const field = { default: '2' };
    expect(defaultTypes.BOOLEAN.checkDefault(field)).toBe(false);
  });

  it('should reject other strings', () => {
    const field = { default: 'yes' };
    expect(defaultTypes.BOOLEAN.checkDefault(field)).toBe(false);
  });
});

describe('ENUM and SET Types', () => {
  describe('ENUM type', () => {
    it('should validate when default is in values list', () => {
      const field = { default: 'red', values: ['red', 'green', 'blue'] };
      expect(defaultTypes.ENUM.checkDefault(field)).toBe(true);
    });

    it('should reject when default is not in values list', () => {
      const field = { default: 'yellow', values: ['red', 'green', 'blue'] };
      expect(defaultTypes.ENUM.checkDefault(field)).toBe(false);
    });

    it('should handle single value enum', () => {
      const field = { default: 'only', values: ['only'] };
      expect(defaultTypes.ENUM.checkDefault(field)).toBe(true);
    });
  });

  describe('SET type', () => {
    it('should validate when all defaults are in values list', () => {
      const field = { default: 'red, green', values: ['red', 'green', 'blue'] };
      expect(defaultTypes.SET.checkDefault(field)).toBe(true);
    });

    it('should validate single value in set', () => {
      const field = { default: 'red', values: ['red', 'green', 'blue'] };
      expect(defaultTypes.SET.checkDefault(field)).toBe(true);
    });

    it('should reject when any default is not in values list', () => {
      const field = { default: 'red, yellow', values: ['red', 'green', 'blue'] };
      expect(defaultTypes.SET.checkDefault(field)).toBe(false);
    });

    it('should handle values with extra spaces', () => {
      const field = { default: 'red,  green', values: ['red', 'green', 'blue'] };
      expect(defaultTypes.SET.checkDefault(field)).toBe(true);
    });
  });
});

describe('Binary Types', () => {
  describe('BLOB type', () => {
    it('should always validate (no default check)', () => {
      const field = { default: 'anything' };
      expect(defaultTypes.BLOB.checkDefault(field)).toBe(true);
    });
  });

  describe('VARBINARY type', () => {
    it('should validate binary string within size', () => {
      const field = { default: '101010', size: 10 };
      expect(defaultTypes.VARBINARY.checkDefault(field)).toBe(true);
    });

    it('should reject binary string exceeding size', () => {
      const field = { default: '101010101010', size: 5 };
      expect(defaultTypes.VARBINARY.checkDefault(field)).toBe(false);
    });

    it('should reject non-binary characters', () => {
      const field = { default: '102', size: 10 };
      expect(defaultTypes.VARBINARY.checkDefault(field)).toBe(false);
    });
  });
});

describe('Database-Specific Types', () => {
  describe('MySQL Types', () => {
    it('should have TINYINT type', () => {
      expect(mysqlTypes.TINYINT).toBeDefined();
      expect(mysqlTypes.TINYINT.type).toBe('TINYINT');
    });

    it('should have MEDIUMINT type', () => {
      expect(mysqlTypes.MEDIUMINT).toBeDefined();
      expect(mysqlTypes.MEDIUMINT.type).toBe('MEDIUMINT');
    });

    it('should validate YEAR type', () => {
      const field = { default: '2024' };
      expect(mysqlTypes.YEAR.checkDefault(field)).toBe(true);
    });

    it('should reject invalid YEAR format', () => {
      const field = { default: '24' };
      expect(mysqlTypes.YEAR.checkDefault(field)).toBe(false);
    });

    it('should have BIT type', () => {
      expect(mysqlTypes.BIT).toBeDefined();
      const field = { default: '1' };
      expect(mysqlTypes.BIT.checkDefault(field)).toBe(true);
    });

    it('should validate geometric types', () => {
      expect(mysqlTypes.GEOMETRY).toBeDefined();
      expect(mysqlTypes.POINT).toBeDefined();
      expect(mysqlTypes.POLYGON).toBeDefined();
    });
  });

  describe('PostgreSQL Types', () => {
    it('should have SERIAL types', () => {
      expect(postgresTypes.SMALLSERIAL).toBeDefined();
      expect(postgresTypes.SERIAL).toBeDefined();
      expect(postgresTypes.BIGSERIAL).toBeDefined();
    });

    it('should have compatibleWith arrays', () => {
      expect(postgresTypes.SMALLINT.compatibleWith).toBeDefined();
      expect(postgresTypes.SMALLINT.compatibleWith).toContain('INTEGER');
    });

    it('should validate BOOLEAN differently from MySQL', () => {
      const field = { default: 'true' };
      expect(postgresTypes.BOOLEAN.checkDefault(field)).toBe(true);
    });

    it('should reject "1" for PostgreSQL BOOLEAN', () => {
      const field = { default: '1' };
      expect(postgresTypes.BOOLEAN.checkDefault(field)).toBe(false);
    });

    it('should validate DATE with special values', () => {
      expect(postgresTypes.DATE.checkDefault({ default: 'now' })).toBe(true);
      expect(postgresTypes.DATE.checkDefault({ default: 'today' })).toBe(true);
      expect(postgresTypes.DATE.checkDefault({ default: 'infinity' })).toBe(true);
    });

    it('should validate BYTEA with hex format', () => {
      const field = { default: '1a2b3c' };
      expect(postgresTypes.BYTEA.checkDefault(field)).toBe(true);
    });

    it('should reject invalid BYTEA', () => {
      const field = { default: 'xyz' };
      expect(postgresTypes.BYTEA.checkDefault(field)).toBe(false);
    });

    it('should validate CIDR format', () => {
      const field = { default: '192.168.1.0/24' };
      expect(postgresTypes.CIDR.checkDefault(field)).toBe(true);
    });

    it('should validate INET format', () => {
      const field = { default: '192.168.1.1' };
      expect(postgresTypes.INET.checkDefault(field)).toBe(true);
    });

    it('should validate MACADDR format', () => {
      const field = { default: '08:00:2b:01:02:03' };
      expect(postgresTypes.MACADDR.checkDefault(field)).toBe(true);
    });

    it('should validate VECTOR type with valid array', () => {
      const field = { default: '[1.0, 2.5, 3.7]', size: 3 };
      expect(postgresTypes.VECTOR.checkDefault(field)).toBe(true);
    });

    it('should reject VECTOR with wrong size', () => {
      const field = { default: '[1.0, 2.5]', size: 3 };
      expect(postgresTypes.VECTOR.checkDefault(field)).toBe(false);
    });

    it('should validate SPARSEVEC format', () => {
      const field = { default: '{1:1.0,3:2.0}/5', size: 5 };
      expect(postgresTypes.SPARSEVEC.checkDefault(field)).toBe(true);
    });
  });

  describe('SQLite Types', () => {
    it('should have limited type set', () => {
      expect(sqliteTypes.INTEGER).toBeDefined();
      expect(sqliteTypes.REAL).toBeDefined();
      expect(sqliteTypes.TEXT).toBeDefined();
      expect(sqliteTypes.BLOB).toBeDefined();
    });

    it('should not have complex types', () => {
      expect(sqliteTypes.GEOMETRY).toBe(false);
    });
  });

  describe('MSSQL Types', () => {
    it('should have DATETIME2 type', () => {
      expect(mssqlTypes.DATETIME2).toBeDefined();
    });

    it('should validate DATETIMEOFFSET', () => {
      const field = { default: '2024-01-15 12:30:45.1234567+01:00' };
      expect(mssqlTypes.DATETIMEOFFSET.checkDefault(field)).toBe(true);
    });

    it('should validate SMALLDATETIME within year range', () => {
      const field = { default: '2024-01-15 12:30:00' };
      expect(mssqlTypes.SMALLDATETIME.checkDefault(field)).toBe(true);
    });

    it('should reject SMALLDATETIME outside year range', () => {
      const field = { default: '1899-12-31 23:59:59' };
      expect(mssqlTypes.SMALLDATETIME.checkDefault(field)).toBe(false);
    });

    it('should have UNIQUEIDENTIFIER type', () => {
      expect(mssqlTypes.UNIQUEIDENTIFIER).toBeDefined();
    });
  });

  describe('Oracle SQL Types', () => {
    it('should have VARCHAR2 type', () => {
      expect(oraclesqlTypes.VARCHAR2).toBeDefined();
    });

    it('should have NUMBER type', () => {
      expect(oraclesqlTypes.NUMBER).toBeDefined();
    });

    it('should validate INTERVAL format', () => {
      const field = { default: "INTERVAL '5' DAY" };
      expect(oraclesqlTypes.INTERVAL.checkDefault(field)).toBe(true);
    });

    it('should have RAW type', () => {
      expect(oraclesqlTypes.RAW).toBeDefined();
      const field = { default: '1A2B3C' };
      expect(oraclesqlTypes.RAW.checkDefault(field)).toBe(true);
    });

    it('should validate TIMESTAMP with fractional seconds', () => {
      const field = { default: '2024-01-15 12:30:45.123456' };
      expect(oraclesqlTypes.TIMESTAMP.checkDefault(field)).toBe(true);
    });
  });

  describe('MariaDB Types', () => {
    it('should have UUID type', () => {
      expect(mariadbTypes.UUID).toBeDefined();
    });

    it('should have INET4 and INET6 types', () => {
      expect(mariadbTypes.INET4).toBeDefined();
      expect(mariadbTypes.INET6).toBeDefined();
    });

    it('should inherit MySQL types', () => {
      expect(mariadbTypes.TINYINT).toBeDefined();
      expect(mariadbTypes.MEDIUMINT).toBeDefined();
    });
  });
});

describe('Proxy Behavior', () => {
  describe('defaultTypes Proxy', () => {
    it('should return type for valid property', () => {
      expect(defaultTypes.INT).toBeDefined();
      expect(defaultTypes.INT.type).toBe('INT');
    });

    it('should return false for non-existent property', () => {
      expect(defaultTypes.NONEXISTENT).toBe(false);
    });

    it('should return false for undefined property', () => {
      expect(defaultTypes.SOME_RANDOM_TYPE).toBe(false);
    });
  });

  describe('mysqlTypes Proxy', () => {
    it('should return type for valid MySQL property', () => {
      expect(mysqlTypes.TINYINT).toBeDefined();
    });

    it('should return false for non-existent property', () => {
      expect(mysqlTypes.NONEXISTENT).toBe(false);
    });
  });

  describe('dbToTypes Proxy', () => {
    it('should return correct type map for MYSQL', () => {
      expect(dbToTypes[DB.MYSQL]).toBe(mysqlTypes);
    });

    it('should return correct type map for POSTGRES', () => {
      expect(dbToTypes[DB.POSTGRES]).toBe(postgresTypes);
    });

    it('should return correct type map for SQLITE', () => {
      expect(dbToTypes[DB.SQLITE]).toBe(sqliteTypes);
    });

    it('should return correct type map for MSSQL', () => {
      expect(dbToTypes[DB.MSSQL]).toBe(mssqlTypes);
    });

    it('should return correct type map for MARIADB', () => {
      expect(dbToTypes[DB.MARIADB]).toBe(mariadbTypes);
    });

    it('should return correct type map for ORACLESQL', () => {
      expect(dbToTypes[DB.ORACLESQL]).toBe(oraclesqlTypes);
    });

    it('should return correct type map for GENERIC', () => {
      expect(dbToTypes[DB.GENERIC]).toBe(defaultTypes);
    });

    it('should return false for non-existent database', () => {
      expect(dbToTypes.NONEXISTENT_DB).toBe(false);
    });
  });
});

describe('Type Properties', () => {
  describe('Type metadata', () => {
    it('should have canIncrement property for integer types', () => {
      expect(defaultTypes.INT.canIncrement).toBe(true);
      expect(defaultTypes.SMALLINT.canIncrement).toBe(true);
      expect(defaultTypes.BIGINT.canIncrement).toBe(true);
    });

    it('should not have canIncrement for non-integer types', () => {
      expect(defaultTypes.VARCHAR.canIncrement).toBeUndefined();
    });

    it('should have isSized property for sized types', () => {
      expect(defaultTypes.VARCHAR.isSized).toBe(true);
      expect(defaultTypes.CHAR.isSized).toBe(true);
    });

    it('should have hasPrecision property for decimal types', () => {
      expect(defaultTypes.DECIMAL.hasPrecision).toBe(true);
      expect(defaultTypes.NUMERIC.hasPrecision).toBe(true);
    });

    it('should have hasQuotes property for string types', () => {
      expect(defaultTypes.VARCHAR.hasQuotes).toBe(true);
      expect(defaultTypes.CHAR.hasQuotes).toBe(true);
    });

    it('should have defaultSize for sized types', () => {
      expect(defaultTypes.VARCHAR.defaultSize).toBe(255);
      expect(defaultTypes.CHAR.defaultSize).toBe(1);
    });

    it('should have noDefault property for types without defaults', () => {
      expect(defaultTypes.BLOB.noDefault).toBe(true);
      expect(defaultTypes.JSON.noDefault).toBe(true);
    });
  });

  describe('Color properties', () => {
    it('should have correct color for integer types', () => {
      expect(defaultTypes.INT.color).toBeDefined();
      expect(defaultTypes.INT.color).toBe(defaultTypes.SMALLINT.color);
    });

    it('should have correct color for string types', () => {
      expect(defaultTypes.VARCHAR.color).toBeDefined();
      expect(defaultTypes.VARCHAR.color).toBe(defaultTypes.CHAR.color);
    });

    it('should have correct color for date types', () => {
      expect(defaultTypes.DATE.color).toBeDefined();
      expect(defaultTypes.DATE.color).toBe(defaultTypes.TIME.color);
    });
  });
});

describe('Edge Cases and Boundary Tests', () => {
  describe('Empty and null-like values', () => {
    it('should handle empty string for INT', () => {
      const field = { default: '' };
      expect(defaultTypes.INT.checkDefault(field)).toBe(true);
    });

    it('should handle empty string for VARCHAR', () => {
      const field = { default: '', size: 10 };
      expect(defaultTypes.VARCHAR.checkDefault(field)).toBe(true);
    });
  });

  describe('Boundary values', () => {
    it('should handle exact size match for CHAR', () => {
      const field = { default: 'abcde', size: 5 };
      expect(defaultTypes.CHAR.checkDefault(field)).toBe(true);
    });

    it('should handle exact size match with quotes', () => {
      const field = { default: "'abc'", size: 3 };
      expect(defaultTypes.CHAR.checkDefault(field)).toBe(true);
    });

    it('should handle minimum TIMESTAMP year', () => {
      const field = { default: '1970-01-01 00:00:00' };
      expect(defaultTypes.TIMESTAMP.checkDefault(field)).toBe(true);
    });

    it('should handle maximum TIMESTAMP year', () => {
      const field = { default: '2038-12-31 23:59:59' };
      expect(defaultTypes.TIMESTAMP.checkDefault(field)).toBe(true);
    });

    it('should handle minimum DATETIME year', () => {
      const field = { default: '1000-01-01 00:00:00' };
      expect(defaultTypes.DATETIME.checkDefault(field)).toBe(true);
    });

    it('should handle maximum DATETIME year', () => {
      const field = { default: '9999-12-31 23:59:59' };
      expect(defaultTypes.DATETIME.checkDefault(field)).toBe(true);
    });
  });

  describe('Case sensitivity', () => {
    it('should handle mixed case for CURRENT_TIMESTAMP', () => {
      expect(defaultTypes.TIMESTAMP.checkDefault({ default: 'Current_Timestamp' })).toBe(true);
      expect(defaultTypes.DATETIME.checkDefault({ default: 'CuRrEnT_TiMeStAmP' })).toBe(true);
    });

    it('should handle mixed case for boolean values', () => {
      expect(defaultTypes.BOOLEAN.checkDefault({ default: 'True' })).toBe(true);
      expect(defaultTypes.BOOLEAN.checkDefault({ default: 'False' })).toBe(true);
      expect(defaultTypes.BOOLEAN.checkDefault({ default: 'TrUe' })).toBe(true);
    });
  });

  describe('Special characters and formats', () => {
    it('should handle single quotes in string validation', () => {
      const field = { default: "'hello'", size: 10 };
      expect(defaultTypes.VARCHAR.checkDefault(field)).toBe(true);
    });

    it('should handle double quotes in string validation', () => {
      const field = { default: '"hello"', size: 10 };
      expect(defaultTypes.VARCHAR.checkDefault(field)).toBe(true);
    });

    it('should handle backticks in string validation', () => {
      const field = { default: '`hello`', size: 10 };
      expect(defaultTypes.VARCHAR.checkDefault(field)).toBe(true);
    });

    it('should handle negative zero for INT', () => {
      const field = { default: '-0' };
      expect(defaultTypes.INT.checkDefault(field)).toBe(true);
    });
  });

  describe('Type-specific edge cases', () => {
    it('should validate TIME at midnight', () => {
      const field = { default: '00:00:00' };
      expect(defaultTypes.TIME.checkDefault(field)).toBe(true);
    });

    it('should validate TIME at end of day', () => {
      const field = { default: '23:59:59' };
      expect(defaultTypes.TIME.checkDefault(field)).toBe(true);
    });

    it('should handle ENUM with single element', () => {
      const field = { default: 'only', values: ['only'] };
      expect(defaultTypes.ENUM.checkDefault(field)).toBe(true);
    });

    it('should handle SET with all values', () => {
      const field = { default: 'a, b, c', values: ['a', 'b', 'c'] };
      expect(defaultTypes.SET.checkDefault(field)).toBe(true);
    });

    it('should validate UUID format in PostgreSQL', () => {
      const field = { default: '550e8400-e29b-41d4-a716-446655440000' };
      expect(postgresTypes.UUID.checkDefault(field)).toBe(true);
    });

    it('should reject invalid UUID format', () => {
      const field = { default: 'not-a-uuid' };
      expect(postgresTypes.UUID.checkDefault(field)).toBe(false);
    });
  });
});

describe('Additional Coverage Tests', () => {
  describe('MySQL TEXT variants', () => {
    it('should validate TINYTEXT with quotes', () => {
      const field = { default: "'hello'", size: 65535 };
      expect(mysqlTypes.TINYTEXT.checkDefault(field)).toBe(true);
    });

    it('should validate MEDIUMTEXT', () => {
      const field = { default: "'hello'", size: 65535 };
      expect(mysqlTypes.MEDIUMTEXT.checkDefault(field)).toBe(true);
    });

    it('should validate LONGTEXT', () => {
      const field = { default: "'hello'", size: 65535 };
      expect(mysqlTypes.LONGTEXT.checkDefault(field)).toBe(true);
    });
  });

  describe('PostgreSQL geometric types', () => {
    it('should validate POINT format', () => {
      const field = { default: '(1,2)' };
      expect(postgresTypes.POINT.checkDefault(field)).toBe(true);
    });

    it('should validate BOX format', () => {
      const field = { default: '(1.5,2.5),(3.5,4.5)' };
      expect(postgresTypes.BOX.checkDefault(field)).toBe(true);
    });

    it('should validate POLYGON format', () => {
      const field = { default: '(1,2,3,4,5,6)' };
      expect(postgresTypes.POLYGON.checkDefault(field)).toBe(true);
    });
  });

  describe('PostgreSQL text search types', () => {
    it('should validate TSVECTOR format', () => {
      const field = { default: 'hello world' };
      expect(postgresTypes.TSVECTOR.checkDefault(field)).toBe(true);
    });

    it('should validate TSQUERY format', () => {
      const field = { default: 'hello & world' };
      expect(postgresTypes.TSQUERY.checkDefault(field)).toBe(true);
    });
  });

  describe('MSSQL specific types', () => {
    it('should validate MONEY type', () => {
      const field = { default: '123.45' };
      expect(mssqlTypes.MONEY.checkDefault(field)).toBe(true);
    });

    it('should validate SMALLMONEY type', () => {
      const field = { default: '99.99' };
      expect(mssqlTypes.SMALLMONEY.checkDefault(field)).toBe(true);
    });

    it('should have NCHAR and NVARCHAR types', () => {
      expect(mssqlTypes.NCHAR).toBeDefined();
      expect(mssqlTypes.NVARCHAR).toBeDefined();
    });
  });

  describe('Type inheritance and consistency', () => {
    it('should have MYPRIMETYPE in all database types', () => {
      expect(defaultTypes.MYPRIMETYPE).toBeDefined();
      expect(mysqlTypes.MYPRIMETYPE).toBeDefined();
      expect(postgresTypes.MYPRIMETYPE).toBeDefined();
      expect(sqliteTypes.MYPRIMETYPE).toBeDefined();
      expect(mssqlTypes.MYPRIMETYPE).toBeDefined();
      expect(oraclesqlTypes.MYPRIMETYPE).toBeDefined();
    });

    it('should share same MYPRIMETYPE reference', () => {
      expect(mysqlTypes.MYPRIMETYPE).toBe(postgresTypes.MYPRIMETYPE);
    });
  });

  describe('Complex validation scenarios', () => {
    it('should validate quoted string exactly at size boundary', () => {
      const field = { default: "'12345'", size: 5 };
      expect(defaultTypes.VARCHAR.checkDefault(field)).toBe(true);
    });

    it('should reject quoted string just over size boundary', () => {
      const field = { default: "'123456'", size: 5 };
      expect(defaultTypes.VARCHAR.checkDefault(field)).toBe(false);
    });

    it('should validate VECTOR with quoted array', () => {
      const field = { default: '"[1.0, 2.0, 3.0]"', size: 3 };
      expect(postgresTypes.VECTOR.checkDefault(field)).toBe(true);
    });

    it('should validate HALFVEC type', () => {
      const field = { default: '[0.5, 1.5, 2.5]', size: 3 };
      expect(postgresTypes.HALFVEC.checkDefault(field)).toBe(true);
    });

    it('should handle SPARSEVEC with wrong size', () => {
      const field = { default: '{1:1.0}/10', size: 5 };
      expect(postgresTypes.SPARSEVEC.checkDefault(field)).toBe(false);
    });
  });
});