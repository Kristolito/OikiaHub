CREATE TABLE IF NOT EXISTS `__EFMigrationsHistory` (
    `MigrationId` varchar(150) CHARACTER SET utf8mb4 NOT NULL,
    `ProductVersion` varchar(32) CHARACTER SET utf8mb4 NOT NULL,
    CONSTRAINT `PK___EFMigrationsHistory` PRIMARY KEY (`MigrationId`)
) CHARACTER SET=utf8mb4;

START TRANSACTION;
ALTER DATABASE CHARACTER SET utf8mb4;

CREATE TABLE `Amenities` (
    `Id` int NOT NULL AUTO_INCREMENT,
    `Name` varchar(100) CHARACTER SET utf8mb4 NOT NULL,
    CONSTRAINT `PK_Amenities` PRIMARY KEY (`Id`)
) CHARACTER SET=utf8mb4;

CREATE TABLE `Cities` (
    `Id` int NOT NULL AUTO_INCREMENT,
    `Name` varchar(100) CHARACTER SET utf8mb4 NOT NULL,
    CONSTRAINT `PK_Cities` PRIMARY KEY (`Id`)
) CHARACTER SET=utf8mb4;

CREATE TABLE `Roles` (
    `Id` int NOT NULL AUTO_INCREMENT,
    `Name` varchar(50) CHARACTER SET utf8mb4 NOT NULL,
    CONSTRAINT `PK_Roles` PRIMARY KEY (`Id`)
) CHARACTER SET=utf8mb4;

CREATE TABLE `Areas` (
    `Id` int NOT NULL AUTO_INCREMENT,
    `Name` varchar(100) CHARACTER SET utf8mb4 NOT NULL,
    `CityId` int NOT NULL,
    CONSTRAINT `PK_Areas` PRIMARY KEY (`Id`),
    CONSTRAINT `FK_Areas_Cities_CityId` FOREIGN KEY (`CityId`) REFERENCES `Cities` (`Id`) ON DELETE RESTRICT
) CHARACTER SET=utf8mb4;

CREATE TABLE `Users` (
    `Id` int NOT NULL AUTO_INCREMENT,
    `FirstName` varchar(100) CHARACTER SET utf8mb4 NOT NULL,
    `LastName` varchar(100) CHARACTER SET utf8mb4 NOT NULL,
    `Email` varchar(255) CHARACTER SET utf8mb4 NOT NULL,
    `PasswordHash` varchar(500) CHARACTER SET utf8mb4 NOT NULL,
    `RoleId` int NOT NULL,
    `CreatedAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    `UpdatedAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    CONSTRAINT `PK_Users` PRIMARY KEY (`Id`),
    CONSTRAINT `FK_Users_Roles_RoleId` FOREIGN KEY (`RoleId`) REFERENCES `Roles` (`Id`) ON DELETE RESTRICT
) CHARACTER SET=utf8mb4;

CREATE TABLE `AgentProfiles` (
    `Id` int NOT NULL AUTO_INCREMENT,
    `UserId` int NOT NULL,
    `PhoneNumber` varchar(30) CHARACTER SET utf8mb4 NOT NULL,
    `AgencyName` varchar(150) CHARACTER SET utf8mb4 NOT NULL,
    `Bio` varchar(2000) CHARACTER SET utf8mb4 NULL,
    `ProfileImageUrl` varchar(500) CHARACTER SET utf8mb4 NULL,
    CONSTRAINT `PK_AgentProfiles` PRIMARY KEY (`Id`),
    CONSTRAINT `FK_AgentProfiles_Users_UserId` FOREIGN KEY (`UserId`) REFERENCES `Users` (`Id`) ON DELETE CASCADE
) CHARACTER SET=utf8mb4;

