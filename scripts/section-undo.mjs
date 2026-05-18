#!/usr/bin/env node
/**
 * Section undo: backup before homepage section edits, restore with password.
 *
 *   node scripts/section-undo.mjs list
 *   node scripts/section-undo.mjs backup <section-id> [--from-git]
 *   node scripts/section-undo.mjs restore <PASSWORD>
 */
import { execSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const REGISTRY_PATH = path.join(ROOT, 'design', 'section-undo-registry.json')
const BACKUP_ROOT = path.join(ROOT, '.undo-backups')

function loadRegistry() {
  const raw = fs.readFileSync(REGISTRY_PATH, 'utf8')
  return JSON.parse(raw)
}

function sectionById(registry, id) {
  const section = registry.sections.find((s) => s.id === id)
  if (!section) {
    console.error(`Unknown section id "${id}". Run: node scripts/section-undo.mjs list`)
    process.exit(1)
  }
  return section
}

function sectionByPassword(registry, password) {
  const section = registry.sections.find((s) => s.password === password)
  if (!section) {
    console.error('Password not found in design/section-undo-registry.json')
    process.exit(1)
  }
  return section
}

function readFromGitHead(relativePath) {
  const normalized = relativePath.replace(/\\/g, '/')
  try {
    return execSync(`git show HEAD:${normalized}`, {
      cwd: ROOT,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe']
    })
  } catch {
    const onDisk = path.join(ROOT, relativePath)
    if (!fs.existsSync(onDisk)) {
      throw new Error(`Not in git HEAD and missing on disk: ${relativePath}`)
    }
    console.warn(`  warn: ${relativePath} not in HEAD — using working-tree copy for backup`)
    return fs.readFileSync(onDisk, 'utf8')
  }
}

function backupFile(sectionId, relativePath, source) {
  const dest = path.join(BACKUP_ROOT, sectionId, relativePath)
  fs.mkdirSync(path.dirname(dest), { recursive: true })
  if (source === 'git-head') {
    fs.writeFileSync(dest, readFromGitHead(relativePath), 'utf8')
  } else {
    const src = path.join(ROOT, relativePath)
    if (!fs.existsSync(src)) {
      throw new Error(`Missing file to backup: ${relativePath}`)
    }
    fs.copyFileSync(src, dest)
  }
}

function cmdList(registry) {
  console.log('Homepage section undo passwords:\n')
  for (const s of registry.sections) {
    const backupDir = path.join(BACKUP_ROOT, s.id)
    const backedUp = fs.existsSync(backupDir) ? 'backup on disk' : 'no backup yet'
    console.log(`  ${s.label}`)
    console.log(`    Password: ${s.password}`)
    console.log(`    Section id: ${s.id} (${backedUp})\n`)
  }
  console.log(`Restore: npm run section:undo -- <PASSWORD>`)
}

function cmdBackup(registry, sectionId, forceGit) {
  const section = sectionById(registry, sectionId)
  const source = forceGit || section.backupSource === 'git-head' ? 'git-head' : 'working-tree'
  for (const file of section.files) {
    backupFile(section.id, file, source)
    console.log(`  backed up ${file} (${source})`)
  }
  const meta = {
    sectionId: section.id,
    label: section.label,
    password: section.password,
    backedUpAt: new Date().toISOString(),
    source
  }
  fs.writeFileSync(path.join(BACKUP_ROOT, section.id, '_meta.json'), JSON.stringify(meta, null, 2), 'utf8')
  console.log(`\nBackup ready. Undo password: ${section.password}`)
}

function cmdRestore(registry, password) {
  const section = sectionByPassword(registry, password)
  const backupDir = path.join(BACKUP_ROOT, section.id)
  if (!fs.existsSync(backupDir)) {
    console.error(`No backup folder for "${section.id}". Run backup first.`)
    process.exit(1)
  }
  for (const file of section.files) {
    const src = path.join(backupDir, file)
    const dest = path.join(ROOT, file)
    if (!fs.existsSync(src)) {
      console.error(`Missing backup file: ${src}`)
      process.exit(1)
    }
    fs.mkdirSync(path.dirname(dest), { recursive: true })
    fs.copyFileSync(src, dest)
    console.log(`  restored ${file}`)
  }
  console.log(`\nRestored: ${section.label}`)
}

const [command, arg] = process.argv.slice(2)
const registry = loadRegistry()

if (!command || command === 'list') {
  cmdList(registry)
} else if (command === 'backup') {
  if (!arg) {
    console.error('Usage: node scripts/section-undo.mjs backup <section-id> [--from-git]')
    process.exit(1)
  }
  const fromGit = process.argv.includes('--from-git')
  cmdBackup(registry, arg, fromGit)
} else if (command === 'restore') {
  if (!arg) {
    console.error('Usage: node scripts/section-undo.mjs restore <PASSWORD>')
    process.exit(1)
  }
  cmdRestore(registry, arg)
} else {
  console.error('Unknown command. Use: list | backup <id> | restore <password>')
  process.exit(1)
}
