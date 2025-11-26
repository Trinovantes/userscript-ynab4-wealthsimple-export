import type { YnabEntry } from '../store/YnabEntry.ts'

export function downloadCsv(transactions: Array<YnabEntry>): void {
    const csv = convertToCsv(transactions)
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)

    const link = document.createElement('a')
    document.body.appendChild(link)
    link.href = url
    link.setAttribute('download', 'Wealthsimple.csv')
    link.click()

    document.body.removeChild(link)
    URL.revokeObjectURL(url)
}

function convertToCsv(transactions: Array<YnabEntry>): string {
    const rows = new Array<string>()
    rows.push('"Date","Payee","Memo","Outflow","Inflow"')

    for (const transaction of transactions) {
        const values = [
            formatDate(transaction.date),
            formatCsvStr(transaction.payee),
            formatCsvStr(transaction.memo),
            formatCsvNum(transaction.outflow),
            formatCsvNum(transaction.inflow),
        ]

        rows.push(values.map((cell) => `"${cell}"`).join(','))
    }

    return rows.join('\n')
}

function formatDate(date: Date): string {
    const y = date.getFullYear()
    const m = (date.getMonth() + 1).toString().padStart(2, '0')
    const d = date.getDate().toString().padStart(2, '0')
    return `${y}-${m}-${d}`
}

function formatCsvStr(val: string): string {
    return val.replaceAll('"', '""')
}

function formatCsvNum(val: number): string {
    if (val === 0) {
        return ''
    }

    return val.toFixed(2)
}
