export function isPdfFile(file: File): boolean {
  return file.name.toLowerCase().endsWith('.pdf') || file.type === 'application/pdf'
}

export function collectPdfsFromFileList(files: FileList | File[]): File[] {
  return Array.from(files).filter(isPdfFile)
}

function getFileFromEntry(entry: FileSystemFileEntry): Promise<File> {
  return new Promise((resolve, reject) => entry.file(resolve, reject))
}

function readAllDirectoryEntries(reader: FileSystemDirectoryReader): Promise<FileSystemEntry[]> {
  return new Promise((resolve, reject) => {
    const all: FileSystemEntry[] = []
    const read = () => {
      reader.readEntries((batch) => {
        if (!batch.length) resolve(all)
        else {
          all.push(...batch)
          read()
        }
      }, reject)
    }
    read()
  })
}

async function traverseEntry(entry: FileSystemEntry, out: File[]): Promise<void> {
  if (entry.isFile) {
    const file = await getFileFromEntry(entry as FileSystemFileEntry)
    if (isPdfFile(file)) out.push(file)
    return
  }
  if (entry.isDirectory) {
    const reader = (entry as FileSystemDirectoryEntry).createReader()
    const children = await readAllDirectoryEntries(reader)
    await Promise.all(children.map((child) => traverseEntry(child, out)))
  }
}

export async function collectPdfsFromDataTransfer(dt: DataTransfer): Promise<File[]> {
  const items = dt.items
  if (!items?.length) return collectPdfsFromFileList(dt.files)

  const pdfs: File[] = []
  const tasks: Promise<void>[] = []

  for (let i = 0; i < items.length; i++) {
    const item = items[i]
    const entry = item.webkitGetAsEntry?.()
    if (entry) tasks.push(traverseEntry(entry, pdfs))
    else {
      const file = item.getAsFile()
      if (file && isPdfFile(file)) pdfs.push(file)
    }
  }

  await Promise.all(tasks)
  if (pdfs.length === 0) return collectPdfsFromFileList(dt.files)
  return pdfs
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function uniqueFiles(files: File[]): File[] {
  const seen = new Set<string>()
  return files.filter((f) => {
    const key = `${f.name}-${f.size}-${f.lastModified}`
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}
