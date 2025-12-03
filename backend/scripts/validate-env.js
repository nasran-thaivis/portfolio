#!/usr/bin/env node

/**
 * Environment Variables Validation Script
 * 
 * This script validates that all required environment variables are set correctly
 * before deployment. Run this script locally or in CI/CD pipeline.
 * 
 * Usage:
 *   node scripts/validate-env.js
 *   or
 *   npm run validate:env (if added to package.json)
 */

const requiredEnvVars = {
  DATABASE_URL: {
    required: true,
    description: 'Database connection URL (MySQL or PostgreSQL)',
    validate: (value) => {
      if (!value) {
        return { valid: false, error: 'DATABASE_URL is not set' };
      }
      
      // Check for localhost in production
      const isProduction = process.env.NODE_ENV === 'production';
      if (isProduction && (value.includes('localhost') || value.includes('127.0.0.1'))) {
        return {
          valid: false,
          error: 'DATABASE_URL contains localhost/127.0.0.1 in production. Use production database URL instead.'
        };
      }
      
      // Check format (MySQL or PostgreSQL)
      if (!value.startsWith('mysql://') && !value.startsWith('postgresql://') && !value.startsWith('postgres://')) {
        return {
          valid: false,
          error: 'DATABASE_URL must start with mysql://, postgresql:// or postgres://'
        };
      }
      
      // Check for required parts
      if (!value.includes('@') || !value.includes('/')) {
        return {
          valid: false,
          error: 'DATABASE_URL format is invalid'
        };
      }
      
      return { valid: true };
    }
  },
  NODE_ENV: {
    required: false,
    description: 'Node environment (development, production, etc.)',
    validate: (value) => {
      if (!value) {
        return { valid: true, warning: 'NODE_ENV is not set (defaults to development)' };
      }
      return { valid: true };
    }
  },
  PORT: {
    required: false,
    description: 'Port number for the application',
    validate: (value) => {
      if (!value) {
        return { valid: true, warning: 'PORT is not set (will use default or Render assigned port)' };
      }
      const port = parseInt(value, 10);
      if (isNaN(port) || port < 1 || port > 65535) {
        return { valid: false, error: 'PORT must be a number between 1 and 65535' };
      }
      return { valid: true };
    }
  }
};

function maskUrl(url) {
  if (!url) return 'Not set';
  return url.replace(/:[^:@]+@/, ':****@');
}

function validateEnvironment() {
  console.log('🔍 Validating environment variables...\n');
  
  let hasErrors = false;
  let hasWarnings = false;
  
  for (const [key, config] of Object.entries(requiredEnvVars)) {
    const value = process.env[key];
    const maskedValue = maskUrl(value);
    
    console.log(`Checking ${key}:`);
    
    if (!value && config.required) {
      console.log(`  ❌ ERROR: ${key} is required but not set`);
      console.log(`  📝 Description: ${config.description}`);
      hasErrors = true;
      console.log('');
      continue;
    }
    
    if (!value && !config.required) {
      const result = config.validate(value);
      if (result.warning) {
        console.log(`  ⚠️  WARNING: ${result.warning}`);
        hasWarnings = true;
      } else {
        console.log(`  ⚪ Optional: ${config.description}`);
      }
      console.log('');
      continue;
    }
    
    // Validate the value
    const result = config.validate(value);
    
    if (!result.valid) {
      console.log(`  ❌ ERROR: ${result.error}`);
      console.log(`  📝 Current value: ${maskedValue}`);
      hasErrors = true;
    } else if (result.warning) {
      console.log(`  ⚠️  WARNING: ${result.warning}`);
      console.log(`  📝 Current value: ${maskedValue}`);
      hasWarnings = true;
    } else {
      console.log(`  ✅ Valid: ${maskedValue}`);
    }
    
    console.log('');
  }
  
  // Summary
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  if (hasErrors) {
    console.log('❌ Validation failed! Please fix the errors above.');
    console.log('\n📚 Troubleshooting:');
    console.log('1. For Render.com deployment:');
    console.log('   - Go to Render Dashboard → Your Web Service → Environment');
    console.log('   - Set DATABASE_URL to your database connection URL');
    console.log('2. Make sure DATABASE_URL does not contain localhost or 127.0.0.1');
    console.log('3. Format examples:');
    console.log('   - MySQL: mysql://username:password@host:port/database');
    console.log('   - PostgreSQL: postgresql://username:password@host:port/database?schema=public');
    process.exit(1);
  } else if (hasWarnings) {
    console.log('⚠️  Validation passed with warnings. Review the warnings above.');
    process.exit(0);
  } else {
    console.log('✅ All environment variables are valid!');
    process.exit(0);
  }
}

// Run validation
validateEnvironment();

