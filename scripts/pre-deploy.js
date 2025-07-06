#!/usr/bin/env node

/**
 * Script de verificación pre-despliegue para Vercel
 * Verifica que todas las configuraciones necesarias estén en su lugar
 */

const fs = require('fs');
const path = require('path');

console.log('🚀 Verificando configuración para despliegue en Vercel...\n');

// Verificar archivos requeridos
const requiredFiles = [
  'package.json',
  'next.config.ts',
  'vercel.json',
  'env.example',
  'tsconfig.json',
  'tailwind.config.js',
];

console.log('📁 Verificando archivos requeridos...');
let allFilesExist = true;

requiredFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`✅ ${file}`);
  } else {
    console.log(`❌ ${file} - FALTA`);
    allFilesExist = false;
  }
});

// Verificar estructura de directorios
const requiredDirs = [
  'src/app',
  'src/components',
  'src/lib',
  'public',
];

console.log('\n📂 Verificando estructura de directorios...');
let allDirsExist = true;

requiredDirs.forEach(dir => {
  if (fs.existsSync(dir)) {
    console.log(`✅ ${dir}/`);
  } else {
    console.log(`❌ ${dir}/ - FALTA`);
    allDirsExist = false;
  }
});

// Verificar dependencias críticas
console.log('\n📦 Verificando dependencias críticas...');
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const criticalDeps = [
  'next',
  'react',
  'react-dom',
  '@auth0/nextjs-auth0',
  'tailwindcss',
  'typescript',
];

let allDepsExist = true;

criticalDeps.forEach(dep => {
  if (packageJson.dependencies[dep] || packageJson.devDependencies[dep]) {
    console.log(`✅ ${dep}`);
  } else {
    console.log(`❌ ${dep} - FALTA`);
    allDepsExist = false;
  }
});

// Verificar configuración de Next.js
console.log('\n⚙️ Verificando configuración de Next.js...');
try {
  const nextConfig = fs.readFileSync('next.config.ts', 'utf8');
  const hasRequiredConfig = [
    'experimental',
    'images',
    'rewrites',
    'headers',
  ];
  
  let configOk = true;
  hasRequiredConfig.forEach(config => {
    if (nextConfig.includes(config)) {
      console.log(`✅ ${config} configurado`);
    } else {
      console.log(`⚠️ ${config} - puede faltar configuración`);
    }
  });
} catch (error) {
  console.log('❌ Error leyendo next.config.ts');
  allFilesExist = false;
}

// Verificar variables de entorno de ejemplo
console.log('\n🔐 Verificando variables de entorno...');
try {
  const envExample = fs.readFileSync('env.example', 'utf8');
  const requiredEnvVars = [
    'AUTH0_SECRET',
    'AUTH0_BASE_URL',
    'AUTH0_ISSUER_BASE_URL',
    'AUTH0_CLIENT_ID',
    'AUTH0_CLIENT_SECRET',
    'BACKEND_URL',
    'NEXT_PUBLIC_BACKEND_URL',
  ];
  
  let envOk = true;
  requiredEnvVars.forEach(envVar => {
    if (envExample.includes(envVar)) {
      console.log(`✅ ${envVar}`);
    } else {
      console.log(`❌ ${envVar} - FALTA en env.example`);
      envOk = false;
    }
  });
} catch (error) {
  console.log('❌ Error leyendo env.example');
  allFilesExist = false;
}

// Resumen final
console.log('\n' + '='.repeat(50));
console.log('📋 RESUMEN DE VERIFICACIÓN');
console.log('='.repeat(50));

if (allFilesExist && allDirsExist && allDepsExist) {
  console.log('✅ ¡Proyecto listo para despliegue en Vercel!');
  console.log('\n🚀 Pasos siguientes:');
  console.log('1. Conecta tu repositorio a Vercel');
  console.log('2. Configura las variables de entorno en Vercel');
  console.log('3. Actualiza las URLs en Auth0');
  console.log('4. ¡Despliega!');
  process.exit(0);
} else {
  console.log('❌ Hay problemas que deben resolverse antes del despliegue');
  console.log('\n🔧 Revisa los elementos marcados con ❌ arriba');
  process.exit(1);
} 