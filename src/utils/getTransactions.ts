import type { YnabEntry } from '../store/YnabEntry.ts'
import { add, parse } from 'date-fns'

export function getTransactions() {
    console.groupCollapsed(__NAME__, 'getTransactions')
    const transactions = new Array<YnabEntry>()

    const headingNodes = document.querySelectorAll('h2[data-fs-privacy-rule]')
    for (const headingNode of headingNodes) {
        const parsedDate = parseDate(headingNode.textContent)
        if (isNaN(parsedDate.getTime())) {
            console.warn(`Failed to parse "${headingNode.textContent}" as date`)
            continue
        }

        const transactionNodes = getNonEmptyDivSiblings(headingNode)
        for (const transactionNode of transactionNodes) {
            console.info(transactionNode)

            const transaction = parseTransaction(transactionNode)
            if (!transaction) {
                continue
            }

            console.info(transaction)
            transactions.push({
                ...transaction,
                date: parsedDate,
                memo: '',
            })
        }
    }

    console.groupEnd()
    return transactions
}

function parseDate(dateStr: string): Date {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())

    if (dateStr.toLowerCase() === 'today') {
        return today
    }
    if (dateStr.toLowerCase() === 'yesterday') {
        return add(today, { days: -1 })
    }

    return parse(dateStr, 'MMMM d, yyyy', new Date())
}

function getNonEmptyDivSiblings(node: Element): Array<HTMLElement> {
    const siblings = new Array<HTMLElement>()

    let currNode: Element | null = node
    while (true) {
        currNode = currNode.nextElementSibling
        if (!(currNode instanceof HTMLDivElement)) {
            break
        }
        if (currNode.children.length === 0) {
            continue
        }

        siblings.push(currNode)
    }

    return siblings
}

function parseTransaction(transactionNode: HTMLElement): Pick<YnabEntry, 'payee' | 'inflow' | 'outflow'> | null {
    if (isCancelledTransaction(transactionNode)) {
        return null
    }

    const containerNode = transactionNode.querySelector('button > div:first-child')

    const payeeNode = containerNode?.children.item(0)?.querySelector('div:not(:has(svg)) > p[data-fs-privacy-rule]')
    if (!payeeNode) {
        console.warn('Failed to parse payee', transactionNode)
        return null
    }

    const amountNode = containerNode?.children.item(1)?.querySelector('p[data-fs-privacy-rule]')
    if (!amountNode) {
        console.warn('Failed to parse amount', transactionNode)
        return null
    }

    const amountRegexMatches = /^(?<negativeSign>[\u2212])?\s*\$(?<amount>[\d,.]+)\s*(?<currency>\w+)$/.exec(amountNode?.textContent ?? '')
    const isNegative = Boolean(amountRegexMatches?.groups?.negativeSign)
    const transactionAmount = parseFloat(amountRegexMatches?.groups?.amount?.replaceAll(',', '') ?? '')
    if (isNaN(transactionAmount)) {
        console.warn('Failed to parse amount', amountNode)
        return null
    }

    return {
        payee: payeeNode.textContent,
        inflow: isNegative ? 0 : transactionAmount,
        outflow: isNegative ? transactionAmount : 0,
    }
}

function isCancelledTransaction(transactionNode: HTMLElement): boolean {
    const cancelLabel = transactionNode.querySelector('button div[data-fs-privacy-rule] span')
    return cancelLabel?.textContent.toLowerCase() === 'cancelled'
}