CREATE TABLE `Properties` (
    `Id` int NOT NULL AUTO_INCREMENT,
    `Title` varchar(200) CHARACTER SET utf8mb4 NOT NULL,
    `Description` varchar(4000) CHARACTER SET utf8mb4 NOT NULL,
    `Price` decimal(18,2) NOT NULL,
    `PropertyType` int NOT NULL,
    `ListingType` int NOT NULL,
    `Bedrooms` int NOT NULL,
    `Bathrooms` int NOT NULL,
    `SquareMeters` decimal(10,2) NOT NULL,
    `Address` varchar(300) CHARACTER SET utf8mb4 NOT NULL,
    `PostalCode` varchar(20) CHARACTER SET utf8mb4 NULL,
    `CityId` int NOT NULL,
    `AreaId` int NOT NULL,
    `Latitude` decimal(9,6) NULL,
    `Longitude` decimal(9,6) NULL,
    `YearBuilt` int NULL,
    `Floor` int NULL,
    `Status` int NOT NULL DEFAULT 1,
    `AgentProfileId` int NOT NULL,
    `CreatedAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    `UpdatedAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    CONSTRAINT `PK_Properties` PRIMARY KEY (`Id`),
    CONSTRAINT `FK_Properties_AgentProfiles_AgentProfileId` FOREIGN KEY (`AgentProfileId`) REFERENCES `AgentProfiles` (`Id`) ON DELETE RESTRICT,
    CONSTRAINT `FK_Properties_Areas_AreaId` FOREIGN KEY (`AreaId`) REFERENCES `Areas` (`Id`) ON DELETE RESTRICT,
    CONSTRAINT `FK_Properties_Cities_CityId` FOREIGN KEY (`CityId`) REFERENCES `Cities` (`Id`) ON DELETE RESTRICT
) CHARACTER SET=utf8mb4;

CREATE TABLE `Favorites` (
    `Id` int NOT NULL AUTO_INCREMENT,
    `UserId` int NOT NULL,
    `PropertyId` int NOT NULL,
    `CreatedAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    CONSTRAINT `PK_Favorites` PRIMARY KEY (`Id`),
    CONSTRAINT `FK_Favorites_Properties_PropertyId` FOREIGN KEY (`PropertyId`) REFERENCES `Properties` (`Id`) ON DELETE CASCADE,
    CONSTRAINT `FK_Favorites_Users_UserId` FOREIGN KEY (`UserId`) REFERENCES `Users` (`Id`) ON DELETE CASCADE
) CHARACTER SET=utf8mb4;

CREATE TABLE `Inquiries` (
    `Id` int NOT NULL AUTO_INCREMENT,
    `PropertyId` int NOT NULL,
    `UserId` int NOT NULL,
    `FullName` varchar(150) CHARACTER SET utf8mb4 NOT NULL,
    `Email` varchar(255) CHARACTER SET utf8mb4 NOT NULL,
    `PhoneNumber` varchar(30) CHARACTER SET utf8mb4 NULL,
    `Message` varchar(2000) CHARACTER SET utf8mb4 NOT NULL,
    `CreatedAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    CONSTRAINT `PK_Inquiries` PRIMARY KEY (`Id`),
    CONSTRAINT `FK_Inquiries_Properties_PropertyId` FOREIGN KEY (`PropertyId`) REFERENCES `Properties` (`Id`) ON DELETE CASCADE,
    CONSTRAINT `FK_Inquiries_Users_UserId` FOREIGN KEY (`UserId`) REFERENCES `Users` (`Id`) ON DELETE CASCADE
) CHARACTER SET=utf8mb4;

CREATE TABLE `PropertyAmenities` (
    `PropertyId` int NOT NULL,
    `AmenityId` int NOT NULL,
    CONSTRAINT `PK_PropertyAmenities` PRIMARY KEY (`PropertyId`, `AmenityId`),
    CONSTRAINT `FK_PropertyAmenities_Amenities_AmenityId` FOREIGN KEY (`AmenityId`) REFERENCES `Amenities` (`Id`) ON DELETE CASCADE,
    CONSTRAINT `FK_PropertyAmenities_Properties_PropertyId` FOREIGN KEY (`PropertyId`) REFERENCES `Properties` (`Id`) ON DELETE CASCADE
) CHARACTER SET=utf8mb4;

