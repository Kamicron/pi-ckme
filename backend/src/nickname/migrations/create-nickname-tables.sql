-- Création des tables pour le système de génération de pseudonymes CS2

CREATE TABLE IF NOT EXISTS `nickname_fragment` (
  `id` varchar(36) NOT NULL,
  `value` varchar(255) NOT NULL,
  `type` enum('prefix','core','suffix','standalone') NOT NULL DEFAULT 'core',
  `language` varchar(10) NOT NULL DEFAULT 'en',
  `weight` int NOT NULL DEFAULT 50,
  `isActive` tinyint(1) NOT NULL DEFAULT 1,
  `tags` text DEFAULT NULL,
  `usageCount` int NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  KEY `IDX_FRAGMENT_TYPE_WEIGHT` (`type`,`weight`),
  KEY `IDX_FRAGMENT_LANGUAGE_TYPE` (`language`,`type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `nickname_style` (
  `id` varchar(36) NOT NULL,
  `style` enum('abstract','name_based','modified_word','simple_word','stylized','hybrid') NOT NULL,
  `weight` int NOT NULL DEFAULT 50,
  `isActive` tinyint(1) NOT NULL DEFAULT 1,
  `description` text DEFAULT NULL,
  `allowedPatterns` json DEFAULT NULL,
  `preferredTransformations` json DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `IDX_STYLE_STYLE_WEIGHT` (`style`,`weight`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `nickname_pattern` (
  `id` varchar(36) NOT NULL,
  `patternType` enum('fragment_core','fragment_prefix_core','fragment_core_suffix','fragment_prefix_core_suffix','name_shortened','name_modified','name_leet','word_modified','standalone','hybrid_name_fragment','name_blend_vowel_consonant') NOT NULL,
  `styleId` varchar(36) DEFAULT NULL,
  `weight` int NOT NULL DEFAULT 50,
  `isActive` tinyint(1) NOT NULL DEFAULT 1,
  `minLengthByPart` json DEFAULT NULL,
  `maxLengthByPart` json DEFAULT NULL,
  `description` text DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `IDX_PATTERN_TYPE_WEIGHT` (`patternType`,`weight`),
  KEY `IDX_PATTERN_STYLE` (`styleId`),
  CONSTRAINT `FK_PATTERN_STYLE` FOREIGN KEY (`styleId`) REFERENCES `nickname_style` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `nickname_transformation` (
  `id` varchar(36) NOT NULL,
  `type` enum('vowel_removal','vowel_removal_partial','letter_duplication','letter_substitution','case_variation','length_trim','leet_simple','leet_moderate','consonant_cluster_reduction','truncate') NOT NULL,
  `weight` int NOT NULL DEFAULT 50,
  `isActive` tinyint(1) NOT NULL DEFAULT 1,
  `parameters` json DEFAULT NULL,
  `description` text DEFAULT NULL,
  `applicablePatterns` json DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `IDX_TRANSFORMATION_TYPE_WEIGHT` (`type`,`weight`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `nickname_blacklist` (
  `id` varchar(36) NOT NULL,
  `pattern` varchar(255) NOT NULL,
  `severity` enum('low','medium','high','critical') NOT NULL DEFAULT 'medium',
  `isRegex` tinyint(1) NOT NULL DEFAULT 0,
  `reason` text DEFAULT NULL,
  `isActive` tinyint(1) NOT NULL DEFAULT 1,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `matchCount` int NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  KEY `IDX_BLACKLIST_PATTERN` (`pattern`),
  KEY `IDX_BLACKLIST_SEVERITY` (`severity`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
