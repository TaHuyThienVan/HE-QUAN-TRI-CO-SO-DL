-- Fix foreign key constraint for sessions table
-- Change from dbo.student (old) to dbo.students (new)

-- First, find and drop the old foreign key constraint if it exists
-- Note: The constraint name might be different, so we need to find it first

-- Drop old foreign key constraint pointing to dbo.student
IF EXISTS (
    SELECT 1 
    FROM sys.foreign_keys 
    WHERE parent_object_id = OBJECT_ID('dbo.sessions') 
    AND referenced_object_id = OBJECT_ID('dbo.student')
)
BEGIN
    DECLARE @FKName NVARCHAR(128)
    SELECT @FKName = name 
    FROM sys.foreign_keys 
    WHERE parent_object_id = OBJECT_ID('dbo.sessions') 
    AND referenced_object_id = OBJECT_ID('dbo.student')
    
    IF @FKName IS NOT NULL
    BEGIN
        EXEC('ALTER TABLE dbo.sessions DROP CONSTRAINT ' + @FKName)
        PRINT 'Dropped old foreign key constraint: ' + @FKName
    END
END

-- Drop any foreign key constraint on student_id column that might be wrong
IF EXISTS (
    SELECT 1 
    FROM sys.foreign_keys fk
    INNER JOIN sys.foreign_key_columns fkc ON fk.object_id = fkc.constraint_object_id
    WHERE fkc.parent_object_id = OBJECT_ID('dbo.sessions')
    AND fkc.parent_column_id = COLUMNPROPERTY(OBJECT_ID('dbo.sessions'), 'student_id', 'ColumnId')
    AND fkc.referenced_object_id != OBJECT_ID('dbo.students')
)
BEGIN
    DECLARE @WrongFKName NVARCHAR(128)
    SELECT @WrongFKName = fk.name
    FROM sys.foreign_keys fk
    INNER JOIN sys.foreign_key_columns fkc ON fk.object_id = fkc.constraint_object_id
    WHERE fkc.parent_object_id = OBJECT_ID('dbo.sessions')
    AND fkc.parent_column_id = COLUMNPROPERTY(OBJECT_ID('dbo.sessions'), 'student_id', 'ColumnId')
    AND fkc.referenced_object_id != OBJECT_ID('dbo.students')
    
    IF @WrongFKName IS NOT NULL
    BEGIN
        EXEC('ALTER TABLE dbo.sessions DROP CONSTRAINT ' + @WrongFKName)
        PRINT 'Dropped wrong foreign key constraint: ' + @WrongFKName
    END
END

-- Create new foreign key constraint pointing to dbo.students
IF NOT EXISTS (
    SELECT 1 
    FROM sys.foreign_keys 
    WHERE parent_object_id = OBJECT_ID('dbo.sessions') 
    AND referenced_object_id = OBJECT_ID('dbo.students')
    AND parent_column_id = COLUMNPROPERTY(OBJECT_ID('dbo.sessions'), 'student_id', 'ColumnId')
    AND referenced_column_id = COLUMNPROPERTY(OBJECT_ID('dbo.students'), 'id', 'ColumnId')
)
BEGIN
    ALTER TABLE dbo.sessions
    ADD CONSTRAINT FK_sessions_student_id 
    FOREIGN KEY (student_id) 
    REFERENCES dbo.students(id)
    PRINT 'Created new foreign key constraint: FK_sessions_student_id'
END
ELSE
BEGIN
    PRINT 'Foreign key constraint already exists and points to dbo.students'
END