CREATE TABLE `PropertyImages` (
    `Id` int NOT NULL AUTO_INCREMENT,
    `PropertyId` int NOT NULL,
    `ImageUrl` varchar(500) CHARACTER SET utf8mb4 NOT NULL,
    `IsPrimary` tinyint(1) NOT NULL DEFAULT FALSE,
    `SortOrder` int NOT NULL DEFAULT 0,
    CONSTRAINT `PK_PropertyImages` PRIMARY KEY (`Id`),
    CONSTRAINT `FK_PropertyImages_Properties_PropertyId` FOREIGN KEY (`PropertyId`) REFERENCES `Properties` (`Id`) ON DELETE CASCADE
) CHARACTER SET=utf8mb4;

INSERT INTO `Amenities` (`Id`, `Name`)
VALUES (1, 'Parking'),
(2, 'Elevator'),
(3, 'Storage Room'),
(4, 'Garden'),
(5, 'Balcony');

INSERT INTO `Cities` (`Id`, `Name`)
VALUES (1, 'Athens'),
(2, 'Thessaloniki'),
(3, 'Patras');

INSERT INTO `Roles` (`Id`, `Name`)
VALUES (1, 'Admin'),
(2, 'Agent'),
(3, 'User');

INSERT INTO `Areas` (`Id`, `CityId`, `Name`)
VALUES (1, 1, 'Kifisia'),
(2, 1, 'Kolonaki'),
(3, 2, 'Kalamaria'),
(4, 2, 'Toumba'),
(5, 3, 'Rio');

CREATE UNIQUE INDEX `IX_AgentProfiles_UserId` ON `AgentProfiles` (`UserId`);

CREATE UNIQUE INDEX `IX_Amenities_Name` ON `Amenities` (`Name`);

CREATE UNIQUE INDEX `IX_Areas_CityId_Name` ON `Areas` (`CityId`, `Name`);

CREATE INDEX `IX_Areas_Name` ON `Areas` (`Name`);

CREATE UNIQUE INDEX `IX_Cities_Name` ON `Cities` (`Name`);

CREATE INDEX `IX_Favorites_PropertyId` ON `Favorites` (`PropertyId`);

CREATE UNIQUE INDEX `IX_Favorites_UserId_PropertyId` ON `Favorites` (`UserId`, `PropertyId`);

CREATE INDEX `IX_Inquiries_PropertyId` ON `Inquiries` (`PropertyId`);

CREATE INDEX `IX_Inquiries_UserId` ON `Inquiries` (`UserId`);

CREATE INDEX `IX_Properties_AgentProfileId` ON `Properties` (`AgentProfileId`);

CREATE INDEX `IX_Properties_AreaId` ON `Properties` (`AreaId`);

CREATE INDEX `IX_Properties_CityId` ON `Properties` (`CityId`);

CREATE INDEX `IX_Properties_ListingType` ON `Properties` (`ListingType`);

CREATE INDEX `IX_Properties_Price` ON `Properties` (`Price`);

CREATE INDEX `IX_Properties_PropertyType` ON `Properties` (`PropertyType`);

CREATE INDEX `IX_PropertyAmenities_AmenityId` ON `PropertyAmenities` (`AmenityId`);

CREATE INDEX `IX_PropertyImages_PropertyId` ON `PropertyImages` (`PropertyId`);

CREATE UNIQUE INDEX `IX_Roles_Name` ON `Roles` (`Name`);

CREATE UNIQUE INDEX `IX_Users_Email` ON `Users` (`Email`);

CREATE INDEX `IX_Users_RoleId` ON `Users` (`RoleId`);

INSERT INTO `__EFMigrationsHistory` (`MigrationId`, `ProductVersion`)
VALUES ('20260306164326_InitialCreate', '9.0.0');

COMMIT;

