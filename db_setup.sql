-- =============================================
-- TrueBlue DataCollect - DB Setup Script
-- Run this once against phvtechc_tb
-- =============================================

-- 1. Outlets table (registered shops)
CREATE TABLE [dbo].[tb_outlets] (
    SysID         INT IDENTITY(1,1) PRIMARY KEY,
    outlet_code   NVARCHAR(100) NOT NULL,
    shop_name     NVARCHAR(200) NOT NULL,
    town          NVARCHAR(100) NOT NULL,
    owner_contact NVARCHAR(50)  NOT NULL,
    created_date  DATETIME DEFAULT GETDATE()
)
GO

-- 2. Fonterra products table (configurable checklist)
CREATE TABLE [dbo].[tb_products] (
    SysID        INT IDENTITY(1,1) PRIMARY KEY,
    product_name NVARCHAR(200) NOT NULL,
    created_date DATETIME DEFAULT GETDATE()
)
GO

-- 3. Register a new shop and auto-generate outlet code
CREATE OR ALTER PROCEDURE [dbo].[tb_outlet_save]
    @shop_name     NVARCHAR(200),
    @town          NVARCHAR(100),
    @owner_contact NVARCHAR(50)
AS
BEGIN
    SET NOCOUNT ON;

    INSERT INTO [dbo].[tb_outlets] (outlet_code, shop_name, town, owner_contact)
    VALUES ('', @shop_name, @town, @owner_contact)

    DECLARE @id          INT          = SCOPE_IDENTITY()
    DECLARE @outlet_code NVARCHAR(100)
    SET @outlet_code = REPLACE(@shop_name, ' ', '')
                     + REPLACE(@town, ' ', '')
                     + RIGHT('0000' + CAST(@id AS NVARCHAR(10)), 4)

    UPDATE [dbo].[tb_outlets] SET outlet_code = @outlet_code WHERE SysID = @id

    SELECT @outlet_code AS outlet_code
END
GO

-- 4. Delete a shop outlet
CREATE OR ALTER PROCEDURE [dbo].[tb_outlet_delete]
    @SysID INT
AS
BEGIN
    SET NOCOUNT ON;
    DELETE FROM [dbo].[tb_outlets] WHERE SysID = @SysID
END
GO

-- 5. Add a Fonterra product
CREATE OR ALTER PROCEDURE [dbo].[tb_product_save]
    @product_name NVARCHAR(200)
AS
BEGIN
    SET NOCOUNT ON;
    INSERT INTO [dbo].[tb_products] (product_name) VALUES (@product_name)
END
GO

-- 6. Delete a Fonterra product
CREATE OR ALTER PROCEDURE [dbo].[tb_product_delete]
    @SysID INT
AS
BEGIN
    SET NOCOUNT ON;
    DELETE FROM [dbo].[tb_products] WHERE SysID = @SysID
END
GO

-- =============================================
-- 7. Add new columns to the existing visits table
--    NOTE: Verify the table name below matches yours.
--    Common names: tb_shop_visits, tb_visit_data, tb_visits
-- =============================================
ALTER TABLE [dbo].[tb_shop_visits]
    ADD outlet_code            NVARCHAR(100)  NULL,
        competitor_text        NVARCHAR(500)  NULL,
        product_checklist      NVARCHAR(1000) NULL,
        rack_fonterra_image    NVARCHAR(200)  NULL,
        competitor_rack_image  NVARCHAR(200)  NULL
GO

-- =============================================
-- 8. Updated visit insert SP
--    New signature replaces shop_name/owner_contact/address
--    with outlet_code + competitor_text + product_checklist
-- =============================================
CREATE OR ALTER PROCEDURE [dbo].[tb_shop_visit_call]
    @outlet_code       NVARCHAR(100),
    @lat               NVARCHAR(50),
    @lng               NVARCHAR(50),
    @visit_date        NVARCHAR(50),
    @root_code         NVARCHAR(50),
    @competitor_text   NVARCHAR(500),
    @product_checklist NVARCHAR(1000)
AS
BEGIN
    SET NOCOUNT ON;
    -- NOTE: Adjust column names below to match your existing table
    INSERT INTO [dbo].[tb_shop_visits]
        (outlet_code, lat, lng, visit_date, root_code, competitor_text, product_checklist)
    VALUES
        (@outlet_code, @lat, @lng, @visit_date, @root_code, @competitor_text, @product_checklist)

    SELECT SCOPE_IDENTITY() AS i
END
GO

-- =============================================
-- 9. Updated file-names update SP
--    Adds rack_fonterra and competitor_rack to existing fields
-- =============================================
CREATE OR ALTER PROCEDURE [dbo].[tb_shop_visit_update_files]
    @id                    NVARCHAR(50),
    @board                 NVARCHAR(200),
    @rack_before           NVARCHAR(200),
    @rack_after            NVARCHAR(200),
    @signature             NVARCHAR(200),
    @selfie                NVARCHAR(200),
    @rack_fonterra         NVARCHAR(200),
    @competitor_rack       NVARCHAR(200)
AS
BEGIN
    SET NOCOUNT ON;
    -- NOTE: Adjust column names below to match your existing table
    UPDATE [dbo].[tb_shop_visits]
    SET board_image             = @board,
        rack_before_image       = @rack_before,
        rack_after_image        = @rack_after,
        signature_image         = @signature,
        selfie_image            = @selfie,
        rack_fonterra_image     = @rack_fonterra,
        competitor_rack_image   = @competitor_rack
    WHERE SysID = @id
END
GO
